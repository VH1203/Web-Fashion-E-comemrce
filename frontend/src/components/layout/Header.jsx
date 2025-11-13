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
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/change-password",
];

export default function Header({
  cartCount = 0,
  notifyCount = 0,
  user = null, // { name, email } | null
  onSearch, // (keyword) => void
  onLogout, // () => void
}) {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  // Profile menu
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
      className="dfs-header glass-appbar"
      sx={{
        // nền trong suốt mờ + viền sáng nhẹ
        background:
          "linear-gradient(90deg, rgba(29,78,216,0.42), rgba(37,99,235,0.42))",
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "saturate(120%) blur(14px)",
        WebkitBackdropFilter: "saturate(120%) blur(14px)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Container rộng hơn: khóa max 1440px */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ px: { xs: 1.5, sm: 2 }, maxWidth: "1440px", mx: "auto" }}
      >
        <Toolbar
          className="dfs-toolbar"
          sx={{
            px: 0,
            gap: 16,
            justifyContent: isAuthPage ? "center" : "space-between",
            minHeight: "var(--header-height)",
          }}
        >
          {/* Logo tròn bên trái */}
          <Link
            component={RouterLink}
            to="/"
            underline="none"
            sx={{ lineHeight: 0 }}
          >
            <Box
              className="brand-logo-wrap"
              sx={{
                width: { xs: 60, sm: 68 },
                height: { xs: 60, sm: 68 },
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.28)",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,.28), inset 0 0 0 1px rgba(255,255,255,0.06)",
                transition: "transform .2s ease, box-shadow .2s ease",
                willChange: "transform",
                "&:hover": {
                  transform: "translateY(-2px) scale(1.03)",
                  boxShadow:
                    "0 12px 32px rgba(0,0,0,.34), inset 0 0 0 1px rgba(255,255,255,0.10)",
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
                  transform: "scale(1.16)",
                  display: "block",
                }}
              />
            </Box>
          </Link>

          {/* Brand + tagline ngắn giúp dễ đọc hơn */}
          <Box
            className="brand-title"
            sx={{
              display: isAuthPage ? "none" : "flex",
              flexDirection: "column",
              gap: 0.25,
            }}
          >
            <Typography
              variant={isMdUp ? "h4" : "h5"}
              fontWeight={900}
              sx={{
                letterSpacing: 0.2,
                textShadow: "0 1px 1px rgba(0,0,0,.25)",
              }}
            >
              Daily Fit
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, ml: 0.5 }}>
              Smart Fashion Commerce
            </Typography>
          </Box>

          {/* Auth pages: chỉ logo + tên */}
          {isAuthPage ? (
            <Box sx={{ display: "none" }} />
          ) : (
            <>
              {/* Search: nền trắng trong suốt + glow dịu */}
              {isSmUp ? (
                <Box
                  component="form"
                  onSubmit={handleSearchSubmit}
                  className="header-search"
                  sx={{ flex: 1, maxWidth: isMdUp ? 720 : 520 }}
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
                        backgroundColor: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(6px)",
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

              {/* Actions */}
              {!user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddAltIcon />}
                    className="btn-outline-hero"
                    sx={{
                      textTransform: "none",
                      borderRadius: "999px",
                      px: 1.75,
                    }}
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
                    sx={{
                      textTransform: "none",
                      borderRadius: "999px",
                      px: 1.75,
                    }}
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

                  {/* Profile icon */}
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
                    MenuListProps={{ onMouseLeave: closeMenu, dense: true }}
                    PaperProps={{
                      elevation: 6,
                      sx: {
                        mt: 1,
                        minWidth: 240,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.14)",
                        background:
                          "linear-gradient(180deg, rgba(15,23,42,0.82), rgba(15,23,42,0.74))",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        color: "#fff",
                      },
                    }}
                  >
                    <MenuItem disabled sx={{ opacity: 0.9 }}>
                      <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                        <PersonOutlineIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ noWrap: true }}
                        primary={user?.name || user?.email || "Tài khoản"}
                      />
                    </MenuItem>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

                    {/* <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/shop");
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                        <StorefrontOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Cửa hàng của tôi" />
                    </MenuItem> */}

                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/profile");
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                        <PersonOutlineIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Hồ sơ" />
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/orders");
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                        <ReceiptLongIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Đơn hàng" />
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/reviews");
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                        <ReceiptLongIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Đánh giá đơn hàng" />
                    </MenuItem>

                    {/* <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/settings");
                      }}
                    >
                      <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                        <SettingsOutlinedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary="Cài đặt" />
                    </MenuItem> */}

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />

                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon sx={{ color: "inherit", minWidth: 34 }}>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
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
