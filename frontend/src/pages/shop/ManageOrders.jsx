import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Box,
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
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Clear, Visibility, Edit } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useToast } from "../../components/common/ToastProvider";

const statusMap = {
  pending: { text: "Chờ xác nhận", color: "warning" },
  confirmed: { text: "Đã xác nhận", color: "info" },
  processing: { text: "Đang xử lý", color: "info" },
  shipping: { text: "Đang giao", color: "primary" },
  delivered: { text: "Hoàn thành", color: "success" },
  canceled_by_shop: { text: "Đã hủy", color: "error" },
  canceled_by_customer: { text: "Đã hủy", color: "error" },
  refund_pending: { text: "Chờ hoàn/đổi", color: "warning" },
  refund_completed: { text: "Hoàn/đổi xong", color: "default" },
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const ManageOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
    setNewStatus("");
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) =>
      orderService.updateStatus(orderId, status),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công!");
      queryClient.invalidateQueries({ queryKey: ["shopOrders"] });
      handleCloseModal();
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Cập nhật trạng thái thất bại!";
      toast.error(message);
      handleCloseModal();
    },
  });

  const handleStatusChange = () => {
    if (selectedOrder) {
      updateStatusMutation.mutate({
        orderId: selectedOrder._id,
        status: newStatus,
      });
    }
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shopOrders", page, debouncedSearchTerm],
    queryFn: () => {
      const params = { page, limit: 10 };
      if (debouncedSearchTerm) {
        params.q = debouncedSearchTerm;
      }
      return orderService.listForShop(params);
    },
    keepPreviousData: true,
  });

  const orders = ordersData?.data.items || [];
  const totalPages = ordersData?.data.totalPages || 1;

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography ml={2}>Đang tải đơn hàng...</Typography>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 4 }}>
        Lỗi khi tải đơn hàng!
      </Alert>
    );
  }

  return (
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
            🛍️ Quản lý Đơn hàng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem, tìm kiếm và quản lý tất cả đơn hàng của cửa hàng
          </Typography>
        </Box>
        <TextField
          placeholder="Tìm kiếm theo mã đơn hàng..."
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
      </Box>

      <TableContainer sx={{ maxHeight: "60vh" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Mã Đơn Hàng</TableCell>
              <TableCell>Khách Hàng</TableCell>
              <TableCell>Ngày Đặt</TableCell>
              <TableCell>Tổng Tiền</TableCell>
              <TableCell>Trạng Thái</TableCell>
              <TableCell align="right">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {order.order_code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {order.user_id?.name || order.user_id?.email || "N/A"}
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {order.total_price.toLocaleString("vi-VN")}₫
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusMap[order.status]?.text || order.status}
                      size="small"
                      color={statusMap[order.status]?.color || "default"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={Link}
                      to={`/orders/${order._id}`}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                    {order.status !== "canceled_by_customer" && (
                      <IconButton
                        color="secondary"
                        onClick={() => handleOpenModal(order)}
                        disabled={updateStatusMutation.isLoading}
                      >
                        <Edit />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography textAlign="center" p={4}>
                    Không tìm thấy đơn hàng nào
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="update-status-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography
            id="update-status-modal-title"
            variant="h6"
            component="h2"
          >
            Cập nhật trạng thái đơn hàng
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {selectedOrder?.order_code}
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Trạng thái</InputLabel>
            <Select
              labelId="status-select-label"
              value={newStatus}
              label="Trạng thái"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {Object.entries(statusMap)
                .filter(([statusKey]) => statusKey !== "canceled_by_customer")
                .map(([statusKey, statusInfo]) => (
                  <MenuItem key={statusKey} value={statusKey}>
                    {statusInfo.text}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseModal}>Hủy</Button>
            <Button
              variant="contained"
              onClick={handleStatusChange}
              disabled={updateStatusMutation.isLoading}
              sx={{ ml: 2 }}
            >
              {updateStatusMutation.isLoading ? "Đang lưu..." : "Lưu"}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </Box>
    </Paper>
  );
};

export default ManageOrders;
