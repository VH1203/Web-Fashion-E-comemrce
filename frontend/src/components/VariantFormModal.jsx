import { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import ImageUploader from "./common/ImageUploader";
import { Close } from "@mui/icons-material";

const emptyVariant = {
  sku: "",
  price: 0,
  stock: 0,
  variant_attributes: { color: "", size: "" },
  images: [],
};

const VariantFormModal = ({ open, onClose, onSave, variant }) => {
  const [editedVariant, setEditedVariant] = useState(variant || emptyVariant);
  const [errors, setErrors] = useState({});
  const isEditMode = Boolean(variant);

  useEffect(() => {
    setEditedVariant(variant || emptyVariant);
    setErrors({}); // Reset errors on open or variant change
  }, [variant, open]);

  const handleChange = (field, value) => {
    setEditedVariant((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAttributeChange = (attr, value) => {
    setEditedVariant((prev) => ({
      ...prev,
      variant_attributes: { ...prev.variant_attributes, [attr]: value },
    }));
    // Clear error when user starts typing
    if (errors[attr]) {
      setErrors((prev) => ({ ...prev, [attr]: null }));
    }
  };

  const handleImagesUploaded = (uploadedImages) => {
    const newImageUrls = uploadedImages.map((img) => img.url);
    setEditedVariant((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...newImageUrls],
    }));
  };

  const handleRemoveImage = (index) => {
    setEditedVariant((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!editedVariant.sku?.trim()) {
      newErrors.sku = "SKU là bắt buộc.";
    }
    if (!editedVariant.variant_attributes?.color?.trim()) {
      newErrors.color = "Màu sắc là bắt buộc.";
    }
    if (!editedVariant.variant_attributes?.size?.trim()) {
      newErrors.size = "Kích thước là bắt buộc.";
    }
    if (!editedVariant.price || editedVariant.price <= 0) {
      newErrors.price = "Giá phải là một số dương.";
    }
    if (
      editedVariant.stock === null ||
      editedVariant.stock < 0 ||
      !Number.isInteger(editedVariant.stock)
    ) {
      newErrors.stock = "Tồn kho phải là một số nguyên không âm.";
    }
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(editedVariant);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {isEditMode ? "Chỉnh sửa biến thể" : "Tạo biến thể mới"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="SKU"
          type="text"
          fullWidth
          variant="outlined"
          value={editedVariant.sku}
          onChange={(e) => handleChange("sku", e.target.value)}
          sx={{ mb: 2, mt: 1 }}
          error={!!errors.sku}
          helperText={errors.sku}
        />
        <TextField
          margin="dense"
          label="Màu sắc"
          type="text"
          fullWidth
          variant="outlined"
          value={editedVariant.variant_attributes.color}
          onChange={(e) => handleAttributeChange("color", e.target.value)}
          sx={{ mb: 2 }}
          error={!!errors.color}
          helperText={errors.color}
        />
        <TextField
          margin="dense"
          label="Kích thước"
          type="text"
          fullWidth
          variant="outlined"
          value={editedVariant.variant_attributes.size}
          onChange={(e) => handleAttributeChange("size", e.target.value)}
          sx={{ mb: 2 }}
          error={!!errors.size}
          helperText={errors.size}
        />
        <TextField
          margin="dense"
          label="Giá"
          type="number"
          fullWidth
          variant="outlined"
          value={editedVariant.price}
          onChange={(e) => handleChange("price", Number(e.target.value))}
          sx={{ mb: 2 }}
          error={!!errors.price}
          helperText={errors.price}
          InputProps={{ inputProps: { min: 0 } }}
        />
        <TextField
          margin="dense"
          label="Tồn kho"
          type="number"
          fullWidth
          variant="outlined"
          value={editedVariant.stock}
          onChange={(e) => handleChange("stock", Number(e.target.value))}
          sx={{ mb: 2 }}
          error={!!errors.stock}
          helperText={errors.stock}
          InputProps={{ inputProps: { min: 0, step: 1 } }}
        />
        <Box mt={2}>
          <ImageUploader
            folder="dfs/products"
            onUploaded={handleImagesUploaded}
          />
          <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
            {(editedVariant.images || []).map((imageUrl, index) => (
              <Box key={index} position="relative">
                <Avatar
                  src={imageUrl}
                  alt={`variant-img-${index}`}
                  variant="rounded"
                  sx={{ width: 80, height: 80 }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    bgcolor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VariantFormModal;
