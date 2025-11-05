import { Stack, Button, Chip } from "@mui/material";
import CloudUpload from "@mui/icons-material/CloudUpload";

export default function MediaUploader({ images = [], setImages, video, setVideo, svc }) {
  const onPickImages = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const ups = await svc.uploadImages(files);
    setImages([...(images||[]), ...ups.map(u => u.url)]);
  };

  const onPickVideo = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const up = await svc.uploadVideo(f);
    setVideo(up.url);
  };

  return (
    <Stack spacing={1}>
      <Button component="label" variant="outlined" startIcon={<CloudUpload/>}>
        Upload ảnh
        <input hidden accept="image/*" type="file" multiple onChange={onPickImages} />
      </Button>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {(images||[]).map((url, i) => <Chip key={i} label={`Ảnh ${i+1}`} onDelete={() => setImages(images.filter((_,idx)=>idx!==i))} />)}
      </Stack>

      <Button component="label" variant="outlined" startIcon={<CloudUpload/>}>
        Upload video (1)
        <input hidden accept="video/*" type="file" onChange={onPickVideo} />
      </Button>
      {video && <Chip label="Đã có video" onDelete={() => setVideo(null)} />}
    </Stack>
  );
}
