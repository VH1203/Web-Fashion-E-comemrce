// src/models/Order.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const OrderItemSchema = require("./OrderItemSchema");

/**
 * OrderSchema
 * - Đơn hàng của khách hàng (thuộc 1 shop)
 * - Liên kết với User, Address, Voucher, Payment, Shipper
 */
const OrderSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `ord-${uuidv4()}` },
    order_code: { type: String, required: true, unique: true },
    user_id: { type: String, ref: "User", required: true },
    shop_id: { type: String, ref: "User", required: true },

    items: [OrderItemSchema],

    address_id: { type: String, ref: "Address" },
    voucher_id: { type: String, ref: "Voucher" },

    payment_method: {
      type: String,
      enum: ["COD", "VNPAY", "MOMO", "WALLET"],
      default: "COD",
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    shipping_provider: {
      type: String,
      enum: ["GHN", "GHTK", "NONE"],
      default: "NONE",
    },
    shipping_fee: { type: Number, default: 0 },
    tracking_code: { type: String },
    expected_delivery: { type: Date },

    total_price: { type: Number, required: true },
    note: { type: String },

    status: {
      type: String,
      enum: [
        "processing",
        "pending",
        "confirmed",
        "shipping",
        "delivered",
        "canceled_by_customer",
        "canceled_by_shop",
        "refund_pending",
        "refund_completed",
      ],
      default: "pending",
    },

    inventory_adjusted: { type: Boolean, default: false },
    created_by: { type: String, ref: "User" },
  },
  { timestamps: true, versionKey: false, collection: "orders" }
);

// Tự động tính tổng tiền trước khi save
OrderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    const subtotal = this.items.reduce(
      (sum, it) => sum + (it.total || (it.price - it.discount) * it.qty),
      0
    );
    this.total_price = subtotal + (this.shipping_fee || 0);
  }
  next();
});

// doanh thu theo danh muc san pham
// src/models/Order.js (chỉ cần thay hàm này)
OrderSchema.statics.getRevenueByCategory = async function () {
  try {
    const result = await this.aggregate([
      // Nếu có đơn delivered thì bật match này lên
      // { $match: { status: "delivered" } },

      // Bung từng sản phẩm trong đơn
      { $unwind: "$items" },

      // ✅ Join sang bảng products (match theo chuỗi, không dùng $expr phức tạp)
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: false } },

      // ✅ Join sang bảng categories
      {
        $lookup: {
          from: "categories",
          localField: "productInfo.category_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: false } },

      // ✅ Gom doanh thu theo tên danh mục
      {
        $group: {
          _id: "$categoryInfo.name",
          totalRevenue: {
            $sum: {
              $ifNull: [
                "$items.total",
                { $multiply: ["$items.price", "$items.qty"] },
              ],
            },
          },
          totalOrders: { $addToSet: "$_id" },
          totalProducts: { $addToSet: "$items.product_id" },
        },
      },

      // ✅ Định dạng lại output
      {
        $project: {
          _id: 0,
          category: "$_id",
          totalRevenue: 1,
          totalOrders: { $size: "$totalOrders" },
          totalProducts: { $size: "$totalProducts" },
        },
      },

      // Sắp xếp giảm dần theo doanh thu
      { $sort: { totalRevenue: -1 } },
    ]);

    console.log("DEBUG revenue result:", result);
    return result;
  } catch (err) {
    console.error("getRevenueByCategory error:", err);
    throw err;
  }
};

module.exports = mongoose.model("Order", OrderSchema);
