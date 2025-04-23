// src/services/dashboardService.js
import UserService from './UserService';

// Dashboard data service that uses your existing UserService
const dashboardService = {
  // PAYMENTS
  async getPayments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      throw error;
    }
  },
  
  // INVENTORY
  async getAllInventory() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      throw error;
    }
  },
  
  async getLowStockItems() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/inventory/low-stock', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
      throw error;
    }
  },
  
  // PATIENTS
  async getAllPatients() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      throw error;
    }
  },
  
  // APPOINTMENTS
  async getAllAppointments() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/appointments/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      throw error;
    }
  },
  
  // PRESCRIPTIONS
  async getAllPrescriptions() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/prescriptions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch prescriptions:', error);
      throw error;
    }
  }
};

export default dashboardService;