import React, { useState } from "react";

// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

// Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { authService } from "../../services/authService";

export default function ChangePassword() {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("error"); // 'success' | 'error' | 'info'

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      if (!form.oldPassword || !form.newPassword)
        return setMessage("Vui lòng nhập đầy đủ mật khẩu cũ và mới!");
      setLoading(true);
      const token = localStorage.getItem("access_token");
      await authService.changePassword(form, token);
      setSeverity("success");
      setMessage("🎉 Đổi mật khẩu thành công!");
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      setSeverity("error");
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
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
        background:
          "radial-gradient(1000px 500px at 10% -10%, rgba(99,102,241,.08), transparent), radial-gradient(800px 400px at 100% 0, rgba(16,185,129,.08), transparent)",
      }}
    >
      <Card elevation={8} sx={{ width: "100%", maxWidth: 480, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
          <Typography variant="h4" color="primary" sx={{ mb: 0.5 }}>
            Đổi mật khẩu
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Hãy đặt mật khẩu mới thật mạnh để bảo vệ tài khoản của bạn.
          </Typography>

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
              fullWidth
              label="Mật khẩu cũ"
              name="oldPassword"
              type={showOld ? "text" : "password"}
              value={form.oldPassword}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => setShowOld((s) => !s)}
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label={showOld ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showOld ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mật khẩu mới"
              name="newPassword"
              type={showNew ? "text" : "password"}
              value={form.newPassword}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => setShowNew((s) => !s)}
                      onMouseDown={(e) => e.preventDefault()}
                      aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showNew ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{ py: 1.25, borderRadius: 2 }}
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
