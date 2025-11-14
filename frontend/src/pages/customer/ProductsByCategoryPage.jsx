import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Container,
  Typography,
  Grid,
  Pagination,
  Box,
  CircularProgress,
  Alert,
  Skeleton,
} from "@mui/material";
import ProductCard from "../../components/home/ProductCard";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import NotFound from "../errors/NotFound";

export default function ProductsByCategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));

  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useQuery({
    queryKey: ["products", "category", slug, page],
    queryFn: () => productService.getProducts({ category_slug: slug, page }),
    keepPreviousData: true,
  });

  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    error: categoryError,
  } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => categoryService.getCategoryBySlug(slug),
    enabled: !!slug,
    retry: (failureCount, error) => {
      if (error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const handlePageChange = (event, value) => {
    setPage(value);
    setSearchParams({ page: value });
  };

  const products = productsData?.data?.docs || [];
  const totalPages = productsData?.data?.totalPages || 0;
  const categoryName = categoryData?.data?.data?.name;

  if (categoryError?.response?.status === 404) {
    return <NotFound />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        textTransform="capitalize"
        fontWeight="bold"
      >
        {isLoadingCategory ? (
          <Skeleton width="30%" />
        ) : categoryError ? (
          "Category"
        ) : (
          categoryName
        )}
      </Typography>

      {(isLoadingProducts || isLoadingCategory) && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {productsError && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error fetching products: {productsError.message}
        </Alert>
      )}

      {categoryError && (
        <Alert severity="error" sx={{ my: 2 }}>
          Error fetching category details: {categoryError.message}
        </Alert>
      )}

      {!isLoadingProducts &&
        !productsError &&
        !isLoadingCategory &&
        products.length === 0 && (
          <Typography sx={{ my: 5, textAlign: "center" }}>
            No products found in this category.
          </Typography>
        )}

      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
            <ProductCard item={product} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
}
