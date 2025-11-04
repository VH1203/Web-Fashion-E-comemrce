const FlashSale = require("../models/FlashSale");
const { v4: uuidv4 } = require("uuid");

// [GET] /api/flashsales?page=1&limit=10
exports.getAllFlashSales = async (req, res, next) => {
  try {
    let { page = 1, limit = 10, status, title } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { created_by: req.user._id };
    if (status) filter.status = status;
    if (title) filter.title = { $regex: title, $options: "i" };
    const total = await FlashSale.countDocuments(filter);
    const flashSales = await FlashSale.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      data: flashSales,
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

// 🟢 [GET] /api/flashsales/:id
exports.getFlashSaleById = async (req, res, next) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale)
      return res.status(404).json({ message: "Không tìm thấy Flash Sale" });

    if (flashSale.created_by !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem Flash Sale này" });
    }

    res.json(flashSale);
  } catch (err) {
    next(err);
  }
};

// [POST] /api/flashsales
exports.createFlashSale = async (req, res, next) => {
  try {
    const {
      title,
      description,
      start_time,
      end_time,
      discount_type,
      discount_value,
      max_per_user,
      total_limit,
      products,
      banner_image,
      status,
    } = req.body;

    // Validate cơ bản
    if (!title || !start_time || !end_time || !discount_type || !discount_value)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });

    const start = new Date(start_time);
    const end = new Date(end_time);
    if (isNaN(start) || isNaN(end))
      return res.status(400).json({ message: "Thời gian không hợp lệ" });
    if (end <= start)
      return res
        .status(400)
        .json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });

    if (
      discount_type === "percentage" &&
      (discount_value <= 0 || discount_value > 100)
    )
      return res
        .status(400)
        .json({ message: "Giá trị giảm theo phần trăm không hợp lệ" });

    if (discount_type === "fixed" && discount_value <= 0)
      return res
        .status(400)
        .json({ message: "Giá trị giảm cố định phải lớn hơn 0" });

    const newFlashSale = new FlashSale({
      _id: `fs-${uuidv4()}`,
      shop_id: req.user._id,
      title: title.trim(),
      description: description || "",
      start_time: start,
      end_time: end,
      status: status || "active",
      discount_type,
      discount_value,
      max_per_user: max_per_user || 1,
      total_limit: total_limit || 100,
      products: Array.isArray(products) ? products : [],
      banner_image: banner_image || "",
      created_by: req.user._id,
      approved_by: null,
    });

    await newFlashSale.save();
    res.status(201).json({
      message: "Tạo Flash Sale thành công",
      data: newFlashSale,
    });
  } catch (err) {
    next(err);
  }
};

// [PUT] /api/flashsales/:id
exports.updateFlashSale = async (req, res, next) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale)
      return res.status(404).json({ message: "Không tìm thấy Flash Sale" });

    if (flashSale.created_by !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật Flash Sale này" });
    }

    const {
      title,
      description,
      start_time,
      end_time,
      discount_type,
      discount_value,
      max_per_user,
      total_limit,
      products,
      banner_image,
      status,
    } = req.body;

    if (start_time && end_time) {
      const start = new Date(start_time);
      const end = new Date(end_time);
      if (end <= start)
        return res
          .status(400)
          .json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
      flashSale.start_time = start;
      flashSale.end_time = end;
    }

    Object.assign(flashSale, {
      title: title ?? flashSale.title,
      description: description ?? flashSale.description,
      discount_type: discount_type ?? flashSale.discount_type,
      discount_value: discount_value ?? flashSale.discount_value,
      max_per_user: max_per_user ?? flashSale.max_per_user,
      total_limit: total_limit ?? flashSale.total_limit,
      banner_image: banner_image ?? flashSale.banner_image,
      status: status ?? flashSale.status,
    });

    if (Array.isArray(products)) {
      flashSale.products = products;
    }

    flashSale.updatedAt = new Date();
    await flashSale.save();

    res.json({ message: "Cập nhật Flash Sale thành công", data: flashSale });
  } catch (err) {
    next(err);
  }
};

//[DELETE] /api/flashsales/:id
exports.deleteFlashSale = async (req, res, next) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale)
      return res.status(404).json({ message: "Không tìm thấy Flash Sale" });

    if (flashSale.created_by !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa Flash Sale này" });
    }

    await flashSale.deleteOne();
    res.json({ message: "Xóa Flash Sale thành công" });
  } catch (err) {
    next(err);
  }
};
