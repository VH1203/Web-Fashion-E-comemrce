import { BarChart2, Menu, X, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ImageIcon from "@mui/icons-material/Image";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

const menuItems = [
  { id: "analytics", route: "/shop", name: "Analytics", icon: BarChart2 },
  {
    id: "manage_products",
    route: "/shop/products",
    name: "Manage Products",
    icon: ShoppingCart,
  },
  {
    id: "manage_orders",
    route: "/shop/orders",
    name: "Manage Orders",
    icon: ShoppingCart,
  },
  {
    id: "manage_vouchers",
    route: "/shop/vouchers",
    name: "Manage Voucher",
    icon: LocalOfferIcon,
  },
  {
    id: "manage_banners",
    route: "/shop/banners",
    name: "Manage Banner",
    icon: ImageIcon,
  },
  {
    id: "manage_flashsale",
    route: "/shop/flashsales",
    name: "Manage Flashsale",
    icon: ImageIcon,
  },
];

const Sidebar = ({
  activeMenu,
  setActiveMenu,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const { user } = useContext(AuthContext);
  console.log("user", user);

  const userName = user?.name || user?.email || "User";
  const avatarUrl =
    user?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName
    )}&background=random`;

  return (
    <Paper
      elevation={4}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: sidebarOpen ? "18rem" : "5rem",
        p: sidebarOpen ? 2 : 1,
        transition: "width 0.3s ease, padding 0.3s ease",
        height: "calc(100vh - 81px)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 2,
          mb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            ...(!sidebarOpen && { justifyContent: "center", width: "100%" }),
          }}
        >
          <Avatar
            sx={{
              bgcolor: "primary.main",
              background:
                "linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(147,51,234,1) 100%)",
              fontWeight: "bold",
            }}
          >
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          {sidebarOpen && (
            <Typography variant="h6" fontWeight="bold" sx={{ ml: 2 }}>
              Cửa hàng của tôi
            </Typography>
          )}
        </Box>

        {sidebarOpen && (
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} size="small">
            <X size={20} />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "action.hover",
            borderRadius: 1,
            p: 1,
          }}
        >
          <Avatar src={avatarUrl} alt="User" />
          {sidebarOpen && (
            <Box sx={{ ml: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {userName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role === "shop_owner"
                  ? "Chủ cửa hàng"
                  : "Hi, welcome back"}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Menu */}
      <Box component="nav" sx={{ flexGrow: 1 }}>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                component={Link}
                to={item.route}
                selected={activeMenu === item.id}
                onClick={() => setActiveMenu(item.id)}
                sx={{
                  justifyContent: sidebarOpen ? "initial" : "center",
                  px: 2,
                  my: 0.5,
                  borderRadius: 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: sidebarOpen ? 2 : "auto",
                    justifyContent: "center",
                    color: "inherit",
                  }}
                >
                  <item.icon size={20} />
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.name} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Toggle button when collapsed */}
      <Box sx={{ textAlign: "center" }}>
        <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </IconButton>
      </Box>
    </Paper>
  );
};

export default Sidebar;
