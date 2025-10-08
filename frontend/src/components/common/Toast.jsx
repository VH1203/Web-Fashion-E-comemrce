import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

export default function Toast({ type = "info", message, duration = 3000, onClose }) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!open) return null;

  return (
    <Stack
      sx={{
        position: "fixed",
        top: 250,
        right: 20,
        zIndex: 2000,
        width: "auto",
        maxWidth: "400px"
      }}
      spacing={2}
    >
      <Alert severity={type} variant="filled">
        {message}
      </Alert>
    </Stack>
  );
}
