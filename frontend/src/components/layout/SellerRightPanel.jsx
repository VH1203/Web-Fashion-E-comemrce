import React from "react";
import { Drawer, List, ListSubheader, ListItemButton, ListItemText, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const groups = [
  { title: "Quản Lý Đơn Hàng", items: [
    { label:"Tất cả", path:"/shop/orders" },
    { label:"Giao Hàng Loạt", path:"/shop/orders/batch" },
    { label:"Bàn Giao Đơn Hàng", path:"/shop/orders/hand-over" },
    { label:"Đơn Trả/Hoàn/Huỷ", path:"/shop/returns" },
    { label:"Cài Đặt Vận Chuyển", path:"/shop/shipping/settings" },
  ]},
  { title: "Quản Lý Sản Phẩm", items: [
    { label:"Tất Cả Sản Phẩm", path:"/shop/products" },
    { label:"Thêm Sản Phẩm", path:"/shop/products/new" },
    { label:"Quản lý danh mục", path:"/shop/categories" },
    { label:"Khuyến Mãi của Shop", path:"/shop/promotions" },
    { label:"Flash Sale Của Shop", path:"/shop/flash-sale" },
    { label:"Mã Giảm Giá Của Shop", path:"/shop/vouchers" },
  ]},
  { title: "Chăm sóc khách hàng", items: [
    { label:"Quản lý Chat", path:"/shop/chat" },
    { label:"Quản lý Đánh Giá", path:"/shop/reviews" },
  ]},
  { title: "Tài Chính", items: [
    { label:"Doanh Thu", path:"/shop/wallet/revenue" },
    { label:"Số dư TK Shop", path:"/shop/wallet" },
    { label:"Tài Khoản Ngân Hàng", path:"/shop/banks" },
  ]},
];

export default function SellerSideNav({ open, onClose }) {
  const nav = useNavigate();
  return (
    <Drawer anchor="left" open={open} onClose={onClose} sx={{ '& .MuiDrawer-paper': { width: 300 } }}>
      {groups.map((g, idx) => (
        <List key={idx} subheader={<ListSubheader>{g.title}</ListSubheader>}>
          {g.items.map((it) => (
            <ListItemButton key={it.path} onClick={() => { nav(it.path); onClose?.(); }}>
              <ListItemText primary={it.label} />
            </ListItemButton>
          ))}
          <Divider />
        </List>
      ))}
    </Drawer>
  );
}
