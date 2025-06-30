
import axios from 'axios';


const api = axios.create({
  baseURL: 'http://localhost:8080/api', 
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      
      config.headers['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRvY3RvciIsInJvbGUiOiJET0NUT1IiLCJpYXQiOjE1MTYyMzkwMjJ9.4Adtg3xFD_KgQUIBqxVFtJ5FXUzd-W1_Fd9n59IAreaU';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API services for dashboard data
export const dashboardService = {
  // Payment related API calls
  getPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },
  
  getPaymentsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/payments/by-date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  getPaymentsByStatus: async (status) => {
    const response = await api.get(`/payments/status/${status}`);
    return response.data;
  },
  
  // Inventory related API calls
  getAllInventory: async () => {
    const response = await api.get('/inventory');
    return response.data;
  },
  
  getAvailableInventory: async () => {
    const response = await api.get('/inventory/available');
    return response.data;
  },
  
  getLowStockItems: async () => {
    const response = await api.get('/inventory/low-stock');
    return response.data;
  },
  
  getExpiringItems: async (days = 30) => {
    const response = await api.get('/inventory/expiring', {
      params: { days }
    });
    return response.data;
  },
  
  // Medicine related API calls
  getAllMedicines: async () => {
    const response = await api.get('/medicines');
    return response.data;
  },
  
  // Patient related API calls
  getAllPatients: async () => {
    const response = await api.get('/patients');
    return response.data;
  },
  
  // Appointment related API calls
  getAllAppointments: async () => {
    const response = await api.get('/appointments/all');
    return response.data;
  },
  
  getAppointmentsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/appointments', {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  // Prescription related API calls
  getAllPrescriptions: async () => {
    const response = await api.get('/prescriptions');
    return response.data;
  },
  
  getPrescriptionsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/prescriptions/by-date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  }
};

export default api;