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

  // --- Submit: Đăng nhập thường ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const res = await authService.login(form);
      const { accessToken, user } = res.data.data || {};
      // Lưu "remember me" tùy ý
      if (remember) {
        localStorage.setItem("dfs_remember", "1");
      } else {
        localStorage.removeItem("dfs_remember");
      }
      login(user, accessToken);
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
        ux_mode: "popup", // mở popup chọn tài khoản
      });
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setLoading(true);
      const token = response.credential;
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

  const promptGoogle = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setSeverity("error");
      setMessage("Google chưa sẵn sàng.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        position: "relative",
        // nền nhẹ nhàng
        background:
          "radial-gradient(1000px 500px at 10% -10%, rgba(99,102,241,.08), transparent), radial-gradient(800px 400px at 100% 0, rgba(16,185,129,.08), transparent)",
      }}
    >
      <Card
        elevation={8}
        sx={{ width: "100%", maxWidth: 480, borderRadius: 3 }}
      >
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
            <Link
              component={RouterLink}
              to="/"
              underline="none"
              sx={{ lineHeight: 0 }}
            >
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
                      aria-label={
                        isPasswordShown ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
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
              disabled={loading}
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
              <Link
                component={RouterLink}
                to="/register"
                color="primary"
                underline="hover"
              >
                Tạo tài khoản
              </Link>
            </Box>

            <Divider>hoặc đăng nhập bằng</Divider>

            {/* Dãy social (demo UI) */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              {/* <IconButton size="small" aria-label="Login with Facebook">
                <FacebookOutlined />
              </IconButton>
              <IconButton size="small" aria-label="Login with Twitter/X">
                <Twitter />
              </IconButton>
              <IconButton size="small" aria-label="Login with GitHub">
                <GitHub />
              </IconButton> */}
              {/* Nút Google phụ (nếu GIS script chưa render kịp) */}
              <Button
                onClick={promptGoogle}
                variant="outlined"
                startIcon={<Google />}
                fullWidth={false} // đổi thành true nếu muốn kéo full hàng
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

      {/* (Optional) Hình minh họa nền — bạn có thể thay ảnh riêng */}
      {/* <Box sx={{ position: "absolute", right: 0, bottom: 0, opacity: .25 }}>
        <img src="/images/pages/auth-v1-mask-light.png" alt="Decor" style={{ maxWidth: 420 }} />
      </Box> */}
    </Box>
  );
}
