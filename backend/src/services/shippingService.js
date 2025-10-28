// shippingService.js 
// Tối giản: tính phí theo provider + số dòng hàng
exports.calculate = async (provider = "GHN", address_id, address, items) => {
  if (!items?.length) return 0;
  const base = provider === "GHTK" ? 18000 : 15000;
  const step = Math.max(0, items.length - 1) * 2000;
  return base + step; // có thể thay bằng call GHN/GHTK thật
};
