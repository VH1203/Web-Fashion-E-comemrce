import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createReview } from "../../services/reviewServices";
import {
  Modal,
  Box,
  Typography,
  Button,
  Rating,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";

// Style cho Modal
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ReviewFormModal = ({
  open,
  onClose,
  productName,
  productId,
  orderId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  // Thêm state cho size_feedback, images nếu cần
  // const [sizeFeedback, setSizeFeedback] = useState("fit");
  // const [images, setImages] = useState([]);

  const { mutate, isLoading, error } = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      onSuccess(); // Gọi callback khi thành công (để đóng modal & refetch)
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá.");
      return;
    }

    const reviewData = {
      order_id: orderId,
      product_id: productId,
      rating: rating,
      comment: comment,
      is_anonymous: isAnonymous,
      // size_feedback: sizeFeedback,
      // images: images,
    };

    mutate(reviewData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" component="h2" gutterBottom>
          Đánh giá sản phẩm
        </Typography>
        <Typography variant="body1" gutterBottom>
          {productName}
        </Typography>

        <Stack spacing={2} sx={{ mt: 2 }}>
          <Typography component="legend">Chất lượng sản phẩm:</Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue || 0);
            }}
            size="large"
          />

          <TextField
            label="Nhận xét của bạn"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Hãy chia sẻ cảm nhận của bạn về sản phẩm..."
          />

          {/* Thêm phần upload ảnh, size feedback nếu cần tại đây */}

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
              }
              label="Đánh giá ẩn danh"
            />
          </FormGroup>

          {error && (
            <Alert severity="error">
              {error.response?.data?.message ||
                "Đã xảy ra lỗi. Vui lòng thử lại."}
            </Alert>
          )}

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onClose} color="inherit" disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : "Gửi đánh giá"}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export default ReviewFormModal;
