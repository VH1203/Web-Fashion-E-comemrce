import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPendingReviews } from "../../../services/reviewServices";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import ReviewFormModal from "../../../components/reviews/ReviewFormModal";

const PendingReviewsTab = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    data: pendingItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pendingReviews"],
    queryFn: getPendingReviews,
  });

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalOpen(false);
  };

  const handleReviewSuccess = () => {
    handleCloseModal();
    // Tải lại danh sách "chờ đánh giá" và "đã đánh giá"
    queryClient.invalidateQueries(["pendingReviews"]);
    queryClient.invalidateQueries(["myReviews"]);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">Không thể tải danh sách chờ đánh giá.</Alert>
    );
  }

  if (!pendingItems || pendingItems.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Bạn không có sản phẩm nào cần đánh giá.
      </Alert>
    );
  }

  return (
    <Box>
      <Stack spacing={2} sx={{ p: 2 }}>
        {pendingItems.map((item) => (
          <Card key={`${item.order_id}-${item.product_id}`} elevation={1}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CardMedia
                  component="img"
                  image={item.product_image || "/placeholder.jpg"}
                  alt={item.product_name}
                  sx={{ width: 80, height: 80, borderRadius: 1 }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div">
                    {item.product_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Đơn hàng ngày:{" "}
                    {new Date(item.order_date).toLocaleDateString("vi-VN")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Giá: {item.price?.toLocaleString("vi-VN")}đ
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenModal(item)}
                >
                  Viết đánh giá
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {selectedItem && (
        <ReviewFormModal
          open={modalOpen}
          onClose={handleCloseModal}
          productName={selectedItem.product_name}
          productId={selectedItem.product_id}
          orderId={selectedItem.order_id}
          onSuccess={handleReviewSuccess}
        />
      )}
    </Box>
  );
};

export default PendingReviewsTab;
