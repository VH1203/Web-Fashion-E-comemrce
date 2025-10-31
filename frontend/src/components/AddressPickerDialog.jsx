import React, { forwardRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Button,
  Paper,
  Chip,
  Radio,
  IconButton,
  Divider,
} from "@mui/material";
import PersonOutline from "@mui/icons-material/PersonOutline";
import FmdGood from "@mui/icons-material/FmdGood";
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Slide from "@mui/material/Slide";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import { useToast } from "./common/Toast";
import { useConfirm } from "./common/Confirm";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
export default function AddressPickerDialog({
  open,
  onClose,
  addresses = [],
  selectedId,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
}) {
  const confirm = useConfirm();
  const toast = useToast();
  const [localSel, setLocalSel] = useState(selectedId || "");
  const [deleting, setDeleting] = useState(null); // id đang xoá (để disable nút)

  useEffect(() => {
    if (!open) return;
    setLocalSel(selectedId || "");
  }, [open, selectedId]);

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = await confirm({
      title: "Xoá địa chỉ",
      content:
        "Bạn có chắc muốn xoá địa chỉ này? Hành động không thể hoàn tác.",
      okText: "Xoá",
      okColor: "error",
    });
    if (!ok) return;
    try {
      setDeleting(id);
      await onDelete?.(id);
      if (id === localSel) setLocalSel("");
      toast.success("Đã xoá địa chỉ.");
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={Transition}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <span>Chọn địa chỉ đã lưu</span>
        <Button
          size="small"
          startIcon={<Add />}
          onClick={() => onAdd?.()}
          variant="outlined"
        >
          Thêm
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={1} className="stagger">
          {addresses.map((a) => {
            const selected = a._id === localSel;
            return (
              <Paper
                key={a._id}
                variant="outlined"
                className="soft-item"
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: selected ? "primary.50" : "background.paper",
                  transition:
                    "box-shadow .25s ease, transform .25s ease, border-color .2s ease",
                  "&:hover": { boxShadow: "var(--shadow-soft)" },
                }}
              >
                <Stack direction="row" alignItems="flex-start" gap={1}>
                  <Radio
                    checked={selected}
                    onChange={() => setLocalSel(a._id)}
                    value={a._id}
                    size="small"
                  />
                  <Stack
                    spacing={0.5}
                    sx={{ flex: 1 }}
                    onClick={() => setLocalSel(a._id)}
                    style={{ cursor: "pointer" }}
                  >
                    <Typography
                      component="div"
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <PersonOutline fontSize="small" /> <b>{a.name}</b>
                      <Chip
                        size="small"
                        variant={selected ? "filled" : "outlined"}
                        label={a.phone}
                      />
                      {a.is_default && (
                        <Chip size="small" color="primary" label="Mặc định" />
                      )}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                    >
                      <FmdGood fontSize="small" />
                      {[a.street, a.ward, a.district, a.city]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit?.(a)}
                      title="Sửa"
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(a._id)}
                      disabled={deleting === a._id}
                      title="Xoá"
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}

          {!addresses.length && (
            <Typography variant="body2" color="text.secondary">
              Bạn chưa có địa chỉ nào. Nhấn “Thêm” để tạo mới.
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
        <Button
          variant="contained"
          onClick={() => {
            if (!localSel) return;
            onSelect?.(localSel);
            onClose?.();
          }}
          disabled={!localSel}
        >
          Chọn
        </Button>
      </DialogActions>
    </Dialog>
  );
}
