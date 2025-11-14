import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductCard({ item, type }) {
  const p = item?.product || item || {};
  const id = p?._id || p?.id || "";
  const slug = p?.slug;
  const href = slug ? `/product/${slug}` : `/product/${id}`;

  const name = p?.name || "Sản phẩm";
  const img = p?.images?.[0] || p?.image || p?.thumbnail;

  const basePrice = Number(p?.base_price ?? p?.price ?? 0) || 0;
  const price =
    type === "flash" ? Number(item?.flash_price ?? basePrice) || 0 : basePrice;

  const percent =
    type === "flash" && basePrice > 0 && basePrice > price
      ? Math.max(0, Math.round((1 - price / basePrice) * 100))
      : 0;

  const rating =
    Number(p?.rating_avg ?? p?.ratingAvg ?? p?.rating?.avg ?? 0) || 0;

  const sold = Number(p?.sold_count ?? p?.soldCount ?? p?.sold ?? 0) || 0;

  const formatSold = (n) => {
    if (!n) return "0";
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
    return `${n}`;
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardActionArea
        href={href}
        sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
      >
        <Box sx={{ position: "relative", width: "100%", pt: "100%" }}>
          <CardMedia
            component="img"
            image={img}
            alt={name}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {!img && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
                bgcolor: "grey.200",
                color: "text.secondary",
              }}
            >
              <Typography variant="caption">No Image</Typography>
            </Box>
          )}
          {type === "flash" && percent > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: "8px",
                left: "8px",
                bgcolor: "error.main",
                color: "white",
                py: 0.25,
                px: 0.75,
                borderRadius: 1.5,
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              -{percent}%
            </Box>
          )}
        </Box>

        <CardContent sx={{ width: "100%", p: 1.5 }}>
          <Typography
            gutterBottom
            variant="body2"
            component="div"
            title={name}
            sx={{
              fontWeight: 500,
              height: "40px", // 2 lines
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              "-webkit-line-clamp": "2",
              "-webkit-box-orient": "vertical",
            }}
          >
            {name}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              my: 0.5,
            }}
          >
            <Rating
              name="read-only"
              value={rating}
              precision={0.5}
              readOnly
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              ({rating.toFixed(1)})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flexShrink: 0 }}
            >
              Đã bán {formatSold(sold)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography color="text.primary" fontWeight="bold">
              {formatCurrency(price)}
            </Typography>
            {type === "flash" && basePrice > price && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textDecoration: "line-through" }}
              >
                {formatCurrency(basePrice)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
