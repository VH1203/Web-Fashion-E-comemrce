import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Close,
} from "@mui/icons-material";
import { flashsaleApi } from "../../services/flashsaleService";
import { bannerApi } from "../../services/bannerService";
import { productService } from "../../services/productService";
import { productVariantByListIdProduct } from "../../services/productVariantService";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB");
};

const ManageFlashsale = () => {
  const [flashsales, setFlashsales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchFlashsales = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await flashsaleApi.getAll(page, 5, keyword);
      setFlashsales(res.data || res || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      showMessage("Failed to load flash sales!", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownData = async () => {
    try {
      const proPromise = productService?.getAllProducts
        ? productService.getAllProducts()
        : Promise.resolve([]);

      const banPromise = bannerApi.getAll(1, 100);
      const [proRes, banRes] = await Promise.allSettled([
        proPromise,
        banPromise,
      ]);

      if (proRes.status === "fulfilled") {
        setProducts(proRes.value || []);
      } else {
        console.warn("Product load failed:", proRes.reason);
        setProducts([]);
      }

      if (banRes.status === "fulfilled") {
        setBanners(banRes.value?.data || []);
      } else {
        console.warn("Banner load failed:", banRes.reason);
        setBanners([]);
      }
    } catch (err) {
      console.error("Unexpected error loading dropdown data:", err);
      showMessage("Failed to load dropdown data", "error");
    }
  };

  useEffect(() => {
    fetchFlashsales(page, searchTerm);
  }, [page, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelected(null);
    setMode(null);
  };

  const handleCreate = async () => {
    await loadDropdownData();
    setSelected({
      title: "",
      description: "",
      product: [],
      banner_id: "",
      banner_image: "",
      discount_type: "percentage",
      discount_value: 0,
      max_per_user: 0,
      total_limit: 0,
      start_time: "",
      end_time: "",
      status: "scheduled",
    });
    setMode("create");
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!selected.product || selected.product.length === 0) {
        showMessage("Please select at least one product", "error");
        return;
      }

      const productIds = selected.product.map((p) => p.product_id);
      const variantRes = await productVariantByListIdProduct.getByProductIds(
        productIds
      );

      if (!variantRes || variantRes.length === 0) {
        showMessage("Selected product(s) have no variants!", "error");
        return;
      }

      // Tạo productsPayload: mỗi variant là 1 entry, tính flash_price theo type
      const productsPayload = variantRes.map((v) => {
        const originalPrice = v.original_price || v.price || 0;
        let flashPrice = originalPrice;

        if (selected.discount_type === "percentage") {
          flashPrice =
            originalPrice * (1 - (selected.discount_value || 0) / 100);
        } else if (selected.discount_type === "fixed") {
          flashPrice = originalPrice - (selected.discount_value || 0);
          if (flashPrice < 0) flashPrice = 0;
        }

        return {
          product_id: v.product_id,
          variant_id: v._id,
          flash_price: Math.round(flashPrice), // có thể làm tròn
          original_price: originalPrice,
          quantity_total: v.stock || 0,
          quantity_sold: 0,
        };
      });

      const payload = {
        title: selected.title,
        description: selected.description,
        banner_id: selected.banner_id,
        banner_image: selected.banner_image,
        discount_type: selected.discount_type || "percentage",
        discount_value: Number(selected.discount_value) || 0,
        max_per_user: Number(selected.max_per_user) || 0,
        total_limit: Number(selected.total_limit) || 0,
        start_time: selected.start_time
          ? new Date(selected.start_time)
          : new Date(),
        end_time: selected.end_time ? new Date(selected.end_time) : new Date(),
        status: selected.status || "scheduled",
        products: productsPayload,
      };

      if (mode === "create") {
        await flashsaleApi.create(payload);
        showMessage("✅ Flash sale created successfully!");
      } else if (mode === "edit" && selected._id) {
        await flashsaleApi.update(selected._id, payload);
        showMessage("✅ Flash sale updated successfully!");
      }

      handleCloseDialog();
      fetchFlashsales(page, searchTerm);
    } catch (err) {
      console.error(err);
      showMessage("❌ Failed to save flash sale!", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this flash sale?"))
      return;
    try {
      await flashsaleApi.delete(id);
      showMessage("Flash sale deleted successfully!");
      fetchFlashsales(page, searchTerm);
    } catch {
      showMessage("Failed to delete flash sale!", "error");
    }
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 4, bgcolor: "#f4f7fa", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Flash Sale Management</Typography>
          <Box
            component="form"
            display="flex"
            gap={1}
            onSubmit={handleSearchSubmit}
          >
            <TextField
              size="small"
              placeholder="Search flash sales..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="contained" startIcon={<Search />}>
              Search
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreate}
            >
              Create
            </Button>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Banner</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flashsales.length > 0 ? (
                flashsales.map((fs) => (
                  <TableRow key={fs._id}>
                    <TableCell>{fs.title}</TableCell>
                    <TableCell>{fs.description}</TableCell>
                    <TableCell>
                      {fs.banner_image ? (
                        <img
                          src={fs.banner_image}
                          alt={fs.title}
                          width="80"
                          style={{ borderRadius: 6 }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {fs.discount_type === "percentage"
                        ? `${fs.discount_value}%`
                        : `${fs.discount_value.toLocaleString()} ₫`}
                    </TableCell>
                    <TableCell>{formatDate(fs.start_time)}</TableCell>
                    <TableCell>{formatDate(fs.end_time)}</TableCell>
                    <TableCell>{fs.status || "inactive"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => {
                            setSelected(fs);
                            setMode("detail");
                            setShowDialog(true);
                          }}
                          sx={{ color: "#1976d2" }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          onClick={async () => {
                            await loadDropdownData(); // load products + banners

                            // Lấy danh sách product_id duy nhất từ flashsale
                            const uniqueProductIds = Array.from(
                              new Set(fs.products?.map((p) => p.product_id))
                            );

                            // Map thành selected.product: mỗi item có product_id + name
                            const mappedProducts = uniqueProductIds.map(
                              (pid) => {
                                const prod = products.find(
                                  (p) => p._id === pid
                                );
                                return {
                                  product_id: pid,
                                  name: prod?.name || "",
                                };
                              }
                            );

                            setSelected({
                              ...fs,
                              product: mappedProducts,
                            });

                            setMode("edit");
                            setShowDialog(true);
                          }}
                          sx={{ color: "#2e7d32" }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(fs._id)}
                          sx={{ color: "#c62828" }}
                        >
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No flash sales found
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
            onChange={(e, val) => setPage(val)}
            color="primary"
          />
        </Box>
      </Paper>

      {/* Dialog Create / Edit / Detail */}
      <Dialog
        open={showDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {mode === "create"
            ? "Create Flash Sale"
            : mode === "edit"
            ? "Edit Flash Sale"
            : "Flash Sale Details"}
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selected && mode === "detail" ? (
            <Stack spacing={2}>
              <Typography variant="h6" color="primary">
                {selected.title}
              </Typography>
              <Typography>
                Description: {selected.description || "-"}
              </Typography>
              <Typography>
                Discount:{" "}
                {selected.discount_type === "percentage"
                  ? `${selected.discount_value}%`
                  : `${selected.discount_value?.toLocaleString()} ₫`}
              </Typography>
              <Typography>
                Max per user: {selected.max_per_user || "-"}
              </Typography>
              <Typography>
                Total limit: {selected.total_limit || "-"}
              </Typography>
              <Typography>Start: {formatDate(selected.start_time)}</Typography>
              <Typography>End: {formatDate(selected.end_time)}</Typography>
              <Typography>Status: {selected.status || "-"}</Typography>
              {selected.banner_image && (
                <Box mt={1}>
                  <img
                    src={selected.banner_image}
                    alt={selected.title}
                    style={{ width: 420, borderRadius: 6 }}
                  />
                </Box>
              )}
            </Stack>
          ) : (
            selected && (
              <Stack spacing={2}>
                <TextField
                  label="Title"
                  fullWidth
                  value={selected.title}
                  onChange={(e) =>
                    setSelected({ ...selected, title: e.target.value })
                  }
                />
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={selected.description}
                  onChange={(e) =>
                    setSelected({ ...selected, description: e.target.value })
                  }
                />

                <FormControl fullWidth>
                  <InputLabel>Banner</InputLabel>
                  <Select
                    value={selected.banner_id || ""}
                    label="Banner"
                    onChange={(e) => {
                      const bannerId = e.target.value;
                      const banner = banners.find((b) => b._id === bannerId);
                      setSelected({
                        ...selected,
                        banner_id: bannerId,
                        banner_image:
                          banner?.image_url || banner?.image_url || "",
                      });
                    }}
                  >
                    {banners.map((b) => (
                      <MenuItem key={b._id} value={b._id}>
                        {b.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Products</InputLabel>
                  <Select
                    multiple
                    value={selected.product?.map((p) => p.product_id) || []} // array product_id
                    onChange={(e) => {
                      const ids = e.target.value; // đây là mảng product_id đã check
                      const newSelected = ids.map((id) => {
                        const prod = products.find((p) => p._id === id);
                        return { product_id: id, name: prod?.name || "" };
                      });
                      setSelected({ ...selected, product: newSelected });
                    }}
                    renderValue={(selectedItems) =>
                      selected.product?.map((s) => s.name).join(", ")
                    }
                  >
                    {products.map((p) => (
                      <MenuItem key={p._id} value={p._id}>
                        <input
                          type="checkbox"
                          checked={
                            selected.product?.some(
                              (s) => s.product_id === p._id
                            ) || false
                          }
                          readOnly
                          style={{ marginRight: 8 }}
                        />
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Discount Type</InputLabel>
                  <Select
                    value={selected.discount_type || "percentage"}
                    label="Discount Type"
                    onChange={(e) =>
                      setSelected({
                        ...selected,
                        discount_type: e.target.value,
                      })
                    }
                  >
                    <MenuItem value="percentage">Percentage (%)</MenuItem>
                    <MenuItem value="fixed">Fixed amount (₫)</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Discount Value"
                  type="number"
                  fullWidth
                  value={selected.discount_value}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      discount_value: Number(e.target.value),
                    })
                  }
                />

                <TextField
                  label="Max per user"
                  type="number"
                  fullWidth
                  value={selected.max_per_user}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      max_per_user: Number(e.target.value),
                    })
                  }
                />

                <TextField
                  label="Total limit"
                  type="number"
                  fullWidth
                  value={selected.total_limit}
                  onChange={(e) =>
                    setSelected({
                      ...selected,
                      total_limit: Number(e.target.value),
                    })
                  }
                />

                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={selected.start_time?.split("T")[0] || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, start_time: e.target.value })
                  }
                />

                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={selected.end_time?.split("T")[0] || ""}
                  onChange={(e) =>
                    setSelected({ ...selected, end_time: e.target.value })
                  }
                />

                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selected.status || "scheduled"}
                    onChange={(e) =>
                      setSelected({ ...selected, status: e.target.value })
                    }
                  >
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="ended">Ended</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            )
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {mode !== "detail" && (
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageFlashsale;
