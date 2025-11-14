import React, { useRef, useState } from "react";
import { uploadApi } from "../../services/uploadService";
import { useAuth } from "../../context/AuthContext";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
} from "@mui/material";
import { Close } from "@mui/icons-material";
// props: folder ('dfs/products','dfs/banners','dfs/users/avatars'), onUploaded(list)

export default function ImageUploader({
  folder = "dfs/misc",
  multiple = true,
  onUploaded,
}) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth?.() || { token: null };

  const onPick = () => inputRef.current?.click();

  const onChange = (e) => {
    const fls = [...e.target.files];
    setFiles(fls);
    setPreviews(fls.map((f) => URL.createObjectURL(f)));
  };

  const onUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      const data = multiple
        ? await uploadApi.uploadMany(files, folder, token)
        : [await uploadApi.uploadSingle(files[0], folder, token)];
      onUploaded?.(data); // [{url, public_id}, ...]
      setFiles([]);
      setPreviews([]);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{ p: 2, borderStyle: "dashed", borderColor: "grey.400" }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={onChange}
      />
      <Button variant="outlined" onClick={onPick}>
        Chọn ảnh
      </Button>
      <Button
        variant="contained"
        onClick={onUpload}
        disabled={!files.length || loading}
        sx={{ ml: 1 }}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        Tải lên
      </Button>
      <Box sx={{ display: "flex", gap: 1.5, mt: 1.5, flexWrap: "wrap" }}>
        {previews.map((src, i) => (
          <Box key={i} sx={{ position: "relative" }}>
            <img
              src={src}
              alt=""
              style={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
