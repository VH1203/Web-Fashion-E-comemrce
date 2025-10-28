import { useState } from 'react';

export default function FileUploader({ onChange, name='images', multiple=true }) {
  const [files, setFiles] = useState([]);
  const handle = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);
    onChange?.(list);
  };
  return (
    <div className="mb-2">
      <label className="form-label">Đính kèm</label>
      <input type="file" className="form-control" name={name} multiple={multiple} onChange={handle}/>
      {files.length > 0 && <small className="text-muted">{files.length} file đã chọn</small>}
    </div>
  );
}
