// backend/sed.js
/* eslint-disable no-console */
const mongoose = require("mongoose");

// ====== DÙNG URI CỐ ĐỊNH (theo yêu cầu) ======
const MONGO_URI = "mongodb+srv://dfs_dev:vietanh2003@cluster1.tr8dadn.mongodb.net/WDP?retryWrites=true&w=majority";
// Bật tắt chỉ log (không ghi DB) qua env DRY_RUN=true/false
const DRY_RUN = String(process.env.DRY_RUN || "").toLowerCase() === "true";

// ====== MODELS (vì sed.js ở backend/, nên dùng ./src/models/...) ======
const ProductVariant = require("./src/models/ProductVariant");
const Attribute      = require("./src/models/Attribute");

// ====== BẢN DỊCH EN -> VI (đổi trực tiếp trong DB) ======
const mapColor = {
  white: "Trắng", black: "Đen", gray: "Xám", grey: "Xám",
  blue: "Xanh dương", navy: "Xanh navy", lightblue: "Xanh nhạt", skyblue: "Xanh da trời",
  green: "Xanh lá", red: "Đỏ", pink: "Hồng", purple: "Tím", yellow: "Vàng",
  orange: "Cam", brown: "Nâu", beige: "Be", cream: "Kem", ivory: "Ngà",
  silver: "Bạc", gold: "Vàng ánh kim", multicolor: "Nhiều màu",
};
const mapSize = { xs:"XS", s:"S", m:"M", l:"L", xl:"XL", xxl:"2XL", "2xl":"2XL", "3xl":"3XL", "4xl":"4XL", "5xl":"5XL" };
const mapMaterial = { cotton:"Cotton", polyester:"Polyester", spandex:"Spandex", wool:"Len", silk:"Lụa", linen:"Lanh", leather:"Da", viscose:"Viscose", nylon:"Nylon", acrylic:"Acrylic" };

const norm = (s) => String(s ?? "").trim().toLowerCase();
const readValue = (x) => (x && typeof x === "object") ? (x.value ?? x.code ?? x.name ?? x.label ?? "") : String(x ?? "");
const writeValue = (old, vi) => (old && typeof old === "object")
  ? { ...old, value: vi, label: vi, name: old.name ?? vi, code: old.code ?? vi }
  : vi;
const applyMapGeneric = (oldVal, map) => {
  const src = readValue(oldVal);
  const vi = map[norm(src)];
  return vi ? writeValue(oldVal, vi) : oldVal; // không có map thì giữ nguyên
};

async function run() {
  await mongoose.connect(MONGO_URI, { autoIndex: false });
  console.log("✅ Connected:", { uri: MONGO_URI, DRY_RUN });

  // --- Kiểm tra nhanh trước khi đổi ---
  const before = await ProductVariant.find({
    $or: [
      { "variant_attributes.color": "black" },
      { "variant_attributes.color": "white" },
    ],
  }).select("_id variant_attributes.color").limit(10).lean();
  console.log("🔎 Sample before:", before);

  // --- 1) Duyệt và đổi từng ProductVariant ---
  let scannedPV = 0, changedPV = 0;
  const cursor = ProductVariant.find({}).cursor();

  for await (const v of cursor) {
    scannedPV++;
    const va = v.variant_attributes || {};
    let dirty = false;

    // gom key thường gặp (để hợp nhất về key "color" | "size" | "material")
    const keys = {
      color: va.color ?? va.colour ?? va.mau_sac ?? va.mau ?? null,
      size: va.size ?? va.kich_co ?? va.kich_thuoc ?? null,
      material: va.material ?? va.chat_lieu ?? null,
    };

    if (keys.color != null) {
      const next = applyMapGeneric(keys.color, mapColor);
      if (JSON.stringify(next) !== JSON.stringify(keys.color)) { va.color = next; dirty = true; }
    }
    if (keys.size != null) {
      const next = applyMapGeneric(keys.size, mapSize);
      if (JSON.stringify(next) !== JSON.stringify(keys.size)) { va.size = next; dirty = true; }
    }
    if (keys.material != null) {
      const next = applyMapGeneric(keys.material, mapMaterial);
      if (JSON.stringify(next) !== JSON.stringify(keys.material)) { va.material = next; dirty = true; }
    }

    if (dirty) {
      v.variant_attributes = va;
      v.markModified("variant_attributes"); // Mixed type
      if (!DRY_RUN) await v.save({ validateBeforeSave: false });
      changedPV++;
    }
  }
  console.log(`➡️ ProductVariant scanned: ${scannedPV}, changed: ${changedPV}`);

  // --- 1b) Fallback bulkWrite “chốt hạ” cho color phổ biến ---
  if (!DRY_RUN) {
    const res = await ProductVariant.bulkWrite([
      { updateMany: { filter: { "variant_attributes.color": "black" }, update: { $set: { "variant_attributes.color": "Đen" } } } },
      { updateMany: { filter: { "variant_attributes.color": "white" }, update: { $set: { "variant_attributes.color": "Trắng" } } } },
    ], { ordered: false });
    console.log("🧱 bulkWrite result:", res);
  } else {
    console.log("🧪 DRY_RUN=true → skip bulkWrite");
  }

  // --- 2) Đồng bộ Attribute.values (để gợi ý/filter đều hiển thị tiếng Việt) ---
  let changedAttr = 0;
  const attrs = await Attribute.find({ code: { $in: ["color", "size", "material"] } });
  for (const a of attrs) {
    if (!Array.isArray(a.values) || a.values.length === 0) continue;
    const mapped = a.values.map((raw) => {
      const s = String(raw);
      if (a.code === "color") return mapColor[norm(s)] || s;
      if (a.code === "size") return mapSize[norm(s)] || s;
      if (a.code === "material") return mapMaterial[norm(s)] || s;
      return s;
    });
    const dedup = Array.from(new Set(mapped));
    if (JSON.stringify(dedup) !== JSON.stringify(a.values)) {
      if (!DRY_RUN) { a.values = dedup; await a.save(); }
      changedAttr++;
      console.log(`Attr[${a.code}] ⇒`, dedup);
    }
  }
  console.log(`➡️ Attribute changed: ${changedAttr}`);

  // --- Kiểm tra nhanh sau khi đổi ---
  const after = await ProductVariant.find({
    $or: [
      { "variant_attributes.color": "black" },
      { "variant_attributes.color": "white" },
      { "variant_attributes.color": "Đen"   },
      { "variant_attributes.color": "Trắng" },
    ],
  }).select("_id variant_attributes.color").limit(10).lean();
  console.log("✅ Sample after:", after);

  await mongoose.disconnect();
  console.log("🎉 Done.");
}

run().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
