// src/pages/auth/Login.jsx
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import dfsLogo from "../../assets/icons/DFS-NonBG1.png";

// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "@mui/material/Link";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Google from "@mui/icons-material/Google";

import { authService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

const clearAuthStorage = () => {
  try {
    localStorage.removeItem("DFS_TOKEN");
    localStorage.removeItem("dfs_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
    // giữ user nếu muốn auto-fill, hoặc xoá nếu muốn sạch
    // localStorage.removeItem("dfs_user");
  } catch {}
};

export default function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("error");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleShowPassword = () => setIsPasswordShown((s) => !s);

  // Auto-hide alert sau 4s
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 4000);
    return () => clearTimeout(t);
  }, [message]);

  // --- Submit: Đăng nhập thường ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // DỌN token cũ để không bị interceptor gắn Authorization vào request /auth/login
    clearAuthStorage();

    try {
      // Nếu authService hỗ trợ options, dùng: authService.login(form, { skipAuth: true })
      const res = await authService.login(form);
      const { accessToken, user } = res.data.data || {};

      // Lưu "remember me" nếu cần
      if (remember) {
        localStorage.setItem("dfs_remember", "1");
      } else {
        localStorage.removeItem("dfs_remember");
      }

      login(user, accessToken); // đảm bảo useAuth chỉ lưu 1 key: DFS_TOKEN
      setSeverity("success");
      setMessage("Đăng nhập thành công!");
    } catch (err) {
      setSeverity("error");
      setMessage(
        err?.response?.data?.message || err.message || "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  // --- Google Identity Services ---
  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        ux_mode: "popup", // popup chọn tài khoản
      });
      // Render nút chính thức của GIS
      try {
        window.google.accounts.id.renderButton(
          document.getElementById("googleLoginDiv"),
          {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "pill",
            width: 320,
          }
        );
      } catch {}
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true);
      // DỌN token cũ trước khi gọi /auth/google-login
      clearAuthStorage();

      const token = response.credential;
      // Nếu service hỗ trợ options, dùng: authService.googleLogin({ token }, { skipAuth: true })
      const res = await authService.googleLogin({ token });
      const { accessToken, user } = res.data.data || {};
      login(user, accessToken);

      setSeverity("success");
      setMessage("Đăng nhập Google thành công!");
    } catch (err) {
      setSeverity("error");
      setMessage(
        "Lỗi Google Login: " + (err?.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Fallback: nếu GIS script chưa sẵn sàng
  const promptGoogle = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setSeverity("error");
      setMessage("Google chưa sẵn sàng.");
    }
  };

  const disabled =
    loading || !form.identifier?.trim() || !form.password?.trim();

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        position: "relative",
        background:
          "radial-gradient(1000px 500px at 10% -10%, rgba(99,102,241,.08), transparent), radial-gradient(800px 400px at 100% 0, rgba(16,185,129,.08), transparent)",
      }}
    >
      <Card elevation={8} sx={{ width: "100%", maxWidth: 480, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
          {/* Header auth: logo + tiêu đề nằm ngang */}
          <Box
            sx={{
              mb: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2.5,
              flexDirection: { xs: "column", sm: "row" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {/* Logo crop tròn */}
            <Link component={RouterLink} to="/" underline="none" sx={{ lineHeight: 0 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
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

            {/* Tiêu đề + mô tả */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="h4">Chào mừng đến với DFS</Typography>
              <Typography color="text.secondary">
                Vui lòng đăng nhập để bắt đầu trải nghiệm.
              </Typography>
            </Box>
          </Box>

          {message ? (
            <Alert severity={severity} sx={{ mb: 2 }}>
              {message}
            </Alert>
          ) : null}

          <Box
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            <TextField
              autoFocus
              fullWidth
              label="Email / Username / SĐT"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              name="password"
              type={isPasswordShown ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={toggleShowPassword}
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label={isPasswordShown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      size="small"
                    >
                      {isPasswordShown ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                }
                label="Ghi nhớ tôi"
              />
              <Link
                component={RouterLink}
                to="/forgot-password"
                underline="hover"
                color="primary"
              >
                Quên mật khẩu?
              </Link>
            </Box>

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={disabled}
              sx={{ py: 1.25, borderRadius: 2 }}
            >
              {loading ? <CircularProgress size={22} /> : "Đăng nhập"}
            </Button>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography>Bạn mới dùng nền tảng?</Typography>
              <Link component={RouterLink} to="/register" color="primary" underline="hover">
                Tạo tài khoản
              </Link>
            </Box>

            <Divider>hoặc đăng nhập bằng</Divider>

            {/* Nút Google chính thức từ GIS */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <div id="googleLoginDiv" />
            </Box>

            {/* Fallback: nút Google thủ công (prompt) */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              <Button
                onClick={promptGoogle}
                variant="outlined"
                startIcon={<Google />}
                fullWidth={false}
                sx={{
                  px: 2.5,
                  color: "#DB4437",
                  borderColor: "#DB4437",
                  borderRadius: 20,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    bgcolor: "rgba(219,68,55,0.08)",
                    borderColor: "#DB4437",
                  },
                }}
              >
                Google
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
