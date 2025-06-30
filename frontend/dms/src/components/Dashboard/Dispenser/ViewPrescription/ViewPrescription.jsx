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
  TextField,
  Chip,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../theme";
import DispenserSidebar from "../Sidebar/DispenserSidebar";
import Topbar from "./Topbar";
import axios from "axios";

const PrescriptionView = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // State for API data
  const [prescriptions, setPrescriptions] = useState([]);
  const [currentPrescriptionIndex, setCurrentPrescriptionIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterOption, setFilterOption] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  // New state variables
  const [doctorFee, setDoctorFee] = useState(300);

  
  const [processedPrescriptions, setProcessedPrescriptions] = useState(() => {
    const savedProcessed = localStorage.getItem("processedPrescriptions");
    return savedProcessed ? new Set(JSON.parse(savedProcessed)) : new Set();
  });

  
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
        const today = new Date().toISOString().split("T")[0];
        url = `${API_BASE_URL}/prescriptions/by-date?date=${today}`;
      } else if (filterOption === "date" && filterDate) {
        url = `${API_BASE_URL}/prescriptions/by-date?date=${filterDate}`;
      } else if (filterOption === "week") {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        url = `${API_BASE_URL}/prescriptions/by-date-range?startDate=${
          startOfWeek.toISOString().split("T")[0]
        }`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      
      console.log("Prescriptions Response:", response.data);
      if (response.data.length > 0) {
        console.log("First prescription:", response.data[0]);
        if (response.data[0].items && response.data[0].items.length > 0) {
          console.log("First prescription item:", response.data[0].items[0]);
          
          console.log("Medicine properties:", {
            medicineName: response.data[0].items[0].medicineName,
            medicineWeight: response.data[0].items[0].medicineWeight,
            medicine: response.data[0].items[0].medicine,
          });
        }
      }

      
      const sortedPrescriptions = response.data.sort(
        (a, b) => new Date(b.issueDate) - new Date(a.issueDate)
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

  
  const showNotification = (message, severity = "success") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  
  const currentPrescription = prescriptions[currentPrescriptionIndex] || null;

  
  const isCurrentPrescriptionProcessed = () => {
    return (
      currentPrescription && processedPrescriptions.has(currentPrescription.id)
    );
  };

  // Handle doctor fee change
  const handleDoctorFeeChange = (e) => {
    const value = parseFloat(e.target.value);
    setDoctorFee(isNaN(value) ? 0 : value);
  };

  // Helper function to extract medicine weight from the item
  const getMedicineWeight = (item) => {
    
    if (item.medicineWeight) return item.medicineWeight;
    if (item.medicine && item.medicine.weight) return item.medicine.weight;
    if (
      typeof item.medicine === "string" &&
      item.medicineDetails &&
      item.medicineDetails.weight
    )
      return item.medicineDetails.weight;

    
    if (item.medicineName) {
      const weightMatch = item.medicineName.match(/(\d+)\s*mg/i);
      if (weightMatch) return weightMatch[1];
    }

    return null;
  };

  // Helper function to get the unit price
  const getUnitPrice = (item) => {
    
    if (item.sellPrice) return item.sellPrice;
    if (item.inventoryItem && item.inventoryItem.sellPrice)
      return item.inventoryItem.sellPrice;

    // Default fallback
    return 100;
  };

  
  const getDosesPerDay = (dosageInstructions) => {
    if (!dosageInstructions) return 1; 

    const instruction = String(dosageInstructions).toUpperCase();

    if (
      instruction.includes("OD") ||
      instruction.includes("ONCE DAILY") ||
      instruction.includes("MANE") ||
      instruction.includes("NOCTE")
    ) {
      return 1;
    } else if (
      instruction.includes("BD") ||
      instruction.includes("TWICE DAILY")
    ) {
      return 2;
    } else if (
      instruction.includes("TDS") ||
      instruction.includes("THREE TIMES DAILY")
    ) {
      return 3;
    } else if (
      instruction.includes("QDS") ||
      instruction.includes("QID") ||
      instruction.includes("FOUR TIMES DAILY")
    ) {
      return 4;
    } else {
      return 1; 
    }
  };

  // Calculate total quantity for an item
  const calculateTotalQuantity = (item) => {
    if (!item) return 0;

    
    const quantityPerDose = parseInt(item.quantity) || 1;

    
    const dosesPerDay = getDosesPerDay(item.dosageInstructions);

    
    const daysSupply = parseInt(item.daysSupply) || 7;

    
    const totalQuantity = quantityPerDose * dosesPerDay * daysSupply;
    console.log(
      `Calculation for ${item.medicineName}: ${quantityPerDose} × ${dosesPerDay} × ${daysSupply} = ${totalQuantity}`
    );

    return totalQuantity;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!currentPrescription || !currentPrescription.items) return doctorFee;

    console.log(
      "Calculating total price for prescription:",
      currentPrescription
    );

    const medicinesTotal = currentPrescription.items.reduce((total, item) => {
      
      const unitPrice = getUnitPrice(item);

      
      const totalQuantity = calculateTotalQuantity(item);

      
      const itemCost = unitPrice * totalQuantity;

      console.log(
        `Item: ${item.medicineName}, Unit Price: ${unitPrice}, Total Quantity: ${totalQuantity}, Cost: ${itemCost}`
      );

      return total + itemCost;
    }, 0);

    const finalTotal = medicinesTotal + doctorFee;
    console.log(
      `Medicines Total: ${medicinesTotal}, Doctor Fee: ${doctorFee}, Final Total: ${finalTotal}`
    );

    return finalTotal;
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

      // Create payment record
      const medicinesCost = calculateTotalPrice() - doctorFee;
      const totalAmount = calculateTotalPrice();

      const paymentData = {
        patientId: currentPrescription.patientId,
        prescriptionId: currentPrescription.id,
        medicinesCost: medicinesCost,
        doctorFee: doctorFee,
        totalAmount: totalAmount,
        paymentMethod: "CASH",
        transactionReference: `PRESC-${currentPrescription.id}`,
        notes: "Payment recorded by dispenser",
      };

      await axios.post(`${API_BASE_URL}/payments`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      
      const updatedProcessed = new Set([
        ...processedPrescriptions,
        currentPrescription.id,
      ]);
      setProcessedPrescriptions(updatedProcessed);

      
      localStorage.setItem(
        "processedPrescriptions",
        JSON.stringify([...updatedProcessed])
      );

      showNotification("Payment recorded successfully");
      fetchPrescriptions();
    } catch (error) {
      console.error("Error processing payment:", error);
      showNotification("Failed to create payment", "error");
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

      // Create a cancelled payment record
      const paymentData = {
        patientId: currentPrescription.patientId,
        prescriptionId: currentPrescription.id,
        medicinesCost: 0,
        doctorFee: 0,
        totalAmount: 0,
        paymentMethod: "CASH",
        status: "CANCELLED",
        transactionReference: `REJECTED-${currentPrescription.id}`,
        notes: "Prescription rejected by dispenser - no payment collected",
      };

      await axios.post(`${API_BASE_URL}/payments`, paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Mark the prescription as processed
      const updatedProcessed = new Set([
        ...processedPrescriptions,
        currentPrescription.id,
      ]);
      setProcessedPrescriptions(updatedProcessed);

      
      localStorage.setItem(
        "processedPrescriptions",
        JSON.stringify([...updatedProcessed])
      );

      showNotification("Prescription marked as rejected in payment records");
      fetchPrescriptions();
    } catch (error) {
      console.error("Error processing rejection:", error);
      showNotification("Failed to record prescription rejection", "error");
    } finally {
      setLoading(false);
    }
  };

  // Print bill
  const printBill = () => {
    if (!currentPrescription) return;

    const printContent = document.getElementById("bill-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
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
          <p><strong>Date:</strong> ${new Date(
            currentPrescription.issueDate
          ).toLocaleString()}</p>
          
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Prescribed Qty</th>
                <th>Total Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${currentPrescription.items
                .map((item) => {
                  const totalQty = calculateTotalQuantity(item);
                  const unitPrice = getUnitPrice(item);
                  const itemTotal = unitPrice * totalQty;
                  const medicineWeight = getMedicineWeight(item);
                  return `
                  <tr>
                    <td>${item.medicineName}${
                    medicineWeight ? ` (${medicineWeight} mg)` : ""
                  }</td>
                    <td>${item.dosageInstructions || "As directed"} for ${
                    item.daysSupply
                  } days</td>
                    <td>${item.quantity} per dose</td>
                    <td>${totalQty}</td>
                    <td>Rs. ${unitPrice.toFixed(2)}</td>
                    <td>Rs. ${itemTotal.toFixed(2)}</td>
                  </tr>
                `;
                })
                .join("")}
              <tr>
                <td colspan="5">Doctor Fee</td>
                <td>Rs. ${doctorFee.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="5">Total Amount</td>
                <td>Rs. ${calculateTotalPrice().toFixed(2)}</td>
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
                    "&:hover": { backgroundColor: colors.blueAccent[600] },
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
                  <Card
                    sx={{
                      backgroundColor:
                        colors.primary[
                          theme.palette.mode === "dark" ? 400 : 50
                        ],
                      padding: 2,
                      boxShadow: theme.shadows[2],
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color:
                          theme.palette.mode === "dark"
                            ? colors.grey[100]
                            : "#000000",
                      }}
                    >
                      Patient Name:{" "}
                      <strong>{currentPrescription?.patientName}</strong>
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          theme.palette.mode === "dark"
                            ? colors.grey[100]
                            : "#000000",
                      }}
                    >
                      Prescription Date:{" "}
                      {formatDate(currentPrescription?.issueDate)}
                    </Typography>
                    {currentPrescription?.prescriptionNotes && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 2,
                          color:
                            theme.palette.mode === "dark"
                              ? colors.grey[300]
                              : "#333333",
                        }}
                      >
                        Notes: {currentPrescription.prescriptionNotes}
                      </Typography>
                    )}
                  </Card>

                  {/* Main Content Grid */}
                  <div id="bill-content">
                    <Grid container spacing={2}>
                      {/* Medicines Section - Left Side */}
                      <Grid item xs={12} md={8}>
                        <Card
                          sx={{
                            backgroundColor:
                              colors.primary[
                                theme.palette.mode === "dark" ? 400 : 50
                              ],
                            padding: 2,
                            boxShadow: theme.shadows[2],
                            height: "100%",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[100]
                                  : "#000000",
                            }}
                            gutterBottom
                          >
                            Prescribed Medicines
                          </Typography>
                          <TableContainer
                            component={Paper}
                            sx={{
                              boxShadow: 0,
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? colors.primary[500]
                                  : "ffffff",
                            }}
                          >
                            <Table>
                              <TableHead>
                                <TableRow
                                  sx={{
                                    backgroundColor:
                                      theme.palette.mode === "dark"
                                        ? colors.blueAccent[700]
                                        : colors.blueAccent[50],
                                  }}
                                >
                                  <TableCell
                                    sx={{
                                      color:
                                        theme.palette.mode === "dark"
                                          ? colors.grey[100]
                                          : "#000000",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Medicine
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color:
                                        theme.palette.mode === "dark"
                                          ? colors.grey[100]
                                          : "#000000",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Dosage Instructions
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color:
                                        theme.palette.mode === "dark"
                                          ? colors.grey[100]
                                          : "#000000",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Quantity
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      color:
                                        theme.palette.mode === "dark"
                                          ? colors.grey[100]
                                          : "#000000",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Total Quantity
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {currentPrescription?.items?.map(
                                  (item, index) => {
                                    const medicineWeight =
                                      getMedicineWeight(item);
                                    console.log(
                                      `Item ${index} weight:`,
                                      medicineWeight
                                    );
                                    return (
                                      <TableRow key={index}>
                                        <TableCell
                                          sx={{
                                            color:
                                              theme.palette.mode === "dark"
                                                ? colors.grey[100]
                                                : "#000000",
                                          }}
                                        >
                                          <Box>
                                            <Typography variant="body2">
                                              {item.medicineName}
                                            </Typography>
                                            {medicineWeight && (
                                              <Chip
                                                label={`${medicineWeight} mg`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{
                                                  mt: 0.5,
                                                  color: "white",
                                                  borderColor: "white",
                                                }}
                                              />
                                            )}
                                          </Box>
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            color:
                                              theme.palette.mode === "dark"
                                                ? colors.grey[100]
                                                : "#000000",
                                          }}
                                        >
                                          {item.dosageInstructions ||
                                            "As directed"}
                                          <Typography
                                            variant="caption"
                                            display="block"
                                          >
                                            For {item.daysSupply} days
                                          </Typography>
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            color:
                                              theme.palette.mode === "dark"
                                                ? colors.grey[100]
                                                : "#000000",
                                          }}
                                        >
                                          {item.quantity} per dose
                                        </TableCell>
                                        <TableCell
                                          sx={{
                                            color:
                                              theme.palette.mode === "dark"
                                                ? colors.grey[100]
                                                : "#000000",
                                          }}
                                        >
                                          <Chip
                                            label={calculateTotalQuantity(item)}
                                            color="secondary"
                                            size="small"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    );
                                  }
                                )}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Card>
                      </Grid>

                      {/* Payment Section - Right Side */}
                      <Grid item xs={12} md={4}>
                        <Card
                          sx={{
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? colors.greenAccent[700]
                                : colors.greenAccent[50],
                            padding: 2,
                            boxShadow: theme.shadows[2],
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[100]
                                  : "#000000",
                            }}
                          >
                            Payment
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[100]
                                  : "#000000",
                              mt: 2,
                            }}
                          >
                            Medicines Cost: Rs.{" "}
                            {(calculateTotalPrice() - doctorFee).toFixed(2)}
                          </Typography>

                          {/* Editable Doctor Fee */}
                          <Box display="flex" alignItems="center" mt={1} mb={1}>
                            <Typography
                              variant="body1"
                              sx={{
                                color:
                                  theme.palette.mode === "dark"
                                    ? colors.grey[100]
                                    : "#000000",
                                mr: 2,
                              }}
                            >
                              Doctor Fee: Rs.
                            </Typography>
                            <TextField
                              type="number"
                              value={doctorFee}
                              onChange={handleDoctorFeeChange}
                              size="small"
                              disabled={isCurrentPrescriptionProcessed()}
                              InputProps={{
                                sx: {
                                  width: "100px",
                                  color:
                                    theme.palette.mode === "dark"
                                      ? colors.grey[100]
                                      : "#000000",
                                },
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{
                              color:
                                theme.palette.mode === "dark"
                                  ? colors.grey[100]
                                  : "#000000",
                              fontWeight: "bold",
                              mt: 2,
                            }}
                          >
                            Total Amount: Rs. {calculateTotalPrice().toFixed(2)}
                          </Typography>

                          {isCurrentPrescriptionProcessed() ? (
                            <Box
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              mt="auto"
                              p={2}
                              sx={{
                                backgroundColor:
                                  theme.palette.mode === "dark"
                                    ? colors.greenAccent[800]
                                    : colors.greenAccent[50],
                                border: `1px solid ${
                                  theme.palette.mode === "dark"
                                    ? colors.greenAccent[400]
                                    : colors.greenAccent[500]
                                }`,
                                borderRadius: 1,
                                boxShadow: "none",
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  color:
                                    theme.palette.mode === "dark"
                                      ? colors.greenAccent[400]
                                      : colors.greenAccent[800],
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <span style={{ fontSize: "1.2rem" }}>✓</span>{" "}
                                Saved Successfully
                              </Typography>
                            </Box>
                          ) : (
                            <Box display="flex" gap={2} mt="auto">
                              <Button
                                variant="contained"
                                fullWidth
                                onClick={rejectPrescription}
                                disabled={loading}
                                sx={{
                                  backgroundColor: colors.redAccent[500],
                                  "&:hover": {
                                    backgroundColor: colors.redAccent[600],
                                  },
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
                                  "&:hover": {
                                    backgroundColor: colors.greenAccent[600],
                                  },
                                }}
                              >
                                Done
                              </Button>
                            </Box>
                          )}
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
                      backgroundColor:
                        colors.primary[
                          theme.palette.mode === "dark" ? 500 : 50
                        ],
                    }}
                  >
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        onClick={goToPreviousPrescription}
                        disabled={
                          currentPrescriptionIndex >= prescriptions.length - 1
                        }
                        sx={{
                          backgroundColor: colors.blueAccent[500],
                          "&:hover": {
                            backgroundColor: colors.blueAccent[600],
                          },
                          padding: "12px 15px",
                        }}
                      >
                        Previous Prescription
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={printBill}
                        disabled={!currentPrescription}
                        sx={{
                          color:
                            theme.palette.mode === "dark"
                              ? colors.grey[100]
                              : "#000000",
                          borderColor:
                            theme.palette.mode === "dark"
                              ? colors.grey[100]
                              : "#000000",
                          "&:hover": {
                            backgroundColor:
                              colors.primary[
                                theme.palette.mode === "dark" ? 600 : 100
                              ],
                            borderColor:
                              theme.palette.mode === "dark"
                                ? colors.grey[100]
                                : "#000000",
                          },
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
                          "&:hover": {
                            backgroundColor: colors.greenAccent[600],
                          },
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

export default PrescriptionView;
