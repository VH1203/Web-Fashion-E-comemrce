import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "../../services/orderService";
import {
  Box, Stack, Typography, Card, CardContent, Chip, Button, Divider, TextField, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import LocalShipping from "@mui/icons-material/LocalShipping";

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đang xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Hoàn thành",
  canceled: "Đã hủy",
  refund_pending: "Chờ hoàn/đổi",
  refund_completed: "Đã hoàn/đổi",
};

export default function OrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ord, setOrd] = useState();
  const [track, setTrack] = useState();
  const [openRefund, setOpenRefund] = useState(false);
  const [reason, setReason] = useState("");

  const load = async () => {
    const d = await orderService.detail(id);
    setOrd(d);
    const t = await orderService.tracking(id).catch(() => null);
    setTrack(t);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (!ord) return <Box sx={{ p:2 }}>Đang tải…</Box>;

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={800}>Đơn #{ord.order_code}</Typography>
        <Chip label={STATUS_LABEL[ord.status] || ord.status} />
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>Sản phẩm</Typography>
          <Stack spacing={1}>
            {(ord.items || []).map((it, idx) => (
              <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1}>
                  <Box sx={{ width: 56, height: 56, borderRadius: 1, overflow: "hidden", bgcolor: "#f5f7fa" }}>
                    {it.image_url && <img src={it.image_url} alt={it.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </Box>
                  <Stack>
                    <Typography fontWeight={600}>{it.name}</Typography>
                    {!!it.variant_text && <Typography variant="caption" color="text.secondary">{it.variant_text}</Typography>}
                    <Typography variant="caption" color="text.secondary">SL: {it.qty}</Typography>
                  </Stack>
                </Stack>
                <Typography fontWeight={700}>{Number(it.total || it.price*it.qty).toLocaleString()} VND</Typography>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Typography color="text.secondary">Tổng:</Typography>
            <Typography fontWeight={800}>{Number(ord.total_price).toLocaleString()} VND</Typography>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography fontWeight={700} mb={1}>Vận chuyển</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocalShipping />
            <Typography>{ord.shipping_provider}</Typography>
          </Stack>
          {track && (
            <Stack spacing={1} mt={1}>
              {(track.steps || []).map((s, idx) => (
                <Stack key={idx} direction="row" spacing={2} alignItems="center">
                  <Chip size="small" label={s.code} />
                  <Typography>{s.text}</Typography>
                  <Typography variant="caption" color="text.secondary">{new Date(s.at).toLocaleString()}</Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1}>
        {(["pending","confirmed","processing"].includes(ord.status)) && (
          <Button variant="outlined" color="error" onClick={async () => {
            if (!confirm("Hủy đơn hàng này?")) return;
            await orderService.cancel(id);
            await load();
          }}>Hủy đơn</Button>
        )}
        {(ord.status === "delivered") && (
          <Button variant="outlined" onClick={() => setOpenRefund(true)}>Yêu cầu hoàn/đổi</Button>
        )}
        <Button variant="contained" onClick={async () => {
          await orderService.reorder(id);
          nav("/cart");
        }}>Mua lại</Button>
      </Stack>

      <Dialog open={openRefund} onClose={() => setOpenRefund(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yêu cầu hoàn/đổi</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={1}>Trong 3 ngày kể từ khi giao thành công.</Typography>
          <TextField fullWidth multiline minRows={3} value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Lý do…" />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setOpenRefund(false)}>Đóng</Button>
          <Button variant="contained" onClick={async ()=>{
            await orderService.refund(id, { reason });
            setOpenRefund(false);
            await load();
          }}>Gửi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}