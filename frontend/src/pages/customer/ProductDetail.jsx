// src/pages/customer/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productService } from "../../services/productService";
import { formatCurrency } from "../../utils/formatCurrency";
import "../../assets/styles/ProductDetail.css";

/* ===== Helpers (no hooks) ===== */
function Stars({ value = 0, size = 16 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const arr = Array.from({ length: 5 }, (_, i) =>
    i < full ? "full" : i === full && half ? "half" : "empty"
  );
  return (
    <div className="stars" style={{ fontSize: size }}>
      {arr.map((t, i) => (
        <span key={i} className={`star ${t}`}>★</span>
      ))}
    </div>
  );
}
function percent(n, total) { return total ? Math.round((n / total) * 100) : 0; }
function prettyKey(k){ return String(k).replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase()); }
const norm = (s) => String(s ?? "").trim().toLowerCase();

/** Gom giá trị từ các biến thể THẬT */
function groupVariantOptions(variants) {
  const map = {};
  for (const v of variants || []) {
    const attrs = v?.attributes || {};
    for (const [k, val] of Object.entries(attrs)) {
      if (val === undefined || val === null || val === "") continue;
      if (!map[k]) map[k] = new Set();
      map[k].add(String(val));
    }
  }
  const orderedKeys = Object.keys(map).sort((a,b)=>a.localeCompare(b)); // mặc định A→Z (có thể đổi Size trước Color nếu muốn)
  const optionGroups = {};
  for (const k of orderedKeys) optionGroups[k] = Array.from(map[k]);
  return { optionGroups, orderedKeys };
}

/** Tìm biến thể khớp nhiều nhất với selections hiện tại */
function findBestVariant(variants, selections) {
  if (!variants?.length) return null;
  let best = null, bestScore = -1;
  for (const v of variants) {
    const attrs = v?.attributes || {};
    let score = 0;
    for (const [k, val] of Object.entries(selections)) {
      if (val == null || val === "") continue;
      if (norm(attrs[k]) === norm(val)) score++;
    }
    // ưu tiên còn hàng
    if ((v.stock ?? 0) > 0) score += 0.5;
    if (score > bestScore) { best = v; bestScore = score; }
  }
  return best;
}

/** Khi user chọn 1 giá trị cho 1 key, tự điều chỉnh selections → biến thể hợp lệ */
function resolveSelectionsOnPick(variants, current, key, value) {
  // 1) lấy tất cả biến thể có key=value
  const list = variants.filter(v => norm(v?.attributes?.[key]) === norm(value));
  if (!list.length) return current; // không có giá trị này trong dữ liệu thật

  // 2) chọn biến thể trong list khớp nhiều nhất với current (các key khác)
  let best = null, bestScore = -1;
  for (const v of list) {
    const attrs = v.attributes || {};
    let score = 0;
    for (const [k2,val2] of Object.entries(current)) {
      if (k2 === key || val2 == null || val2 === "") continue;
      if (norm(attrs[k2]) === norm(val2)) score++;
    }
    if ((v.stock ?? 0) > 0) score += 0.5;
    if (score > bestScore) { best = v; bestScore = score; }
  }

  // 3) selections mới = toàn bộ attributes của biến thể best (đảm bảo hợp lệ)
  const next = { ...current, [key]: value };
  if (best?.attributes) {
    for (const [k,v] of Object.entries(best.attributes)) next[k] = v;
  }
  return next;
}

/** Disable nếu giá trị đó không tồn tại hoặc tất cả biến thể của giá trị đó hết hàng */
function buildDisabledMapLoose(variants, key, values) {
  const map = new Map();
  for (const val of values) {
    const list = variants.filter(v => norm(v?.attributes?.[key]) === norm(val));
    const hasAny = list.length > 0;
    const hasStock = list.some(v => (v.stock ?? 0) > 0);
    map.set(val, !(hasAny && hasStock));
  }
  return map;
}

/* ===== Component ===== */
export default function ProductDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  // hooks cố định
  const [detail, setDetail] = useState(null); // { product, variants, brand, category, ... }
  const [summary, setSummary] = useState({ average: 0, count: 0, histogram: {1:0,2:0,3:0,4:0,5:0} });
  const [reviews, setReviews] = useState({ total: 0, items: [] });
  const [related, setRelated] = useState([]);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedVar, setSelectedVar] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    setSelectedAttrs({});
    setSelectedVar(null);

    (async () => {
      try {
        const [d, s, r, rel] = await Promise.all([
          productService.getDetail(idOrSlug),
          productService.getRatingsSummary(idOrSlug),
          productService.getReviews(idOrSlug, 1, 6),
          productService.getRelated(idOrSlug, 12),
        ]);
        if (!mounted) return;
        setDetail(d);
        setSummary(s);
        setReviews(r);
        setRelated(rel);

        // auto pick biến thể hợp lệ đầu tiên (nếu có)
        const v0 = (d?.variants || [])[0];
        if (v0?.attributes) {
          const init = { ...v0.attributes };
          setSelectedAttrs(init);
          setSelectedVar(v0);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.response?.data?.message || e?.message || "Không tải được chi tiết sản phẩm");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [idOrSlug]);

  // Re-match selectedVar mỗi khi variants hoặc selections đổi
  useEffect(() => {
    if (!detail?.variants) { setSelectedVar(null); return; }
    const best = findBestVariant(detail.variants, selectedAttrs);
    setSelectedVar(best);
  }, [detail?.variants, selectedAttrs]);

  if (loading) return <div className="pd-wrap">Đang tải...</div>;
  if (error) return <div className="pd-wrap error">{error}</div>;
  if (!detail?.product) return <div className="pd-wrap">Không tìm thấy sản phẩm</div>;

  const { product: p, variants = [], brand, category } = detail;
  const { optionGroups, orderedKeys } = groupVariantOptions(variants);

  const images = (selectedVar?.images?.length ? selectedVar.images : (p.images || []));
  const priceMin = detail.product.price_min ?? p.base_price;
  const priceMax = detail.product.price_max ?? p.base_price;
  const displayPrice = selectedVar ? selectedVar.price : (variants.length ? priceMin : p.base_price);
  const compareAt = (selectedVar?.compare_at_price) || (variants.length ? priceMax : null);
  const hasDiscount = !!(compareAt && compareAt > displayPrice);
  const specEntries = [
    ...(p.attributes ? Object.entries(p.attributes) : []),
    ...(selectedVar?.attributes ? Object.entries(selectedVar.attributes) : []),
  ];

  const swapThumbToMain = (idx) => {
    const arr = [...images];
    [arr[0], arr[idx]] = [arr[idx], arr[0]];
    if (selectedVar?.images?.length) {
      setSelectedVar({ ...selectedVar, images: arr });
    } else {
      setDetail({ ...detail, product: { ...detail.product, images: arr } });
    }
  };

  const chooseAttr = (key, val) => {
    // Cho phép bấm TẤT CẢ giá trị đang tồn tại; tự ghép sang 1 biến thể hợp lệ
    setSelectedAttrs(prev => resolveSelectionsOnPick(variants, prev, key, val));
  };

  const addToCart = () => {
    if (!selectedVar) { alert("Vui lòng chọn tổ hợp hợp lệ."); return; }
    navigate("/cart", {
      state: {
        product_id: p._id,
        variant_id: selectedVar._id,
        qty,
        selected_attrs: selectedAttrs
      }
    });
  };

  return (
    <div className="pd-wrap">
      <div className="pd-grid">
        {/* Gallery */}
        <div className="pd-gallery">
          <div className="pd-mainimg">
            {images[0] ? <img src={images[0]} alt={p.name} /> : <div className="noimg">No Image</div>}
            {hasDiscount && <span className="badge">SALE</span>}
          </div>
          {!!images.length && (
            <div className="pd-thumbs">
              {images.map((img, idx) => (
                <button type="button" className="thumb" onClick={() => swapThumbToMain(idx)} key={idx}>
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
            <span className="sold">Đã bán: <b>{p.sold_count || 0}</b></span>
            {brand?.name && <span>Thương hiệu: <b>{brand.name}</b></span>}
            {category?.name && <span>Danh mục: <b>{category.name}</b></span>}
            {p.sku && <span>SKU: <b>{p.sku}</b></span>}
          </div>

          <div className="pd-price">
            <span className="cur">{formatCurrency(displayPrice || 0)}</span>
            {hasDiscount && <span className="base">{formatCurrency(compareAt)}</span>}
            {!selectedVar && variants.length > 0 && (
              <span className="range">({formatCurrency(priceMin)} - {formatCurrency(priceMax)})</span>
            )}
          </div>

          {/* Variant options — CHỈ từ biến thể đang có */}
          {!!orderedKeys.length && (
            <div className="pd-variants">
              {orderedKeys.map((key) => {
                const values = optionGroups[key] || [];
                const selected = selectedAttrs[key] ?? "";
                const disabledMap = buildDisabledMapLoose(variants, key, values); // chỉ disable nếu giá trị không tồn tại / hết hàng toàn bộ
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
                            className={`v-item ${active ? "active" : ""}`}
                            disabled={disabled}
                            onClick={() => chooseAttr(key, val)}
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
              {selectedVar && (<div className="stock">Tồn kho: {selectedVar.stock}</div>)}
            </div>
          )}

          {/* Qty & action */}
          <div className="pd-actions">
            <div className="qty">
              <button type="button" onClick={() => setQty((q)=>Math.max(1,q-1))}>-</button>
              <input
                type="number"
                value={qty}
                min={1}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              />
              <button type="button" onClick={() => setQty((q)=>q+1)}>+</button>
            </div>
            <button type="button" className="btn-primary" onClick={addToCart}>Thêm vào giỏ</button>
          </div>

          {/* Specs */}
          {!!specEntries.length && (
            <div className="pd-specs">
              <h3>Thông số</h3>
              <table>
                <tbody>
                  {specEntries.map(([k, v], idx) => (
                    <tr key={idx}><td>{prettyKey(k)}</td><td>{String(v)}</td></tr>
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

      {/* Ratings summary */}
      <section className="pd-section">
        <h2>Đánh giá ({summary.count})</h2>
        <div className="rating-sum">
          <div className="avg">
            <div className="score">
              {summary.average?.toFixed ? summary.average.toFixed(1) : summary.average}
            </div>
            <Stars value={summary.average} size={22} />
          </div>
          <div className="bars">
            {[5,4,3,2,1].map((star) => (
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

      {/* Reviews list */}
      {!!reviews.items.length && (
        <section className="pd-section">
          <div className="rv-list">
            {reviews.items.map((r) => (
              <div className="rv-item" key={r._id}>
                <div className="rv-head">
                  <b>{r.author_name || "Người dùng"}</b>
                  <Stars value={r.rating || 0} />
                </div>
                <div className="rv-body">{r.content}</div>
                <div className="rv-time">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </section>
      )}

     <section className="pd-section">
  <h2>Sản phẩm liên quan</h2>

  {related.length ? (
    <div className="rel-grid">
      {related.map((rp) => {
        const img = rp.images?.[0];
        const price = rp.base_price || 0;
        const compare = rp.compare_at_price; // nếu BE có trường này
        const hasSale = compare && compare > price;
        const rating = rp.rating_avg || 0;
        const sold = rp.sold_count || 0;

        return (
          <Link className="rel-card" to={`/product/${rp.slug || rp._id}`} key={rp._id}>
            <div className="rel-thumb">
              {img ? <img src={img} alt={rp.name} /> : <div className="noimg">No Image</div>}
              {hasSale && <span className="rel-badge">SALE</span>}
            </div>

            <div className="rel-info">
              <div className="rel-name" title={rp.name}>{rp.name}</div>

              <div className="rel-price-row">
                <span className="price-cur">{formatCurrency(price)}</span>
                {hasSale && <span className="price-base">{formatCurrency(compare)}</span>}
              </div>

              <div className="rel-meta">
                <span className="rel-rating">
                  <span className="stars-mini">{"★".repeat(Math.round(rating)).padEnd(5, "☆")}</span>
                  <span className="score">{(rating || 0).toFixed ? (rating || 0).toFixed(1) : rating}</span>
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

    </div>
  );
}
