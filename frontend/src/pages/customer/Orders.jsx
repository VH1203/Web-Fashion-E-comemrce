// Orders.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { orderService } from "../../services/orderService";
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
} from "@mui/material";
import LocalShipping from "@mui/icons-material/LocalShipping";
import Replay from "@mui/icons-material/Replay";
import Print from "@mui/icons-material/Print";

const STATUS_TABS = [
  { key: "", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Hoàn thành" },
  { key: "canceled", label: "Đã hủy" },
  { key: "refund_pending", label: "Hoàn/Đổi (chờ)" },
  { key: "refund_completed", label: "Hoàn/Đổi xong" },
];

const STATUS_COLOR = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  shipping: "primary",
  delivered: "success",
  canceled: "default",
  refund_pending: "warning",
  refund_completed: "success",
};

export default function Orders() {
  const nav = useNavigate();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: 10 });
  const [q, setQ] = useState("");

  const load = async (page = 1) => {
    const status = STATUS_TABS[tab].key || undefined;
    const res = await orderService.list({
      status,
      page,
      limit: 10,
      q: q || undefined,
    });
    setData(res);
  };

  useEffect(() => {
    load(1); /* eslint-disable-next-line */
  }, [tab]);

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
          {STATUS_TABS.map((t, i) => (
            <Tab key={t.key + "-" + i} label={t.label} />
          ))}
        </Tabs>
        <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
          <TextField
            size="small"
            placeholder="Tìm mã đơn"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") load(1);
            }}
          />
          <Button variant="outlined" onClick={() => load(1)}>
            Tìm
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={1.25}>
        {data.items.map((o) => (
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
                    label={o.status}
                    color={STATUS_COLOR[o.status] || "default"}
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
                    onClick={async () => {
                      await orderService.reorder(o._id);
                      nav("/cart");
                    }}
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
                          <Typography variant="caption" color="text.secondary">
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
                {["pending", "confirmed", "processing"].includes(o.status) && (
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={async () => {
                      if (!confirm("Hủy đơn hàng này?")) return;
                      await orderService.cancel(o._id);
                      await load(data.page);
                    }}
                  >
                    Hủy đơn
                  </Button>
                )}
                {o.status === "delivered" && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={async () => {
                      await orderService.reviewReminder(o._id);
                      alert("Đã gửi nhắc nhở đánh giá");
                    }}
                  >
                    Nhắc đánh giá
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Stack alignItems="center" mt={2}>
        <Pagination
          count={Math.ceil(data.total / data.limit) || 1}
          page={data.page}
          onChange={(e, p) => load(p)}
        />
      </Stack>
    </Box>
  );
}
