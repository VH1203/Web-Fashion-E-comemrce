
exports.successResponse = (data = null, message = "Thành công") => ({
  success: true,
  message,
  data,
});

exports.errorResponse = (message = "Thất bại") => ({
  success: false,
  message,
});
