import api from './api';

const taskService = {
  getTasks: () => api.get('/tasks/'),
  getKanban: () => api.get('/tasks/kanban'),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (data) => api.post('/tasks/', data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  assignTask: (id, assigned_to_id) => api.patch(`/tasks/${id}/assign`, { assigned_to_id }),
  addComment: (id, content, is_internal = false) => api.post(`/tasks/${id}/comments`, { content, is_internal }),
  getComments: (id) => api.get(`/tasks/${id}/comments`),
};

export default taskService;
