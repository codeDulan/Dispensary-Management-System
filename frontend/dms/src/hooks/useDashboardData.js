

import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

// Helper to get ISO date strings for API requests
const formatDateForApi = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Hook for fetching all dashboard data
export const useDashboardData = (refreshKey = 0) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    revenueData: [],
    patientAgeDistribution: [], // Changed from paymentDistribution to patientAgeDistribution
    stats: {
      totalPatients: 0,
      appointmentsThisWeek: 0,
      appointmentsToday: 0,
      todayRevenue: 0,
      inventoryItems: 0,
      lowStockItems: 0
    }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Define date ranges
        const today = new Date();
        const sixMonthsAgo = subMonths(today, 6);
        const startDate = formatDateForApi(startOfMonth(sixMonthsAgo));
        const endDate = formatDateForApi(endOfMonth(today));
        const todayDate = formatDateForApi(today);
        
        // Initial data objects
        let payments = [];
        let inventory = [];
        let patients = [];
        let appointments = [];
        let todayAppointments = [];
        let lowStockItems = [];
        let patientAgeData = []; // New array for patient age distribution
        let successfulApiCalls = false;
        
        // Try to fetch payments
        try {
          payments = await dashboardService.getPayments();
          successfulApiCalls = true;
          console.log("Payments data:", payments);
        } catch (error) {
          console.log("Failed to fetch payments:", error.response?.status, error.response?.data || error.message);
          payments = [];
        }
        
        // Try to fetch inventory
        try {
          inventory = await dashboardService.getAllInventory();
          successfulApiCalls = true;
          console.log("Inventory data:", inventory);
        } catch (error) {
          console.log("Failed to fetch inventory:", error.response?.status, error.response?.data || error.message);
          inventory = [];
        }
        
        // Try to fetch patients
        try {
          patients = await dashboardService.getAllPatients();
          successfulApiCalls = true;
          console.log("Patients data:", patients);
        } catch (error) {
          console.log("Failed to fetch patients:", error.response?.status, error.response?.data || error.message);
          patients = [];
        }
        
        // Try to fetch patient age distribution
        try {
          patientAgeData = await dashboardService.getPatientAgeDistribution();
          successfulApiCalls = true;
          console.log("Patient age distribution:", patientAgeData);
        } catch (error) {
          console.log("Failed to fetch patient age distribution:", error.response?.status, error.response?.data || error.message);
          patientAgeData = [];
        }
        
        // Try to fetch appointments
        try {
          appointments = await dashboardService.getAllAppointments();
          successfulApiCalls = true;
          console.log("All appointments:", appointments);
        } catch (error) {
          console.log("Failed to fetch appointments:", error.response?.status, error.response?.data || error.message);
          appointments = [];
        }
        
        // Try to fetch today's appointments specifically
        try {
          todayAppointments = await dashboardService.getAppointmentsByDate(todayDate);
          successfulApiCalls = true;
          console.log("Today's appointments:", todayAppointments);
        } catch (error) {
          console.log("Failed to fetch today's appointments:", error.response?.status, error.response?.data || error.message);
          todayAppointments = [];
        }
        
        // Try to fetch low stock items
        try {
          lowStockItems = await dashboardService.getLowStockItems();
          successfulApiCalls = true;
          console.log("Low stock items:", lowStockItems);
        } catch (error) {
          console.log("Failed to fetch low stock items:", error.response?.status, error.response?.data || error.message);
          lowStockItems = [];
        }
        
        // If no API call succeeded, throw an error
        if (!successfulApiCalls) {
          throw new Error("All API calls failed. Check authentication and API availability.");
        }
        
        // Process revenue data by month
        const revenueByMonth = processRevenueData(payments);
        
        // Calculate summary statistics
        const stats = calculateStats(patients, appointments, payments, inventory, lowStockItems, todayAppointments);
        
        setDashboardData({
          revenueData: revenueByMonth,
          patientAgeDistribution: patientAgeData, // Set the patient age distribution
          stats
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to fetch dashboard data");
        
        // Return empty data instead of fallback data
        setDashboardData({
          revenueData: [],
          patientAgeDistribution: [], // Empty array for patient age distribution
          stats: {
            totalPatients: 0,
            appointmentsThisWeek: la0,
            appointmentsToday: 0,
            todayRevenue: 0,
            inventoryItems: 0,
            lowStockItems: 0
          }
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [refreshKey]);
  
  return { loading, error, dashboardData };
};

// Process payments data to get monthly revenue
const processRevenueData = (payments) => {
  // Group payments by month and sum amounts
  const monthlyRevenue = {};
  
  payments.forEach(payment => {
    const date = new Date(payment.paymentDate);
    const monthYear = format(date, 'MMM yyyy');
    const month = format(date, 'MMM');
    
    if (!monthlyRevenue[month]) {
      monthlyRevenue[month] = 0;
    }
    
    monthlyRevenue[month] += payment.totalAmount || 0;
  });
  
  // Convert to array format for charts
  return Object.keys(monthlyRevenue).map(month => ({
    month,
    revenue: monthlyRevenue[month]
  }));
};

// Calculate summary statistics
const calculateStats = (patients, appointments, payments, inventory, lowStockItems, todayAppointments) => {
  // Total patients
  const totalPatients = patients.length;
  
  // Appointments this week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const appointmentsThisWeek = appointments.filter(appointment => {
    if (!appointment.date) return false;
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= startOfWeek && appointmentDate <= today;
  }).length;
  
  // Today's appointments count
  const appointmentsToday = todayAppointments.length;
  
  // Today's revenue instead of monthly revenue
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  
  const todayRevenue = payments
    .filter(payment => {
      if (!payment.paymentDate) return false;
      const paymentDate = new Date(payment.paymentDate);
      return paymentDate >= todayStart && paymentDate <= todayEnd;
    })
    .reduce((sum, payment) => sum + (payment.totalAmount || 0), 0);
  
  // Inventory stats
  const inventoryItems = inventory.length;
  const lowStockCount = lowStockItems.length;
  
  return {
    totalPatients,
    appointmentsThisWeek,
    appointmentsToday,
    todayRevenue,
    inventoryItems,
    lowStockItems: lowStockCount
  };
};

// Hook for fetching recent inventory status
export const useInventoryStatus = (refreshKey = 0) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventoryStatus, setInventoryStatus] = useState({
    lowStock: [],
    expiring: []
  });

  useEffect(() => {
    const fetchInventoryStatus = async () => {
      try {
        setLoading(true);
        
        let lowStock = [];
        
        try {
          lowStock = await dashboardService.getLowStockItems();
        } catch (error) {
          console.log("Failed to fetch low stock items:", error.message);
          lowStock = [];
        }
        
        setInventoryStatus({
          lowStock,
          expiring: [] // Empty array instead of dummy data
        });
      } catch (err) {
        console.error("Error fetching inventory status:", err);
        setError(err.message || "Failed to fetch inventory status");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventoryStatus();
  }, [refreshKey]); // Add refreshKey dependency
  
  return { loading, error, inventoryStatus };
};

// Hook for fetching upcoming appointments
export const useUpcomingAppointments = (refreshKey = 0) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        let appointmentsData = [];
        
        try {
          appointmentsData = await dashboardService.getAllAppointments();
        } catch (error) {
          console.log("Failed to fetch appointments:", error.message);
          appointmentsData = []; // Empty array instead of dummy data
        }
        
        setAppointments(appointmentsData);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError(err.message || "Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [refreshKey]); // Add refreshKey dependency
  
  return { loading, error, appointments };
};