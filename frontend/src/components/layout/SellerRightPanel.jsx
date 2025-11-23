// frontend/src/components/shop/ShopSideNav.jsx
import { Drawer, List, ListSubheader, ListItemButton, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";

const groups = [
  { title: "Tổng quan", items: [{t:"Bảng điều khiển", to:"/shop/dashboard"}] },
  { title: "Sản phẩm", items: [
    {t:"Tất cả sản phẩm", to:"/shop/products"},
    {t:"Thêm sản phẩm", to:"/shop/products/new"},
    {t:"Hàng sắp hết", to:"/shop/inventory/low-stock"},
  ]},
  { title: "Danh mục & Thuộc tính", items: [
    {t:"Danh mục", to:"/shop/catalog/categories"},
    {t:"Thuộc tính", to:"/shop/catalog/attributes"},
    {t:"Brand", to:"/shop/catalog/brands"},
  ]},
  { title: "Dữ liệu", items: [{t:"Import Excel", to:"/shop/products#import"}] },
];

export default function ShopSideNav({ open, onClose }) {
  const nav = useNavigate();
  return (
    <Drawer open={open} onClose={onClose} variant="temporary" anchor="left"
      sx={{ "& .MuiDrawer-paper": { width: 280 } }}>
      {groups.map(g=>(
        <List key={g.title} subheader={<ListSubheader>{g.title}</ListSubheader>}>
          {g.items.map(it=>(
            <ListItemButton key={it.t} onClick={()=>{ nav(it.to); onClose?.(); }}>
              <ListItemText primary={it.t}/>
            </ListItemButton>
          ))}
        </List>
      ))}
    </Drawer>
  );
}
