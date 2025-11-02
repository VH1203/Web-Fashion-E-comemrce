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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Search, Close } from "@mui/icons-material";
import { voucherApi } from "../../services/voucherService";

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

const ManageVoucher = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [mode, setMode] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchVouchers = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await voucherApi.getAll(page, 5, keyword);
      setVouchers(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to load vouchers!";
      showMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchVoucherDetail = async (id) => {
    try {
      const res = await voucherApi.getDetail(id);
      setSelectedVoucher(res);
      setMode("detail");
      setShowDetail(true);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to load voucher details!";
      showMessage(message, "error");
    }
  };

  useEffect(() => {
    fetchVouchers(page, searchTerm);
  }, [page, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedVoucher(null);
    setMode(null);
  };

  const handleCreate = () => {
    setSelectedVoucher({
      code: "",
      discount_type: "percent",
      discount_value: 0,
      max_uses: 1,
      usage_limit_per_user: 1,
      min_order_value: 0,
      applicable_products: [],
      applicable_users: [],
      scope: "shop",
      shop_id: "",
      valid_from: "",
      valid_to: "",
      is_active: true,
    });
    setMode("create");
    setShowDetail(true);
  };

  const handleSave = async () => {
    try {
      const currentUserId = "0e64fafe-6d8f-4859-b989-63c02f560329";
      const now = new Date().toISOString();

      const payload = {
        ...selectedVoucher,
        discount_value: Number(selectedVoucher.discount_value),
        max_uses: Number(selectedVoucher.max_uses),
        usage_limit_per_user: Number(selectedVoucher.usage_limit_per_user),
        min_order_value: Number(selectedVoucher.min_order_value),
        updated_by: currentUserId,
        updated_at: now,
      };

      if (mode === "create") {
        payload.created_by = currentUserId;
        payload.created_at = now;
        await voucherApi.create(payload);
        showMessage("Voucher created successfully!", "success");
      } else if (mode === "edit") {
        await voucherApi.update(selectedVoucher._id, payload);
        showMessage("Voucher updated successfully!", "success");
      }

      handleCloseDetail();
      fetchVouchers(page, searchTerm);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to save voucher!";
      showMessage(message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this voucher?")) return;
    try {
      await voucherApi.delete(id);
      showMessage("Voucher deleted successfully!", "success");
      fetchVouchers(page, searchTerm);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to delete voucher!";
      showMessage(message, "error");
    }
  };

  if (loading) return <Typography>Loading vouchers...</Typography>;

  return (
    <Box sx={{ p: 4, bgcolor: "#f4f7fa", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Voucher Management</Typography>
          <Box component="form" display="flex" alignItems="center" gap={1} onSubmit={handleSearchSubmit}>
            <TextField
              size="small"
              placeholder="Search vouchers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button type="submit" variant="contained" startIcon={<Search />}>
              Search
            </Button>
            <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
              Create
            </Button>
          </Box>
        </Box>

        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Discount</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Max Uses</TableCell>
                <TableCell>Used</TableCell>
                <TableCell>Valid From</TableCell>
                <TableCell>Valid To</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vouchers.length > 0 ? (
                vouchers.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>{v.code}</TableCell>
                    <TableCell>{v.discount_value}</TableCell>
                    <TableCell>{v.discount_type}</TableCell>
                    <TableCell>{v.max_uses}</TableCell>
                    <TableCell>{v.used_count}</TableCell>
                    <TableCell>{formatDate(v.valid_from)}</TableCell>
                    <TableCell>{formatDate(v.valid_to)}</TableCell>
                    <TableCell>{v.is_active ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => fetchVoucherDetail(v._id)} sx={{ color: "#1976d2" }}>
                          <Visibility />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedVoucher(v);
                            setMode("edit");
                            setShowDetail(true);
                          }}
                          sx={{ color: "#2e7d32" }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(v._id)} sx={{ color: "#c62828" }}>
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No vouchers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" />
        </Box>
      </Paper>

      {/* === DIALOG DETAIL === */}
      <Dialog open={showDetail && mode === "detail"} onClose={handleCloseDetail} fullWidth maxWidth="sm">
        <DialogTitle>
          Voucher Detail
          <IconButton aria-label="close" onClick={handleCloseDetail} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#fafafa",
          }}
        >
          {selectedVoucher && (
            <Box
              sx={{
                width: "100%",
                maxWidth: 400,
                mx: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 2.5,
                bgcolor: "white",
                borderRadius: 3,
                boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
              }}
            >
              {[
                { label: "Code", value: selectedVoucher.code },
                {
                  label: "Discount",
                  value:
                    selectedVoucher.discount_value +
                    (selectedVoucher.discount_type === "percent" ? "%" : " VND"),
                },
                { label: "Discount type", value: selectedVoucher.discount_type },
                { label: "Max Uses", value: selectedVoucher.max_uses },
                { label: "Used", value: selectedVoucher.used_count || 0 },
                { label: "Valid From", value: formatDate(selectedVoucher.valid_from) },
                { label: "Valid To", value: formatDate(selectedVoucher.valid_to) },
                { label: "Created At", value: formatDate(selectedVoucher.created_at) },
                { label: "Updated At", value: formatDate(selectedVoucher.updated_at) },
              ].map((item, i) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid #e0e0e0",
                    borderRadius: 2,
                    p: 1.5,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: "0 0 0 2px rgba(25,118,210,0.15)",
                      backgroundColor: "rgba(25,118,210,0.02)",
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 600, color: "text.secondary" }}>{item.label}</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{item.value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* === DIALOG CREATE / EDIT === */}
      <Dialog open={showDetail && (mode === "edit" || mode === "create")} onClose={handleCloseDetail} fullWidth maxWidth="sm">
        <DialogTitle>
          {mode === "create" ? "Create Voucher" : "Edit Voucher"}
          <IconButton aria-label="close" onClick={handleCloseDetail} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedVoucher && (
            <Stack spacing={2}>
              <TextField
                label="Code"
                fullWidth
                value={selectedVoucher.code}
                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, code: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={selectedVoucher.discount_type}
                  label="Discount Type"
                  onChange={(e) => setSelectedVoucher({ ...selectedVoucher, discount_type: e.target.value })}
                >
                  <MenuItem value="percent">Percent</MenuItem>
                  <MenuItem value="fixed">Fixed</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Discount Value"
                type="number"
                fullWidth
                value={selectedVoucher.discount_value}
                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, discount_value: Number(e.target.value) })}
              />
              <TextField
                label="Max Uses"
                type="number"
                fullWidth
                value={selectedVoucher.max_uses}
                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, max_uses: Number(e.target.value) })}
              />
              <TextField
                label="Usage Limit Per User"
                type="number"
                fullWidth
                value={selectedVoucher.usage_limit_per_user}
                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, usage_limit_per_user: Number(e.target.value) })}
              />
              <TextField
                label="Valid From"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={selectedVoucher.valid_from?.split("T")[0] || ""}
                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, valid_from: e.target.value })}
              />
              <TextField
                label="Valid To"
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={selectedVoucher.valid_to?.split("T")[0] || ""}
                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, valid_to: e.target.value })}
              />
              <TextField
                label="Min Order Value"
                type="number"
                fullWidth
                value={selectedVoucher.min_order_value}
                onChange={(e) => setSelectedVoucher({ ...selectedVoucher, min_order_value: Number(e.target.value) })}
              />
              <TextField
                label="Applicable Products (comma separated)"
                fullWidth
                value={selectedVoucher.applicable_products.join(", ")}
                onChange={(e) =>
                  setSelectedVoucher({
                    ...selectedVoucher,
                    applicable_products: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <TextField
                label="Applicable Users (comma separated)"
                fullWidth
                value={selectedVoucher.applicable_users.join(", ")}
                onChange={(e) =>
                  setSelectedVoucher({
                    ...selectedVoucher,
                    applicable_users: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Scope</InputLabel>
                <Select
                  value={selectedVoucher.scope}
                  label="Scope"
                  onChange={(e) => setSelectedVoucher({ ...selectedVoucher, scope: e.target.value })}
                >
                  <MenuItem value="shop">Shop</MenuItem>
                  <MenuItem value="global">Global</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Active</InputLabel>
                <Select
                  value={selectedVoucher.is_active}
                  label="Active"
                  onChange={(e) => setSelectedVoucher({ ...selectedVoucher, is_active: e.target.value })}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDetail}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageVoucher;
