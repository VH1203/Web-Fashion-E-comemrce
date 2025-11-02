// backend/src/services/addressService.js
const Address = require("../models/Address");

/** Chuẩn hoá body: 63/34 + codes + trim text */
function normalizeBody(p = {}) {
  const source = String(p.schema || p.source || "63");

  const data = {
    name:   String(p.name || "").trim(),
    phone:  String(p.phone || "").trim(),
    street: String(p.street || "").trim(),
    city:   String(p.city || "").trim(),
    ward:   String(p.ward || "").trim(),
    // 34: district rỗng; 63: dùng như FE gửi
    district: source === "34"
      ? String(p.district || "").trim()
      : String(p.district || "").trim(),

    source,

    province_code: p.province_code ?? null,
    district_code: source === "34" ? null : (p.district_code ?? null),
    ward_code:     p.ward_code ?? null,

    // is_default là tuỳ chọn
    is_default: p.is_default === true,
  };

  return data;
}

/** Kiểm tra required theo source */
function assertRequired(data) {
  const commonMissing =
    !data.name || !data.phone || !data.city || !data.ward || !data.street;
  if (commonMissing) {
    const e = new Error("Missing required fields: name, phone, city, ward, street");
    e.status = 400;
    throw e;
  }
  if (data.source !== "34" && !data.district) {
    const e = new Error("Missing required field: district");
    e.status = 400;
    throw e;
  }
}

exports.list = (userId) =>
  Address.find({ user_id: userId })
    .sort({ is_default: -1, createdAt: -1 })
    .lean();

exports.create = async (userId, p) => {
  const data = normalizeBody(p);
  assertRequired(data);

  // nếu đặt mặc định mới -> bỏ mặc định cũ
  if (data.is_default) {
    await Address.updateMany(
      { user_id: userId, is_default: true },
      { $set: { is_default: false } }
    );
  }

  return Address.create({ user_id: userId, ...data });
};

exports.update = async (userId, id, p) => {
  const exists = await Address.findOne({ _id: id, user_id: userId });
  if (!exists) return null;

  const data = normalizeBody(p);
  // với update, vẫn đảm bảo rule required theo source
  assertRequired({ ...exists.toObject(), ...data });

  // nếu set mặc định -> bỏ mặc định cũ trừ chính nó
  if (data.is_default) {
    await Address.updateMany(
      { user_id: userId, is_default: true, _id: { $ne: id } },
      { $set: { is_default: false } }
    );
  }

  // chỉ set những field thực sự có giá trị (không ghi đè bằng undefined)
  const $set = {};
  [
    "name",
    "phone",
    "street",
    "city",
    "ward",
    "district",
    "source",
    "province_code",
    "district_code",
    "ward_code",
  ].forEach((k) => {
    if (typeof data[k] !== "undefined") $set[k] = data[k];
  });
  if (typeof p.is_default !== "undefined") {
    $set.is_default = data.is_default === true;
  }

  // runValidators để áp rule required động theo source trong Mongoose
  return Address.findOneAndUpdate(
    { _id: id, user_id: userId },
    { $set },
    { new: true, runValidators: true }
  );
};

exports.remove = (userId, id) =>
  Address.findOneAndDelete({ _id: id, user_id: userId });

exports.setDefault = async (userId, id) => {
  const addr = await Address.findOne({ _id: id, user_id: userId });
  if (!addr) return null;

  await Address.updateMany(
    { user_id: userId, is_default: true },
    { $set: { is_default: false } }
  );

  addr.is_default = true;
  await addr.save();
  return addr;
};
