import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, Typography, Button, Paper, Chip, Radio, DialogContentText
} from "@mui/material";
import { alpha } from "@mui/material/styles";

import PersonOutline from "@mui/icons-material/PersonOutline";
import FmdGood from "@mui/icons-material/FmdGood";
import Star from "@mui/icons-material/Star";
import StarBorder from "@mui/icons-material/StarBorder";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import DeleteOutline from "@mui/icons-material/DeleteOutline";

import { useToast } from "./common/ToastProvider";
import { addressService } from "../services/addressService";

/* helper khớp Checkout */
const prettyJoin = (parts = []) => {
  const cleaned = parts
    .map((x) => String(x || "").trim())
    .filter((x) => x && x !== "-" && x !== "—");
  const s = cleaned.join(", ");
  return s
    .replace(/\s*-\s*/g, "")
    .replace(/,\s*,/g, ", ")
    .replace(/^\s*,\s*|\s*,\s*$/g, "")
    .trim();
};

export default function AddressDialogPicker({
  open,
  onClose,
  addresses = [],
  selectedId,
  onSelect,       // (id) => void
  onAddNew,       // () => void
  onEdit,         // (address) => void
  onSetDefault,   // async (id) => void
  onRefresh,      // async () => void
}) {
  const toast = useToast();
  const [localSel, setLocalSel] = useState(selectedId || "");
  const [confirmId, setConfirmId] = useState("");

  useEffect(() => {
    if (!open) return;
    setLocalSel(selectedId || "");
  }, [open, selectedId]);

  const choose = () => {
    if (!localSel) return;
    onSelect?.(localSel);
    onClose?.();
  };

  const doDelete = async () => {
    if (!confirmId) return;
    try {
      await (addressService.remove ? addressService.remove(confirmId) : addressService.delete(confirmId));
      toast.success("Đã xoá địa chỉ");
      setConfirmId("");
      await onRefresh?.();
      if (localSel === confirmId) {
        const first = (addresses || []).find((x) => x._id !== confirmId);
        setLocalSel(first ? first._id : "");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Xoá địa chỉ thất bại");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>Chọn địa chỉ nhận hàng</DialogTitle>

        <DialogContent
          dividers
          sx={(theme)=>({
            background: "linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)",
            borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
          })}
        >
          <Stack spacing={1.25}>
            {(!addresses || addresses.length === 0) && (
              <Typography variant="body2" color="text.secondary">
                Bạn chưa có địa chỉ. Nhấn <b>Thêm địa chỉ</b> để tạo mới.
              </Typography>
            )}

            {addresses.map((a) => {
              const selected = localSel === a._id;
              return (
                <Paper
                  key={a._id}
                  variant="outlined"
                  onClick={() => setLocalSel(a._id)}
                  sx={(theme)=>({
                    p: 1.25,
                    borderRadius: 2,
                    cursor: "pointer",
                    borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
                    bgcolor: selected ? alpha(theme.palette.primary.main, 0.06) : theme.palette.background.paper,
                    transition: "transform .12s ease, box-shadow .12s ease",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.10)}`
                    }
                  })}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Radio
                          checked={selected}
                          onChange={() => setLocalSel(a._id)}
                          color="primary"
                          size="small"
                        />
                        <Typography component="div" sx={{ display: "flex", alignItems: "center", gap: .75 }}>
                          <PersonOutline fontSize="small" />
                          <b>{a.name}</b>
                          <Chip size="small" variant="outlined" label={a.phone} />
                          {a.is_default && (
                            <Chip size="small" color="warning" icon={<Star sx={{ fontSize: 16 }} />} label="Mặc định" sx={{ ml: .5 }} />
                          )}
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" gap={1}>
                        <Button size="small" startIcon={<Edit />} onClick={(e) => { e.stopPropagation(); onEdit?.(a); }}>
                          Sửa
                        </Button>
                        {!a.is_default && (
                          <Button
                            size="small"
                            startIcon={<StarBorder />}
                            onClick={async (e) => { e.stopPropagation(); await onSetDefault?.(a._id); }}
                          >
                            Đặt mặc định
                          </Button>
                        )}
                        <Button
                          color="error"
                          size="small"
                          startIcon={<DeleteOutline />}
                          onClick={(e) => { e.stopPropagation(); setConfirmId(a._id); }}
                        >
                          Xoá
                        </Button>
                      </Stack>
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: .75, pl: 4 }}
                    >
                      <FmdGood fontSize="small" sx={{ animation: "float 3s ease-in-out infinite" }} />
                      {prettyJoin([a.street, a.ward, a.district, a.city])}
                    </Typography>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button startIcon={<Add />} onClick={() => onAddNew?.()}>
            Thêm địa chỉ
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose}>Đóng</Button>
            <Button variant="contained" disabled={!localSel} onClick={choose}>
              Dùng địa chỉ này
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={!!confirmId} onClose={() => setConfirmId("")}>
        <DialogTitle>Xoá địa chỉ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xoá địa chỉ này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmId("")}>Huỷ</Button>
          <Button color="error" variant="contained" onClick={doDelete}>
            Xoá
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
