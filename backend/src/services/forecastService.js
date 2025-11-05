/**
 * Simple Holt-Winters (Triple Exponential Smoothing) for daily revenue.
 * - seasonLength: 7 (tuần)
 * - alpha, beta, gamma có default hợp lý; có thể tinh chỉnh.
 * Input series: [{ ds: "YYYY-MM-DD", y: Number }]
 * Output:      [{ ds: "YYYY-MM-DD", yhat: Number }]
 */

const { addDays, formatISO } = require("date-fns");

// Core Holt-Winters
function holtWintersForecast(values, horizon = 14, {
  seasonLength = 7,
  alpha = 0.4,  // level
  beta  = 0.3,  // trend
  gamma = 0.3,  // seasonality
} = {}) {
  if (!Array.isArray(values) || values.length === 0) return Array.from({ length: horizon }, () => 0);

  // Nếu dữ liệu quá ít, fallback sang trung bình
  if (values.length < seasonLength * 2) {
    const avg = values.reduce((s,v)=>s+v,0) / values.length;
    return Array.from({ length: horizon }, () => avg);
  }

  // Khởi tạo level (L), trend (B), seasonal (S)
  let L = values[0];
  let B = values[1] - values[0];

  // seasonal init bằng tỉ lệ so với trung bình chu kỳ đầu
  const seasonals = Array(seasonLength).fill(0);
  // lấy season đầu
  const firstSeason = values.slice(0, seasonLength);
  const seasonAvg = firstSeason.reduce((s, v) => s + v, 0) / seasonLength;
  for (let i = 0; i < seasonLength; i++) {
    seasonals[i] = seasonAvg === 0 ? 0 : (firstSeason[i] / seasonAvg);
  }

  // Fit qua toàn bộ chuỗi
  for (let t = 0; t < values.length; t++) {
    const y = values[t];
    const sIdx = (t % seasonLength);

    const lastL = L;
    const lastB = B;
    const lastS = seasonals[sIdx];

    // tránh chia 0
    const seasonalAdj = (Math.abs(lastS) < 1e-9) ? 1 : lastS;

    // Update level, trend, seasonal
    L = alpha * (y / seasonalAdj) + (1 - alpha) * (lastL + lastB);
    B = beta * (L - lastL) + (1 - beta) * lastB;
    seasonals[sIdx] = gamma * (y / (lastL + lastB || 1)) + (1 - gamma) * lastS;
  }

  // Forecast tương lai
  const fc = [];
  for (let m = 1; m <= horizon; m++) {
    const sIdx = ((values.length + m - 1) % seasonLength);
    const yhat = (L + m * B) * (seasonals[sIdx] || 1);
    fc.push(yhat < 0 ? 0 : yhat);
  }
  return fc;
}

exports.forecastRevenue = ({ series, horizon = 14 }) => {
  const ys = (series || []).map(r => Number(r.y || 0));
  const baseDates = (series || []).map(r => r.ds);
  const lastDate = baseDates.length ? new Date(baseDates[baseDates.length - 1]) : new Date();

  const forecasts = holtWintersForecast(ys, horizon, { seasonLength: 7, alpha: 0.4, beta: 0.3, gamma: 0.3 });
  return forecasts.map((yhat, i) => ({
    ds: formatISO(addDays(lastDate, i + 1), { representation: "date" }),
    yhat: Number.isFinite(yhat) ? yhat : 0,
  }));
};
