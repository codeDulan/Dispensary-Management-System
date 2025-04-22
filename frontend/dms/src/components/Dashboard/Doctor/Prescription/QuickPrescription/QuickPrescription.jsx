import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  ThemeProvider,
  CssBaseline,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Autocomplete,
  Paper
} from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../../theme";
import Topbar from "./Topbar";
import DoctorSidebar from "../../Sidebar/DoctorSidebar";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QuickPrescription = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const medicineRefs = useRef([]);

  // Form state
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState([""]);
  const [investigation, setInvestigation] = useState([""]);
  const [medicines, setMedicines] = useState([
    { inventoryItemId: "", name: "", type: "", dosageInstructions: "", quantity: "", daysSupply: "7" },
  ]);
  const [notes, setNotes] = useState("");
  
  // API data
  const [patients, setPatients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  // Medical dosage instructions
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

  // API base URL
  const API_BASE_URL = "http://localhost:8080/api";

  // Fetch patients and inventory items on component mount
  useEffect(() => {
    fetchPatients();
    fetchInventoryItems();
  }, []);

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Patient data:", response.data);
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      showNotification("Failed to load patients", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory items from API
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch available inventory items
      const response = await axios.get(`${API_BASE_URL}/inventory/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Debug log
      console.log("Inventory Items:", response.data);
      
      setInventoryItems(response.data);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      showNotification("Failed to load medicines", "error");
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

  // Diagnosis handlers
  const handleAddDiagnosis = () => setDiagnosis([...diagnosis, ""]);
  const handleRemoveDiagnosis = (index) => {
    if (diagnosis.length > 1)
      setDiagnosis(diagnosis.filter((_, i) => i !== index));
  };
  const handleDiagnosisChange = (index, value) => {
    const updated = [...diagnosis];
    updated[index] = value;
    setDiagnosis(updated);
  };

  // Investigation handlers
  const handleAddInvestigation = () => setInvestigation([...investigation, ""]);
  const handleRemoveInvestigation = (index) => {
    if (investigation.length > 1)
      setInvestigation(investigation.filter((_, i) => i !== index));
  };
  const handleInvestigationChange = (index, value) => {
    const updated = [...investigation];
    updated[index] = value;
    setInvestigation(updated);
  };

  // Medicine handlers
  const handleAddMedicine = (focusIndex = medicines.length - 1) => {
    setMedicines([...medicines, { inventoryItemId: "", name: "", type: "", dosageInstructions: "", quantity: "", daysSupply: "7" }]);
    setTimeout(() => {
      if (medicineRefs.current[focusIndex + 1]) {
        medicineRefs.current[focusIndex + 1].querySelector("input").focus();
      }
    }, 0);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index));
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  // Medicine key handlers
  const handleMedicineKeyDown = (e, index, field) => {
    // Shift+Tab from name field adds new row above
    if (e.key === "Tab" && e.shiftKey && field === "name") {
      e.preventDefault();
      if (medicines[index].name.trim()) {
        const newMedicines = [...medicines];
        newMedicines.splice(index, 0, {
          inventoryItemId: "",
          name: "",
          type: "",
          dosageInstructions: "",
          quantity: "",
          daysSupply: "7"
        });
        setMedicines(newMedicines);
        setTimeout(() => {
          if (medicineRefs.current[index]) {
            medicineRefs.current[index].querySelector("input").focus();
          }
        }, 0);
      }
    }
    // Tab from quantity field adds new row below
    else if (
      e.key === "Tab" &&
      !e.shiftKey &&
      field === "quantity" &&
      index === medicines.length - 1 &&
      medicines[index].name.trim()
    ) {
      e.preventDefault();
      handleAddMedicine(index);
    }
  };

  // Fetch patient details including medical notes
  const fetchPatientDetails = async (patientId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/patients/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching patient details:", error);
      showNotification("Failed to load patient details", "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientSelect = async (event, newValue) => {
    if (newValue) {
      setPatientId(newValue.id);
      setPatientName(`${newValue.firstName} ${newValue.lastName || ''}`);
      setAge(newValue.age || "");
      setGender(newValue.gender || "");
      
      // Try to fetch additional patient details if available
      try {
        const patientDetails = await fetchPatientDetails(newValue.id);
        if (patientDetails && patientDetails.medicalNotes) {
          setMedicalNotes(patientDetails.medicalNotes);
        } else {
          setMedicalNotes("No medical notes available");
        }
      } catch (error) {
        console.error("Error in patient selection:", error);
        setMedicalNotes("Unable to load medical notes");
      }
    } else {
      setPatientId("");
      setPatientName("");
      setAge("");
      setGender("");
      setMedicalNotes("");
    }
  };

  // Handle medicine item selection
  const handleMedicineSelect = (index, newValue) => {
    if (newValue) {
      handleMedicineChange(index, "inventoryItemId", newValue.id);
      handleMedicineChange(index, "name", newValue.medicineName || "");
      // Set type based on medicine name or leave empty if you don't have type in your DTO
      handleMedicineChange(index, "type", "");
    } else {
      handleMedicineChange(index, "inventoryItemId", "");
      handleMedicineChange(index, "name", "");
      handleMedicineChange(index, "type", "");
    }
  };

  // Cancel prescription
  const handleCancel = () => {
    navigate("/prescriptions");
  };

  // Validate quantity input (only numbers)
  const validateQuantity = (value) => {
    return value === "" || /^[0-9]+$/.test(value);
  };

  // Save prescription to backend
  const handleSave = async () => {
    // Validate form data
    if (!patientId) {
      showNotification("Please select a patient", "error");
      return;
    }

    if (!medicines[0].inventoryItemId) {
      showNotification("Please add at least one medicine", "error");
      return;
    }

    // Filter out empty medicine items
    const validMedicines = medicines.filter(m => m.inventoryItemId && m.quantity);
    
    if (validMedicines.length === 0) {
      showNotification("Please add quantity for at least one medicine", "error");
      return;
    }

    // Format diagnosis and investigation as notes
    const diagnosisText = diagnosis.filter(d => d.trim()).join("\n- ");
    const investigationText = investigation.filter(i => i.trim()).join("\n- ");
    
    // Combine notes
    let prescriptionNotes = "";
    if (diagnosisText) prescriptionNotes += `Diagnosis:\n- ${diagnosisText}\n\n`;
    if (investigationText) prescriptionNotes += `Investigation:\n- ${investigationText}\n\n`;
    if (notes) prescriptionNotes += `Additional Notes:\n${notes}`;

    // Prepare prescription data according to backend API
    const prescriptionData = {
      patientId: patientId,
      prescriptionNotes: prescriptionNotes.trim(),
      items: validMedicines.map(med => ({
        inventoryItemId: med.inventoryItemId,
        quantity: parseInt(med.quantity) || 0,
        dosageInstructions: med.dosageInstructions || `Take as directed`,
        daysSupply: parseInt(med.daysSupply) || 7
      }))
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/prescriptions`,
        prescriptionData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("Prescription saved successfully!");
      // Navigate back to prescriptions list after successful save
      setTimeout(() => navigate("/prescriptions"), 1500);
    } catch (error) {
      console.error("Error saving prescription:", error);
      showNotification(
        error.response?.data?.message || "Failed to save prescription",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" height="100vh">
          <DoctorSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            <Topbar />
            <Box p={3}>
              {/* Patient Information Section */}
              <Box display="flex" gap={2} flexWrap="wrap">
                <Autocomplete
                  options={patients}
                  getOptionLabel={(option) => 
                    `${option.firstName} ${option.lastName || ''}`
                  }
                  onChange={handlePatientSelect}
                  renderInput={(params) => (
                    <TextField {...params} label="Select Patient" fullWidth />
                  )}
                  sx={{ width: 300 }}
                />
                <TextField 
                  label="Age" 
                  value={age} 
                  InputProps={{ readOnly: true }}
                  sx={{ width: 100 }} 
                />
                <TextField
                  label="Gender"
                  value={gender}
                  InputProps={{ readOnly: true }}
                  sx={{ width: 150 }}
                />
              </Box>

              {/* Patient Medical Notes Section */}
              {patientId && (
                <Box mt={3}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      backgroundColor: colors.primary[400],
                      borderLeft: `4px solid ${colors.greenAccent[500]}`
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                      Patient Medical History
                    </Typography>
                    <Typography variant="body2">
                      {medicalNotes || "No medical history available for this patient."}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Main Content Area - Split into Left and Right Sections */}
              <Box display="flex" gap={4} mt={3} flexDirection={{ xs: 'column', md: 'row' }}>
                {/* Left Section - Diagnosis and Investigation */}
                <Box flex={1}>
                  <Box mb={4}>
                    <Typography fontWeight={600} mb={1}>
                      Diagnosis
                    </Typography>
                    {diagnosis.map((value, i) => (
                      <Box
                        key={i}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1}
                      >
                        <TextField 
                          fullWidth 
                          margin="dense" 
                          value={value}
                          onChange={(e) => handleDiagnosisChange(i, e.target.value)}
                        />
                        {diagnosis.length > 1 && (
                          <IconButton onClick={() => handleRemoveDiagnosis(i)}>
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <IconButton onClick={handleAddDiagnosis}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Box>

                  <Box>
                    <Typography fontWeight={600} mb={1}>
                      Investigation
                    </Typography>
                    {investigation.map((value, i) => (
                      <Box
                        key={i}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1}
                      >
                        <TextField 
                          fullWidth 
                          margin="dense" 
                          value={value} 
                          onChange={(e) => handleInvestigationChange(i, e.target.value)}
                        />
                        {investigation.length > 1 && (
                          <IconButton
                            onClick={() => handleRemoveInvestigation(i)}
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <IconButton onClick={handleAddInvestigation}>
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </Box>
                  
                  <Box mt={4}>
                    <Typography fontWeight={600} mb={1}>
                      Additional Notes
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Box>
                </Box>

                {/* Right Section - Medicine */}
                <Box flex={1}>
                  <Typography fontWeight={600} mb={1}>
                    Medicine
                  </Typography>
                  {medicines.map((med, i) => (
                    <Box
                      sx={{
                        backgroundColor: colors.greenAccent[700],
                        borderRadius: "8px",
                        p: 2,
                        mb: 2,
                        boxShadow: theme.shadows[2],
                      }}
                      key={i}
                      display="flex"
                      flexDirection="column"
                      gap={2}
                      ref={(el) => (medicineRefs.current[i] = el)}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2">Medicine {i + 1}</Typography>
                        {medicines.length > 1 && (
                          <IconButton 
                            onClick={() => handleRemoveMedicine(i)}
                            size="small"
                          >
                            <RemoveCircleOutlineIcon />
                          </IconButton>
                        )}
                      </Box>
                      
                      <Autocomplete
                        options={inventoryItems}
                        getOptionLabel={(option) => {
                          // Use medicineName directly from the DTO
                          const remainingQty = option.remainingQuantity || 0;
                          return option.medicineName 
                            ? `${option.medicineName} (${remainingQty} available)`
                            : "";
                        }}
                        onChange={(e, newValue) => handleMedicineSelect(i, newValue)}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Select Medicine" 
                            fullWidth
                            onKeyDown={(e) => handleMedicineKeyDown(e, i, "name")}
                          />
                        )}
                      />
                      
                      <Box display="flex" gap={2} flexWrap="wrap">
                        {/* Type field removed since it's not in your DTO */}
                        
                        {/* Quantity as a text input field */}
                        <TextField
                          label="Quantity"
                          value={med.quantity}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (validateQuantity(value)) {
                              handleMedicineChange(i, "quantity", value);
                            }
                          }}
                          type="text"
                          InputProps={{
                            inputProps: { min: 1 },
                          }}
                          sx={{ width: "100px" }}
                          onKeyDown={(e) => handleMedicineKeyDown(e, i, "quantity")}
                        />
                        
                        <TextField
                          select
                          label="Days Supply"
                          value={med.daysSupply}
                          onChange={(e) => handleMedicineChange(i, "daysSupply", e.target.value)}
                          sx={{ width: "120px" }}
                        >
                          <MenuItem value="3">3 days</MenuItem>
                          <MenuItem value="5">5 days</MenuItem>
                          <MenuItem value="7">7 days</MenuItem>
                          <MenuItem value="14">14 days</MenuItem>
                          <MenuItem value="30">30 days</MenuItem>
                        </TextField>
                      </Box>

                      {/* Dosage Instructions dropdown with medical terms */}
                      <FormControl fullWidth>
                        <InputLabel>Dosage Instructions</InputLabel>
                        <Select
                          value={med.dosageInstructions}
                          onChange={(e) => handleMedicineChange(i, "dosageInstructions", e.target.value)}
                          label="Dosage Instructions"
                        >
                          <MenuItem value="">
                            <em>Select dosage pattern</em>
                          </MenuItem>
                          {dosageOptions.map(option => (
                            <MenuItem key={option.value} value={option.label}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {/* Additional specific instructions */}
                      <TextField
                        label="Additional Instructions"
                        placeholder="E.g. Take with food, avoid alcohol"
                        fullWidth
                        value={med.additionalInstructions || ""}
                        onChange={(e) => handleMedicineChange(i, "additionalInstructions", e.target.value)}
                      />
                    </Box>
                  ))}
                  <IconButton onClick={() => handleAddMedicine()}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box
                mt={4}
                display="flex"
                justifyContent="flex-end"
                gap={3}
                pr={2}
              >
                <Button 
                  variant="contained" 
                  color="inherit" 
                  sx={{padding: "12px 16px"}}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="success"
                  disabled={saving}
                  onClick={handleSave}
                  sx={{padding: "12px 16px"}}
                >
                  {saving ? <CircularProgress size={24} color="inherit" /> : "Save Prescription"}
                </Button>
              </Box>
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

export default QuickPrescription;