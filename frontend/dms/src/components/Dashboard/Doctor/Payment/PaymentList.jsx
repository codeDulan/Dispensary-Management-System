import {
  Box,
  Button,
  Typography,
  ThemeProvider,
  CssBaseline,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../theme";
import DoctorSidebar from "../Sidebar/DoctorSidebar";
import Topbar from "./Topbar";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";

const PaymentList = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State for API data
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [patientId, setPatientId] = useState("");
  const [prescriptionId, setPrescriptionId] = useState("");

  // API base URL
  const API_BASE_URL = "http://localhost:8080/api";

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let url = `${API_BASE_URL}/payments`;

      // Apply filters based on selection
      if (filterType === "status" && statusFilter) {
        url = `${API_BASE_URL}/payments/status/${statusFilter}`;
      } else if (filterType === "date-range" && (startDate || endDate)) {
        url = `${API_BASE_URL}/payments/by-date-range`;
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        url = `${url}?${params.toString()}`;
      } else if (filterType === "patient" && patientId) {
        url = `${API_BASE_URL}/payments/patient/${patientId}`;
      } else if (filterType === "prescription" && prescriptionId) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/payments/prescription/${prescriptionId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setPayments([response.data]);
          setLoading(false);
          return;
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setPayments([]);
            showNotification("No payment found for this prescription", "info");
          } else {
            throw error;
          }
        }
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Payments:", response.data);
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      showNotification("Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    fetchPayments();
  };

  // Reset filters
  const resetFilters = () => {
    setFilterType("all");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPatientId("");
    setPrescriptionId("");
    fetchPayments();
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
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

  // Handle delete payment
  const handleDeletePayment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      showNotification("Payment deleted successfully");
      fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      showNotification("Failed to delete payment", "error");
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return colors.greenAccent[500];
      case "PENDING":
        return colors.orangeAccent[500];
      case "CANCELLED":
        return colors.redAccent[500];
      case "REFUNDED":
        return colors.blueAccent[500];
      default:
        return colors.grey[500];
    }
  };

  // Handle view payment
  const handleViewPayment = (id) => {
    navigate(`/payments/${id}`);
  };

  // Handle edit payment
  const handleEditPayment = (id) => {
    navigate(`/payments/edit/${id}`);
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

            <Box p={3}>
              {/* Page Title */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                
                
              </Box>

              {/* Filters */}
              <Box
                mb={3}
                p={2}
                display="flex"
                flexWrap="wrap"
                gap={2}
                alignItems="center"
                sx={{ backgroundColor: colors.primary[400], borderRadius: 1 }}
              >
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    label="Filter Type"
                  >
                    <MenuItem value="all">All Payments</MenuItem>
                    <MenuItem value="status">By Status</MenuItem>
                    <MenuItem value="date-range">By Date Range</MenuItem>
                    <MenuItem value="patient">By Patient ID</MenuItem>
                    <MenuItem value="prescription">By Prescription ID</MenuItem>
                  </Select>
                </FormControl>

                {filterType === "status" && (
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                      <MenuItem value="REFUNDED">Refunded</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {filterType === "date-range" && (
                  <>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 200 }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 200 }}
                    />
                  </>
                )}

                {filterType === "patient" && (
                  <TextField
                    label="Patient ID"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    sx={{ width: 200 }}
                  />
                )}

                {filterType === "prescription" && (
                  <TextField
                    label="Prescription ID"
                    value={prescriptionId}
                    onChange={(e) => setPrescriptionId(e.target.value)}
                    sx={{ width: 200 }}
                  />
                )}

                <Box>
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<SearchIcon />}
                    sx={{ mr: 1 }}
                  >
                    Apply
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      color: colors.primary[100],
                      borderColor: colors.primary[100],
                      "&:hover": {
                        backgroundColor: colors.primary[400],
                        color: "white",
                      },
                    }}
                    onClick={resetFilters}
                    startIcon={<RefreshIcon />}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>

              {/* Payments Table */}
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: colors.primary[400],
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                {loading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : payments.length === 0 ? (
                  <Box textAlign="center" p={4}>
                    <Typography variant="h6">No payments found</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow
                          sx={{ backgroundColor: colors.blueAccent[700] }}
                        >
                          <TableCell
                            sx={{ fontWeight: "bold", color: colors.grey[100] }}
                          >
                            ID
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", color: colors.grey[100] }}
                          >
                            Patient
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", color: colors.grey[100] }}
                          >
                            Date
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", color: colors.grey[100] }}
                          >
                            Amount
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", color: colors.grey[100] }}
                          >
                            Method
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", color: colors.grey[100] }}
                          >
                            Status
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", color: colors.grey[100] }}
                          >
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{payment.id}</TableCell>
                            <TableCell>{payment.patientName}</TableCell>
                            <TableCell>
                              {formatDateDisplay(payment.paymentDate)}
                            </TableCell>
                            <TableCell>Rs. {payment.totalAmount}</TableCell>
                            <TableCell>{payment.paymentMethod}</TableCell>
                            <TableCell>
                              <Chip
                                label={payment.status}
                                sx={{
                                  backgroundColor: getStatusColor(
                                    payment.status
                                  ),
                                  color: "#fff",
                                  fontWeight: "bold",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleViewPayment(payment.id)}
                                sx={{ color: colors.blueAccent[400] }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleEditPayment(payment.id)}
                                sx={{ color: colors.greenAccent[400] }}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeletePayment(payment.id)}
                                sx={{ color: colors.redAccent[400] }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
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

export default PaymentList;
