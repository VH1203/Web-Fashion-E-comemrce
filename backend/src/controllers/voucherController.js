const Voucher = require("../models/Voucher");
const { v4: uuidv4 } = require("uuid");

//Lấy danh sách voucher (có phân trang + filter)
exports.getAllVouchers = async (req, res, next) => {
  try {
    let { page = 1, limit = 5, code } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { created_by: req.user._id };
    if (code) {
      filter.code = { $regex: code, $options: "i" };
    }

    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
console.log(vouchers);
    res.json({
      data: vouchers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Lấy voucher theo ID (kiểm tra quyền sở hữu)
exports.getVoucherById = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy voucher" });

    if (voucher.created_by !== req.user._id) {
      return res.status(403).json({ message: "Bạn không có quyền xem voucher này" });
    }

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

//Tạo voucher (validate thủ công)
exports.createVoucher = async (req, res, next) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      max_uses,
      usage_limit_per_user,
      min_order_value,
      applicable_products,
      applicable_users,
      scope,
      shop_id,
      valid_from,
      valid_to,
    } = req.body;

    if (!code || !discount_type || !discount_value || !max_uses || !valid_from || !valid_to) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    if (discount_type === "percent") {
      if (typeof discount_value !== "number" || discount_value <= 0 || discount_value > 100) {
        return res.status(400).json({ message: "Phần trăm giảm giá phải nằm trong khoảng 1-100" });
      }
    } else if (discount_type === "fixed") {
      if (typeof discount_value !== "number" || discount_value <= 0) {
        return res.status(400).json({ message: "Giá trị giảm cố định phải là số dương" });
      }
    } else {
      return res.status(400).json({ message: "Loại giảm giá không hợp lệ" });
    }

    const now = new Date();
    const fromDate = new Date(valid_from);
    const toDate = new Date(valid_to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return res.status(400).json({ message: "Ngày không hợp lệ" });
    }

    if (fromDate < now) {
      return res.status(400).json({ message: "Ngày bắt đầu phải là hiện tại hoặc tương lai" });
    }

    if (toDate <= fromDate) {
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    const existingVoucher = await Voucher.findOne({ code });
    if (existingVoucher) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    }

    const voucher = new Voucher({
      _id: `vou-${uuidv4()}`,
      code: code.trim(),
      discount_type,
      discount_value,
      max_uses,
      usage_limit_per_user: usage_limit_per_user || 1,
      min_order_value: min_order_value || 0,
      applicable_products: Array.isArray(applicable_products) ? applicable_products : [],
      applicable_users: Array.isArray(applicable_users) ? applicable_users : [],
      scope: scope || "shop",
      shop_id: scope === "shop" ? shop_id || req.user._id : null,
      valid_from: fromDate,
      valid_to: toDate,
      is_active: true,
      created_by: req.user._id || "system",
      created_at: now,
      updated_at: now,
    });

    await voucher.save();
    return res.status(201).json({ message: "Tạo voucher thành công", voucher });
  } catch (err) {
    next(err);
  }
};

// Cập nhật voucher (validate + quyền sở hữu)
exports.updateVoucher = async (req, res, next) => {
  try {
    const { code, discount_percent, max_uses, valid_from, valid_to, conditions } = req.body;

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy voucher" });

    if (voucher.created_by !== req.user._id) {
      return res.status(403).json({ message: "Bạn không có quyền sửa voucher này" });
    }

    // Validate phần trăm giảm giá
    if (discount_percent && (discount_percent <= 0 || discount_percent > 100)) {
      return res.status(400).json({ message: "Phần trăm giảm giá không hợp lệ" });
    }

    // Validate ngày
    const now = new Date();
    let fromDate = valid_from ? new Date(valid_from) : new Date(voucher.valid_from);
    let toDate = valid_to ? new Date(valid_to) : new Date(voucher.valid_to);

    if (valid_from && fromDate < now) {
      return res.status(400).json({ message: "Ngày bắt đầu phải là hiện tại hoặc tương lai" });
    }

    if (valid_to && toDate <= fromDate) {
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    // Cập nhật dữ liệu
    voucher.code = code || voucher.code;
    voucher.discount_percent = discount_percent ?? voucher.discount_percent;
    voucher.max_uses = max_uses ?? voucher.max_uses;
    voucher.valid_from = fromDate;
    voucher.valid_to = toDate;
    voucher.conditions = conditions || voucher.conditions;

    await voucher.save();
    res.json({ message: "Cập nhật voucher thành công", voucher });
  } catch (err) {
    next(err);
  }
};

// Xóa voucher (kiểm tra quyền sở hữu)
exports.deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy voucher" });

    if (voucher.created_by !== req.user._id) {
      return res.status(403).json({ message: "Bạn không có quyền xóa voucher này" });
    }

    await voucher.deleteOne();
    res.json({ message: "Xóa voucher thành công" });
  } catch (err) {
    next(err);
  }
};
