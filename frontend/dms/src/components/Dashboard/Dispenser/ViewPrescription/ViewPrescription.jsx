import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  ThemeProvider, 
  CssBaseline, 
  Grid, 
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
  TextField
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../theme";
import DispenserSidebar from "../Sidebar/DispenserSidebar";
import Topbar from "./Topbar";
import axios from "axios";

const DOCTOR_FEE = 300;

const PrescriptionView = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State for API data
  const [prescriptions, setPrescriptions] = useState([]);
  const [currentPrescriptionIndex, setCurrentPrescriptionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [filterOption, setFilterOption] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  
  // API base URL
  const API_BASE_URL = "http://localhost:8080/api";

  // Fetch prescriptions from API
  useEffect(() => {
    fetchPrescriptions();
  }, [filterOption, filterDate]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      let url = `${API_BASE_URL}/prescriptions`;
      
      // Apply filters
      if (filterOption === "today") {
        const today = new Date().toISOString().split('T')[0];
        url = `${API_BASE_URL}/prescriptions/by-date?date=${today}`;
      } else if (filterOption === "date" && filterDate) {
        url = `${API_BASE_URL}/prescriptions/by-date?date=${filterDate}`;
      } else if (filterOption === "week") {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        url = `${API_BASE_URL}/prescriptions/by-date-range?startDate=${startOfWeek.toISOString().split('T')[0]}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Prescriptions:", response.data);
      
      // Sort prescriptions by issue date (newest first)
      const sortedPrescriptions = response.data.sort((a, b) => 
        new Date(b.issueDate) - new Date(a.issueDate)
      );
      
      setPrescriptions(sortedPrescriptions);
      setCurrentPrescriptionIndex(0);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      showNotification("Failed to load prescriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show notifications
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Current prescription
  const currentPrescription = prescriptions[currentPrescriptionIndex] || null;

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!currentPrescription || !currentPrescription.items) return DOCTOR_FEE;
    
    const medicinesTotal = currentPrescription.items.reduce((total, item) => {
      // If sellPrice is available, use it; otherwise fallback to an estimated price
      const price = item.sellPrice || 100; // fallback price if not available
      return total + (price * item.quantity);
    }, 0);
    
    return medicinesTotal + DOCTOR_FEE;
  };

  // Navigation functions
  const goToPreviousPrescription = () => {
    if (currentPrescriptionIndex < prescriptions.length - 1) {
      setCurrentPrescriptionIndex(currentPrescriptionIndex + 1);
    }
  };

  const goToNextPrescription = () => {
    if (currentPrescriptionIndex > 0) {
      setCurrentPrescriptionIndex(currentPrescriptionIndex - 1);
    }
  };

  // Handle prescription completion
  const markAsDone = async () => {
    if (!currentPrescription) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Update the prescription status
      await axios.put(
        `${API_BASE_URL}/prescriptions/${currentPrescription.id}`,
        { 
          prescriptionNotes: currentPrescription.prescriptionNotes + "\n\nDispensed: " + new Date().toLocaleString() 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification("Prescription marked as dispensed");
      
      // Refresh prescriptions
      fetchPrescriptions();
    } catch (error) {
      console.error("Error marking prescription as done:", error);
      showNotification("Failed to update prescription", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle prescription rejection
  const rejectPrescription = async () => {
    if (!currentPrescription) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Update the prescription status
      await axios.put(
        `${API_BASE_URL}/prescriptions/${currentPrescription.id}`,
        { 
          prescriptionNotes: currentPrescription.prescriptionNotes + "\n\nRejected: " + new Date().toLocaleString() 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification("Prescription marked as rejected");
      
      // Refresh prescriptions
      fetchPrescriptions();
    } catch (error) {
      console.error("Error rejecting prescription:", error);
      showNotification("Failed to update prescription", "error");
    } finally {
      setLoading(false);
    }
  };

  // Print bill
  const printBill = () => {
    if (!currentPrescription) return;
    
    const printContent = document.getElementById('bill-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription Bill - ${currentPrescription.patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Sahanaya Medical Center</h1>
          <h2>Prescription Bill</h2>
          <p><strong>Patient:</strong> ${currentPrescription.patientName}</p>
          <p><strong>Date:</strong> ${new Date(currentPrescription.issueDate).toLocaleString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${currentPrescription.items.map(item => `
                <tr>
                  <td>${item.medicineName}</td>
                  <td>${item.dosageInstructions || 'As directed'}</td>
                  <td>${item.quantity}</td>
                  <td>Rs. ${item.sellPrice || 100}</td>
                  <td>Rs. ${(item.sellPrice || 100) * item.quantity}</td>
                </tr>
              `).join('')}
              <tr>
                <td colspan="4">Doctor Fee</td>
                <td>Rs. ${DOCTOR_FEE}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4">Total Amount</td>
                <td>Rs. ${calculateTotalPrice()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Thank you for visiting Sahanaya Medical Center</p>
            <p>Get well soon!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

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

            <Box p={3} display="flex" flexDirection="column" gap={3}>
              {/* Filter Section */}
              <Box display="flex" gap={2} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Filter Prescriptions</InputLabel>
                  <Select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                    label="Filter Prescriptions"
                  >
                    <MenuItem value="all">All Prescriptions</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This Week</MenuItem>
                    <MenuItem value="date">By Date</MenuItem>
                  </Select>
                </FormControl>

                {filterOption === "date" && (
                  <TextField
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    sx={{ width: 200 }}
                  />
                )}

                <Button 
                  variant="contained"
                  onClick={fetchPrescriptions}
                  sx={{
                    backgroundColor: colors.blueAccent[500],
                    '&:hover': { backgroundColor: colors.blueAccent[600] }
                  }}
                >
                  Refresh
                </Button>
              </Box>

              {/* Loading Indicator */}
              {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                  <CircularProgress />
                </Box>
              ) : prescriptions.length === 0 ? (
                <Box textAlign="center" p={4}>
                  <Typography variant="h6">No prescriptions found</Typography>
                </Box>
              ) : (
                <>
                  {/* Patient Card */}
                  <Card sx={{ 
                    backgroundColor: colors.primary[theme.palette.mode === 'dark' ? 400 : 50],
                    padding: 2,
                    boxShadow: theme.shadows[2],
                    mb: 2
                  }}>
                    <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>
                      Patient Name: <strong>{currentPrescription?.patientName}</strong>
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>
                      Prescription Date: {formatDate(currentPrescription?.issueDate)}
                    </Typography>
                    {currentPrescription?.prescriptionNotes && (
                      <Typography variant="body2" sx={{ mt: 2, color: theme.palette.mode === 'dark' ? colors.grey[300] : '#333333' }}>
                        Notes: {currentPrescription.prescriptionNotes}
                      </Typography>
                    )}
                  </Card>

                  {/* Main Content Grid */}
                  <div id="bill-content">
                    <Grid container spacing={2}>
                      {/* Medicines Section - Left Side */}
                      <Grid item xs={12} md={8}>
                        <Card sx={{ 
                          backgroundColor: colors.primary[theme.palette.mode === 'dark' ? 400 : 50],
                          padding: 2,
                          boxShadow: theme.shadows[2],
                          height: '100%'
                        }}>
                          <Typography variant="h6" fontWeight={600} sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }} gutterBottom>
                            Prescribed Medicines
                          </Typography>
                          <TableContainer component={Paper} sx={{ 
                            boxShadow: 0,
                            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[500] : 'ffffff'
                          }}>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ 
                                  backgroundColor: theme.palette.mode === 'dark' ? colors.blueAccent[700] : colors.blueAccent[50]
                                }}>
                                  <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold' }}>Medicine</TableCell>
                                  <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold' }}>Dosage Instructions</TableCell>
                                  <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold' }}>Quantity</TableCell>
                                  <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold' }}>Days Supply</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {currentPrescription?.items?.map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{item.medicineName}</TableCell>
                                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{item.dosageInstructions || 'As directed'}</TableCell>
                                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{item.quantity}</TableCell>
                                    <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{item.daysSupply} days</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Card>
                      </Grid>

                      {/* Payment Section - Right Side */}
                      <Grid item xs={12} md={4}>
                        <Card sx={{ 
                          backgroundColor: theme.palette.mode === 'dark' ? colors.greenAccent[700] : colors.greenAccent[50],
                          padding: 2,
                          boxShadow: theme.shadows[2],
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <Typography variant="h6" fontWeight={600} sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>
                            Payment
                          </Typography>
                          <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', mt: 2 }}>
                            Medicines Cost: Rs. {calculateTotalPrice() - DOCTOR_FEE}
                          </Typography>
                          <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', mb: 2 }}>
                            Doctor Fee: Rs. {DOCTOR_FEE}
                          </Typography>
                          <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold', mt: 2 }}>
                            Total Amount: Rs. {calculateTotalPrice()}
                          </Typography>
                          <Box display="flex" gap={2} mt="auto">
                            <Button 
                              variant="contained"
                              fullWidth
                              onClick={rejectPrescription}
                              disabled={loading}
                              sx={{
                                backgroundColor: colors.redAccent[500],
                                '&:hover': { backgroundColor: colors.redAccent[600] }
                              }}
                            >
                              Reject
                            </Button>
                            <Button 
                              variant="contained"
                              fullWidth
                              onClick={markAsDone}
                              disabled={loading}
                              sx={{
                                backgroundColor: colors.greenAccent[500],
                                '&:hover': { backgroundColor: colors.greenAccent[600] }
                              }}
                            >
                              Done
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </div>

                  {/* Navigation Buttons - Right aligned */}
                  <Box
                    display="flex"
                    justifyContent="flex-end"
                    mt={4}
                    p={2}
                    sx={{ 
                      backgroundColor: colors.primary[theme.palette.mode === 'dark' ? 500 : 50]
                    }}
                  >
                    <Box display="flex" gap={2}>
                      <Button 
                        variant="contained"
                        onClick={goToPreviousPrescription}
                        disabled={currentPrescriptionIndex >= prescriptions.length - 1}
                        sx={{
                          backgroundColor: colors.blueAccent[500],
                          '&:hover': { backgroundColor: colors.blueAccent[600] },
                          padding: '12px 15px'
                        }}
                      >
                        Previous Prescription
                      </Button>
                      <Button 
                        variant="outlined"
                        onClick={printBill}
                        disabled={!currentPrescription}
                        sx={{
                          color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000',
                          borderColor: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000',
                          '&:hover': {
                            backgroundColor: colors.primary[theme.palette.mode === 'dark' ? 600 : 100],
                            borderColor: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000'
                          }
                        }}
                      >
                        Print Bill
                      </Button>
                      <Button 
                        variant="contained"
                        onClick={goToNextPrescription}
                        disabled={currentPrescriptionIndex <= 0}
                        sx={{
                          backgroundColor: colors.greenAccent[500],
                          '&:hover': { backgroundColor: colors.greenAccent[600] }
                        }}
                      >
                        Next Prescription
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default PrescriptionView;