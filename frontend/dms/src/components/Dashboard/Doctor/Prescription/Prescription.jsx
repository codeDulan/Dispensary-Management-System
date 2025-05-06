import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  CssBaseline,
  ThemeProvider,
  TextField,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Snackbar,
  Alert,
  Card,
  Divider,
  FormControl,
  InputLabel,
  Autocomplete,
  Grid
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import InfoIcon from "@mui/icons-material/Info";

import { ColorModeContext, useMode, tokens } from "../../../../theme";
import Topbar from "./Topbar";
import DoctorSidebar from "../Sidebar/DoctorSidebar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Prescription = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Filter Options
  const filterOptions = ["All", "Today", "This Week", "This Month"];

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [editNotes, setEditNotes] = useState("");
  
  // Medicine edit states
  const [editableMedicines, setEditableMedicines] = useState([]);
  const [availableInventory, setAvailableInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // API base URL - adjust according to your backend configuration
  const API_BASE_URL = "http://localhost:8080/api";

  // Medical dosage instructions options
  const dosageOptions = [
    { value: "OD", label: "OD (Once daily)" },
    { value: "BD", label: "BD (Twice daily)" },
    { value: "TDS", label: "TDS (Three times daily)" },
    { value: "QDS", label: "QDS (Four times daily)" },
    { value: "QID", label: "QID (Four times daily)" },
    { value: "STAT", label: "STAT (Immediately)" },
    { value: "PRN", label: "PRN (When required)" },
    { value: "MANE", label: "MANE (In the morning)" },
    { value: "NOCTE", label: "NOCTE (At night)" },
    { value: "AC", label: "AC (Before meals)" },
    { value: "PC", label: "PC (After meals)" },
  ];

  // Days supply options
  const daysSupplyOptions = [
    { value: "3", label: "3 days" },
    { value: "5", label: "5 days" },
    { value: "7", label: "7 days" },
    { value: "14", label: "14 days" },
    { value: "30", label: "30 days" },
  ];

  // Fetch prescriptions on component mount
  useEffect(() => {
    fetchPrescriptions();
  }, []);

  // Fetch available inventory when edit dialog opens
  useEffect(() => {
    if (editDialogOpen && selectedPrescription) {
      fetchAvailableInventory();
    }
  }, [editDialogOpen, selectedPrescription]);

  // Function to fetch all prescriptions
  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      // Get auth token from localStorage or your auth context
      const token = localStorage.getItem("token");
      
      const response = await axios.get(`${API_BASE_URL}/prescriptions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log("API Response:", response.data);
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      showNotification("Failed to load prescriptions", "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch available inventory items
  const fetchAvailableInventory = async () => {
    setInventoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/inventory/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Available inventory:", response.data);
      setAvailableInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showNotification("Failed to load available medicines", "error");
    } finally {
      setInventoryLoading(false);
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

  // Handle filter change
  const handleFilterChange = async (value) => {
    setFilterValue(value);
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      let url = `${API_BASE_URL}/prescriptions`;
      
      // Apply date filters based on selection
      if (value === "Today") {
        const today = new Date().toISOString().split('T')[0];
        url = `${API_BASE_URL}/prescriptions/by-date?date=${today}`;
      } else if (value === "This Week") {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        
        url = `${API_BASE_URL}/prescriptions/by-date-range?startDate=${startOfWeek.toISOString().split('T')[0]}`;
      } else if (value === "This Month") {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        url = `${API_BASE_URL}/prescriptions/by-date-range?startDate=${startOfMonth.toISOString().split('T')[0]}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error applying filter:", error);
      showNotification("Failed to apply filter", "error");
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (error) {
      return dateString;
    }
  };

  // Filtering Logic based on search query
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patientName = (prescription.patientName || "").toLowerCase();
    const notes = (prescription.prescriptionNotes || "").toLowerCase();
    
    return patientName.includes(searchQuery.toLowerCase()) || 
           notes.includes(searchQuery.toLowerCase());
  });
  
  // Handler for view prescription
  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setViewDialogOpen(true);
  };
  
  // Handler for edit prescription
  const handleEditPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setEditNotes(prescription.prescriptionNotes || "");
    
    // Initialize editable medicines from the prescription
    if (prescription.items && prescription.items.length > 0) {
      setEditableMedicines(prescription.items.map(item => {
        // Convert item to an editable format
        return {
          id: item.id,
          inventoryItemId: item.inventoryItemId,
          medicineName: item.medicineName,
          medicineWeight: item.medicineWeight,
          quantity: item.quantity,
          dosageInstructions: item.dosageInstructions || "",
          daysSupply: item.daysSupply ? String(item.daysSupply) : "7",
          isNew: false, // Flag to identify existing medicines
          // Fetch medicine details including available quantity will be done when editing
          oldQuantity: item.quantity, // Store original quantity for inventory adjustment calculation
          oldDaysSupply: item.daysSupply,
          oldDosageInstructions: item.dosageInstructions
        };
      }));
    } else {
      setEditableMedicines([]);
    }
    
    setEditDialogOpen(true);
  };
  
  // Handler for adding a new medicine to the edit form
  const handleAddMedicine = () => {
    setEditableMedicines([
      ...editableMedicines, 
      {
        id: null,
        inventoryItemId: "",
        medicineName: "",
        medicineWeight: null,
        quantity: "",
        dosageInstructions: "",
        daysSupply: "7",
        isNew: true,
        availableQuantity: 0
      }
    ]);
  };
  
  // Handler for removing a medicine from the edit form
  const handleRemoveMedicine = (index) => {
    const updatedMedicines = [...editableMedicines];
    updatedMedicines.splice(index, 1);
    setEditableMedicines(updatedMedicines);
  };
  
  // Handler for medicine field changes
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...editableMedicines];
    updatedMedicines[index][field] = value;
    setEditableMedicines(updatedMedicines);
  };
  
  // Handler for medicine selection from inventory
  const handleMedicineSelect = (index, selectedItem) => {
    if (!selectedItem) {
      // If medicine is cleared, reset relevant fields
      handleMedicineChange(index, "inventoryItemId", "");
      handleMedicineChange(index, "medicineName", "");
      handleMedicineChange(index, "medicineWeight", null);
      handleMedicineChange(index, "availableQuantity", 0);
      return;
    }
    
    // Update medicine fields based on selection
    handleMedicineChange(index, "inventoryItemId", selectedItem.id);
    handleMedicineChange(index, "medicineName", selectedItem.medicineName || "");
    handleMedicineChange(index, "medicineWeight", selectedItem.medicineWeight);
    handleMedicineChange(index, "availableQuantity", selectedItem.remainingQuantity || 0);
  };
  
  // Handler for saving edited prescription
  const handleSaveEdit = async () => {
    if (!selectedPrescription) return;
    
    // Validate medicine entries
    const invalidMedicines = editableMedicines.filter(med => 
      !med.inventoryItemId || !med.quantity || !med.daysSupply
    );
    
    if (invalidMedicines.length > 0) {
      showNotification("Please fill in all required medicine fields", "error");
      return;
    }
    
    // Check if there's enough inventory for new medicines
    // or for increased quantities in existing medicines
    for (let medicine of editableMedicines) {
      if (medicine.isNew) {
        // For new medicines, check total quantity against available
        const totalQty = calculateTotalQuantity(medicine);
        if (totalQty > medicine.availableQuantity) {
          showNotification(`Insufficient quantity for ${medicine.medicineName}`, "error");
          return;
        }
      } else {
        // For existing medicines, check if quantity is increased
        const oldTotalQty = calculateTotalQuantityWithParams(
          medicine.oldQuantity, 
          medicine.oldDosageInstructions, 
          medicine.oldDaysSupply
        );
        
        const newTotalQty = calculateTotalQuantity(medicine);
        
        if (newTotalQty > oldTotalQty) {
          // Need to check if there's enough additional inventory
          const additionalQty = newTotalQty - oldTotalQty;
          
          // Need to fetch current available quantity
          // This might need an API call if not already available
          // For now we'll assume we don't have this info and show a warning
          showNotification(
            `Increasing medicine quantity may require additional inventory check for ${medicine.medicineName}`,
            "warning"
          );
        }
      }
    }
    
    try {
      const token = localStorage.getItem("token");
      
      // Prepare prescription update data
      const updateData = {
        prescriptionNotes: editNotes,
        // Format medicine items for the API
        updatedItems: editableMedicines
          .filter(med => !med.isNew)
          .map(med => ({
            id: med.id,
            inventoryItemId: med.inventoryItemId,
            quantity: parseInt(med.quantity) || 0,
            dosageInstructions: med.dosageInstructions || "Take as directed",
            daysSupply: parseInt(med.daysSupply) || 7,
            // Include original values for inventory adjustment
            oldQuantity: med.oldQuantity,
            oldDaysSupply: med.oldDaysSupply,
            oldDosageInstructions: med.oldDosageInstructions
          })),
        newItems: editableMedicines
          .filter(med => med.isNew)
          .map(med => ({
            inventoryItemId: med.inventoryItemId,
            quantity: parseInt(med.quantity) || 0,
            dosageInstructions: med.dosageInstructions || "Take as directed",
            daysSupply: parseInt(med.daysSupply) || 7
          }))
      };
      
      // Update the prescription
      const response = await axios.put(
        `${API_BASE_URL}/prescriptions/${selectedPrescription.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh prescriptions data
      await fetchPrescriptions();
      
      setEditDialogOpen(false);
      showNotification("Prescription updated successfully");
    } catch (error) {
      console.error("Error updating prescription:", error);
      showNotification(
        error.response?.data?.message || "Failed to update prescription", 
        "error"
      );
    }
  };
  
  // Helper function to get doses per day based on dosage instructions
  const getDosesPerDay = (dosageInstructions) => {
    if (!dosageInstructions) return 1; // Default to 1 if no instructions
    
    const instruction = String(dosageInstructions || "").toUpperCase();
    
    if (instruction.includes('OD') || instruction.includes('ONCE DAILY') || 
        instruction.includes('MANE') || instruction.includes('NOCTE')) {
      return 1;
    } else if (instruction.includes('BD') || instruction.includes('TWICE DAILY')) {
      return 2;
    } else if (instruction.includes('TDS') || instruction.includes('THREE TIMES DAILY')) {
      return 3;
    } else if (instruction.includes('QDS') || instruction.includes('QID') || 
              instruction.includes('FOUR TIMES DAILY')) {
      return 4;
    } else {
      return 1; // Default for other instructions
    }
  };
  
  // Helper function to calculate total quantity
  const calculateTotalQuantity = (item) => {
    if (!item) return 0;
    
    // Extract quantity per dose
    const quantityPerDose = parseInt(item.quantity) || 1;
    
    // Get number of doses per day based on dosage instructions
    const dosesPerDay = getDosesPerDay(item.dosageInstructions);
    
    // Get number of days for the prescription
    const daysSupply = parseInt(item.daysSupply) || 7;
    
    // Calculate total: quantity per dose * doses per day * days
    return quantityPerDose * dosesPerDay * daysSupply;
  };
  
  // Helper function to calculate total quantity with specific parameters
  const calculateTotalQuantityWithParams = (quantity, dosageInstructions, daysSupply) => {
    // Extract quantity per dose
    const quantityPerDose = parseInt(quantity) || 1;
    
    // Get number of doses per day based on dosage instructions
    const dosesPerDay = getDosesPerDay(dosageInstructions);
    
    // Get number of days for the prescription
    const days = parseInt(daysSupply) || 7;
    
    // Calculate total: quantity per dose * doses per day * days
    return quantityPerDose * dosesPerDay * days;
  };
  
  // Check if quantity is sufficient
  const isQuantitySufficient = (med) => {
    if (!med.isNew) return true; // Skip check for existing medicines
    const totalQty = calculateTotalQuantity(med);
    return totalQty <= med.availableQuantity;
  };
  
  // Validate quantity input (only numbers)
  const validateQuantity = (value) => {
    return value === "" || /^[0-9]+$/.test(value);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box display="flex" height="100vh">
          {/* Sidebar */}
          <DoctorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            {/* Topbar */}
            <Topbar />

            {/* Search, Filter, and Add Button */}
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
              {/* Search Input and Filter Dropdown */}
              <Box display="flex" alignItems="center" gap={2} sx={{ width: "40%" }}>
                <TextField
                  variant="outlined"
                  placeholder="Search by patient name or notes"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Select
                  value={filterValue}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{ width: "40%" }}
                >
                  <MenuItem value="">Filter by Date</MenuItem>
                  {filterOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Add Prescription Button */}
              <Link
                to="/quickPrescription"
                style={{ textDecoration: "none", width: "15%" }}
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: "100%", padding: "8px 16px" }}
                >
                  New Prescription
                </Button>
              </Link>
            </Box>

            {/* Prescriptions Table */}
            <Box flex="1" p={2} bgcolor={theme.palette.background.default} overflow="auto">
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                  <CircularProgress />
                </Box>
              ) : prescriptions.length === 0 ? (
                <Typography align="center" py={4}>No prescriptions found</Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="prescriptions table">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: colors.primary[400] }}>
                        <TableCell>ID</TableCell>
                        <TableCell>Patient Name</TableCell>
                        <TableCell>Issue Date</TableCell>
                        <TableCell>Medicines</TableCell>
                        <TableCell>Notes</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPrescriptions.map((prescription) => (
                        <TableRow key={prescription.id} hover>
                          <TableCell>{prescription.id}</TableCell>
                          <TableCell>{prescription.patientName}</TableCell>
                          <TableCell>{formatDate(prescription.issueDate)}</TableCell>
                          <TableCell>{prescription.items ? prescription.items.length : 0}</TableCell>
                          <TableCell>
                            {prescription.prescriptionNotes?.length > 50
                              ? `${prescription.prescriptionNotes.substring(0, 50)}...`
                              : prescription.prescriptionNotes || "No notes"}
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton 
                                  onClick={() => handleViewPrescription(prescription)}
                                  sx={{ color: colors.blueAccent[400] }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Edit Prescription">
                                <IconButton 
                                  onClick={() => handleEditPrescription(prescription)}
                                  sx={{ color: colors.greenAccent[500] }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </Box>
        
        {/* View Prescription Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Prescription Details</Typography>
              <IconButton onClick={() => setViewDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedPrescription && (
              <Box>
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="h6">Patient Information</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1"><strong>Name:</strong> {selectedPrescription.patientName}</Typography>
                  <Typography variant="body1"><strong>Prescription Date:</strong> {formatDate(selectedPrescription.issueDate)}</Typography>
                </Card>
                
                <Typography variant="h6" gutterBottom>Prescribed Medications</Typography>
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: colors.primary[400] }}>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Dosage Instructions</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="center">Days Supply</TableCell>
                        <TableCell align="center">Total Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPrescription.items && selectedPrescription.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2">{item.medicineName}</Typography>
                            {item.medicineWeight && (
                              <Chip
                                label={`${item.medicineWeight} mg`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </TableCell>
                          <TableCell>{item.dosageInstructions || "As directed"}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="center">{item.daysSupply} days</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={calculateTotalQuantity(item)} 
                              color="secondary" 
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6">Prescription Notes</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {selectedPrescription.prescriptionNotes || "No notes provided."}
                  </Typography>
                </Card>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setViewDialogOpen(false)} 
              variant="contained"
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Prescription Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Typography variant="h6">Edit Prescription</Typography>
          </DialogTitle>
          <DialogContent dividers>
            {selectedPrescription && (
              <Box>
                {/* Patient Info (Read-only) */}
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Patient Information</Typography>
                  <Typography variant="body2"><strong>Name:</strong> {selectedPrescription.patientName}</Typography>
                  <Typography variant="body2"><strong>Prescription Date:</strong> {formatDate(selectedPrescription.issueDate)}</Typography>
                </Card>
                
                {/* Medicines Section */}
                <Box mb={4}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold">Medications</Typography>
                    <Tooltip title="You can edit all medicines and add new ones to this prescription">
                      <InfoIcon fontSize="small" color="info" sx={{ ml: 1 }} />
                    </Tooltip>
                  </Box>
                  
                  {/* Medicines Table */}
                  {editableMedicines.length > 0 ? (
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: colors.primary[400] }}>
                            <TableCell>Medicine</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell align="center">Qty</TableCell>
                            <TableCell align="center">Days</TableCell>
                            <TableCell align="center">Total</TableCell>
                            <TableCell align="center">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {editableMedicines.map((med, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                {med.isNew ? (
                                  // New medicine (selectable)
                                  <Autocomplete
                                    options={availableInventory}
                                    loading={inventoryLoading}
                                    getOptionLabel={(option) => {
                                      const weight = option.medicineWeight 
                                        ? `${option.medicineWeight} mg` 
                                        : "";
                                      const remaining = option.remainingQuantity || 0;
                                      return `${option.medicineName} ${weight ? `(${weight})` : ""} - ${remaining} available`;
                                    }}
                                    renderOption={(props, option) => (
                                      <li {...props}>
                                        <Box>
                                          <Typography variant="body2">{option.medicineName}</Typography>
                                          <Box display="flex" gap={1} alignItems="center">
                                            {option.medicineWeight && (
                                              <Chip
                                                label={`${option.medicineWeight} mg`}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                              />
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                              {option.remainingQuantity || 0} available
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </li>
                                    )}
                                    onChange={(e, newValue) => handleMedicineSelect(index, newValue)}
                                    size="small"
                                    fullWidth
                                  />
                                ) : (
                                  // Existing medicine (read-only name)
                                  <Box>
                                    <Typography variant="body2">{med.medicineName}</Typography>
                                    {med.medicineWeight && (
                                      <Chip
                                        label={`${med.medicineWeight} mg`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mt: 0.5 }}
                                      />
                                    )}
                                  </Box>
                                )}
                              </TableCell>
                              <TableCell>
                                {/* All medicines can have dosage edited */}
                                <FormControl fullWidth size="small">
                                  <Select
                                    value={med.dosageInstructions}
                                    onChange={(e) => handleMedicineChange(index, "dosageInstructions", e.target.value)}
                                    size="small"
                                    displayEmpty
                                  >
                                    <MenuItem value=""><em>Select</em></MenuItem>
                                    {dosageOptions.map(option => (
                                      <MenuItem key={option.value} value={option.label}>
                                        {option.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell align="center">
                                {/* All medicines can have quantity edited */}
                                <TextField
                                  type="text"
                                  value={med.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (validateQuantity(value)) {
                                      handleMedicineChange(index, "quantity", value);
                                    }
                                  }}
                                  size="small"
                                  sx={{ width: 60 }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {/* All medicines can have days supply edited */}
                                <Select
                                  value={med.daysSupply}
                                  onChange={(e) => handleMedicineChange(index, "daysSupply", e.target.value)}
                                  size="small"
                                  sx={{ width: 70 }}
                                >
                                  {daysSupplyOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.value}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </TableCell>
                              <TableCell align="center">
                                <Chip
                                  label={calculateTotalQuantity(med)}
                                  color="secondary"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                {med.isNew ? (
                                  // Remove button for new medicines
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleRemoveMedicine(index)}
                                    color="error"
                                  >
                                    <RemoveCircleOutlineIcon fontSize="small" />
                                  </IconButton>
                                ) : (
                                  // Status chip for existing medicines
                                  <Chip 
                                    label="Existing" 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      No medications in this prescription.
                    </Typography>
                  )}
                  
                  {/* Add New Medicine Button */}
                  <Button
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddMedicine}
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 1 }}
                  >
                    Add New Medicine
                  </Button>
                </Box>
                
                {/* Prescription Notes */}
                <Box mt={4}>
                  <Typography variant="h6" fontWeight="bold" mb={2}>Prescription Notes</Typography>
                  <TextField
                    label="Notes"
                    multiline
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    fullWidth
                    placeholder="Enter any special instructions or notes for this prescription"
                  />
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit}
              variant="contained" 
              color="primary"
            >
              Save Changes
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
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Prescription;