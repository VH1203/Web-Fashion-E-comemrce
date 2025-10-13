import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { productApi } from "../../services/productService";
import "../../assets/styles/ProductList.css";

export default function AllProductsPage() {
  const { type } = useParams(); // "flash-sale", "new", "men", "women"
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      let res;
      switch (type) {
        case "flash-sale":
          setTitle("FLASH SALE 🔥");
          res = await productApi.getAll({ tag: "flash-sale", page });
          break;
        case "new":
          setTitle("Sản phẩm mới");
          res = await productApi.getAll({ sort: "created_at", page });
          break;
        case "men":
          setTitle("Thời trang Nam");
          res = await productApi.getAll({ category: "men", page });
          break;
        case "women":
          setTitle("Thời trang Nữ");
          res = await productApi.getAll({ category: "women", page });
          break;
        default:
          setTitle("Tất cả sản phẩm");
          res = await productApi.getAll({ page });
      }
      setProducts(res.products || []);
      setTotal(res.total || 0);
    };
    fetch();
  }, [type, page]);

  return (
    <div className="all-products-page">
      <h2>{title}</h2>
      <div className="product-grid">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            <img
              src={p.images?.[0] || `https://picsum.photos/300/400?random=${p._id}`}
              alt={p.name}
            />
            <h3>{p.name}</h3>
            <p className="price">{p.base_price.toLocaleString()} đ</p>
          </div>
        ))}
      </div>

      {/* pagination */}
      <div className="pagination">
        {page > 1 && <button onClick={() => setPage(page - 1)}>‹ Trước</button>}
        <span>
          Trang {page} / {Math.ceil(total / 12) || 1}
        </span>
        {page * 12 < total && (
          <button onClick={() => setPage(page + 1)}>Sau ›</button>
        )}
      </div>
    </div>
  );
}
