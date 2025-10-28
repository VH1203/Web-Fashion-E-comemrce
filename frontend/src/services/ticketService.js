// src/services/ticketService.js
import api from './apiClient'; // anh đã có

export const TicketAPI = {
  // customer tạo ticket (kèm ảnh)
  create(fd) {
    return api.post('/tickets', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  // danh sách ticket của customer
  my(params) {
    return api.get('/tickets/my', { params }).then(r => r.data);
  },

  // hàng chờ của support
  supportQueue(params) {
    return api.get('/tickets/support/queue', { params }).then(r => r.data);
  },

  // chi tiết
  detail(id) {
    return api.get(`/tickets/${id}`).then(r => r.data);
  },

  // cập nhật trạng thái
  setStatus(id, status) {
    return api.patch(`/tickets/${id}/status`, { status }).then(r => r.data);
  },

  // thêm log (chat/note/…)
  addLog(id, payload) {
    return api.post(`/tickets/${id}/logs`, payload).then(r => r.data);
  },

  // assign ticket cho support (owner/admin)
  assign(id, supportId) {
    return api.post(`/tickets/${id}/assign`, { supportId }).then(r => r.data);
  }
};
