import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  ThemeProvider,
  CssBaseline,
  TextField,
  Button,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, getYear, startOfYear, endOfYear } from 'date-fns';

import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import { ColorModeContext, useMode, tokens } from "../../../../theme";
import DoctorSidebar from "../Sidebar/DoctorSidebar";
import Topbar from "../Topbar/Topbar";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Reports = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Data states
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    averagePayment: 0,
    totalPayments: 0,
    pendingPayments: 0,
  });
  
  // Filter states
  const [startDate, setStartDate] = useState(subMonths(new Date(), 12));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [filterApplied, setFilterApplied] = useState(false);
  const [timeframe, setTimeframe] = useState("yearly"); // yearly, monthly, custom
  
  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  // API base URL
  const API_BASE_URL = "http://localhost:8080/api";

  // Fetch data on component mount
  useEffect(() => {
    fetchRevenueData();
  }, []);

  // Fetch revenue data
  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Set date range based on selected timeframe
      let apiStartDate, apiEndDate;
      
      if (timeframe === "yearly") {
        apiStartDate = startOfYear(new Date(selectedYear, 0, 1));
        apiEndDate = endOfYear(new Date(selectedYear, 0, 1));
      } else if (timeframe === "monthly") {
        // Last 6 months
        apiStartDate = subMonths(startOfMonth(new Date()), 6);
        apiEndDate = endOfMonth(new Date());
      } else {
        // Custom date range
        apiStartDate = startDate;
        apiEndDate = endDate;
      }
      
      // Format dates for API
      const formattedStartDate = format(apiStartDate, 'yyyy-MM-dd');
      const formattedEndDate = format(apiEndDate, 'yyyy-MM-dd');
      
      // Fetch payments by date range
      const response = await axios.get(
        `${API_BASE_URL}/payments/by-date-range?startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Process the data for charts
      processPaymentData(response.data, apiStartDate, apiEndDate);
      setFilterApplied(true);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      showNotification("Failed to load revenue data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Process payment data for charts
  const processPaymentData = (payments, startDate, endDate) => {
    // Skip processing if no payments
    if (!payments || payments.length === 0) {
      setRevenueData([]);
      setSummaryStats({
        totalRevenue: 0,
        averagePayment: 0,
        totalPayments: 0,
        pendingPayments: 0,
      });
      return;
    }

    // Calculate total revenue, average payment, etc.
    const totalRevenue = payments.reduce(
      (sum, payment) => sum + (payment.totalAmount || 0),
      0
    );
    
    const averagePayment = totalRevenue / payments.length;
    
    const pendingPayments = payments.filter(
      (payment) => payment.status === "PENDING"
    ).length;

    // Set summary statistics
    setSummaryStats({
      totalRevenue,
      averagePayment,
      totalPayments: payments.length,
      pendingPayments,
    });

    // Generate monthly revenue data
    const monthlyData = generateMonthlyData(payments, startDate, endDate);
    setRevenueData(monthlyData);
  };

  // Generate monthly data for charts
  const generateMonthlyData = (payments, startDate, endDate) => {
    // Create an array of all months in the date range
    const monthsInRange = eachMonthOfInterval({ start: startDate, end: endDate });
    
    // Initialize data for each month
    const monthlyData = monthsInRange.map(date => {
      const monthStr = format(date, 'MMM yyyy');
      return {
        name: monthStr,
        revenue: 0,
        doctorFees: 0,
        medicinesCost: 0,
        count: 0
      };
    });
    
    // Populate with actual payment data
    payments.forEach(payment => {
      const paymentDate = new Date(payment.paymentDate);
      const monthStr = format(paymentDate, 'MMM yyyy');
      
      // Find the corresponding month in our data array
      const monthData = monthlyData.find(item => item.name === monthStr);
      if (monthData) {
        monthData.revenue += payment.totalAmount || 0;
        monthData.doctorFees += payment.doctorFee || 0;
        monthData.medicinesCost += payment.medicinesCost || 0;
        monthData.count += 1;
      }
    });
    
    return monthlyData;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount == null) return "Rs. 0.00";
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  // Apply filters
  const applyFilters = () => {
    fetchRevenueData();
  };

  // Reset filters
  const resetFilters = () => {
    setTimeframe("yearly");
    setSelectedYear(getYear(new Date()));
    setStartDate(subMonths(new Date(), 12));
    setEndDate(new Date());
    setFilterApplied(false);
    fetchRevenueData();
  };

  // Helper function to show notifications
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Generate a PDF report
  // Replace your existing generatePdfReport function with this implementation:
const generatePdfReport = () => {
  try {
    showNotification("Generating report...", "info");

    // Determine the report period text
    let reportPeriod = "";
    if (timeframe === "yearly") {
      reportPeriod = `Year: ${selectedYear}`;
    } else if (timeframe === "monthly") {
      reportPeriod = "Last 6 Months";
    } else {
      reportPeriod = `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
    }

    // Create a new window for the report
    const printWindow = window.open('', '_blank');
    
    // Get theme colors for the report
    const currentMode = theme.palette.mode;
    const currentColors = tokens(currentMode);
    
    // Write the HTML content
    printWindow.document.write(`
      <html>
        <head>
          <title>Revenue Report - ${format(new Date(), 'yyyy-MM-dd')}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              background-color: #fcfcfc;
            }
            .report-container {
              max-width: 1000px;
              margin: 0 auto;
              background-color: white;
              padding: 30px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #6870fa;
              margin-bottom: 30px;
            }
            .clinic-name {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
              color: #141b2d;
            }
            .report-title {
              font-size: 20px;
              margin-bottom: 10px;
              color: #4cceac;
            }
            .report-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .report-period {
              font-weight: bold;
            }
            .summary-cards {
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              flex: 1;
              min-width: 200px;
              padding: 20px;
              border-radius: 8px;
              background-color: #f5f5f5;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            }
            .card-title {
              font-size: 14px;
              color: #666;
              margin-bottom: 10px;
            }
            .card-value {
              font-size: 22px;
              font-weight: bold;
              color: #141b2d;
            }
            .card-subtitle {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .revenue-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .revenue-table th, .revenue-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .revenue-table th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .revenue-table tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .chart-container {
              margin-top: 30px;
              margin-bottom: 30px;
              height: 400px;
              background-color: #f5f5f5;
              border-radius: 8px;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .chart-placeholder {
              width: 100%;
              height: 300px;
              background-color: #eee;
              display: flex;
              align-items: center;
              justify-content: center;
              font-style: italic;
              color: #666;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .status-item {
              display: flex;
              align-items: center;
            }
            .status-dot {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-right: 8px;
            }
            .blue-dot {
              background-color: #6870fa;
            }
            .green-dot {
              background-color: #4cceac;
            }
            .chart-legend {
              display: flex;
              gap: 20px;
              justify-content: center;
              margin-top: 10px;
            }
            .chart-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #141b2d;
            }
            @media print {
              body {
                background-color: white;
              }
              .report-container {
                box-shadow: none;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <div class="header">
              <div class="clinic-name">Sahanaya Medical Center</div>
              <div class="report-title">Revenue Report</div>
            </div>
            
            <div class="report-meta">
              <div>
                <div class="report-period">${reportPeriod}</div>
                <div>Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}</div>
              </div>
            </div>
            
            <div class="summary-cards">
              <div class="summary-card">
                <div class="card-title">Total Revenue</div>
                <div class="card-value">${formatCurrency(summaryStats.totalRevenue)}</div>
                <div class="card-subtitle">${filterApplied ? 'For selected period' : 'All time'}</div>
              </div>
              
              <div class="summary-card">
                <div class="card-title">Average Payment</div>
                <div class="card-value">${formatCurrency(summaryStats.averagePayment)}</div>
                <div class="card-subtitle">Per transaction</div>
              </div>
              
              <div class="summary-card">
                <div class="card-title">Total Payments</div>
                <div class="card-value">${summaryStats.totalPayments}</div>
                <div class="card-subtitle">Transactions</div>
              </div>
              
              <div class="summary-card">
                <div class="card-title">Pending Payments</div>
                <div class="card-value">${summaryStats.pendingPayments}</div>
                <div class="card-subtitle">Awaiting completion</div>
              </div>
            </div>
            
            <div class="chart-title">Monthly Revenue Breakdown</div>
            <table class="revenue-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Doctor Fees</th>
                  <th>Medicines Cost</th>
                  <th>Total Revenue</th>
                  <th>Payments Count</th>
                </tr>
              </thead>
              <tbody>
                ${revenueData.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${formatCurrency(item.doctorFees)}</td>
                    <td>${formatCurrency(item.medicinesCost)}</td>
                    <td>${formatCurrency(item.revenue)}</td>
                    <td>${item.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="chart-container">
              <div class="chart-title">Revenue Visualization</div>
              <div class="chart-placeholder">
                Chart visualization would appear here in the app
              </div>
              <div class="chart-legend">
                <div class="status-item">
                  <div class="status-dot blue-dot"></div>
                  <div>Doctor Fees</div>
                </div>
                <div class="status-item">
                  <div class="status-dot green-dot"></div>
                  <div>Medicines Cost</div>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>This report was generated by Sahanaya Medical Clinic Management System</p>
              <p>© ${new Date().getFullYear()} Sahanaya Medical Center. All rights reserved.</p>
            </div>
            
            <div class="no-print" style="margin-top: 30px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background-color: #4cceac; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                Print Report
              </button>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for resources to load then trigger print
    printWindow.addEventListener('load', () => {
      // Auto-print if desired - uncomment this line
      // printWindow.print();
      showNotification("Report generated successfully. Click the print button to print.", "success");
    });
    
  } catch (error) {
    console.error("Error generating report:", error);
    showNotification("Failed to generate report", "error");
  }
};

  // Export data to CSV
  const exportToCSV = () => {
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Month,Revenue,Doctor Fees,Medicines Cost,Payment Count\r\n";
    
    // Add data rows
    revenueData.forEach(item => {
      csvContent += `${item.name},${item.revenue.toFixed(2)},${item.doctorFees.toFixed(2)},${item.medicinesCost.toFixed(2)},${item.count}\r\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `revenue_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    
    showNotification("CSV report downloaded successfully", "success");
  };

  // Generate years for dropdown (last 5 years and current year)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 6; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            backgroundColor: colors.primary[400], 
            color: colors.grey[100],
            p: 1, 
            border: `1px solid ${colors.primary[300]}` 
          }}
        >
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          {payload.map((entry, index) => (
            <Typography 
              key={`tooltip-${index}`} 
              variant="body2" 
              sx={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box display="flex" height="100vh">
          {/* Sidebar */}
          <DoctorSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            {/* Topbar */}
            <Topbar />

            {/* Main Content */}
            <Box p={3}>
              {/* Page Title */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color={colors.grey[100]}
                >
                  Revenue Reports
                </Typography>
                
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={exportToCSV}
                    sx={{ 
                      backgroundColor: colors.greenAccent[600],
                      '&:hover': { backgroundColor: colors.greenAccent[700] }
                    }}
                  >
                    Export CSV
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PictureAsPdfIcon />}
                    onClick={generatePdfReport}
                    sx={{ 
                      backgroundColor: colors.redAccent[600],
                      '&:hover': { backgroundColor: colors.redAccent[700] }
                    }}
                  >
                    Generate PDF
                  </Button>
                </Box>
              </Box>

              {/* Filter Section */}
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  mb: 3,
                  backgroundColor: colors.primary[400],
                  borderRadius: 1
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Timeframe</InputLabel>
                      <Select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        label="Timeframe"
                      >
                        <MenuItem value="yearly">Yearly</MenuItem>
                        <MenuItem value="monthly">Last 6 Months</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  {timeframe === 'yearly' && (
                    <Grid item xs={12} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Year</InputLabel>
                        <Select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          label="Year"
                        >
                          {generateYearOptions().map(year => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  
                  {timeframe === 'custom' && (
                    <>
                      <Grid item xs={12} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                            slotProps={{
                              textField: {
                                size: "small",
                                fullWidth: true
                              }
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </>
                  )}
                  
                  <Grid item xs={12} md={timeframe === 'custom' ? 3 : 7}>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={applyFilters}
                        startIcon={<FilterAltIcon />}
                        sx={{ 
                          backgroundColor: colors.blueAccent[500],
                          '&:hover': { backgroundColor: colors.blueAccent[600] }
                        }}
                      >
                        Apply Filter
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={resetFilters}
                        startIcon={<RefreshIcon />}
                        sx={{
                          borderColor: colors.grey[100],
                          color: colors.grey[100],
                          '&:hover': {
                            borderColor: colors.grey[300],
                            color: colors.grey[300],
                          }
                        }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* Summary Cards */}
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      backgroundColor: colors.primary[400],
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color={colors.grey[300]} gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]}>
                        {formatCurrency(summaryStats.totalRevenue)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={colors.grey[300]}
                        sx={{ mt: 1 }}
                      >
                        {filterApplied ? 'For selected period' : 'All time'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      backgroundColor: colors.primary[400],
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color={colors.grey[300]} gutterBottom>
                        Average Payment
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={colors.blueAccent[500]}>
                        {formatCurrency(summaryStats.averagePayment)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={colors.grey[300]}
                        sx={{ mt: 1 }}
                      >
                        Per transaction
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      backgroundColor: colors.primary[400],
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color={colors.grey[300]} gutterBottom>
                        Total Payments
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
                        {summaryStats.totalPayments}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={colors.grey[300]}
                        sx={{ mt: 1 }}
                      >
                        Transactions
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Card 
                    elevation={3}
                    sx={{ 
                      backgroundColor: colors.primary[400],
                      height: '100%'
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6" color={colors.grey[300]} gutterBottom>
                        Pending Payments
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color={colors.orangeAccent[500]}>
                        {summaryStats.pendingPayments}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={colors.grey[300]}
                        sx={{ mt: 1 }}
                      >
                        Awaiting completion
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Main Revenue Chart */}
              <Paper elevation={3} sx={{ backgroundColor: colors.primary[400], borderRadius: 1, p: 3 }}>
                <Box height="400px">
                  {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      <Typography variant="h6" mb={2}>Monthly Revenue Breakdown</Typography>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={revenueData}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 60,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[800]} />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            height={70} 
                            tick={{ fill: colors.grey[100] }}
                          />
                          <YAxis tick={{ fill: colors.grey[100] }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend wrapperStyle={{ marginTop: 20 }} />
                          <Bar dataKey="doctorFees" name="Doctor Fees" stackId="a" fill={colors.blueAccent[500]} />
                          <Bar dataKey="medicinesCost" name="Medicines Cost" stackId="a" fill={colors.greenAccent[500]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Reports;