import apiClient from "./apiClient";

export const getPendingReviews = async () => {
  const response = await apiClient.get("/reviews/pending-reviews");
  return response.data.data;
};

export const createReview = async (reviewData) => {
  const response = await apiClient.post("/reviews/test-review", reviewData);
  return response.data.data;
};

export const getReviewsByProduct = async (productId) => {
  const response = await apiClient.get(`/reviews/product/${productId}`);
  return response.data.data;
};

export const getMyReviews = async () => {
  const response = await apiClient.get("/reviews/my-reviews");
  return response.data.data;
};
