import React from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

// Icons
import SendIcon from "@mui/icons-material/Send";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

export default function Footer() {
  return (
    <Box
      component="footer"
      className="dfs-footer glass-footer"
      sx={{
        mt: 8,
        color: "#fff",
        background:
          "linear-gradient(90deg, rgba(29,78,216,0.42), rgba(37,99,235,0.42))",
        borderTop: "1px solid rgba(255,255,255,0.18)",
        backdropFilter: "saturate(120%) blur(14px)",
        WebkitBackdropFilter: "saturate(120%) blur(14px)",
        boxShadow:
          "0 -10px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Top content */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 5, md: 7 }, maxWidth: "1440px", mx: "auto" }}
      >
        <Grid container spacing={4}>
          {/* Brand + newsletter */}
          <Grid item xs={12} md={4}>
            <Typography variant="h5" fontWeight={900} sx={{ letterSpacing: .2, mb: 1 }}>
              Daily Fit
            </Typography>
            <Typography variant="body2" sx={{ opacity: .9, mb: 2 }}>
              Smart Fashion Commerce • Chất lượng & trải nghiệm là ưu tiên số 1.
            </Typography>

            <Box
              component="form"
              onSubmit={(e) => e.preventDefault()}
              sx={{ maxWidth: 420 }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Nhập email để nhận ưu đãi…"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        aria-label="Đăng ký nhận tin"
                        sx={{ color: "var(--primary-50)" }}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "999px",
                    backgroundColor: "rgba(255,255,255,0.88)",
                  },
                }}
              />
            </Box>

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
  <IconButton
    aria-label="Facebook"
    className="footer-icon"
    sx={{
      color: "#1877F2",                 // Facebook brand
      borderColor: "rgba(24, 119, 242, .35)",
      "&:hover": {
        filter: "brightness(1.1)",
        boxShadow: "0 0 10px rgba(24, 119, 242, .35)",
      },
      "& svg": { fill: "currentColor" },
    }}
  >
    <FacebookIcon />
  </IconButton>

  <IconButton
    aria-label="Instagram"
    className="footer-icon"
    sx={{
      color: "#E4405F",                 // Instagram brand (solid)
      borderColor: "rgba(228, 64, 95, .35)",
      "&:hover": {
        filter: "brightness(1.1)",
        boxShadow: "0 0 10px rgba(228, 64, 95, .35)",
      },
      "& svg": { fill: "currentColor" },
    }}
  >
    <InstagramIcon />
  </IconButton>

  <IconButton
    aria-label="YouTube"
    className="footer-icon"
    sx={{
      color: "#FF0000",                 // YouTube brand
      borderColor: "rgba(255, 0, 0, .35)",
      "&:hover": {
        filter: "brightness(1.1)",
        boxShadow: "0 0 10px rgba(255, 0, 0, .35)",
      },
      "& svg": { fill: "currentColor" },
    }}
  >
    <YouTubeIcon />
  </IconButton>
</Box>
          </Grid>

          {/* Links 1 */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Sản phẩm
            </Typography>
            <FooterLink to="/collections/new">Hàng mới về</FooterLink>
            <FooterLink to="/collections/best-sellers">Bán chạy</FooterLink>
            <FooterLink to="/collections/men">Nam</FooterLink>
            <FooterLink to="/collections/women">Nữ</FooterLink>
            <FooterLink to="/sale">Khuyến mãi</FooterLink>
          </Grid>

          {/* Links 2 */}
          <Grid item xs={12} sm={6} md={2.5}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Hỗ trợ
            </Typography>
            <FooterLink to="/help/size-guide">Bảng size</FooterLink>
            <FooterLink to="/help/shipping">Vận chuyển</FooterLink>
            <FooterLink to="/help/returns">Đổi trả</FooterLink>
            <FooterLink to="/help/faq">FAQ</FooterLink>
            <FooterLink to="/contact">Liên hệ</FooterLink>
          </Grid>

          {/* Contact */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Liên hệ
            </Typography>

            <FooterContact
              icon={<LocationOnIcon fontSize="small" />}
              text="Đại học FPT"
            />
            <FooterContact icon={<PhoneIcon fontSize="small" />} text="(028) 1234 5678" />
            <FooterContact icon={<MailOutlineIcon fontSize="small" />} text="support@dailyfit.vn" />
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ opacity: 0.18, borderColor: "rgba(255,255,255,0.28)" }} />

      {/* Bottom bar */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{ px: { xs: 1.5, sm: 2 }, py: 2, maxWidth: "1440px", mx: "auto" }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Typography variant="body2" sx={{ opacity: .9 }}>
            © {new Date().getFullYear()} Daily Fit. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <BottomLink to="/terms">Điều khoản</BottomLink>
            <BottomLink to="/privacy">Bảo mật</BottomLink>
            <BottomLink to="/cookies">Cookies</BottomLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function FooterLink({ to, children }) {
  return (
    <Typography variant="body2" sx={{ my: .5 }}>
      <Link
        component={RouterLink}
        to={to}
        underline="none"
        className="footer-link"
        sx={{ color: "#fff", opacity: .92 }}
      >
        {children}
      </Link>
    </Typography>
  );
}

function FooterContact({ icon, text }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, opacity: .95, mb: .75 }}>
      <Box sx={{ lineHeight: 0, color: "var(--primary-50)" }}>{icon}</Box>
      <Typography variant="body2">{text}</Typography>
    </Box>
  );
}

function BottomLink({ to, children }) {
  return (
    <Link
      component={RouterLink}
      to={to}
      underline="none"
      className="footer-link"
      sx={{ color: "#fff", opacity: .92, fontSize: 14 }}
    >
      {children}
    </Link>
  );
}
