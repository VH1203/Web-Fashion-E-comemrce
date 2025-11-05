const ExcelJS = require("exceljs");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const Category = require("../models/Category");
const Brand = require("../models/Brand");

/**
 * Expected columns (Sheet1):
 * name | sku | price | stock | category | brand | images(csv) | attrs(json)
 * - images: comma-separated URLs (optional) → anh có thể re-upload sau
 * - attrs: JSON object, ví dụ: {"size":"M","color":"Black"}
 */
exports.importProductsFromExcel = async (buffer, shopId) => {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error("Excel is empty");

  const header = {};
  ws.getRow(1).eachCell((cell, col) => header[cell.value?.toString().trim().toLowerCase()] = col);
  const required = ["name", "sku", "price", "stock"];
  for (const k of required) if (!header[k]) throw new Error(`Missing column: ${k}`);

  const created = [];
  for (let r = 2; r <= ws.actualRowCount; r++) {
    const row = ws.getRow(r);
    const name = row.getCell(header["name"]).value?.toString().trim();
    if (!name) continue;

    const sku   = row.getCell(header["sku"]).value?.toString().trim();
    const price = Number(row.getCell(header["price"]).value || 0);
    const stock = Number(row.getCell(header["stock"]).value || 0);
    const catName = header["category"] ? row.getCell(header["category"]).value?.toString().trim() : null;
    const brandName = header["brand"] ? row.getCell(header["brand"]).value?.toString().trim() : null;
    const imagesCsv = header["images"] ? row.getCell(header["images"]).value?.toString().trim() : "";
    const attrsStr  = header["attrs"] ? row.getCell(header["attrs"]).value?.toString().trim() : "";

    let category_id = undefined;
    if (catName) {
      const c = await Category.findOneAndUpdate({ name: catName }, { $setOnInsert: { name: catName, is_active: true } }, { upsert: true, new: true });
      category_id = c._id;
    }

    let brand_id = undefined;
    if (brandName) {
      const b = await Brand.findOneAndUpdate({ name: brandName }, { $setOnInsert: { name: brandName, is_active: true } }, { upsert: true, new: true });
      brand_id = b._id;
    }

    const images = imagesCsv ? imagesCsv.split(",").map(s => s.trim()).filter(Boolean) : [];
    let attrs = {};
    if (attrsStr) { try { attrs = JSON.parse(attrsStr); } catch (e) {} }

    const prod = await Product.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      shop_id: shopId,
      price,
      images,
      category_id,
      brand_id,
      is_active: true,
    });

    await ProductVariant.create({
      product_id: prod._id,
      shop_id: shopId,
      sku,
      price,
      stock,
      variant_attributes: attrs,
      is_active: true,
    });

    created.push({ product_id: prod._id, sku });
  }

  return { inserted: created.length, items: created };
};
