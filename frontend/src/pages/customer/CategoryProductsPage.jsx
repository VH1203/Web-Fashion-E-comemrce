import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productApi } from "../../services/productService";
import "../../assets/styles/ProductList.css";

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    productApi.getAll({ category: slug }).then((res) => {
      setProducts(res.products || []);
      setTitle(slug.toUpperCase());
    });
  }, [slug]);

  return (
    <div className="all-products-page">
      <h2>Danh mục: {title}</h2>
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
    </div>
  );
}
