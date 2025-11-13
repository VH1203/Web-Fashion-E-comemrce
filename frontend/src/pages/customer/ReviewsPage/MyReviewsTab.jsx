import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyReviews } from "../../../services/reviewServices";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Rating,
  Avatar,
} from "@mui/material";
import { Link } from "react-router-dom";
const MyReviewsTab = () => {
  const {
    data: myReviews,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myReviews"],
    queryFn: getMyReviews,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Không thể tải các đánh giá của bạn.</Alert>;
  }

  if (!myReviews || myReviews.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Bạn chưa viết đánh giá nào.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack spacing={2} sx={{ p: 2 }}>
        {myReviews.map((review) => (
          <Card key={review._id} elevation={1}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={review.product_id?.images?.[0] || "/placeholder.jpg"}
                  alt={review.product_id?.name}
                  variant="rounded"
                  sx={{ width: 60, height: 60 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    component={Link}
                    to={`/product/${review.product_id?.slug}`} // Link đến sản phẩm
                    sx={{ textDecoration: "none", color: "inherit" }}
                  >
                    {review.product_id?.name}
                  </Typography>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {review.comment}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ngày:{" "}
                    {new Date(review.created_at).toLocaleDateString("vi-VN")}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default MyReviewsTab;
