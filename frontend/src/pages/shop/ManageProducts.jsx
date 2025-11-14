import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "../../services/productService";
import ProductFormModal from "../../components/ProductFormModal";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Pagination,
  Snackbar,
} from "@mui/material";
import { Clear, Edit, Delete, Add } from "@mui/icons-material";

const statuses = {
  active: "Hoạt động",
  out_of_stock: "Hết hàng",
  inactive: "Ngừng bán",
};

const ManageProducts = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [toastInfo, setToastInfo] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const {
    data: productsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", page, debouncedSearchTerm],
    queryFn: () => {
      const params = { page, limit: 10 };
      if (debouncedSearchTerm) {
        params.q = debouncedSearchTerm;
      }
      return productService.getProducts(params);
    },
    keepPreviousData: true,
  });

  const products = productsData?.data.docs || [];
  const totalPages = productsData?.data.totalPages || 1;

  console.log("products:", products);

  const showToast = (message, severity = "success") => {
    setToastInfo({ open: true, message, severity });
  };

  const createProductMutation = useMutation({
    mutationFn: (newProduct) => productService.createProduct(newProduct),
    onSuccess: () => {
      showToast("✨ Tạo sản phẩm mới thành công!");
      queryClient.invalidateQueries(["products"]);
      setShowModal(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "❌ Tạo sản phẩm thất bại!";
      showToast(errorMessage, "error");
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: (updatedProduct) =>
      productService.updateProduct(updatedProduct._id, updatedProduct),
    onSuccess: () => {
      showToast("Cập nhật sản phẩm thành công!");
      queryClient.invalidateQueries(["products", page, debouncedSearchTerm]);
      setShowModal(false);
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Cập nhật thất bại!";
      showToast(errorMessage, "error");
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId) => productService.deleteProduct(productId),
    onSuccess: () => {
      showToast("Xóa sản phẩm thành công!");
      queryClient.invalidateQueries(["products", page, debouncedSearchTerm]);
      setShowDeleteModal(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || "❌ Xóa thất bại!";
      showToast(errorMessage, "error");
    },
  });

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setToastInfo((prev) => ({ ...prev, open: false }));
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setShowModal(true);
  };

  const handleSave = (productToSave) => {
    if (editingProduct) {
      updateProductMutation.mutate(productToSave);
    } else {
      createProductMutation.mutate(productToSave);
    }
  };

  const handleDelete = (product) => {
    setDeletingProduct({ ...product });
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteProductMutation.mutate(deletingProduct._id);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography ml={2}>Đang tải sản phẩm...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        Lỗi khi tải sản phẩm!
      </Alert>
    );
  }

  return (
    <>
      <Snackbar
        open={toastInfo.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastInfo.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {toastInfo.message}
        </Alert>
      </Snackbar>
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold">
              📦 Quản lý sản phẩm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Xem, tìm kiếm và quản lý toàn bộ sản phẩm trong kho
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ minWidth: "300px" }}
              InputProps={{
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm("")} edge="end">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreateModal}
            >
              Tạo sản phẩm
            </Button>
          </Stack>
        </Box>

        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table stickyHeader sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Danh mục</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Tồn kho</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product._id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={product.images?.[0] || "/no-image.jpg"}
                        alt={product.name}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 1.5,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {product.description || "Không có mô tả"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {product.category_id?.name || "N/A"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary"
                      >
                        {product.base_price.toLocaleString("vi-VN")}₫
                      </Typography>
                    </TableCell>
                    <TableCell>{product.stock_total}</TableCell>
                    <TableCell>
                      <Chip
                        label={statuses[product.status]}
                        size="small"
                        color={
                          product.status === "active"
                            ? "success"
                            : product.status === "out_of_stock"
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(product)}
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Typography textAlign="center" p={4}>
                      Không tìm thấy sản phẩm phù hợp
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      </Paper>

      {showModal && (
        <ProductFormModal
          open={showModal}
          onClose={() => setShowModal(false)}
          product={editingProduct}
          onSave={handleSave}
        />
      )}

      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa sản phẩm "
            <strong>{deletingProduct?.name}</strong>" không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>Hủy</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteProductMutation.isLoading}
          >
            {deleteProductMutation.isLoading ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageProducts;
