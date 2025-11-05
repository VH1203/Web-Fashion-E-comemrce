import React, { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { formatCurrency } from "../../utils/formatCurrency";
import "../../assets/styles/ProductDetail.css";
import { cartService } from "../../services/cartService";

const norm = (s) => String(s ?? "").trim().toLowerCase();
const prettyKey = (k) => String(k).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const getVarAttrs = (v) => {
  const va = v?.variant_attributes ?? v?.attributes ?? {};
  return va instanceof Map ? Object.fromEntries(va) : (typeof va === "object" ? va : {});
};
const rawVal = (x) => {
  if (x == null) return "";
  if (typeof x === "object") return x.value ?? x.label ?? x.name ?? x.code ?? "";
  return String(x);
};
const formatSold = (n) => {
    if (!n) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `${n}`;
  };
function Stars({ value = 0, size = 16 }) {
  const v = Number(value || 0);
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  const arr = Array.from({ length: 5 }, (_, i) => (i < full ? "full" : i === full && half ? "half" : "empty"));
  return (
    <div className="stars" style={{ fontSize: size }}>
      {arr.map((t, i) => (
        <span key={i} className={`star ${t}`}>★</span>
      ))}
    </div>
  );
}

function buildVariantOptionGroups(variants) {
  const valuesByKey = new Map();
  for (const v of variants || []) {
    const attrs = getVarAttrs(v);
    for (const [k, val] of Object.entries(attrs)) {
      const r = rawVal(val);
      if (!r) continue;
      if (!valuesByKey.has(k)) valuesByKey.set(k, new Set());
      valuesByKey.get(k).add(r);
    }
  }
  const orderedKeys = Array.from(valuesByKey.keys()).sort();
  const optionGroups = {};
  for (const k of orderedKeys) {
    const exist = Array.from(valuesByKey.get(k) || []);
    optionGroups[k] = exist
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map((v) => ({ value: v, label: v }));
  }
  return { optionGroups, orderedKeys };
}

function findBestVariant(variants, selections) {
  if (!variants?.length) return null;
  let best = null, bestScore = -1;
  for (const v of variants) {
    const va = getVarAttrs(v);
    let s = 0;
    for (const [k, sel] of Object.entries(selections || {})) {
      const vRaw = rawVal(va?.[k]);
      if (sel && norm(vRaw) === norm(sel)) s++;
    }
    if ((v.stock ?? 0) > 0) s += 0.5;
    if (s > bestScore) { best = v; bestScore = s; }
  }
  return best;
}

function resolveOnPick(variants, current, key, value) {
  const list = variants.filter((v) => norm(rawVal(getVarAttrs(v)?.[key])) === norm(value));
  if (!list.length) return current;
  let best = null, bestScore = -1;
  for (const v of list) {
    const va = getVarAttrs(v);
    let s = 0;
    for (const [k2, val2] of Object.entries(current)) {
      if (k2 === key || !val2) continue;
      if (norm(rawVal(va?.[k2])) === norm(val2)) s++;
    }
    if ((v.stock ?? 0) > 0) s += 0.5;
    if (s > bestScore) { best = v; bestScore = s; }
  }
  const next = { ...current, [key]: value };
  const bestAttrs = getVarAttrs(best) || {};
  for (const [k, v] of Object.entries(bestAttrs)) next[k] = rawVal(v);
  return next;
}

function buildDisabledMap(variants, key, selections) {
  const map = new Map();
  const values = new Set();
  for (const v of variants || []) {
    const va = getVarAttrs(v);
    const val = rawVal(va?.[key]);
    if (!val) continue;
    values.add(val);
  }
  for (const val of values) {
    let ok = false;
    for (const v of variants || []) {
      const va = getVarAttrs(v);
      const thisVal = rawVal(va?.[key]);
      if (norm(thisVal) !== norm(val)) continue;
      let match = true;
      for (const [k2, sel] of Object.entries(selections || {})) {
        if (!sel || k2 === key) continue;
        if (norm(rawVal(va?.[k2])) !== norm(sel)) { match = false; break; }
      }
      if (match && (v.stock ?? 0) > 0) { ok = true; break; }
    }
    map.set(String(val), !ok);
  }
  return map;
}

function pickSizeByHeightWeight(rows = [], height, weight) {
  const inRange = rows.filter((r) => {
    const m = r.measurements || {};
    const okH = (m.height_min == null || height >= m.height_min) && (m.height_max == null || height <= m.height_max);
    const okW = (m.weight_min == null || weight >= m.weight_min) && (m.weight_max == null || weight <= m.weight_max);
    return okH && okW;
  });
  if (inRange.length) return inRange[0].label;
  let best = null, bestDist = Infinity;
  for (const r of rows) {
    const m = r.measurements || {};
    const hc = m.height_min != null && m.height_max != null ? (m.height_min + m.height_max) / 2 : height;
    const wc = m.weight_min != null && m.weight_max != null ? (m.weight_min + m.weight_max) / 2 : weight;
    const d = Math.hypot((height - hc) || 0, (weight - wc) || 0);
    if (d < bestDist) { best = r; bestDist = d; }
  }
  return best?.label || null;
}
function refineByMeasurements(rows = [], baseLabel, extras = {}) {
  const { chest, waist, hip, shoulder } = extras;
  const hasExtra = [chest, waist, hip, shoulder].some((v) => Number(v) > 0);
  if (!hasExtra) return baseLabel;
  let best = null, bestScore = Infinity;
  for (const r of rows) {
    const m = r.measurements || {};
    const dChest = chest ? Math.abs((m.chest || chest) - chest) : 0;
    const dWaist = waist ? Math.abs((m.waist || waist) - waist) : 0;
    const dHip = hip ? Math.abs((m.hip || hip) - hip) : 0;
    const dShoulder = shoulder ? Math.abs((m.shoulder || shoulder) - shoulder) : 0;
    const score = dChest + dWaist + dHip + dShoulder;
    if (score < bestScore) { best = r; bestScore = score; }
  }
  return best?.label || baseLabel;
}

export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const mainImgRef = useRef(null);
  const [detail, setDetail] = useState(null);
  const [summary, setSummary] = useState({ average: 0, count: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [reviews, setReviews] = useState({ total: 0, items: [] });
  const [related, setRelated] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedVar, setSelectedVar] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sizeOpen, setSizeOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hip, setHip] = useState("");
  const [shoulder, setShoulder] = useState("");
  const [sizeSuggest, setSizeSuggest] = useState(null);
  const [rvStar, setRvStar] = useState("all");
  const [rvPage, setRvPage] = useState(1);
  const RV_LIMIT = 6;

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        setSelectedAttrs({});
        setSelectedVar(null);
        const [d, s, r, rel] = await Promise.all([
          productService.getDetail(idOrSlug),
          productService.getRatingsSummary?.(idOrSlug),
          productService.getReviews?.(idOrSlug, 1, RV_LIMIT),
          productService.getRelated?.(idOrSlug, 12),
        ]);
        if (!alive) return;
        setDetail((prev) => d ?? prev);
        setSummary((prev) => s ?? prev);
        setReviews((prev) => r ?? prev);
        setRelated((prev) => rel ?? prev);
        const first = (d?.variants || []).find((v) => (v.stock ?? 0) > 0) || d?.variants?.[0];
        if (first) {
          const firstAttrs = getVarAttrs(first);
          const firstRaw = Object.fromEntries(Object.entries(firstAttrs).map(([k, v]) => [k, rawVal(v)]));
          setSelectedAttrs(firstRaw);
          setSelectedVar(first);
          if (typeof first.stock === "number" && first.stock > 0) setQty((q) => Math.min(q, first.stock));
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || "Không tải được chi tiết sản phẩm");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    setActiveIndex(0);
    return () => { alive = false; };
  }, [idOrSlug]);

  useEffect(() => {
    const variants = detail?.variants || [];
    if (!variants.length) {
      setSelectedVar(null);
      return;
    }
    const best = findBestVariant(variants, selectedAttrs);
    setSelectedVar(best);
    if (best && typeof best.stock === "number" && best.stock >= 1) {
      setQty((q) => Math.min(Math.max(1, q), best.stock));
    }
    setActiveIndex(0);
  }, [detail?.variants, selectedAttrs]);

  const variantsMemo = detail?.variants || [];
  const { optionGroups, orderedKeys } = useMemo(() => buildVariantOptionGroups(variantsMemo), [variantsMemo]);

  const p = detail?.product || {};
  const brand = detail?.brand;
  const category = detail?.category;
  const flash_sale = detail?.flash_sale;
  const sizeChart = detail?.size_chart;

  const rawImages = selectedVar?.images?.length ? selectedVar.images : p.images || [];
  const images = Array.isArray(rawImages)
    ? rawImages
        .map((x) => (typeof x === "string" ? x : x?.url || x?.secure_url || x?.path || ""))
        .map((s) => String(s || "").trim())
        .filter(Boolean)
        .filter((url, i, arr) => arr.indexOf(url) === i)
    : [];
  const mainImg = images[activeIndex] || images[0] || "";

  const priceMin = p.price_min ?? p.base_price ?? 0;
  const priceMax = p.price_max ?? p.base_price ?? 0;
  const displayPrice = selectedVar ? selectedVar.price : variantsMemo.length ? priceMin : p.base_price;
  const compareAt = selectedVar?.compare_at_price ?? (variantsMemo.length ? priceMax : null);
  const hasDiscount = !!(compareAt && compareAt > displayPrice);
  const flashBadge = flash_sale?.discount_percent ? `${flash_sale.discount_percent}%` : null;

  const di = p.detail_info || {};
  const specEntries = [
    di.origin_country ? ["Xuất xứ", di.origin_country] : null,
    Array.isArray(di.materials) && di.materials.length ? ["Chất liệu", di.materials.join(", ")] : null,
    di.material_ratio && Object.keys(di.material_ratio).length
      ? ["Tỉ lệ chất liệu", Object.entries(di.material_ratio).map(([k, v]) => `${k}: ${v}%`).join(", ")]
      : null,
    Array.isArray(di.seasons) && di.seasons.length ? ["Mùa phù hợp", di.seasons.join(", ")] : null,
    di.customization_available != null ? ["Tuỳ chỉnh", di.customization_available ? "Có" : "Không"] : null,
    di.care_instructions ? ["Hướng dẫn bảo quản", di.care_instructions] : null,
  ].filter(Boolean);
  const va = getVarAttrs(selectedVar);
  Object.entries(va).forEach(([k, v]) => specEntries.push([prettyKey(k), String(rawVal(v))]));

  const onPick = (k, v) => setSelectedAttrs((prev) => resolveOnPick(variantsMemo, prev, k, v));

  const canSuggest = Number(height) > 0 && Number(weight) > 0 && Array.isArray(sizeChart?.rows) && sizeChart.rows.length > 0;
  const runSuggest = () => {
    if (!canSuggest) return;
    const h = Number(height), w = Number(weight);
    let label = pickSizeByHeightWeight(sizeChart.rows, h, w);
    label = refineByMeasurements(sizeChart.rows, label, {
      chest: Number(chest) || 0,
      waist: Number(waist) || 0,
      hip: Number(hip) || 0,
      shoulder: Number(shoulder) || 0,
    });
    setSizeSuggest(label || null);
    if (label && (p.variant_dimensions || []).map(norm).includes("size")) {
      setSelectedAttrs((prev) => ({ ...prev, size: label }));
    }
    setSizeOpen(false);
  };

  const flyToCart = () => {
    try {
      const imgEl = mainImgRef.current;
      const cartEl = document.getElementById("cartIcon");
      if (!imgEl || !cartEl) return;
      const imgRect = imgEl.getBoundingClientRect();
      const cartRect = cartEl.getBoundingClientRect();
      const ghost = imgEl.cloneNode();
      ghost.className = "fly-img";
      ghost.style.left = `${imgRect.left}px`;
      ghost.style.top = `${imgRect.top}px`;
      ghost.style.width = `${imgRect.width}px`;
      ghost.style.height = `${imgRect.height}px`;
      document.body.appendChild(ghost);
      requestAnimationFrame(() => {
        ghost.style.transform = `translate(${cartRect.left - imgRect.left}px, ${cartRect.top - imgRect.top}px) scale(0.25)`;
        ghost.style.opacity = "0.2";
      });
      setTimeout(() => ghost.remove(), 700);
    } catch {}
  };

  const addToCart = async () => {
    try {
      if (!selectedVar) return alert("Vui lòng chọn tổ hợp hợp lệ.");
      if ((selectedVar.stock ?? 0) <= 0) return alert("Biến thể đã hết hàng.");
      if (qty > (selectedVar.stock ?? 0)) return alert("Không đủ tồn kho.");
      setAdding(true);
      await cartService.add({ product_id: p._id, variant_id: selectedVar._id || selectedVar.id, qty });
      flyToCart();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Không thêm được vào giỏ";
      if ([401, 403].includes(e?.response?.status)) {
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        return navigate(`/login?returnUrl=${returnUrl}`);
      }
      alert(msg);
    } finally {
      setAdding(false);
    }
  };

  const buyNow = async () => {
    try {
      if (!selectedVar) return alert("Vui lòng chọn tổ hợp hợp lệ.");
      if ((selectedVar.stock ?? 0) <= 0) return alert("Biến thể đã hết hàng.");
      if (qty > (selectedVar.stock ?? 0)) return alert("Không đủ tồn kho.");
      setAdding(true);
      await cartService.add({ product_id: p._id, variant_id: selectedVar._id || selectedVar.id, qty });
      navigate("/checkout");
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Không thể mua ngay";
      if ([401, 403].includes(e?.response?.status)) {
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        return navigate(`/login?returnUrl=${returnUrl}`);
      }
      alert(msg);
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await productService.getReviews?.(idOrSlug, rvPage, RV_LIMIT, rvStar === "all" ? undefined : rvStar);
        if (!alive || !res) return;
        setReviews(res);
      } catch {}
    })();
    return () => { alive = false; };
  }, [rvStar, rvPage, idOrSlug]);

  const pObj = detail?.product || {};
  const ratingValue = summary.average || pObj.rating_avg || 0;
  const ratingCount = summary.count || pObj.rating_count || 0;
  const sold = pObj.sold_count ?? 0;

  return (
    <div className="pd-wrap">
      {loading && <div>Đang tải...</div>}
      {error && !loading && <div className="error">{error}</div>}
      {!loading && !pObj._id && !error && <div>Không tìm thấy sản phẩm</div>}
      {pObj._id && (
        <>
          <div className="pd-grid">
            <div className="pd-gallery">
              <div className="pd-mainimg">
                {mainImg ? (
                  <img ref={mainImgRef} src={mainImg} alt={pObj.name} loading="eager" fetchpriority="high" decoding="async" draggable={false} />
                ) : (
                  <div className="noimg">No Image</div>
                )}
                {(hasDiscount || flashBadge) && <span className="badge">{flashBadge || "SALE"}</span>}
              </div>
              {!!images.length && (
                <div className="pd-thumbs">
                  {images.map((img, idx) => (
                    <button
                      type="button"
                      className={`thumb ${idx === activeIndex ? "active" : ""}`}
                      onClick={() => setActiveIndex(idx)}
                      key={`${img}#${idx}`}
                      aria-current={idx === activeIndex ? "true" : "false"}
                      aria-label={`Xem ảnh ${idx + 1}`}
                      title={`Ảnh ${idx + 1}`}
                    >
                      <img src={img} alt={`thumb-${idx}`} loading="lazy" decoding="async" draggable={false} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pd-info">
              <h1 className="pd-name">{pObj.name}</h1>
              <div className="pd-meta">
                <span className="rating">
                  <Stars value={ratingValue} />
                  <span className="avg">{ratingValue.toFixed ? ratingValue.toFixed(1) : ratingValue}</span>
                  <span className="count">({ratingCount} đánh giá)</span>
                </span>
                <span className="sold">Đã bán: <b>{formatSold(sold)}</b></span>
                {brand?.name && <span>Thương hiệu: <b>{brand.name}</b></span>}
                {category?.name && <span>Danh mục: <b>{category.name}</b></span>}
                {pObj.sku && <span>SKU: <b>{pObj.sku}</b></span>}
              </div>

              <div className="pd-price">
                <span className="cur">{formatCurrency(displayPrice || 0)}</span>
                {hasDiscount && <span className="base">{formatCurrency(compareAt)}</span>}
                {!selectedVar && variantsMemo.length > 0 && (
                  <span className="range">({formatCurrency(priceMin)} - {formatCurrency(priceMax)})</span>
                )}
              </div>

              {!!orderedKeys.length && (
                <div className="pd-variants">
                  {orderedKeys.map((key) => {
                    const options = optionGroups[key] || [];
                    const selected = selectedAttrs[key] ?? "";
                    const disabledMap = buildDisabledMap(variantsMemo, key, selectedAttrs);
                    return (
                      <div className="v-group" key={key}>
                        <div className="label">{prettyKey(key)}</div>
                        <div className="v-list">
                          {options.map((opt) => {
                            const active = norm(opt.value) === norm(selected);
                            const disabled = disabledMap.get(String(opt.value)) === true;
                            return (
                              <button
                                type="button"
                                key={`${key}:${opt.value}`}
                                className={`chip-square ${active ? "active" : ""}`}
                                disabled={disabled}
                                onClick={() => onPick(key, opt.value)}
                                title={String(opt.label)}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {selectedVar && (
                    <div className={`stock ${selectedVar.stock > 0 ? "" : "oos"}`}>
                      {(selectedVar.stock ?? 0) > 0 ? `Còn hàng (${selectedVar.stock})` : "Hết hàng"}
                    </div>
                  )}
                </div>
              )}

              <div className="pd-size-advisor">
                <div className="sa-card">
                  <div className="sa-left">
                    <span className="sa-title">Hướng dẫn chọn size</span>
                    <span className="sa-sub">{sizeSuggest ? <>Size đề xuất: <b>{sizeSuggest}</b></> : "Chưa có size đề xuất"}</span>
                  </div>
                  <button type="button" className="sa-link" onClick={() => setSizeOpen(true)}>Nhập size ▸</button>
                </div>
              </div>

              <div className="pd-actions">
                <div className="qty">
                  <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>-</button>
                  <input
                    type="number"
                    value={qty}
                    min={1}
                    max={selectedVar?.stock ?? 999999}
                    onChange={(e) => {
                      const n = Math.max(1, Number(e.target.value) || 1);
                      setQty(selectedVar?.stock != null ? Math.min(n, selectedVar.stock) : n);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setQty((q) => (selectedVar?.stock != null ? Math.min(q + 1, selectedVar.stock) : q + 1))}
                    disabled={selectedVar?.stock != null && qty >= selectedVar.stock}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={addToCart}
                  disabled={!selectedVar || (selectedVar?.stock ?? 0) === 0 || qty > (selectedVar?.stock ?? Infinity) || adding}
                >
                  Thêm Vào Giỏ Hàng
                </button>

                <button
                  type="button"
                  className="btn btn-buy"
                  onClick={buyNow}
                  disabled={!selectedVar || (selectedVar?.stock ?? 0) === 0 || qty > (selectedVar?.stock ?? Infinity) || adding}
                >
                  Mua Ngay
                </button>
              </div>

              {!!specEntries.length && (
                <div className="pd-specs">
                  <h3>Chi tiết sản phẩm</h3>
                  <table>
                    <tbody>
                      {specEntries.map(([k, v], i) => (
                        <tr key={i}>
                          <td>{k}</td>
                          <td>{String(v)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pObj.description && (
                <div className="pd-desc">
                  <h3>Mô tả sản phẩm</h3>
                  <div className="desc" dangerouslySetInnerHTML={{ __html: pObj.description }} />
                </div>
              )}
            </div>
          </div>

          <section className="pd-section">
            <h2>ĐÁNH GIÁ SẢN PHẨM</h2>
            <div className="rating-sum card-muted">
              <div className="avgbox">
                <div className="big">{ratingValue?.toFixed ? ratingValue.toFixed(1) : ratingValue}</div>
                <Stars value={ratingValue} size={22} />
              </div>
              <div className="filters">
                {["all", 5, 4, 3, 2, 1].map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`tag ${String(rvStar) === String(f) ? "active" : ""}`}
                    onClick={() => {
                      setRvStar(String(f));
                      setRvPage(1);
                    }}
                  >
                    {f === "all" ? "Tất cả" : `${f} Sao (${summary.histogram?.[f] || 0})`}
                  </button>
                ))}
              </div>
            </div>

            {!!reviews.items?.length ? (
              <>
                <div className="rv-list">
                  {reviews.items.map((r) => (
                    <div className="rv-item" key={r._id}>
                      <div className="rv-head">
                        <b>{r.author_name || "Người dùng"}</b>
                        <Stars value={r.rating || 0} />
                      </div>
                      {r.content && <div className="rv-body">{r.content}</div>}
                      {r.createdAt && <div className="rv-time">{new Date(r.createdAt).toLocaleString()}</div>}
                    </div>
                  ))}
                </div>
                <div className="rv-pager">
                  <button disabled={rvPage <= 1} onClick={() => setRvPage((p) => Math.max(1, p - 1))}>« Trước</button>
                  <span>Trang {rvPage}</span>
                  <button disabled={(reviews.items?.length || 0) < RV_LIMIT} onClick={() => setRvPage((p) => p + 1)}>Sau »</button>
                </div>
              </>
            ) : (
              <div className="muted">Chưa có đánh giá phù hợp bộ lọc.</div>
            )}
          </section>

          <section className="pd-section">
            <h2>Sản phẩm liên quan</h2>
            {related?.length ? (
              <div className="rel-grid">
                {related.map((rp) => {
                  const img = rp.images?.[0];
                  const price = rp.base_price ?? rp.price ?? 0;
                  const rating = rp.rating_avg || 0;
                  const sold = rp.sold_count ?? rp.sold ?? 0;
                  return (
                    <Link className="rel-card" to={`/product/${rp.slug || rp._id || rp.id}`} key={rp._id || rp.id}>
                      <div className="rel-thumb">{img ? <img src={img} alt={rp.name} /> : <div className="noimg">No Image</div>}</div>
                      <div className="rel-info">
                        <div className="rel-name" title={rp.name}>{rp.name}</div>
                        <div className="rel-price-row"><span className="price-cur">{formatCurrency(price)}</span></div>
                        <div className="rel-meta">
                          <span className="rel-rating">
                            <span className="stars-mini">{"★".repeat(Math.round(rating)).padEnd(5, "☆")}</span>
                            <span className="score">{rating?.toFixed ? rating.toFixed(1) : rating}</span>
                          </span>
                          <span className="rel-sold">Đã bán {sold}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="muted">Chưa có sản phẩm liên quan.</div>
            )}
          </section>

          {sizeOpen && (
            <div className="modal-backdrop" onClick={() => setSizeOpen(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Nhập thông tin cơ thể</h3>
                <div className="sa-grid">
                  <label>Chiều cao (cm)* <input type="number" min="0" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
                  <label>Cân nặng (kg)* <input type="number" min="0" value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
                  <label>Vòng ngực (cm) <input type="number" min="0" value={chest} onChange={(e) => setChest(e.target.value)} /></label>
                  <label>Vòng eo (cm) <input type="number" min="0" value={waist} onChange={(e) => setWaist(e.target.value)} /></label>
                  <label>Vòng mông (cm) <input type="number" min="0" value={hip} onChange={(e) => setHip(e.target.value)} /></label>
                  <label>Ngang vai (cm) <input type="number" min="0" value={shoulder} onChange={(e) => setShoulder(e.target.value)} /></label>
                </div>
                <div className="modal-actions">
                  <button className="btn btn-outline" onClick={() => setSizeOpen(false)}>Huỷ</button>
                  <button className="btn" onClick={runSuggest} disabled={!canSuggest}>Gợi ý size</button>
                </div>
                <div className="sa-note">* Bắt buộc nhập chiều cao và cân nặng. Số đo khác là tuỳ chọn để tinh chỉnh kết quả.</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
