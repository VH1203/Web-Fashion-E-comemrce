import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import dfsLogo from "../../assets/icons/DFS-NonBG.png";
import "../../assets/styles/Header.css";

// MUI
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/change-password"];

export default function Header({
  cartCount = 0,
  notifyCount = 0,
  user = null,       // { name, email } | null
  onSearch,          // (keyword) => void
  onLogout,          // () => void
}) {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  // Profile menu (mở cả khi hover)
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = (e) => setAnchorEl(e.currentTarget);
  const closeMenu = () => setAnchorEl(null);

  const handleLogout = () => {
    closeMenu();
    onLogout?.();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const keyword = new FormData(e.currentTarget).get("q")?.toString().trim();
    if (keyword) onSearch?.(keyword);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="dfs-header"
      sx={{
        background: "linear-gradient(90deg, var(--primary-500), var(--primary-700))",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar
          className="dfs-toolbar"
          sx={{
            px: 2,
            gap: 2,
            justifyContent: isAuthPage ? "center" : "space-between",
          }}
        >
          {/* Logo avatar tròn bên trái (nổi bật) */}
          <Link component={RouterLink} to="/" underline="none" sx={{ lineHeight: 0 }}>
            <Box
              className="brand-logo-wrap"
              sx={{
                width: 74,
                height: 74,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "var(--primary-50)",
                border: "2px solid var(--primary-100)",
                boxShadow: "0 6px 20px rgba(0,0,0,.25)",
                transition: "transform .2s ease, box-shadow .2s ease",
                willChange: "transform",
                "&:hover": {
                  transform: "translateY(-2px) scale(1.03)",
                  boxShadow: "0 10px 28px rgba(0,0,0,.28)",
                },
              }}
            >
              <Box
                component="img"
                src={dfsLogo}
                alt="DFS"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  transform: "scale(1.18)",
                  display: "block",
                }}
              />
            </Box>
          </Link>

          {/* Tên thương hiệu */}
          <Box className="brand-title" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h4" fontWeight={900} sx={{ textShadow: "0 1px 1px rgba(0,0,0,.25)" }}>
              Daily Fit
            </Typography>
          </Box>

          {/* Auth pages: chỉ logo + tên */}
          {isAuthPage ? (
            <Box sx={{ display: "none" }} />
          ) : (
            <>
              {/* Search pill – nền trắng, viền xanh toả */}
              {isSmUp ? (
                <Box
                  component="form"
                  onSubmit={handleSearchSubmit}
                  className="header-search"
                  sx={{ flex: 1, maxWidth: isMdUp ? 620 : 460 }}
                >
                  <TextField
                    name="q"
                    size="small"
                    fullWidth
                    placeholder="Tìm kiếm sản phẩm…"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "999px",
                        backgroundColor: "#fff",               // nền trắng
                      },
                    }}
                  />
                </Box>
              ) : (
                <IconButton
                  aria-label="Tìm kiếm"
                  onClick={() => navigate("/search")}
                  className="nav-icon"
                  sx={{ ml: "auto" }}
                >
                  <SearchIcon />
                </IconButton>
              )}

              {/* Khu vực actions */}
              {!user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddAltIcon />}
                    className="btn-outline-hero"
                    sx={{ textTransform: "none", borderRadius: "999px" }}
                  >
                    Đăng ký
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    size="small"
                    startIcon={<LoginIcon />}
                    className="btn-solid-hero"
                    sx={{ textTransform: "none", borderRadius: "999px" }}
                  >
                    Đăng nhập
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <IconButton
                    color="inherit"
                    component={RouterLink}
                    to="/cart"
                    aria-label="Giỏ hàng"
                    className="nav-icon"
                  >
                    <Badge badgeContent={cartCount} color="primary">
                      <ShoppingCartIcon />
                    </Badge>
                  </IconButton>

                  <IconButton
                    color="inherit"
                    component={RouterLink}
                    to="/notifications"
                    aria-label="Thông báo"
                    className="nav-icon"
                  >
                    <Badge badgeContent={notifyCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  {/* Profile icon: mở menu khi hover hoặc click */}
                  <IconButton
                    color="inherit"
                    aria-label="Tài khoản"
                    className="nav-icon"
                    onClick={openMenu}
                    onMouseEnter={openMenu}
                    sx={{ ml: 0.5 }}
                  >
                    <AccountCircleIcon />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={closeMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    MenuListProps={{ onMouseLeave: closeMenu }}
                    PaperProps={{
                      elevation: 6,
                      sx: {
                        mt: 1,
                        minWidth: 220,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,.06)",
                      },
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: 0.9 }}>
                      <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ noWrap: true }}
                        primary={user?.name || user?.email || "Tài khoản"}
                      />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => { closeMenu(); navigate("/profile"); }}>
                      <ListItemIcon><PersonOutlineIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Hồ sơ" />
                    </MenuItem>
                    <MenuItem onClick={() => { closeMenu(); navigate("/orders"); }}>
                      <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Đơn hàng" />
                    </MenuItem>
                    <MenuItem onClick={() => { closeMenu(); navigate("/settings"); }}>
                      <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Cài đặt" />
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Đăng xuất" />
                    </MenuItem>
                  </Menu>
                </Box>
              )}
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
