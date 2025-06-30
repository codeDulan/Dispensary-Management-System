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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ColorModeContext, useMode, tokens } from "../../../../theme";

import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";

import DispenserSidebar from "../Sidebar/DoctorSidebar";
import Topbar from "./Topbar";

const PaymentList = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data states
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [patientId, setPatientId] = useState("");
  const [prescriptionId, setPrescriptionId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Edit form states
  const [editFormData, setEditFormData] = useState({
    status: "",
    paymentMethod: "",
    doctorFee: "",
    medicinesCost: "",
    totalAmount: "",
    notes: ""
  });

  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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
    setSearchQuery("");
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

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount == null) return "N/A";
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
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

  // Handle opening view modal
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setViewModalOpen(true);
  };

  // Handle opening edit modal
  const handleEditPayment = (payment) => {
    
    const paymentToEdit = payment || selectedPayment;
    if (!paymentToEdit) return;
    
    setSelectedPayment(paymentToEdit);
    setEditFormData({
      status: paymentToEdit.status || "",
      paymentMethod: paymentToEdit.paymentMethod || "",
      doctorFee: paymentToEdit.doctorFee || 0,
      medicinesCost: paymentToEdit.medicinesCost || 0,
      totalAmount: paymentToEdit.totalAmount || 0,
      notes: paymentToEdit.notes || ""
    });
    
    
    if (viewModalOpen) {
      setViewModalOpen(false);
      
      setTimeout(() => {
        setEditModalOpen(true);
      }, 300);
    } else {
      setEditModalOpen(true);
    }
  };

  // Handle opening delete confirmation modal
  const handleDeleteRequest = (payment) => {
    const paymentToDelete = payment || selectedPayment;
    if (!paymentToDelete) return;
    
    setSelectedPayment(paymentToDelete);
    
    
    if (viewModalOpen) {
      setViewModalOpen(false);
      // Use setTimeout to avoid focus issues
      setTimeout(() => {
        setDeleteConfirmOpen(true);
      }, 300);
    } else {
      setDeleteConfirmOpen(true);
    }
  };

  // Handle delete payment
  const handleDeletePayment = async () => {
    if (!selectedPayment) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      console.log("Deleting payment:", selectedPayment.id);
      
      await axios.delete(`${API_BASE_URL}/payments/${selectedPayment.id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Payment deleted successfully");
      
      // Close modal
      setDeleteConfirmOpen(false);
      showNotification("Payment deleted successfully");
      
     
      setPayments(prevPayments => prevPayments.filter(p => p.id !== selectedPayment.id));
    } catch (error) {
      console.error("Error deleting payment:", error);
      showNotification("Failed to delete payment: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric values with safe parsing
    if (name === "doctorFee" || name === "medicinesCost" || name === "totalAmount") {
      
      const safeValue = value === "" ? "0" : value;
      
      
      setEditFormData(prev => {
        const doctorFee = name === "doctorFee" ? safeValue : prev.doctorFee || "0";
        const medicinesCost = name === "medicinesCost" ? safeValue : prev.medicinesCost || "0";
        
        
        const calculatedTotal = name !== "totalAmount" 
          ? (parseFloat(doctorFee) + parseFloat(medicinesCost)).toString()
          : safeValue;
        
        return {
          ...prev,
          [name]: safeValue,
          
          ...(name !== "totalAmount" ? { totalAmount: calculatedTotal } : {})
        };
      });
    } else {
      setEditFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Submit payment update
  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Parse numeric values for API
      const updateData = {
        status: editFormData.status,
        paymentMethod: editFormData.paymentMethod,
        doctorFee: parseFloat(editFormData.doctorFee || 0),
        medicinesCost: parseFloat(editFormData.medicinesCost || 0),
        totalAmount: parseFloat(editFormData.totalAmount || 0),
        notes: editFormData.notes
      };
      
      console.log("Updating payment:", selectedPayment.id, updateData);
      
      const response = await axios.put(
        `${API_BASE_URL}/payments/${selectedPayment.id}`,
        updateData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("Update response:", response.data);
      
      // Close modal
      setEditModalOpen(false);
      showNotification("Payment updated successfully");
      
      // Update the payment in the local state
      setPayments(prevPayments => 
        prevPayments.map(p => p.id === selectedPayment.id ? response.data : p)
      );
    } catch (error) {
      console.error("Error updating payment:", error);
      showNotification("Failed to update payment: " + (error.response?.data?.message || error.message), "error");
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

  // DataGrid Columns
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { 
      field: "patientName", 
      headerName: "Patient", 
      flex: 1,
      minWidth: 180
    },
    { 
      field: "paymentDate", 
      headerName: "Payment Date", 
      width: 180,
      renderCell: (params) => formatDateDisplay(params.row.paymentDate)
    },
    { 
      field: "totalAmount", 
      headerName: "Amount", 
      width: 120,
      renderCell: (params) => formatCurrency(params.row.totalAmount)
    },
    { 
      field: "paymentMethod", 
      headerName: "Method", 
      width: 120
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          sx={{
            backgroundColor: getStatusColor(params.row.status),
            color: "#fff",
            fontWeight: "bold",
          }}
        />
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-around">
          <Tooltip title="View Details">
            <IconButton
              aria-label="view"
              onClick={() => handleViewPayment(params.row)}
            >
              <VisibilityIcon sx={{ color: colors.blueAccent[400] }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Payment">
            <IconButton
              aria-label="edit"
              onClick={() => handleEditPayment(params.row)}
            >
              <EditIcon sx={{ color: colors.greenAccent[400] }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Payment">
            <IconButton
              aria-label="delete"
              onClick={() => handleDeleteRequest(params.row)}
            >
              <DeleteIcon sx={{ color: colors.redAccent[400] }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      payment.patientName?.toLowerCase().includes(searchLower) ||
      payment.status?.toLowerCase().includes(searchLower) ||
      payment.paymentMethod?.toLowerCase().includes(searchLower) ||
      payment.id?.toString().includes(searchQuery) ||
      payment.prescriptionId?.toString().includes(searchQuery)
    );
  });

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box display="flex" height="100vh">
          {/* Sidebar */}
          <DispenserSidebar
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
                  Payment Management
                </Typography>
              </Box>

              {/* Filter Section */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                mb={3}
                sx={{ backgroundColor: colors.primary[400], borderRadius: 1 }}
              >
                {/* Search Input */}
                <Box display="flex" alignItems="center" gap={2} sx={{ width: "40%" }}>
                  <TextField
                    variant="outlined"
                    placeholder="Search by patient name, status, or payment method"
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>

                {/* Filters */}
                <Box display="flex" alignItems="center" gap={2}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
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
                    <FormControl size="small" sx={{ minWidth: 120 }}>
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
                        size="small"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        label="End Date"
                        type="date"
                        size="small"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </>
                  )}

                  {filterType === "patient" && (
                    <TextField
                      label="Patient ID"
                      size="small"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                    />
                  )}

                  {filterType === "prescription" && (
                    <TextField
                      label="Prescription ID"
                      size="small"
                      value={prescriptionId}
                      onChange={(e) => setPrescriptionId(e.target.value)}
                    />
                  )}

                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<SearchIcon />}
                    sx={{ 
                      backgroundColor: colors.blueAccent[500],
                      '&:hover': { backgroundColor: colors.blueAccent[600] }
                    }}
                  >
                    Apply
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={resetFilters}
                    startIcon={<RefreshIcon />}
                    sx={{
                      color: colors.primary[100],
                      borderColor: colors.primary[100],
                      "&:hover": {
                        backgroundColor: colors.primary[400],
                        color: "white",
                      },
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>

              {/* DataGrid */}
              <Box
                flex="1"
                bgcolor={theme.palette.background.default}
                overflow="auto"
                height="65vh"
              >
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </Box>
                ) : (
                  <DataGrid
                    getRowId={(row) => row.id}
                    rows={filteredPayments}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50, 100]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                      },
                    }}
                    disableRowSelectionOnClick
                    autoHeight
                    sx={{
                      '& .MuiDataGrid-cell': {
                        borderBottom: `1px solid ${colors.primary[300]}`,
                      },
                      '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                        fontWeight: 'bold',
                      },
                      '& .MuiDataGrid-virtualScroller': {
                        backgroundColor: colors.primary[400],
                      },
                      '& .MuiDataGrid-footerContainer': {
                        backgroundColor: colors.blueAccent[700],
                        color: colors.grey[100],
                      },
                      '& .MuiToolbar-root': {
                        color: colors.grey[100],
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* View Payment Modal */}
        <Dialog
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          maxWidth="md"
          fullWidth
          disableRestoreFocus
        >
          <DialogTitle sx={{ bgcolor: colors.primary[400], color: colors.grey[100] }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Payment Details</Typography>
              <IconButton
                onClick={() => setViewModalOpen(false)}
                sx={{ color: colors.grey[300] }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ bgcolor: colors.primary[400], color: colors.grey[100], pt: 3 }}>
            {selectedPayment && (
              <Box>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between" 
                  mb={2}
                >
                  <Typography variant="h5">
                    {selectedPayment.patientName}
                  </Typography>
                  <Chip
                    label={selectedPayment.status}
                    sx={{
                      backgroundColor: getStatusColor(selectedPayment.status),
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                      py: 1,
                    }}
                  />
                </Box>
                
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} mb={3}>
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Payment ID
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {selectedPayment.id}
                    </Typography>
                    
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Patient ID
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {selectedPayment.patientId}
                    </Typography>

                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Prescription ID
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {selectedPayment.prescriptionId}
                    </Typography>
                    
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Payment Date
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {formatDateDisplay(selectedPayment.paymentDate)}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Payment Method
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {selectedPayment.paymentMethod}
                    </Typography>
                    
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Doctor Fee
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {formatCurrency(selectedPayment.doctorFee)}
                    </Typography>
                    
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Medicines Cost
                    </Typography>
                    <Typography variant="body1" mb={1}>
                      {formatCurrency(selectedPayment.medicinesCost)}
                    </Typography>
                    
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Total Amount
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" mb={1}>
                      {formatCurrency(selectedPayment.totalAmount)}
                    </Typography>
                  </Box>
                </Box>
                
                {selectedPayment.notes && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Notes
                    </Typography>
                    <Typography variant="body1" sx={{ p: 2, bgcolor: colors.primary[500], borderRadius: 1 }}>
                      {selectedPayment.notes}
                    </Typography>
                  </Box>
                )}
                
                {selectedPayment.transactionReference && (
                  <Box mt={2}>
                    <Typography variant="subtitle2" color={colors.grey[300]}>
                      Transaction Reference
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayment.transactionReference}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: colors.primary[400], px: 3, pb: 2 }}>
            <Button 
              onClick={() => setViewModalOpen(false)}
              sx={{ color: colors.grey[100] }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setViewModalOpen(false);
                setTimeout(() => handleEditPayment(selectedPayment), 100);
              }}
              sx={{ 
                bgcolor: colors.greenAccent[600],
                '&:hover': { bgcolor: colors.greenAccent[700] }
              }}
            >
              Edit Payment
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setViewModalOpen(false);
                setTimeout(() => handleDeleteRequest(selectedPayment), 100);
              }}
              sx={{ 
                bgcolor: colors.redAccent[600],
                '&:hover': { bgcolor: colors.redAccent[700] }
              }}
            >
              Delete Payment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Payment Modal */}
        <Dialog
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          maxWidth="sm"
          fullWidth
          disableRestoreFocus
        >
          <DialogTitle sx={{ bgcolor: colors.primary[400], color: colors.grey[100] }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Edit Payment</Typography>
              <IconButton
                onClick={() => setEditModalOpen(false)}
                sx={{ color: colors.grey[300] }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ bgcolor: colors.primary[400], color: colors.grey[100], pt: 3 }}>
            {selectedPayment && (
              <Box
                component="form"
                noValidate
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1">
                  Patient: {selectedPayment.patientName}
                </Typography>
                <Typography variant="subtitle2" color={colors.grey[300]}>
                  Payment ID: {selectedPayment.id} | Prescription ID: {selectedPayment.prescriptionId}
                </Typography>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Payment Status</InputLabel>
                  <Select
                    name="status"
                    value={editFormData.status || ""}
                    onChange={handleEditFormChange}
                    label="Payment Status"
                  >
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="REFUNDED">Refunded</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={editFormData.paymentMethod || ""}
                    onChange={handleEditFormChange}
                    label="Payment Method"
                  >
                    <MenuItem value="CASH">Cash</MenuItem>
                    <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                    <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                    <MenuItem value="INSURANCE">Insurance</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
                
                <TextField
                  label="Doctor Fee"
                  name="doctorFee"
                  type="number"
                  value={editFormData.doctorFee || ""}
                  onChange={handleEditFormChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  }}
                />
                
                <TextField
                  label="Medicines Cost"
                  name="medicinesCost"
                  type="number"
                  value={editFormData.medicinesCost || ""}
                  onChange={handleEditFormChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  }}
                />
                
                <TextField
                  label="Total Amount"
                  name="totalAmount"
                  type="number"
                  value={editFormData.totalAmount || ""}
                  onChange={handleEditFormChange}
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                  }}
                  sx={{ fontWeight: "bold" }}
                />
                
                <TextField
                  label="Notes"
                  name="notes"
                  value={editFormData.notes || ""}
                  onChange={handleEditFormChange}
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: colors.primary[400], px: 3, pb: 2 }}>
            <Button 
              onClick={() => setEditModalOpen(false)}
              sx={{ color: colors.grey[100] }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdatePayment}
              disabled={loading}
              sx={{ 
                bgcolor: colors.greenAccent[600],
                '&:hover': { bgcolor: colors.greenAccent[700] }
              }}
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteConfirmOpen} 
          onClose={() => setDeleteConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          disableRestoreFocus
        >
          <DialogTitle sx={{ bgcolor: colors.primary[400], color: colors.grey[100] }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ bgcolor: colors.primary[400], color: colors.grey[100], pt: 2 }}>
            <Typography>
              Are you sure you want to delete this payment for {selectedPayment?.patientName}?
            </Typography>
            <Typography variant="caption" color={colors.redAccent[400]} sx={{ mt: 1, display: 'block' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ bgcolor: colors.primary[400], px: 3, pb: 2 }}>
            <Button 
              onClick={() => setDeleteConfirmOpen(false)}
              sx={{ color: colors.grey[100] }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeletePayment}
              disabled={loading}
              sx={{ 
                bgcolor: colors.redAccent[600],
                '&:hover': { bgcolor: colors.redAccent[700] }
              }}
            >
              Delete Payment
            </Button>
          </DialogActions>
        </Dialog>

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