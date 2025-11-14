// services/categoryService.js
const Category = require("../models/Category");
const Product = require("../models/Product");

exports.getTree = async function(depth = 3) {
  const all = await Category.find({ is_active: true }).sort({ level: 1, name: 1 }).lean();
  const byParent = all.reduce((m,c) => ((m[c.parent_id||"root"] ||= []).push(c), m), {});
  function build(node, d=0) {
    if (d >= depth) return { ...node, children: [] };
    const kids = (byParent[node._id] || []).map(ch => build(ch, d+1));
    return { ...node, children: kids };
  }
  return (byParent["root"]||[]).map(r => build(r, 0));
};

exports.create = async function(payload) {
  // name, parent_id, gender_hint, ...
  const doc = await Category.create({ ...payload, slug: payload.slug || undefined });
  return doc;
};

exports.update = async function(id, patch) {
  const before = await Category.findById(id);
  if (!before) throw new Error("Category not found");
  const doc = await Category.findOneAndUpdate({ _id: id }, { $set: patch }, { new: true, runValidators: true });
  // Nếu đổi parent → cập nhật lại toàn bộ subtree
  if (String(before.parent_id||"") !== String(doc.parent_id||"") || before.name !== doc.name) {
    await Category.recomputeTreeFields(doc._id);
    // cập nhật lại path/level cho con cháu
    const all = await Category.find({ ancestors: id }, { _id:1 }).lean();
    for (const c of all) await Category.recomputeTreeFields(c._id);
  }
  return doc;
};

exports.remove = async function(id) {
  const childCount = await Category.countDocuments({ parent_id: id });
  if (childCount > 0) throw new Error("Không thể xoá: vẫn còn danh mục con");
  const prodCount = await Product.countDocuments({ category_id: id });
  if (prodCount > 0) throw new Error("Không thể xoá: vẫn còn sản phẩm thuộc danh mục");
  await Category.findByIdAndDelete(id);
  return { ok: true };
};
