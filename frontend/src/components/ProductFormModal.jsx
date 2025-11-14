import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  FormHelperText,
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  Stack,
} from "@mui/material";
import { Add, Delete, Close } from "@mui/icons-material";
import { categoryService } from "../services/categoryService";
import VariantFormModal from "./VariantFormModal";
import ImageUploader from "./common/ImageUploader";

const emptyProduct = {
  name: "",
  description: "",
  base_price: 0,
  stock_total: 0,
  status: "active",
  category_id: "",
  variants: [],
};

const ProductFormModal = ({ open, onClose, product, onSave }) => {
  const [editedProduct, setEditedProduct] = useState(product || emptyProduct);
  const [errors, setErrors] = useState({});
  const isEditMode = Boolean(product);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);

  const {
    data: categories,
    isLoading: isLoadingCategories,
    isError: isErrorCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAllCategories,
    enabled: open, // Only fetch when the modal is open
  });

  useEffect(() => {
    if (open) {
      // Normalize category_id to be just the ID string if it's an object
      const initialProduct = product
        ? {
            ...product,
            category_id: product.category_id?._id || "",
            variants: (product.variants || []).map((v) => ({
              ...v,
              clientId: v._id || Date.now() + Math.random(),
            })),
          }
        : emptyProduct;
      setEditedProduct(initialProduct);
      setErrors({}); // Reset errors when modal opens
    }
  }, [product, open]);

  // Automatically update stock_total and base_price from variants
  useEffect(() => {
    if (editedProduct.variants && editedProduct.variants.length > 0) {
      const totalStock = editedProduct.variants.reduce(
        (sum, v) => sum + (v.stock || 0),
        0
      );
      const basePrice = editedProduct.variants[0]?.price || 0;

      // To avoid infinite loops, only update if the values have changed
      if (
        totalStock !== editedProduct.stock_total ||
        basePrice !== editedProduct.base_price
      ) {
        setEditedProduct((prev) => ({
          ...prev,
          stock_total: totalStock,
          base_price: basePrice,
        }));
      }
    }
  }, [
    editedProduct.variants,
    editedProduct.stock_total,
    editedProduct.base_price,
  ]);

  const handleChange = (field, value) => {
    setEditedProduct((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for the field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleImagesUploaded = (uploadedImages) => {
    const newImages = uploadedImages.map((img) => img.url);
    setEditedProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newImages],
    }));
  };

  const handleRemoveImage = (index) => {
    setEditedProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!editedProduct.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống.";
    }
    if (!editedProduct.category_id) {
      newErrors.category_id = "Vui lòng chọn danh mục.";
    }
    if (editedProduct.base_price <= 0 && editedProduct.variants?.length === 0) {
      newErrors.base_price =
        "Giá sản phẩm phải là số dương nếu không có biến thể.";
    }
    if (editedProduct.stock_total < 0 && editedProduct.variants?.length === 0) {
      newErrors.stock_total =
        "Tồn kho không được là số âm nếu không có biến thể.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      const productToSave = {
        ...editedProduct,
        variants: editedProduct.variants.map(
          // eslint-disable-next-line no-unused-vars
          ({ clientId, ...variant }) => variant
        ),
      };
      onSave(productToSave);
    }
  };

  const handleOpenVariantModal = (variant = null) => {
    setEditingVariant(variant);
    setShowVariantModal(true);
  };

  const handleSaveVariant = (variant) => {
    setEditedProduct((prev) => {
      const newVariants = [...prev.variants];
      if (editingVariant) {
        // Update
        const index = newVariants.findIndex(
          (v) => v.clientId === editingVariant.clientId
        );
        newVariants[index] = variant;
      } else {
        // Create
        newVariants.push({
          ...variant,
          clientId: Date.now() + Math.random(),
        });
      }
      return { ...prev, variants: newVariants };
    });
    setEditingVariant(null);
  };

  const handleDeleteVariant = (variantClientId) => {
    setEditedProduct((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.clientId !== variantClientId),
    }));
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditMode ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tên sản phẩm"
            type="text"
            fullWidth
            variant="outlined"
            value={editedProduct.name}
            onChange={(e) => handleChange("name", e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            error={!!errors.name}
            helperText={errors.name}
          />
          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.category_id}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={editedProduct.category_id || ""}
              label="Danh mục"
              onChange={(e) => handleChange("category_id", e.target.value)}
              disabled={isLoadingCategories}
            >
              {isLoadingCategories ? (
                <MenuItem value="">
                  <CircularProgress size={20} /> Đang tải...
                </MenuItem>
              ) : isErrorCategories ? (
                <MenuItem value="" disabled>
                  Lỗi khi tải danh mục
                </MenuItem>
              ) : (
                categories?.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.category_id && (
              <FormHelperText>{errors.category_id}</FormHelperText>
            )}
          </FormControl>
          <TextField
            margin="dense"
            label="Mô tả"
            type="text"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={editedProduct.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            sx={{ mb: 2 }}
          />

          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Ảnh sản phẩm
            </Typography>
            <ImageUploader
              folder="dfs/products"
              onUploaded={handleImagesUploaded}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
              {(editedProduct.images || []).map((image, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  <Avatar
                    src={image}
                    variant="rounded"
                    sx={{ width: 80, height: 80 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      bgcolor: "rgba(255, 255, 255, 0.7)",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                    }}
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>

          {editedProduct.variants?.length === 0 && (
            <>
              <TextField
                margin="dense"
                label="Giá (₫)"
                type="number"
                fullWidth
                variant="outlined"
                value={editedProduct.base_price}
                onChange={(e) =>
                  handleChange("base_price", Number(e.target.value))
                }
                sx={{ mb: 2 }}
                error={!!errors.base_price}
                helperText={errors.base_price}
              />
              <TextField
                margin="dense"
                label="Tồn kho"
                type="number"
                fullWidth
                variant="outlined"
                value={editedProduct.stock_total}
                onChange={(e) =>
                  handleChange("stock_total", Number(e.target.value))
                }
                sx={{ mb: 2 }}
                error={!!errors.stock_total}
                helperText={errors.stock_total}
              />
            </>
          )}

          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={editedProduct.status}
              label="Trạng thái"
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <MenuItem value="active">Hoạt động</MenuItem>
              <MenuItem value="out_of_stock">Hết hàng</MenuItem>
              <MenuItem value="inactive">Ngừng bán</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ border: "1px solid #ccc", borderRadius: 1, p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Biến thể sản phẩm
            </Typography>
            {editedProduct.variants.map((variant) => (
              <Chip
                key={variant.clientId}
                label={`${variant.variant_attributes.color} - ${
                  variant.variant_attributes.size
                } (${new Intl.NumberFormat("vi-VN").format(
                  variant.price || 0
                )}₫)`}
                onDelete={() => handleDeleteVariant(variant.clientId)}
                deleteIcon={<Delete />}
                onClick={() => handleOpenVariantModal(variant)}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
            <Button
              startIcon={<Add />}
              onClick={() => handleOpenVariantModal()}
              size="small"
            >
              Thêm biến thể
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditMode ? "Lưu thay đổi" : "Tạo sản phẩm"}
          </Button>
        </DialogActions>
      </Dialog>
      {showVariantModal && (
        <VariantFormModal
          open={showVariantModal}
          onClose={() => setShowVariantModal(false)}
          onSave={handleSaveVariant}
          variant={editingVariant}
        />
      )}
    </>
  );
};

export default ProductFormModal;
