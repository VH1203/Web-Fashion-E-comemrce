import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export default function ToastProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState({ message: "", severity: "info", duration: 3000 });

  const show = useCallback((message, severity = "info", duration = 3000) => {
    setOpts({ message, severity, duration });
    setOpen(true);
  }, []);

  const toast = {
    show,
    success: (m, d) => show(m, "success", d),
    info: (m, d) => show(m, "info", d),
    warning: (m, d) => show(m, "warning", d),
    error: (m, d) => show(m, "error", d),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={opts.duration}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setOpen(false)} severity={opts.severity} variant="filled" sx={{ width: "100%" }}>
          {opts.message}
        </Alert>
      </Snackbar>
    </ToastCtx.Provider>
  );
}
