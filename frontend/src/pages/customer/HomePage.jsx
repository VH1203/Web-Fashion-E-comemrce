import React, { useEffect, useMemo, useState } from "react";
import { homeService } from "../../services/homeService";
import { formatCurrency } from "../../utils/formatCurrency";
import "../../assets/styles/Homepage.css";

export default function HomePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await homeService.fetchHomepage();
        setData(res);
      } catch (e) {
        setError(e?.message || "Load homepage failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fsEnd = data?.flashSale?.end_time
    ? new Date(data.flashSale.end_time)
    : null;
  const now = new Date();
  const remainMs = useMemo(
    () => (fsEnd ? Math.max(0, fsEnd - now) : 0),
    [fsEnd, data]
  );

  if (loading) return <div className="hp-container">Đang tải trang chủ…</div>;
  if (error) return <div className="hp-container error">{error}</div>;

  const { banners, flashSale, categories, men, women } = data || {};

  return (
    <div className="hp-container">
      <BannerSection banners={banners} />

      {flashSale && (
        <section className="hp-section">
          <div className="hp-section-header">
            <h2>Flash Sale</h2>
            <Countdown endTime={flashSale.end_time} />
          </div>
          <div className="grid grid-5">
            {flashSale.items.map((it) => (
              <ProductCard
                key={`${it.product_id}-${it.variant_id}`}
                item={it}
                type="flash"
              />
            ))}
          </div>
        </section>
      )}

      <section className="hp-section">
        <div className="hp-section-header">
          <h2>Danh mục nổi bật</h2>
        </div>
        <div className="category-list">
          {categories?.map((cat) => (
            <div className="category-group" key={cat._id}>
              <div className="category-parent">
                {cat.image_url && <img src={cat.image_url} alt={cat.name} />}
                <h3>{cat.name}</h3>
              </div>
              <div className="category-children">
                {cat.children?.map((c) => (
                  <a className="chip" href={`/category/${c.slug}`} key={c._id}>
                    {c.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Men */}
      <section className="hp-section">
        <div className="hp-section-header">
          <h2>Thời trang Nam</h2>
        </div>
        <div className="grid grid-6">
          {men?.map((p) => (
            <ProductCard key={p._id} item={{ product: p }} />
          ))}
        </div>
      </section>

      {/* Women */}
      <section className="hp-section">
        <div className="hp-section-header">
          <h2>Thời trang Nữ</h2>
        </div>
        <div className="grid grid-6">
          {women?.map((p) => (
            <ProductCard key={p._id} item={{ product: p }} />
          ))}
        </div>
      </section>
    </div>
  );
}

function BannerSection({ banners }) {
  const tops = banners?.homepage_top || [];
  const mids = banners?.homepage_mid || [];
  const bottoms = banners?.homepage_bottom || [];
  const all = [tops, mids, bottoms].filter((x) => x?.length);
  if (!all.length) return null;

  return (
    <section className="hp-banners">
      {all.map((list, i) => (
        <div className="banner-row" key={i}>
          {list.map((b) => (
            <a href={b.link || "#"} className="banner" key={b._id}>
              <img src={b.image_url} alt={b.title} />
            </a>
          ))}
        </div>
      ))}
    </section>
  );
}

function Countdown({ endTime }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(endTime).getTime();
  const left = Math.max(0, end - now);
  const hh = String(Math.floor(left / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return (
    <div className="countdown">
      Kết thúc sau {hh}:{mm}:{ss}
    </div>
  );
}

function ProductCard({ item, type }) {
  const p = item.product || item; // support both formats
  const img = p?.images?.[0];
  const price = type === "flash" ? item.flash_price : p?.base_price;
  const base = p?.base_price;
  const percent =
    type === "flash" && base
      ? Math.max(0, Math.round((1 - price / base) * 100))
      : 0;
  return (
    <a className="product-card" href={`/product/${p?._id}`}>
      <div className="thumb">
        {img ? (
          <img src={img} alt={p?.name} />
        ) : (
          <div className="noimg">No Image</div>
        )}
        {type === "flash" && percent > 0 && (
          <span className="badge">-{percent}%</span>
        )}
      </div>
      <div className="info">
        <h4 className="name" title={p?.name}>
          {p?.name}
        </h4>
        <div className="price">
          <span className="cur">{formatCurrency(price || 0)}</span>
          {type === "flash" && base && (
            <span className="base">{formatCurrency(base)}</span>
          )}
        </div>
      </div>
    </a>
  );
}
