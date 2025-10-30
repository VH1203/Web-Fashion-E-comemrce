import React, { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import dfsLogo from "../../assets/icons/DFS-NonBG.png";

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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";

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

  // Brand (logo + tên)
  const Brand = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
      <Box
        component="img"
        src={dfsLogo}
        alt="Daily Fit"
        sx={{ height: 30, width: "auto" }}
      />
      <Typography
        variant="h6"
        component={RouterLink}
        to="/"
        sx={{
          color: "inherit",
          textDecoration: "none",
          fontWeight: 800,
          letterSpacing: ".2px",
        }}
      >
        Daily Fit
      </Typography>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: "saturate(180%) blur(10px)",
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar
          sx={{
            px: 2,
            minHeight: { xs: 60, sm: 64 },
            gap: 2,
            justifyContent: isAuthPage ? "center" : "space-between",
          }}
        >
          <Link
            component={RouterLink}
            to="/"
            underline="none"
            sx={{ lineHeight: 0 }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
                  transform: "scale(1.25)",
                  display: "block",
                }}
              />
            </Box>
          </Link>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="h4">Daily Fit</Typography>
          </Box>

          {/* Auth pages: chỉ logo + tên */}
          {isAuthPage ? (
            <Box sx={{ display: "none" }} />
          ) : (
            <>
              {/* Search pill */}
              {isSmUp ? (
                <Box
                  component="form"
                  onSubmit={handleSearchSubmit}
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
                        backgroundColor: alpha(
                          theme.palette.common.black,
                          0.02
                        ),
                      },
                    }}
                  />
                </Box>
              ) : (
                // Mobile: chỉ icon search → điều hướng /search (hoặc mở overlay riêng nếu bạn có)
                <IconButton
                  aria-label="Tìm kiếm"
                  onClick={() => navigate("/search")}
                  sx={{ ml: "auto" }}
                >
                  <SearchIcon />
                </IconButton>
              )}

              {/* Action area */}
              {!user ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddAltIcon />}
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
                  >
                    <Badge badgeContent={notifyCount} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>

                  <IconButton
                    color="inherit"
                    aria-label="Tài khoản"
                    onClick={openMenu}
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
                  >
                    <MenuItem disabled>
                      <Typography variant="body2" noWrap>
                        {user?.name || user?.email || "Tài khoản"}
                      </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/profile");
                      }}
                    >
                      Hồ sơ
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        closeMenu();
                        navigate("/orders");
                      }}
                    >
                      Đơn hàng
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
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
