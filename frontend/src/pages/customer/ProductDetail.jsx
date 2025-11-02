// src/pages/customer/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { formatCurrency } from "../../utils/formatCurrency";
import "../../assets/styles/ProductDetail.css";
import { cartService } from "../../services/cartService";

/* ============ Helpers ============ */
const norm = (s) => String(s ?? "").trim().toLowerCase();
const prettyKey = (k) => String(k).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const percent = (n, total) => (total ? Math.round((Number(n || 0) / Number(total)) * 100) : 0);

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

function buildVariantOptionGroups(variants, beVariantOptions) {
  const keysFromVariants = new Set();
  const valuesByKey = new Map();
  for (const v of variants || []) {
    const attrs = v?.attributes || {};
    for (const [k, val] of Object.entries(attrs)) {
      if (val == null || val === "") continue;
      keysFromVariants.add(k);
      if (!valuesByKey.has(k)) valuesByKey.set(k, new Set());
      valuesByKey.get(k).add(String(val));
    }
  }
  const orderedKeys = beVariantOptions
    ? Object.keys(beVariantOptions)
    : Array.from(keysFromVariants).sort((a, b) => a.localeCompare(b));
  const optionGroups = {};
  for (const k of orderedKeys) {
    const beVals = Array.isArray(beVariantOptions?.[k]) ? beVariantOptions[k].map(String) : [];
    const found = Array.from(valuesByKey.get(k) || []);
    optionGroups[k] = beVals.length ? beVals : found;
  }
  return { optionGroups, orderedKeys };
}

function findBestVariant(variants, selections) {
  if (!variants?.length) return null;
  let best = null, bestScore = -1;
  for (const v of variants) {
    let s = 0;
    for (const [k, val] of Object.entries(selections || {})) {
      if (val && norm(v?.attributes?.[k]) === norm(val)) s++;
    }
    if ((v.stock ?? 0) > 0) s += 0.5;
    if (s > bestScore) { best = v; bestScore = s; }
  }
  return best;
}
function resolveOnPick(variants, current, key, value) {
  const list = variants.filter(v => norm(v?.attributes?.[key]) === norm(value));
  if (!list.length) return current;
  let best = null, bestScore = -1;
  for (const v of list) {
    let s = 0;
    for (const [k2, val2] of Object.entries(current)) {
      if (k2 === key || !val2) continue;
      if (norm(v?.attributes?.[k2]) === norm(val2)) s++;
    }
    if ((v.stock ?? 0) > 0) s += 0.5;
    if (s > bestScore) { best = v; bestScore = s; }
  }
  const next = { ...current, [key]: value };
  if (best?.attributes) for (const [k, v] of Object.entries(best.attributes)) next[k] = v;
  return next;
}
function buildDisabledMap(variants, key, values) {
  const m = new Map();
  for (const val of values) {
    const list = variants.filter(v => norm(v?.attributes?.[key]) === norm(val));
    const ok = list.length && list.some(v => (v.stock ?? 0) > 0);
    m.set(val, !ok);
  }
  return m;
}

/* ============ Component ============ */
export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  // --- states (luôn luôn cùng thứ tự) ---
  const [detail, setDetail] = useState(null); // { product, variants, variant_options, brand, category, flash_sale }
  const [summary, setSummary] = useState({ average: 0, count: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [reviews, setReviews] = useState({ total: 0, items: [] });
  const [related, setRelated] = useState([]);

  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedVar, setSelectedVar] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- effects (luôn luôn gọi) ---
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setError(""); setSelectedAttrs({}); setSelectedVar(null);
        const [d, s, r, rel] = await Promise.all([
          productService.getDetail(idOrSlug),
          productService.getRatingsSummary?.(idOrSlug),
          productService.getReviews?.(idOrSlug, 1, 6),
          productService.getRelated?.(idOrSlug, 12),
        ]);
        if (!alive) return;
        setDetail(d || null);
        setSummary(s || { average: 0, count: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
        setReviews(r || { total: 0, items: [] });
        setRelated(rel || []);
        const first = (d?.variants || []).find(v => (v.stock ?? 0) > 0) || d?.variants?.[0];
        if (first?.attributes) {
          setSelectedAttrs({ ...first.attributes });
          setSelectedVar(first);
          if (typeof first.stock === "number" && first.stock > 0) setQty(q => Math.min(q, first.stock));
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.message || e?.message || "Không tải được chi tiết sản phẩm");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [idOrSlug]);

  useEffect(() => {
    const variants = detail?.variants || [];
    if (!variants.length) { setSelectedVar(null); return; }
    const best = findBestVariant(variants, selectedAttrs);
    setSelectedVar(best);
    if (best && typeof best.stock === "number" && best.stock >= 1) {
      setQty(q => Math.min(Math.max(1, q), best.stock));
    }
  }, [detail?.variants, selectedAttrs]);

  // --- memo (luôn luôn gọi, trước bất kỳ return nào) ---
  const variantsMemo = detail?.variants || [];
  const variantOptionsMemo = detail?.variant_options;
  const { optionGroups, orderedKeys } = useMemo(
    () => buildVariantOptionGroups(variantsMemo, variantOptionsMemo),
    [variantsMemo, variantOptionsMemo]
  );

  // ====== Tất cả code dưới đây KHÔNG gọi thêm hook nữa ======

  const p = detail?.product || {};
  const brand = detail?.brand;
  const category = detail?.category;
  const flash_sale = detail?.flash_sale;

  const images = (selectedVar?.images?.length ? selectedVar.images : (p.images || []));
  const priceMin = p.price_min ?? p.base_price ?? 0;
  const priceMax = p.price_max ?? p.base_price ?? 0;
  const displayPrice = selectedVar ? selectedVar.price : (variantsMemo.length ? priceMin : p.base_price);
  const compareAt = selectedVar?.compare_at_price ?? (variantsMemo.length ? priceMax : null);
  const hasDiscount = !!(compareAt && compareAt > displayPrice);
  const flashBadge = flash_sale?.discount_percent ? `${flash_sale.discount_percent}%` : null;

  const specEntries = [
    ...(p.attributes ? Object.entries(p.attributes) : []),
    ...(selectedVar?.attributes ? Object.entries(selectedVar.attributes) : []),
  ];
  const stockLabel = selectedVar
    ? ((selectedVar.stock ?? 0) > 0 ? `Tồn kho: ${selectedVar.stock}` : "Hết hàng")
    : "";

  const onPick = (k, v) => setSelectedAttrs(prev => resolveOnPick(variantsMemo, prev, k, v));

  const swapThumb = (i) => {
    const arr = [...images];
    [arr[0], arr[i]] = [arr[i], arr[0]];
    if (selectedVar?.images?.length) setSelectedVar({ ...selectedVar, images: arr });
    else setDetail(prev => prev ? ({ ...prev, product: { ...prev.product, images: arr } }) : prev);
  };

  const addToCart = async () => {
    try {
      if (!selectedVar) return alert("Vui lòng chọn tổ hợp hợp lệ.");
      if ((selectedVar.stock ?? 0) <= 0) return alert("Biến thể đã hết hàng.");
      if (qty > (selectedVar.stock ?? 0)) return alert("Không đủ tồn kho.");
      setAdding(true);
      await cartService.add({
        product_id: p._id,
        variant_id: selectedVar._id || selectedVar.id,
        qty,
      });
      navigate("/cart");
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Không thêm được vào giỏ";
      if ([401, 403].includes(e?.response?.status)) {
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        return navigate(`/login?returnUrl=${returnUrl}`);
      }
      alert(msg);
    } finally { setAdding(false); }
  };
  const buyNow = async () => {
    try {
      if (!selectedVar) return alert("Vui lòng chọn tổ hợp hợp lệ.");
      if ((selectedVar.stock ?? 0) <= 0) return alert("Biến thể đã hết hàng.");
      if (qty > (selectedVar.stock ?? 0)) return alert("Không đủ tồn kho.");
      setAdding(true);
      await cartService.add({
        product_id: p._id,
        variant_id: selectedVar._id || selectedVar.id,
        qty,
      });
      navigate("/checkout");
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Không thể mua ngay";
      if ([401, 403].includes(e?.response?.status)) {
        const returnUrl = encodeURIComponent(location.pathname + location.search);
        return navigate(`/login?returnUrl=${returnUrl}`);
      }
      alert(msg);
    } finally { setAdding(false); }
  };

  /* ====== Render (không còn return sớm trước hook) ====== */
  return (
    <div className="pd-wrap">
      {/* trạng thái */}
      {loading && <div>Đang tải...</div>}
      {error && !loading && <div className="error">{error}</div>}
      {!loading && !p._id && !error && <div>Không tìm thấy sản phẩm</div>}

      {p._id && (
        <>
          <div className="pd-grid">
            {/* Gallery */}
            <div className="pd-gallery">
              <div className="pd-mainimg">
                {images[0] ? <img src={images[0]} alt={p.name} /> : <div className="noimg">No Image</div>}
                {(hasDiscount || flashBadge) && <span className="badge">{flashBadge || "SALE"}</span>}
              </div>
              {!!images.length && (
                <div className="pd-thumbs">
                  {images.map((img, idx) => (
                    <button type="button" className="thumb" onClick={() => swapThumb(idx)} key={idx}>
                      <img src={img} alt={`thumb-${idx}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="pd-info">
              <h1 className="pd-name">{p.name}</h1>

              <div className="pd-meta">
                <span className="rating">
                  <Stars value={summary.average || p.rating_avg || 0} />
                  <span className="avg">
                    {(summary.average || p.rating_avg || 0).toFixed
                      ? (summary.average || p.rating_avg || 0).toFixed(1)
                      : (summary.average || p.rating_avg || 0)}
                  </span>
                  <span className="count">({summary.count || p.rating_count || 0} đánh giá)</span>
                </span>
                {p.sold_count != null && <span className="sold">Đã bán: <b>{p.sold_count}</b></span>}
                {brand?.name && <span>Thương hiệu: <b>{brand.name}</b></span>}
                {category?.name && <span>Danh mục: <b>{category.name}</b></span>}
                {p.sku && <span>SKU: <b>{p.sku}</b></span>}
              </div>

              {/* Giá */}
              <div className="pd-price">
                <span className="cur">{formatCurrency(displayPrice || 0)}</span>
                {hasDiscount && <span className="base">{formatCurrency(compareAt)}</span>}
                {!selectedVar && variantsMemo.length > 0 && (
                  <span className="range">({formatCurrency(priceMin)} - {formatCurrency(priceMax)})</span>
                )}
              </div>

              {/* Biến thể */}
              {!!orderedKeys.length && (
                <div className="pd-variants">
                  {orderedKeys.map((key) => {
                    const values = optionGroups[key] || [];
                    const selected = selectedAttrs[key] ?? "";
                    const disabledMap = buildDisabledMap(variantsMemo, key, values);
                    return (
                      <div className="v-group" key={key}>
                        <div className="label">{prettyKey(key)}</div>
                        <div className="v-list">
                          {values.map((val) => {
                            const active = norm(val) === norm(selected);
                            const disabled = disabledMap.get(val) === true;
                            return (
                              <button
                                type="button"
                                key={val}
                                className={`chip-square ${active ? "active" : ""}`}
                                disabled={disabled}
                                onClick={() => onPick(key, val)}
                                title={disabled ? "Không có hàng" : String(val)}
                              >
                                {String(val)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {selectedVar && (<div className={`stock ${selectedVar.stock > 0 ? "" : "oos"}`}>{stockLabel}</div>)}
                </div>
              )}

              {/* Qty + actions */}
              <div className="pd-actions">
                <div className="qty">
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}>-</button>
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
                    onClick={() => setQty(q => selectedVar?.stock != null ? Math.min(q + 1, selectedVar.stock) : q + 1)}
                    disabled={selectedVar?.stock != null && qty >= selectedVar.stock}
                  >+</button>
                </div>

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={addToCart}
                  disabled={!selectedVar || (selectedVar?.stock ?? 0) === 0 || qty > (selectedVar?.stock ?? Infinity)}
                >
                  Thêm Vào Giỏ Hàng
                </button>

                <button
                  type="button"
                  className="btn btn-buy"
                  onClick={buyNow}
                  disabled={!selectedVar || (selectedVar?.stock ?? 0) === 0 || qty > (selectedVar?.stock ?? Infinity)}
                >
                  Mua Ngay
                </button>
              </div>

              {/* Specs */}
              {!!specEntries.length && (
                <div className="pd-specs">
                  <h3>Chi tiết sản phẩm</h3>
                  <table>
                    <tbody>
                      {specEntries.map(([k, v], i) => (
                        <tr key={i}><td>{prettyKey(k)}</td><td>{String(v)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Description */}
              {p.description && (
                <div className="pd-desc">
                  <h3>Mô tả sản phẩm</h3>
                  <div className="desc" dangerouslySetInnerHTML={{ __html: p.description }} />
                </div>
              )}
            </div>
          </div>

          {/* Rating summary */}
          <section className="pd-section">
            <h2>Đánh giá ({summary.count})</h2>
            <div className="rating-sum">
              <div className="avg">
                <div className="score">{summary.average?.toFixed ? summary.average.toFixed(1) : summary.average}</div>
                <Stars value={summary.average} size={22} />
              </div>
              <div className="bars">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div className="bar-row" key={star}>
                    <span>{star}★</span>
                    <div className="bar">
                      <div className="fill" style={{ width: `${percent(summary.histogram[star], summary.count)}%` }} />
                    </div>
                    <span className="n">{summary.histogram[star] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Reviews */}
          {!!reviews.items?.length && (
            <section className="pd-section">
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
            </section>
          )}

          {/* Related */}
          <section className="pd-section">
            <h2>Sản phẩm liên quan</h2>
            {related?.length ? (
              <div className="rel-grid">
                {related.map((rp) => {
                  const img = rp.images?.[0];
                  const price = rp.base_price ?? rp.price ?? 0;
                  const compare = rp.compare_at_price;
                  const sale = compare && compare > price;
                  const rating = rp.rating_avg || 0;
                  const sold = rp.sold_count ?? rp.sold ?? 0;
                  return (
                    <Link className="rel-card" to={`/product/${rp.slug || rp._id || rp.id}`} key={rp._id || rp.id}>
                      <div className="rel-thumb">
                        {img ? <img src={img} alt={rp.name} /> : <div className="noimg">No Image</div>}
                        {sale && <span className="rel-badge">SALE</span>}
                      </div>
                      <div className="rel-info">
                        <div className="rel-name" title={rp.name}>{rp.name}</div>
                        <div className="rel-price-row">
                          <span className="price-cur">{formatCurrency(price)}</span>
                          {sale && <span className="price-base">{formatCurrency(compare)}</span>}
                        </div>
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
        </>
      )}
    </div>
  );
}
