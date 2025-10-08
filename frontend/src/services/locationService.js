import axios from "axios";

const BASE_URL = "https://vietnamlabs.com/api/vietnamprovince";

export const locationApi = {
  // 📍 Lấy danh sách tỉnh
  getProvinces: async () => {
    try {
      const res = await axios.get(BASE_URL);
      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      // Dạng chuẩn: data là mảng các object tỉnh
      const provinces = data.map((item) => ({
        id: item.id || item.province,
        name: item.province,
      }));

      console.log("✅ Provinces loaded:", provinces);
      return provinces;
    } catch (err) {
      console.error("❌ Lỗi khi tải tỉnh:", err);
      return [];
    }
  },

  // 🏙️ Lấy danh sách xã/phường theo tên tỉnh
  getWards: async (provinceName) => {
    if (!provinceName) return [];

    try {
      const url = `${BASE_URL}?province=${encodeURIComponent(provinceName)}`;
      const res = await axios.get(url);

      // Dạng mới: data là 1 object duy nhất
      const data = res.data?.data;
      if (!data || !Array.isArray(data.wards)) {
        console.warn(`⚠️ Không tìm thấy wards cho tỉnh: ${provinceName}`);
        return [];
      }

      // Map ra danh sách xã/phường
      const wards = data.wards.map((w, idx) => ({
        id: `${data.id}-${idx + 1}`,
        name: w.name,
      }));

      console.log(`✅ Wards of ${provinceName}:`, wards);
      return wards;
    } catch (err) {
      console.error(`Lỗi khi tải wards cho ${provinceName}:`, err);
      return [];
    }
  },
};
