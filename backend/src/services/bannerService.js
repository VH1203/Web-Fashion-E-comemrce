const Banner = require("../models/Banner");

exports.getActiveBanners = async (position = null) => {
  const filter = { is_active: true };
  if (position) filter.position = position;

  return await Banner.find(filter)
    .sort({ createdAt: -1 })
    .select("_id title image_url link position");
};
