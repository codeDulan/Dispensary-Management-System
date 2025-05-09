import React, { useState, useEffect } from "react";
import { ColorModeContext, useMode } from "../theme.js";
import { ThemeProvider, CssBaseline, Box, Grid, Paper, Typography, useTheme, CircularProgress, Alert, IconButton } from "@mui/material";
import Topbar from "../components/Dashboard/Doctor/Topbar/Topbar.jsx";
import DoctorSidebar from "../components/Dashboard/Doctor/Sidebar/DoctorSidebar.jsx";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';

// Import professional icons
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EventNoteIcon from '@mui/icons-material/EventNote';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';

// Import custom hooks for data fetching
import { useDashboardData, useInventoryStatus, useUpcomingAppointments } from "../hooks/useDashboardData";
import UserService from "../services/UserService"; // Import your existing UserService

// Dashboard widget components
const RevenueChart = ({ data = [] }) => {
  const theme = useTheme();
  
  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" mb={2}>Monthly Revenue</Typography>
      {data.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="250px">
          <Typography color="textSecondary">No revenue data available</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue" 
              stroke={theme.palette.primary.main} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

const PaymentDistribution = ({ data = [] }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.success.main,
    theme.palette.warning.main
  ];
  
  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" mb={2}>Payment Distribution</Typography>
      {data.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="250px">
          <Typography color="textSecondary">No payment data available</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80} 
              fill="#8884d8" 
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `Rs. ${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

const InventoryStats = ({ data = [] }) => {
  const theme = useTheme();
  
  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" mb={2}>Inventory Status</Typography>
      {data.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="250px">
          <Typography color="textSecondary">No inventory data available</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" name="Quantity" fill={theme.palette.info.main} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

const PatientTrends = ({ data = [] }) => {
  const theme = useTheme();
  
  return (
    <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" mb={2}>Patient Trends</Typography>
      {data.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="250px">
          <Typography color="textSecondary">No patient data available</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="new" name="New Patients" fill={theme.palette.primary.main} />
            <Bar dataKey="returning" name="Returning Patients" fill={theme.palette.secondary.main} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

// Stats Card Component - Updated with professional icons
const StatsCard = ({ title, value, subtitle, icon, loading = false }) => {
  const theme = useTheme(); 
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column',
        height: "100%"
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h6" color="textSecondary">{title}</Typography>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <Typography variant="h4" fontWeight="bold">{value}</Typography>
              <Typography variant="body2" color="textSecondary">{subtitle}</Typography>
            </>
          )}
        </Box>
        <Box 
          sx={{ 
            color: theme.palette.mode === 'dark' ? 'white' : 'black',
            fontSize: 40 
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

// Loading Component
const LoadingIndicator = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  );
};

const Dashboard = () => {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Force refresh function
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      // Check if user is authenticated and is a doctor using your UserService
      const authenticated = UserService.isAuthenticated();
      const doctorRole = UserService.isDoctor();
      
      setIsAuthorized(authenticated && doctorRole);
      setAuthChecked(true);
    };
    
    checkAuth();
  }, [refreshKey]);
  
  // Fetch dashboard data
  const { loading, error, dashboardData } = useDashboardData(refreshKey);
  const { 
    revenueData, 
    paymentDistribution, 
    inventoryStats, 
    patientTrends, 
    stats 
  } = dashboardData;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <Box display="flex" height="100vh">
          
          {/* Sidebar with controlled width */}
          <DoctorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            
            {/* Topbar at the top of the content area */}
            <Topbar style={{ zIndex: 1000 }} />

            {/* Dashboard Content */}
            <Box flex="1" p={3} bgcolor="background.default" overflow="auto">
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                
                <IconButton 
                  color="primary" 
                  onClick={handleRefresh} 
                  disabled={loading}
                  title="Refresh dashboard data"
                >
                  <RefreshIcon />
                </IconButton>
              </Box>
              
              {!authChecked ? (
                <LoadingIndicator />
              ) : !isAuthorized ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                  <Alert severity="error" sx={{ width: "100%", maxWidth: "600px" }}>
                    <Typography variant="h6">Authentication Required</Typography>
                    <Typography>
                      You need to be logged in as a doctor to view this dashboard.
                    </Typography>
                  </Alert>
                </Box>
              ) : loading ? (
                <LoadingIndicator />
              ) : (
                <>
                  {/* Stats Overview - With professional icons */}
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatsCard 
                        title="Total Patients" 
                        value={stats.totalPatients.toLocaleString()} 
                        subtitle="Registered patients" 
                        icon={<PeopleOutlineIcon sx={{ fontSize: 40 }} />} 
                        loading={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatsCard 
                        title="Appointments" 
                        value={stats.appointmentsThisWeek.toLocaleString()} 
                        subtitle="This week" 
                        icon={<EventNoteIcon sx={{ fontSize: 40 }} />} 
                        loading={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatsCard 
                        title="Revenue" 
                        value={`Rs. ${stats.monthlyRevenue.toLocaleString()}`} 
                        subtitle="This month" 
                        icon={<MonetizationOnOutlinedIcon sx={{ fontSize: 40 }} />} 
                        loading={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatsCard 
                        title="Inventory Items" 
                        value={stats.inventoryItems.toLocaleString()} 
                        subtitle={`${stats.lowStockItems} low stock`} 
                        icon={<InventoryIcon sx={{ fontSize: 40 }} />} 
                        loading={loading}
                      />
                    </Grid>
                  </Grid>
                  
                  {/* Charts Row 1 */}
                  <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={8}>
                      <RevenueChart data={revenueData} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PaymentDistribution data={paymentDistribution} />
                    </Grid>
                  </Grid>
                  
                  {/* Charts Row 2 */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <InventoryStats data={inventoryStats} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <PatientTrends data={patientTrends} />
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          </Box>
        </Box>
        
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Dashboard;