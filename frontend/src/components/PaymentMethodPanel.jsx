import React, { useEffect, useState } from "react";
import {
  Stack, Typography, RadioGroup, FormControlLabel, Radio,
  TextField, InputAdornment, Paper, Chip, Tooltip
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCode2 from "@mui/icons-material/QrCode2";
import Payment from "@mui/icons-material/Payment";
import InfoOutlined from "@mui/icons-material/InfoOutlined";

export default function PaymentMethodPanel({ method, onExtraChange }) {
  // extra payload gửi kèm khi confirm
  // vnpay: { vnpay_mode: 'QR'|'CARD' }
  // momo:  {}
  // card:  { card_number, card_name, exp, cvc }
  const [mode, setMode] = useState("QR"); // cho VNPAY
  const [card, setCard] = useState({ number: "", name: "", exp: "", cvc: "" });

  useEffect(() => {
    if (method === "VNPAY") onExtraChange?.({ vnpay_mode: mode });
    if (method === "CARD") onExtraChange?.({ ...card });
    if (method === "MOMO") onExtraChange?.({});
    if (method === "COD") onExtraChange?.({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, mode, card]);

  if (method === "VNPAY") {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Payment fontSize="small" />
            <Typography fontWeight={700}>VNPay</Typography>
            <Chip size="small" label="Sandbox" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Chọn cách thanh toán trên cổng VNPay.
          </Typography>
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <FormControlLabel value="QR" control={<Radio />} label={<><QrCode2 fontSize="small" />&nbsp;Quét QR</>} />
            <FormControlLabel value="CARD" control={<Radio />} label={<><CreditCardIcon fontSize="small" />&nbsp;Thẻ nội địa/Quốc tế</>} />
          </RadioGroup>
          <Tooltip title="Sau khi ấn Thanh toán, hệ thống chuyển sang cổng VNPay để quét QR hoặc nhập thẻ.">
            <InfoOutlined fontSize="small" color="action" />
          </Tooltip>
        </Stack>
      </Paper>
    );
  }

  if (method === "MOMO") {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            <img alt="MoMo" src="https://static.mservice.io/img/logo-momo.png" style={{ width: 22, height: 22 }} />
            <Typography fontWeight={700}>MoMo</Typography>
            <Chip size="small" label="Sandbox" />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Chuyển đến cổng thanh toán MoMo để xác nhận (App/QR).
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (method === "CARD") {
    return (
      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            <CreditCardIcon fontSize="small" />
            <Typography fontWeight={700}>Thẻ tín dụng/ghi nợ (demo)</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Nhập thông tin thẻ (demo). Ở BE nên chuyển qua cổng VNPay/Stripe được cấu hình sandbox.
          </Typography>
          <TextField
            label="Số thẻ"
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            placeholder="4111 1111 1111 1111"
            InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon fontSize="small" /></InputAdornment> }}
          />
          <Stack direction="row" spacing={1}>
            <TextField label="Tên in trên thẻ" fullWidth value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
            <TextField label="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
            <TextField label="CVC" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
          </Stack>
        </Stack>
      </Paper>
    );
  }

  return null; // COD
}
