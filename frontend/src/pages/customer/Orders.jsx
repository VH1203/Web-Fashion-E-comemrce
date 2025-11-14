// Orders.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "../../services/orderService";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Box,
  Tabs,
  Tab,
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Divider,
  Pagination,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
} from "@mui/material";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Replay from "@mui/icons-material/Replay";
import Print from "@mui/icons-material/Print";

const statusMap = {
  pending: { text: "Chờ xác nhận", color: "warning" },
  confirmed: { text: "Đã xác nhận", color: "info" },
  processing: { text: "Đang xử lý", color: "info" },
  shipping: { text: "Đang giao", color: "primary" },
  delivered: { text: "Hoàn thành", color: "success" },
  canceled_by_shop: {
    text: "Đã hủy (từ shop)",
    color: "error",
  },
  canceled_by_customer: { text: "Đã hủy (từ khách hàng)", color: "error" },
  refund_pending: { text: "Chờ hoàn/đổi", color: "warning" },
  refund_completed: { text: "Hoàn/đổi xong", color: "default" },
};

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  ...Object.entries(statusMap).map(([key, { text }]) => ({
    key,
    label: text,
  })),
];

export default function Orders() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 500);
  const [dialog, setDialog] = useState({ open: false, content: null });

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedQ]);

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders", page, tab, debouncedQ],
    queryFn: () => {
      const status = STATUS_TABS[tab].key || undefined;
      return orderService.list({
        status,
        page,
        limit: 10,
        q: debouncedQ || undefined,
      });
    },
    keepPreviousData: true,
  });

  console.log("ordersData", ordersData);

  const cancelMutation = useMutation({
    mutationFn: (orderId) => orderService.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDialog({ open: false, content: null });
    },
    onError: () => {
      // You can add toast notifications here for errors
      setDialog({ open: false, content: null });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderId) => orderService.reorder(orderId),
    onSuccess: () => {
      nav("/cart");
    },
  });

  const reviewReminderMutation = useMutation({
    mutationFn: (orderId) => orderService.reviewReminder(orderId),
    onSuccess: () => {
      setDialog({
        open: true,
        content: (
          <>
            <DialogTitle>Thông báo</DialogTitle>
            <DialogContent>
              <DialogContentText>Đã gửi nhắc nhở đánh giá.</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialog({ open: false, content: null })}>
                Đóng
              </Button>
            </DialogActions>
          </>
        ),
      });
    },
  });

  const handleCancelOrder = (order) => {
    setDialog({
      open: true,
      content: (
        <>
          <DialogTitle>Xác nhận hủy đơn hàng</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Bạn có chắc chắn muốn hủy đơn hàng #{order.order_code}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialog({ open: false, content: null })}>
              Không
            </Button>
            <Button
              onClick={() => cancelMutation.mutate(order._id)}
              color="error"
              disabled={cancelMutation.isLoading}
            >
              {cancelMutation.isLoading ? "Đang hủy..." : "Có, Hủy"}
            </Button>
          </DialogActions>
        </>
      ),
    });
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
      <Typography variant="h5" fontWeight={800} mb={2}>
        Đơn hàng của tôi
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1}
        mb={2}
        alignItems="center"
      >
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="scrollable"
          scrollButtons
          allowScrollButtonsMobile
        >
          {STATUS_TABS.map((t, idx) => (
            <Tab key={`${idx}-${t}`} label={t.label} />
          ))}
        </Tabs>
        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <TextField
            size="small"
            placeholder="Tìm mã đơn"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Stack>
      </Stack>

      {isLoading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">Không thể tải danh sách đơn hàng.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {ordersData?.items.map((o) => (
            <Card key={o._id} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ md: "center" }}
                  spacing={1}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={800}>#{o.order_code}</Typography>
                    <Chip
                      size="small"
                      label={statusMap[o.status]?.text || o.status}
                      color={statusMap[o.status]?.color || "default"}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocalShipping />}
                      onClick={() => nav(`/orders/${o._id}`)}
                    >
                      Theo dõi
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Print />}
                      onClick={async () => {
                        const { url } = await orderService.invoice(o._id);
                        window.open(url, "_blank");
                      }}
                    >
                      In hóa đơn
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Replay />}
                      onClick={() => reorderMutation.mutate(o._id)}
                      disabled={reorderMutation.isLoading}
                    >
                      Mua lại
                    </Button>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack spacing={1}>
                  {(o.items || []).slice(0, 3).map((it, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            overflow: "hidden",
                            bgcolor: "#f5f7fa",
                          }}
                        >
                          {it.image_url && (
                            <img
                              src={it.image_url}
                              alt={it.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </Box>
                        <Stack>
                          <Typography fontWeight={600}>{it.name}</Typography>
                          {!!it.variant_text && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {it.variant_text}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            SL: {it.qty}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Typography fontWeight={700}>
                        {Number(it.total || it.price * it.qty).toLocaleString()}{" "}
                        VND
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={2}
                  mt={1}
                >
                  <Typography color="text.secondary">Tổng: </Typography>
                  <Typography fontWeight={800}>
                    {Number(o.total_price).toLocaleString()} VND
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} mt={1}>
                  {["pending", "confirmed", "processing"].includes(
                    o.status
                  ) && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleCancelOrder(o)}
                      disabled={cancelMutation.isLoading}
                    >
                      Hủy đơn
                    </Button>
                  )}
                  {o.status === "delivered" && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => reviewReminderMutation.mutate(o._id)}
                      disabled={reviewReminderMutation.isLoading}
                    >
                      Nhắc đánh giá
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Stack alignItems="center" mt={2}>
        <Pagination
          count={Math.ceil(ordersData?.total / ordersData?.limit) || 1}
          page={page}
          onChange={(e, p) => setPage(p)}
        />
      </Stack>
      <Dialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, content: null })}
      >
        {dialog.content}
      </Dialog>
    </Box>
  );
}
