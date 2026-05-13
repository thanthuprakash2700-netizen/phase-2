import api from './api';

const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getTaskDistribution: () => api.get('/dashboard/task-distribution'),
  getPerformance: () => api.get('/dashboard/performance'),
};

export default dashboardService;
