const locationService = require("../services/vietnamProvinceService");

exports.getProvinces = async (req, res, next) => {
  try {
    const data = await locationService.getProvinces();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getDistricts = async (req, res, next) => {
  try {
    const { province_id } = req.params;
    const data = await locationService.getDistricts(province_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getWards = async (req, res, next) => {
  try {
    const { district_id } = req.params;
    const data = await locationService.getWards(district_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
