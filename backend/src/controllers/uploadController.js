const { uploadBufferToCloudinary, deleteByPublicId } = require('../services/uploadService');

exports.uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('Không có file');
    const folder = req.body.folder || 'dfs/misc';
    const result = await uploadBufferToCloudinary(req.file.buffer, { folder });
    // Gợi ý lưu: result.secure_url, result.public_id, result.width, height, format
    res.json({ url: result.secure_url, public_id: result.public_id, width: result.width, height: result.height, format: result.format });
  } catch (e) {
    next(e);
  }
};

exports.uploadMany = async (req, res, next) => {
  try {
    if (!req.files?.length) throw new Error('Không có file');
    const folder = req.body.folder || 'dfs/misc';
    const uploads = await Promise.all(
      req.files.map(f => uploadBufferToCloudinary(f.buffer, { folder }))
    );
    res.json(uploads.map(r => ({ url: r.secure_url, public_id: r.public_id })));
  } catch (e) { next(e); }
};

exports.deleteFile = async (req, res, next) => {
  try {
    const { public_id } = req.body;
    if (!public_id) throw new Error('Thiếu public_id');
    const result = await deleteByPublicId(public_id);
    res.json(result);
  } catch (e) { next(e); }
};
