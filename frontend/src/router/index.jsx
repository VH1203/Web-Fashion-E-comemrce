import React from "react";
import ReactDOM from "react-dom/client";
import App from "../App.jsx";
import "../index.css";
import "mdb-react-ui-kit/dist/css/mdb.min.css"; 

// Tạo root và render App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
