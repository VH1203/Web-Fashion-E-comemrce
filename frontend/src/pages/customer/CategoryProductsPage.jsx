import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productApi } from "../../services/productService";
import "../../assets/styles/ProductList.css";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    sort: "created_at",
  });

  useEffect(() => {
    loadProducts();
  }, [slug, filters]);

  const loadProducts = async () => {
    try {
      const res = await productApi.getAll({
        category: slug,
        sort: filters.sort,
        min_price: filters.min_price,
        max_price: filters.max_price,
      });
      setProducts(res.products || []);
      setTitle(slug.toUpperCase());
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  };

  return (
    <div className="category-products-page">
      <h2>Danh mục: {title}</h2>

      {/* Bộ lọc */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Giá từ:</label>
          <input
            type="number"
            name="min_price"
            value={filters.min_price}
            onChange={handleFilterChange}
            placeholder="0"
          />
          <label>đến:</label>
          <input
            type="number"
            name="max_price"
            value={filters.max_price}
            onChange={handleFilterChange}
            placeholder="..."
          />
        </div>

        <div className="filter-group">
          <label>Sắp xếp:</label>
          <select name="sort" value={filters.sort} onChange={handleFilterChange}>
            <option value="created_at">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="sold">Bán chạy</option>
          </select>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="product-grid">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p._id} className="product-card">
              <img
                src={p.images?.[0] || `https://picsum.photos/300/400?random=${p._id}`}
                alt={p.name}
              />
              <h3>{p.name}</h3>
              <p className="price">{p.base_price.toLocaleString()} đ</p>
            </div>
          ))
        ) : (
          <p className="no-products">Không có sản phẩm nào phù hợp</p>
        )}
      </div>
    </div>
  );
}
