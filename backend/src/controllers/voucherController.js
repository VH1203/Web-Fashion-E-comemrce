const Voucher = require("../models/Voucher");

// ✅ Lấy danh sách voucher (có phân trang + filter)
exports.getAllVouchers = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, code } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { created_by: req.user.sub };
    if (code) {
      filter.code = { $regex: code, $options: "i" };
    }

    const total = await Voucher.countDocuments(filter);
    const vouchers = await Voucher.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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

    if (voucher.created_by !== req.user.sub) {
      return res.status(403).json({ message: "Bạn không có quyền xem voucher này" });
    }

    res.json(voucher);
  } catch (err) {
    next(err);
  }
};

// ✅ Tạo voucher (validate thủ công)
exports.createVoucher = async (req, res, next) => {
  try {
    const {
      code,
      discount_percent,
      max_uses,
      valid_from,
      valid_to,
      conditions
    } = req.body;

    // Validate cơ bản
    if (!code || !discount_percent || !max_uses || !valid_from || !valid_to) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }

    if (typeof discount_percent !== "number" || discount_percent <= 0 || discount_percent > 100) {
      return res.status(400).json({ message: "Phần trăm giảm giá không hợp lệ" });
    }

    const now = new Date();
    const fromDate = new Date(valid_from);
    const toDate = new Date(valid_to);

    // ✅ valid_from phải là hiện tại hoặc tương lai
    if (fromDate < now) {
      return res.status(400).json({ message: "Ngày bắt đầu phải là hiện tại hoặc tương lai" });
    }

    // ✅ valid_to phải sau valid_from
    if (toDate <= fromDate) {
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    const voucher = new Voucher({
      code,
      discount_percent,
      max_uses,
      used_count: 0,
      valid_from: fromDate,
      valid_to: toDate,
      conditions,
      created_by: req.user.sub,
      created_at: new Date(),
    });

    await voucher.save();
    res.status(201).json({ message: "Tạo voucher thành công", voucher });
  } catch (err) {
    next(err);
  }
};

// ✅ Cập nhật voucher (validate + quyền sở hữu)
exports.updateVoucher = async (req, res, next) => {
  try {
    const { code, discount_percent, max_uses, valid_from, valid_to, conditions } = req.body;

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy voucher" });

    if (voucher.created_by !== req.user.sub) {
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

// ✅ Xóa voucher (kiểm tra quyền sở hữu)
exports.deleteVoucher = async (req, res, next) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ message: "Không tìm thấy voucher" });

    if (voucher.created_by !== req.user.sub) {
      return res.status(403).json({ message: "Bạn không có quyền xóa voucher này" });
    }

    await voucher.deleteOne();
    res.json({ message: "Xóa voucher thành công" });
  } catch (err) {
    next(err);
  }
};
