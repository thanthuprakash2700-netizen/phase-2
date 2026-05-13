import api from './api';

const approvalService = {
  getApprovals: () => api.get('/approvals/'),
  createApproval: (data) => api.post('/approvals/', data),
  takeAction: (id, action, comment) => api.patch(`/approvals/${id}/action`, { action, comment }),
  getHistory: (id) => api.get(`/approvals/${id}/history`),
};

export default approvalService;
