
import React, { useState, useEffect } from "react";
import { ColorModeContext, useMode } from "../theme.js";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Grid,
  Paper,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import Topbar from "../components/Dashboard/Doctor/Topbar/Topbar.jsx";
import DoctorSidebar from "../components/Dashboard/Doctor/Sidebar/DoctorSidebar.jsx";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";

// Import professional icons
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import EventNoteIcon from "@mui/icons-material/EventNote";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import InventoryIcon from "@mui/icons-material/Inventory";

// Import custom hooks for data fetching
import {
  useDashboardData,
  useInventoryStatus,
  useUpcomingAppointments,
} from "../hooks/useDashboardData";
import UserService from "../services/UserService";

// Dashboard widget components
const RevenueChart = ({ data = [] }) => {
  const theme = useTheme();
  const colors =
    theme.palette.mode === "dark"
      ? { bgColor: "#1F2A40", textColor: "#e0e0e0", gridColor: "#3d3d3d" }
      : { bgColor: "#ffffff", textColor: "#141414", gridColor: "#c2c2c2" };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: "100%",
        backgroundColor: colors.bgColor,
        color: colors.textColor,
      }}
    >
      <Typography variant="h6" mb={2} color={colors.textColor}>
        Monthly Revenue
      </Typography>
      {data.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="250px"
        >
          <Typography color={colors.textColor}>
            No revenue data available
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.gridColor} />
            <XAxis dataKey="month" stroke={colors.textColor} />
            <YAxis stroke={colors.textColor} />
            <Tooltip
              formatter={(value) => `Rs. ${value.toLocaleString()}`}
              contentStyle={{
                backgroundColor: colors.bgColor,
                color: colors.textColor,
                border: `1px solid ${colors.gridColor}`,
              }}
              labelStyle={{ color: colors.textColor }}
            />
            <Legend wrapperStyle={{ color: colors.textColor }} />
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

// PatientAgeDistribution with only percentage labels

const PatientAgeDistribution = ({ data = [] }) => {
  const theme = useTheme();
  const colors = theme.palette.mode === 'dark' 
    ? { bgColor: '#1F2A40', textColor: '#e0e0e0', gridColor: '#3d3d3d' }
    : { bgColor: '#ffffff', textColor: '#141414', gridColor: '#c2c2c2' };
  
  
  const CHART_COLORS = [
    '#4cceac', // greenAccent
    '#6870fa', // blueAccent 
    '#db4f4a', // redAccent
    '#ffa726', // orange
    '#a1a4ab'  // grey
  ];
  
  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        height: "100%", 
        backgroundColor: colors.bgColor,
        color: colors.textColor
      }}
    >
      <Typography variant="h6" mb={2} color={colors.textColor}>Patient Age Distribution</Typography>
      {data.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="250px">
          <Typography color={colors.textColor}>No patient age data available</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              data={data} 
              cx="50%" 
              cy="50%" 
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`} 
              outerRadius={80} 
              fill="#8884d8" 
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value} patients`}
              contentStyle={{ backgroundColor: colors.bgColor, color: colors.textColor, border: `1px solid ${colors.gridColor}` }}
              labelStyle={{ color: colors.textColor }}
            />
            <Legend wrapperStyle={{ color: colors.textColor }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, subtitle, icon, loading = false }) => {
  const theme = useTheme();
  const colors =
    theme.palette.mode === "dark"
      ? { bgColor: "#1F2A40", textColor: "#e0e0e0" }
      : { bgColor: "#ffffff", textColor: "#141414" };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: colors.bgColor,
        color: colors.textColor,
      }}
    >
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box>
          <Typography
            variant="h6"
            color={
              theme.palette.mode === "dark"
                ? theme.palette.grey[300]
                : theme.palette.grey[700]
            }
          >
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <>
              <Typography
                variant="h4"
                fontWeight="bold"
                color={colors.textColor}
              >
                {value}
              </Typography>
              <Typography
                variant="body2"
                color={
                  theme.palette.mode === "dark"
                    ? theme.palette.grey[400]
                    : theme.palette.grey[600]
                }
              >
                {subtitle}
              </Typography>
            </>
          )}
        </Box>
        <Box
          sx={{
            color:
              theme.palette.mode === "dark"
                ? theme.palette.primary.light
                : theme.palette.primary.dark,
            fontSize: 40,
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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100%"
    >
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

  // Format today's date for display
  const today = new Date();
  const formattedDate = today.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      
      const authenticated = UserService.isAuthenticated();
      const doctorRole = UserService.isDoctor();

      setIsAuthorized(authenticated && doctorRole);
      setAuthChecked(true);
    };

    checkAuth();
  }, [refreshKey]);

  // Fetch dashboard data
  const { loading, error, dashboardData } = useDashboardData(refreshKey);
  const { revenueData, patientAgeDistribution, stats } = dashboardData;

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box display="flex" height="100vh">
          {/* Sidebar with controlled width */}
          <DoctorSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            {/* Topbar at the top of the content area */}
            <Topbar style={{ zIndex: 1000 }} />

            {/* Dashboard Content */}
            <Box flex="1" p={3} bgcolor="background.default" overflow="auto">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
              >
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
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="200px"
                >
                  <Alert
                    severity="error"
                    sx={{ width: "100%", maxWidth: "600px" }}
                  >
                    <Typography variant="h6">
                      Authentication Required
                    </Typography>
                    <Typography>
                      You need to be logged in as a doctor to view this
                      dashboard.
                    </Typography>
                  </Alert>
                </Box>
              ) : loading ? (
                <LoadingIndicator />
              ) : (
                <>
                  {/* Stats Overview */}
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
                        title="Today's Appointments"
                        value={stats.appointmentsToday.toLocaleString()}
                        subtitle={formattedDate}
                        icon={<EventNoteIcon sx={{ fontSize: 40 }} />}
                        loading={loading}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <StatsCard
                        title="Today's Revenue"
                        value={`Rs. ${stats.todayRevenue.toLocaleString()}`}
                        subtitle={formattedDate}
                        icon={
                          <MonetizationOnOutlinedIcon sx={{ fontSize: 40 }} />
                        }
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

                  {/* Charts Row - Revenue and Patient Age Distribution */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <RevenueChart data={revenueData} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <PatientAgeDistribution data={patientAgeDistribution} />
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
