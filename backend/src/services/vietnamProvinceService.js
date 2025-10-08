const axios = require("axios");

const BASE_URL = "https://vietnamlabs.com/api/vietnamprovince";

exports.getAll = async () => {
  try {
    const res = await axios.get(BASE_URL);
    return res.data;
  } catch (err) {
    console.error("❌ getAll provinces failed:", err.message);
    throw new Error("Không thể lấy danh sách tỉnh thành");
  }
};

/**
 * @param {string} provinceName 
 */
exports.getByProvince = async (provinceName) => {
  try {
    if (!provinceName) throw new Error("Thiếu tên tỉnh cần lấy dữ liệu");

    const res = await axios.get(`${BASE_URL}?province=${encodeURIComponent(provinceName)}`);

    return res.data;
  } catch (err) {
    console.error(`❌ getByProvince(${provinceName}) failed:`, err.message);
    throw new Error("Không thể lấy dữ liệu phường/xã cho tỉnh này");
  }
};
