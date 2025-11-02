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
} from "@mui/material";
import { Add, Edit, Delete, Visibility, Search, Close } from "@mui/icons-material";
import { bannerApi } from "../../services/bannerService"; // ✅ file bannerApi

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-GB");
};

const ManageBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [mode, setMode] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // --- Fetch banners ---
  const fetchBanners = async (page = 1, keyword = "") => {
    try {
      setLoading(true);
      const res = await bannerApi.getAll(page, 5, keyword);
      setBanners(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to load banners!", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch banner detail ---
  const fetchBannerDetail = async (id) => {
    try {
      const res = await bannerApi.getDetail(id);
      setSelectedBanner({ ...res, imagePreview: res.image_url });
      setMode("detail");
      setShowDialog(true);
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to load banner details!", "error");
    }
  };

  useEffect(() => {
    fetchBanners(page, searchTerm);
  }, [page, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedBanner(null);
    setMode(null);
  };

  const handleCreate = () => {
    setSelectedBanner({
      title: "",
      image_url: "",
      imagePreview: "",
      image_file: null,
      link: "#",
      position: "homepage_top",
      is_active: true,
      start_date: "",
      end_date: "",
    });
    setMode("create");
    setShowDialog(true);
  };

  // --- Save banner (create / edit) ---
  const handleSave = async () => {
  try {
    const payload = { ...selectedBanner };

    // --- Nếu có file ảnh, upload trước ---
    if (selectedBanner.image_file) {
      const uploadRes = await bannerApi.uploadImage(selectedBanner.image_file);
      payload.image_url = uploadRes.upload.url;
      payload.image_public_id = uploadRes.upload.public_id;
      delete payload.image_file; // Không gửi file nữa
      delete payload.imagePreview;
    }

    // --- Create / Update banner ---
    if (mode === "create") {
      await bannerApi.create(payload);
    } else if (mode === "edit") {
      await bannerApi.update(selectedBanner._id, payload);
    }

    showMessage(mode === "create" ? "Banner created successfully!" : "Banner updated successfully!");
    handleCloseDialog();
    fetchBanners(page, searchTerm);
  } catch (err) {
    showMessage(err.response?.data?.message || "Failed to save banner!", "error");
  }
};


  // --- Delete banner ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await bannerApi.delete(id);
      showMessage("Banner deleted successfully!");
      fetchBanners(page, searchTerm);
    } catch (err) {
      showMessage(err.response?.data?.message || "Failed to delete banner!", "error");
    }
  };

  if (loading) return <Typography>Loading banners...</Typography>;

  return (
    <Box sx={{ p: 4, bgcolor: "#f4f7fa", minHeight: "100vh" }}>
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Banner Management</Typography>
          <Box component="form" display="flex" gap={1} onSubmit={handleSearchSubmit}>
            <TextField
              size="small"
              placeholder="Search banners..."
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

        {/* TABLE */}
        <TableContainer sx={{ maxHeight: "60vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Link</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Active</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.length > 0 ? (
                banners.map((b) => (
                  <TableRow key={b._id}>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>
                      <img src={b.image_url} alt={b.title} width="80" style={{ borderRadius: 6 }} />
                    </TableCell>
                    <TableCell>{b.link}</TableCell>
                    <TableCell>{b.position}</TableCell>
                    <TableCell>{formatDate(b.start_date)}</TableCell>
                    <TableCell>{formatDate(b.end_date)}</TableCell>
                    <TableCell>{b.is_active ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => fetchBannerDetail(b._id)} sx={{ color: "#1976d2" }}>
                          <Visibility />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedBanner({ ...b, imagePreview: b.image_url, image_file: null });
                            setMode("edit");
                            setShowDialog(true);
                          }}
                          sx={{ color: "#2e7d32" }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(b._id)} sx={{ color: "#c62828" }}>
                          <Delete />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No banners found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} color="primary" />
        </Box>
      </Paper>

      {/* === DIALOG DETAIL / CREATE / EDIT === */}
      <Dialog open={showDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {mode === "detail" ? "Banner Detail" : mode === "create" ? "Create Banner" : "Edit Banner"}
          <IconButton onClick={handleCloseDialog} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedBanner && (
            <Stack spacing={2}>
              {/* Title */}
              <TextField
                label="Title"
                fullWidth
                value={selectedBanner.title}
                onChange={(e) => setSelectedBanner({ ...selectedBanner, title: e.target.value })}
                InputProps={mode === "detail" ? { readOnly: true } : {}}
              />

              {/* Image Upload */}
              <Box>
                {selectedBanner.imagePreview && (
                  <Box textAlign="center" mb={1}>
                    <img
                      src={selectedBanner.imagePreview}
                      alt="Preview"
                      style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid #ddd" }}
                    />
                  </Box>
                )}
                {mode !== "detail" && (
                  <Button variant="contained" component="label">
                    {selectedBanner.image_file ? "Change Image" : "Upload Image"}
                    <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setSelectedBanner({
                          ...selectedBanner,
                          image_file: file,
                          imagePreview: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                  </Button>
                )}
              </Box>

              {/* Link */}
              <TextField
                label="Link"
                fullWidth
                value={selectedBanner.link}
                onChange={(e) => setSelectedBanner({ ...selectedBanner, link: e.target.value })}
                InputProps={mode === "detail" ? { readOnly: true } : {}}
              />

              {/* Position */}
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  value={selectedBanner.position}
                  label="Position"
                  onChange={(e) => setSelectedBanner({ ...selectedBanner, position: e.target.value })}
                  disabled={mode === "detail"}
                >
                  <MenuItem value="homepage_top">Homepage Top</MenuItem>
                  <MenuItem value="homepage_mid">Homepage Middle</MenuItem>
                  <MenuItem value="homepage_bottom">Homepage Bottom</MenuItem>
                  <MenuItem value="category_page">Category Page</MenuItem>
                </Select>
              </FormControl>

              {/* Dates */}
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={selectedBanner.start_date?.split("T")[0] || ""}
                onChange={(e) => setSelectedBanner({ ...selectedBanner, start_date: e.target.value })}
                InputProps={mode === "detail" ? { readOnly: true } : {}}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={selectedBanner.end_date?.split("T")[0] || ""}
                onChange={(e) => setSelectedBanner({ ...selectedBanner, end_date: e.target.value })}
                InputProps={mode === "detail" ? { readOnly: true } : {}}
              />

              {/* Active */}
              <FormControl fullWidth>
                <InputLabel>Active</InputLabel>
                <Select
                  value={selectedBanner.is_active}
                  label="Active"
                  onChange={(e) => setSelectedBanner({ ...selectedBanner, is_active: e.target.value })}
                  disabled={mode === "detail"}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>

        {mode !== "detail" && (
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* SNACKBAR */}
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

export default ManageBanner;
