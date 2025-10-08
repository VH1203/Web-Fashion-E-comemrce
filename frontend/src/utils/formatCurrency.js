/**
 * Định dạng tiền tệ theo kiểu Việt Nam (₫)
 * @param {number|string} value - Số tiền cần định dạng
 * @param {boolean} withSymbol - Có hiển thị ký hiệu ₫ hay không
 * @returns {string} Ví dụ: "120.000 ₫" hoặc "120.000"
 */
export function formatCurrency(value, withSymbol = true) {
  if (value === null || value === undefined || isNaN(value)) return "0 ₫";
  try {
    const num = Number(value);
    const formatted = num.toLocaleString("vi-VN");
    return withSymbol ? `${formatted} ₫` : formatted;
  } catch (err) {
    console.error("❌ Lỗi formatCurrency:", err);
    return value;
  }
}

/**
 * Định dạng số ngắn gọn hơn (ví dụ: 1.2K, 3.4M)
 * Dùng cho dashboard, biểu đồ doanh thu.
 */
export function formatCompactNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return "0";
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Parse chuỗi tiền (ví dụ "120.000 ₫") thành số
 */
export function parseCurrency(str) {
  if (!str) return 0;
  return Number(String(str).replace(/[^\d.-]/g, ""));
}
