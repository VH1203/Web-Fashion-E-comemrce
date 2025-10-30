import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmCtx = createContext(null);
export const useConfirm = () => useContext(ConfirmCtx);

export default function ConfirmProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({ title: "Xác nhận", content: "Bạn chắc chắn?" });
  const resolverRef = useRef(null);

  const confirm = useCallback((opts = {}) => {
    setState({
      title: opts.title || "Xác nhận",
      content: opts.content || "Bạn chắc chắn muốn thực hiện hành động này?",
      okText: opts.okText || "Đồng ý",
      cancelText: opts.cancelText || "Huỷ",
      okColor: opts.okColor || "error",
    });
    setOpen(true);
    return new Promise((resolve) => { resolverRef.current = resolve; });
  }, []);

  const handleClose = (result) => {
    setOpen(false);
    resolverRef.current?.(result);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      <Dialog open={open} onClose={() => handleClose(false)}>
        <DialogTitle>{state.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">{state.content}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)}>{state.cancelText}</Button>
          <Button variant="contained" color={state.okColor} onClick={() => handleClose(true)}>
            {state.okText}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmCtx.Provider>
  );
}
