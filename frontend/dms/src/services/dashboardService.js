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



  async getPatientAgeDistribution() {
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
      
      // Get all patients
      const patients = await response.json();
      
      // Calculate age distribution
      const ageGroups = {
        'Under 18': 0,
        '18-30': 0,
        '31-45': 0,
        '46-60': 0, 
        'Over 60': 0
      };
      
      // Count patients in each age group
      patients.forEach(patient => {
        const age = patient.age;
        
        if (age === null || age === undefined) {
          // Skip patients with no age data
          return;
        }
        
        if (age < 18) {
          ageGroups['Under 18']++;
        } else if (age <= 30) {
          ageGroups['18-30']++;
        } else if (age <= 45) {
          ageGroups['31-45']++;
        } else if (age <= 60) {
          ageGroups['46-60']++;
        } else {
          ageGroups['Over 60']++;
        }
      });
      
      // Convert to array format suitable for charts
      return Object.keys(ageGroups).map(group => ({
        name: group,
        value: ageGroups[group]
      }));
    } catch (error) {
      console.error('Failed to fetch patient age distribution:', error);
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
  
  // New method to get appointments for a specific date
  async getAppointmentsByDate(date) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/appointments/daily-queue?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch appointments for date:', error);
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