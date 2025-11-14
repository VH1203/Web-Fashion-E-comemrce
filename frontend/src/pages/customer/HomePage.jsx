import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardActionArea,
  Link,
  IconButton,
  Avatar,
  Paper,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { homeService } from "../../services/homeService";
import ProductCard from "../../components/home/ProductCard.jsx";

/* ===================== PAGE ===================== */

export default function HomePage() {
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["homepage"],
    queryFn: () => homeService.fetchHomepage(),
    select: (data) => normalizeHomepage(data),
  });

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography>Đang tải trang chủ…</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">{error.message}</Typography>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">Không có dữ liệu.</Typography>
      </Container>
    );
  }

  const { banners, brands, categories, men, women, flashSale, unisex } = data;

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* ===== Banners (carousel rộng) ===== */}
      {!!banners.__count && <BannerCarousel banners={banners} />}

      {/* ===== Category (carousel) ===== */}
      {!!categories.length && (
        <SectionCarousel
          title="Danh mục"
          viewAllHref="/categories"
          items={categories}
          renderItem={(cat) => <CategoryCard category={cat} />}
          itemWidth={220}
          gap={2}
        />
      )}

      {/* ===== Brands (carousel) ===== */}
      <SectionCarousel
        title="Thương hiệu nổi bật"
        viewAllHref="/brands"
        items={brands}
        emptyText="Đang cập nhật thương hiệu…"
        renderItem={(br) => <BrandCard brand={br} />}
        itemWidth={160}
        gap={1.5}
      />

      {/* ===== Flash Sale (carousel) ===== */}
      {flashSale?.items?.length ? (
        <SectionCarousel
          title={flashSale._upcoming ? "Flash Sale sắp diễn ra" : "Flash Sale"}
          rightNode={
            <Countdown
              label={flashSale._upcoming ? "Bắt đầu sau" : "Kết thúc sau"}
              endTime={
                flashSale._upcoming ? flashSale.start_time : flashSale.end_time
              }
            />
          }
          viewAllHref="/flash-sale"
          items={flashSale.items}
          renderItem={(it) => (
            <ProductCard item={normalizeFlashItem(it)} type="flash" />
          )}
          itemWidth={220}
          gap={1.5}
        />
      ) : null}

      {/* ===== Men (carousel) ===== */}
      {!!men.length && (
        <SectionCarousel
          title="Thời trang Nam"
          viewAllHref="/category/men"
          items={men}
          renderItem={(p) => <ProductCard item={{ product: p }} />}
          itemWidth={220}
          gap={1.5}
        />
      )}

      {/* ===== Women (carousel) ===== */}
      {!!women.length && (
        <SectionCarousel
          title="Thời trang Nữ"
          viewAllHref="/category/women"
          items={women}
          renderItem={(p) => <ProductCard item={{ product: p }} />}
          itemWidth={220}
          gap={1.5}
        />
      )}
      {!!unisex?.length && (
        <SectionCarousel
          title="Unisex"
          viewAllHref="/category/unisex"
          items={unisex}
          renderItem={(p) => <ProductCard item={{ product: p }} />}
          itemWidth={220}
          gap={1.5}
        />
      )}
    </Container>
  );
}

function normalizeHomepage(raw) {
  const banners = {
    homepage_top: raw?.banners?.homepage_top || [],
    homepage_mid: raw?.banners?.homepage_mid || [],
    homepage_bottom: raw?.banners?.homepage_bottom || [],
    __count:
      (raw?.banners?.homepage_top?.length || 0) +
      (raw?.banners?.homepage_mid?.length || 0) +
      (raw?.banners?.homepage_bottom?.length || 0),
  };
  return {
    banners,
    brands: raw?.brands || raw?.brand_list || [],
    categories: raw?.categories || [],
    men: raw?.men || [],
    women: raw?.women || [],
    unisex: raw?.unisex || [],
    flashSale: raw?.flashSale || raw?.flash_sale || null,
  };
}

function normalizeFlashItem(it) {
  if (it.product) return it;
  return {
    ...it,
    product: {
      _id: it.product_id || it._id,
      name: it.name || it.title || "Sản phẩm",
      images: it.images || (it.image ? [it.image] : []),
      base_price: it.original_price || it.base_price || it.price || 0,
    },
    flash_price: it.flash_price || it.sale_price || it.price || 0,
  };
}

/* ===================== MUI CARDS ===================== */

function CategoryCard({ category: cat }) {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardActionArea
        href={`/category/${cat.slug}`}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          height: "100%",
        }}
      >
        <Avatar
          src={cat.image_url}
          alt={cat.name}
          sx={{
            width: 64,
            height: 64,
            mb: 1.5,
            bgcolor: "grey.200",
            fontSize: "2rem",
          }}
        >
          {cat.name?.[0] || "?"}
        </Avatar>
        <Typography fontWeight="bold" textAlign="center">
          {cat.name}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

function BrandCard({ brand: br }) {
  return (
    <Card
      sx={{
        height: "100%",
        transition: "transform .15s ease, box-shadow .15s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <CardActionArea
        href={`/brand/${br.slug || br._id || ""}`}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
          height: "100%",
        }}
      >
        <Avatar
          variant="rounded"
          src={br.logo_url || br.image_url}
          alt={br.name}
          sx={{
            width: 72,
            height: 72,
            mb: 1.5,
            bgcolor: "grey.100",
            fontSize: "2.5rem",
            img: { objectFit: "contain" },
          }}
        >
          {br.name?.[0] || "?"}
        </Avatar>
        <Typography fontWeight={600} fontSize={14} textAlign="center">
          {br.name}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

/* ===================== GENERIC CAROUSEL ===================== */

function useCarousel({ itemWidth, gap, perClick = 2 }) {
  const theme = useTheme();
  const viewportRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const update = () => {
    const el = viewportRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    setCanPrev(el.scrollLeft > 0);
    setCanNext(el.scrollLeft < max);
  };

  useEffect(() => {
    update();
    const el = viewportRef.current;
    if (!el) return;
    const onScroll = () => update();
    const ro = new ResizeObserver(update);
    el.addEventListener("scroll", onScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollByStep = (dir = 1) => {
    const el = viewportRef.current;
    if (!el) return;
    const gapWidth = parseFloat(theme.spacing(gap));
    const step = perClick * itemWidth + gapWidth * perClick;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return {
    viewportRef,
    canPrev,
    canNext,
    scrollPrev: () => scrollByStep(-1),
    scrollNext: () => scrollByStep(1),
  };
}

function SectionCarousel({
  title,
  rightNode,
  viewAllHref,
  items = [],
  renderItem,
  itemWidth = 220,
  gap = 2,
  emptyText,
}) {
  const { viewportRef, canPrev, canNext, scrollPrev, scrollNext } = useCarousel(
    { itemWidth, gap }
  );

  return (
    <Box component="section" sx={{ mt: 3.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="h4" component="h2" fontWeight="bold">
          {title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {rightNode}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              underline="none"
              color="text.secondary"
              fontWeight="600"
              sx={{ display: "flex", alignItems: "center" }}
            >
              Xem tất cả <ArrowForwardIcon sx={{ fontSize: "1rem", ml: 0.5 }} />
            </Link>
          )}
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              size="small"
              disabled={!canPrev}
              onClick={scrollPrev}
              aria-label="prev"
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              size="small"
              disabled={!canNext}
              onClick={scrollNext}
              aria-label="next"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {!items.length ? (
        emptyText ? (
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              textAlign: "center",
              color: "text.secondary",
              bgcolor: "grey.50",
            }}
          >
            {emptyText}
          </Paper>
        ) : null
      ) : (
        <Box sx={{ position: "relative" }}>
          <Box
            ref={viewportRef}
            sx={{
              overflow: "auto hidden",
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": { display: "none" },
              py: 1, // Add padding-block
              pl: 0.5, // Add padding-left
              ml: -0.5, // Nudge back to align with container edge
            }}
          >
            <Box sx={{ display: "flex", gap }}>
              {items.map((it, i) => (
                <Box
                  key={it._id || it.id || it.slug || i}
                  sx={{
                    width: itemWidth,
                    minWidth: itemWidth,
                    flex: "0 0 auto",
                  }}
                >
                  {renderItem(it)}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

/* ===================== BANNER CAROUSEL ===================== */

function BannerCarousel({ banners }) {
  const rows = [
    banners.homepage_top,
    banners.homepage_mid,
    banners.homepage_bottom,
  ].filter((r) => r?.length);
  if (!rows.length) return null;

  const list = rows.flat();
  const gap = 1.5; // theme.spacing unit

  const { viewportRef, canPrev, canNext, scrollPrev, scrollNext } = useCarousel(
    {
      itemWidth: 0, // will be set after measuring
      gap,
      perClick: 1,
    }
  );

  const [vw, setVw] = React.useState(0);
  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setVw(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [viewportRef]);

  const itemW = vw || "100%";

  return (
    <Box component="section" sx={{ mt: 3.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography variant="h4" component="h2" fontWeight="bold">
          Khuyến mãi nổi bật
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            disabled={!canPrev}
            onClick={scrollPrev}
            aria-label="prev"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            size="small"
            disabled={!canNext}
            onClick={scrollNext}
            aria-label="next"
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ position: "relative" }}>
        <Box
          ref={viewportRef}
          sx={{
            overflow: "auto hidden",
            scrollBehavior: "smooth",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          <Box sx={{ display: "flex", gap }}>
            {list.map((b, i) => {
              const src = b.image_url || b.image || b.url;
              if (!src) return null;
              const href = b.link || b.href || "#";
              return (
                <Box
                  key={b._id || b.id || `${src}-${i}`}
                  component="a"
                  href={href}
                  sx={{
                    width: itemW,
                    minWidth: itemW,
                    flex: "0 0 auto",
                    position: "relative",
                    display: "block",
                    borderRadius: 3.5,
                    overflow: "hidden",
                    minHeight: 160,
                    aspectRatio: "1000 / 300", // Adjust based on typical banner aspect ratio
                  }}
                >
                  <Box
                    component="img"
                    src={src}
                    alt={b.title || "Banner"}
                    loading="lazy"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ===================== WIDGETS ===================== */

function Countdown({ endTime, label = "Kết thúc sau" }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = new Date(endTime).getTime();
  const left = Math.max(0, end - now);
  const hh = String(Math.floor(left / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return (
    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
      {label} {hh}:{mm}:{ss}
    </Typography>
  );
}
