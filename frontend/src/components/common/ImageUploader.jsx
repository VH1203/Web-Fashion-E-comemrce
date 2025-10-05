import React, { useRef, useState } from 'react';
import { uploadApi } from '../../services/uploadService';
import { useAuth } from '../../hooks/useAuth'; // nếu anh có hook này
// props: folder ('dfs/products','dfs/banners','dfs/users/avatars'), onUploaded(list)

export default function ImageUploader({ folder = 'dfs/misc', multiple = true, onUploaded }) {
  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth?.() || { token: null };

  const onPick = () => inputRef.current?.click();

  const onChange = (e) => {
    const fls = [...e.target.files];
    setFiles(fls);
    setPreviews(fls.map(f => URL.createObjectURL(f)));
  };

  const onUpload = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      const data = multiple
        ? await uploadApi.uploadMany(files, folder, token)
        : [await uploadApi.uploadSingle(files[0], folder, token)];
      onUploaded?.(data); // [{url, public_id}, ...]
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ border: '1px dashed #cbd5e1', padding: 16, borderRadius: 8 }}>
      <input ref={inputRef} type="file" accept="image/*" multiple={multiple} hidden onChange={onChange}/>
      <button type="button" onClick={onPick}>Chọn ảnh</button>
      <button type="button" onClick={onUpload} disabled={!files.length || loading} style={{ marginLeft: 8 }}>
        {loading ? 'Đang upload...' : 'Tải lên'}
      </button>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
        {previews.map((src, i) => (
          <img key={i} src={src} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}/>
        ))}
      </div>
    </div>
  );
}
