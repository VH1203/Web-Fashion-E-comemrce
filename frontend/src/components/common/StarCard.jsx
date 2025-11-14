import React from "react";
import { Users, ShoppingCart, Star, CreditCard } from "lucide-react";
import { Paper, Box, Typography, Grid } from "@mui/material";

const SingleCard = ({ title, value, icon: Icon, bgColor, iconColor }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2.5,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box
          sx={{
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: bgColor || "grey.200",
            color: iconColor || "primary.main",
          }}
        >
          <Icon size={28} />
        </Box>
        <Box textAlign="right">
          <Typography variant="h4" fontWeight="bold">
            {value ?? "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

//  Component hiển thị toàn bộ grid Stat Cards
const StatCardsGrid = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: "Người dùng",
      value: stats.users?.toLocaleString(),
      icon: Users,
      bgColor: "info.lighter",
      iconColor: "info.main",
    },
    {
      title: "Sản phẩm",
      value: stats.products?.toLocaleString(),
      icon: ShoppingCart,
      bgColor: "primary.lighter",
      iconColor: "primary.main",
    },
    {
      title: "Đánh giá",
      value: stats.reviews?.toLocaleString(),
      icon: Star,
      bgColor: "warning.lighter",
      iconColor: "warning.main",
    },
    {
      title: "Giao dịch",
      value: stats.transactions?.toLocaleString(),
      icon: CreditCard,
      bgColor: "success.lighter",
      iconColor: "success.main",
    },
  ];

  return (
    <Grid container spacing={3} mb={4}>
      {cards.map((card, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
          <SingleCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatCardsGrid;
