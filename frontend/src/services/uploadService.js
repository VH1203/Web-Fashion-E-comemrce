import { API_URL } from './apiClient'; // hoặc import { API_URL } từ nơi anh đang dùng
// Lưu ý: nếu apiClient đang export default axios instance => dùng instance đó là tốt nhất.

export const uploadApi = {
  async uploadSingle(file, folder = 'dfs/misc', token) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch(`${API_URL}/uploads/single`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error('Upload thất bại');
    return res.json(); // { url, public_id, ... }
  },

  async uploadMany(files, folder = 'dfs/misc', token) {
    const fd = new FormData();
    [...files].forEach(f => fd.append('files', f));
    fd.append('folder', folder);
    const res = await fetch(`${API_URL}/uploads/many`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error('Upload thất bại');
    return res.json(); // array of { url, public_id }
  },

  async delete(public_id, token) {
    const res = await fetch(`${API_URL}/uploads`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ public_id }),
    });
    if (!res.ok) throw new Error('Xóa ảnh thất bại');
    return res.json();
  },
};
