// shippingService.js 
// Tối giản: tính phí theo provider + số dòng hàng
exports.calculate = async (provider = "GHN", address_id, address, items) => {
  if (!items?.length) return 0;
  const base = provider === "GHTK" ? 18000 : 15000;
  const step = Math.max(0, items.length - 1) * 2000;
  return base + step; // có thể thay bằng call GHN/GHTK thật
};
exports.getTracking = async (provider = "GHN", orderCode) => {
  // TODO: gọi API thực tế GHN/GHTK
  return {
    provider,
    order_code: orderCode,
    steps: [
      { code: "confirmed", text: "Shop đã xác nhận", at: new Date(Date.now() - 1000*60*60*24) },
      { code: "processing", text: "Đang đóng gói", at: new Date(Date.now() - 1000*60*60*20) },
      { code: "shipping", text: "Đang giao", at: new Date(Date.now() - 1000*60*60*5) },
    ],
    current: "shipping",
  };
};