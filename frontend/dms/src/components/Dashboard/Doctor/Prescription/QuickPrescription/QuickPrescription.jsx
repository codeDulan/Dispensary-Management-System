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
  Paper,
  Chip,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../../theme";
import Topbar from "./Topbar";
import DoctorSidebar from "../../Sidebar/DoctorSidebar";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import InfoIcon from "@mui/icons-material/Info";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const QuickPrescription = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const medicineRefs = useRef([]);

  // Form state
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState("");
  const [customDisease, setCustomDisease] = useState("");
  const [showCustomDiseaseField, setShowCustomDiseaseField] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [diagnosis, setDiagnosis] = useState([""]);
  const [investigation, setInvestigation] = useState([""]);
  const [medicines, setMedicines] = useState([
    {
      inventoryItemId: "",
      name: "",
      type: "",
      dosageInstructions: "",
      quantity: "",
      daysSupply: "7",
      medicineWeight: null,
      availableQuantity: 0,
    },
  ]);
  const [notes, setNotes] = useState("");

  // Template state
  const [templates, setTemplates] = useState([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templateCondition, setTemplateCondition] = useState("");

  // API data
  const [patients, setPatients] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

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

  // Helper function to get doses per day based on dosage instructions
  const getDosesPerDay = (dosageInstructions) => {
    if (!dosageInstructions) return 1; // Default to 1 if no instructions

    const instruction = String(dosageInstructions || "").toUpperCase();

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
    } else if (
      instruction.includes("STAT") ||
      instruction.includes("IMMEDIATELY")
    ) {
      return 1; // One-time dose
    } else if (
      instruction.includes("PRN") ||
      instruction.includes("WHEN REQUIRED")
    ) {
      return 1; // Assume once daily for PRN
    } else {
      return 1; // Default for other instructions
    }
  };

  // Calculate total quantity for an item
  const calculateTotalQuantity = (med) => {
    if (!med || !med.quantity) return 0;

    // Extract quantity per dose
    const quantityPerDose = parseInt(med.quantity) || 1;

    // Get number of doses per day based on dosage instructions
    const dosesPerDay = getDosesPerDay(med.dosageInstructions);

    // Get number of days for the prescription
    const daysSupply = parseInt(med.daysSupply) || 7;

    // Calculate total: quantity per dose * doses per day * days
    return quantityPerDose * dosesPerDay * daysSupply;
  };

  // Fetch patients, inventory items, and templates on component mount
  useEffect(() => {
    fetchPatients();
    fetchInventoryItems();
    fetchTemplates();
    fetchDiseases();
  }, []);

  // Fetch diseases from API
  const fetchDiseases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/diseases/common`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Disease data:", response.data);
      setDiseases(response.data);
    } catch (error) {
      console.error("Error fetching diseases:", error);
      showNotification("Failed to load common diseases", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle disease selection
  const handleDiseaseChange = (event) => {
    const value = event.target.value;
    setSelectedDisease(value);

    // Show custom disease field if "Other" is selected
    setShowCustomDiseaseField(value === "other");

    // Clear custom disease if a predefined disease is selected
    if (value !== "other") {
      setCustomDisease("");
    }
  };

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: { Authorization: `Bearer ${token}` },
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
        headers: { Authorization: `Bearer ${token}` },
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

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/prescription-templates`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Template data:", response.data);
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      showNotification("Failed to load prescription templates", "error");
    } finally {
      setLoading(false);
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

  const handleDeleteTemplate = async (templateId) => {
    if (!templateId) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_BASE_URL}/prescription-templates/${templateId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the deleted template from the state
      setTemplates(templates.filter((template) => template.id !== templateId));

      // If the deleted template was selected, clear selection
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
      }

      showNotification("Template deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting template:", error);
      showNotification(
        error.response?.data?.message || "Failed to delete template",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Template dialog handlers
  const handleOpenTemplateDialog = () => {
    setTemplateDialogOpen(true);
  };

  const handleCloseTemplateDialog = () => {
    setTemplateDialogOpen(false);
    setSelectedTemplate(null);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleLoadTemplate = () => {
    if (!selectedTemplate) {
      showNotification("Please select a template", "error");
      return;
    }

    // Set diagnosis if available
    if (selectedTemplate.conditionName) {
      const newDiagnosis = [...diagnosis];
      newDiagnosis[0] = selectedTemplate.conditionName;
      setDiagnosis(newDiagnosis);
    }

    // Set notes if available
    if (selectedTemplate.templateNotes) {
      setNotes(selectedTemplate.templateNotes);
    }

    // Handle items - need to convert template medicines to inventory items
    if (selectedTemplate.items && selectedTemplate.items.length > 0) {
      const newMedicines = selectedTemplate.items
        .map((item) => {
          // Find matching inventory items for this medicine
          const matchingInventory = inventoryItems.filter(
            (inv) => inv.medicineId === item.medicineId
          );

          if (matchingInventory.length > 0) {
            const bestMatch = matchingInventory[0];
            return {
              inventoryItemId: bestMatch.id,
              name: bestMatch.medicineName || item.medicineName, // Ensure name is set
              type: "",
              dosageInstructions: item.dosageInstructions,
              quantity: item.quantity.toString(),
              daysSupply: item.daysSupply.toString(),
              medicineWeight: bestMatch.medicineWeight,
              availableQuantity: bestMatch.remainingQuantity || 0,
            };
          }

          return null;
        })
        .filter((med) => med !== null);

      if (newMedicines.length > 0) {
        setMedicines(newMedicines);
        console.log("Loaded medicines:", newMedicines); // Debug log
      } else {
        // If no matches were found, keep one empty row
        setMedicines([
          {
            inventoryItemId: "",
            name: "",
            type: "",
            dosageInstructions: "",
            quantity: "",
            daysSupply: "7",
            medicineWeight: null,
            availableQuantity: 0,
          },
        ]);
        showNotification(
          "No inventory items found for template medicines",
          "warning"
        );
      }
    }

    setTemplateDialogOpen(false);
    showNotification("Template loaded successfully", "success");
  };
  // Save template dialog handlers
  const handleOpenSaveTemplateDialog = () => {
    // Default template name to first diagnosis if available
    if (diagnosis[0] && diagnosis[0].trim()) {
      setTemplateCondition(diagnosis[0].trim());
      setNewTemplateName(`${diagnosis[0].trim()} Treatment`);
    }
    setSaveTemplateDialogOpen(true);
  };

  const handleCloseSaveTemplateDialog = () => {
    setSaveTemplateDialogOpen(false);
    setNewTemplateName("");
    setTemplateCondition("");
  };

  const handleSaveAsTemplate = async () => {
    // Validate template data
    if (!newTemplateName.trim()) {
      showNotification("Please enter a template name", "error");
      return;
    }

    // Filter out empty medicine items
    const validMedicines = medicines.filter(
      (m) => m.inventoryItemId && m.quantity
    );

    if (validMedicines.length === 0) {
      showNotification("Please add at least one valid medicine", "error");
      return;
    }

    // Prepare template data
    const templateData = {
      templateName: newTemplateName.trim(),
      conditionName: templateCondition.trim(),
      templateNotes: notes.trim(),
      items: validMedicines
        .map((med) => {
          // Find the medicine ID for this inventory item
          const inventoryItem = inventoryItems.find(
            (item) => item.id === med.inventoryItemId
          );
          return {
            medicineId: inventoryItem ? inventoryItem.medicineId : null,
            quantity: parseInt(med.quantity) || 1,
            dosageInstructions: med.dosageInstructions || "Take as directed",
            daysSupply: parseInt(med.daysSupply) || 7,
          };
        })
        .filter((item) => item.medicineId), // Filter out items where we couldn't find the medicine ID
    };

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/prescription-templates`,
        templateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification("Template saved successfully!", "success");
      setSaveTemplateDialogOpen(false);
      fetchTemplates(); // Refresh the templates list
    } catch (error) {
      console.error("Error saving template:", error);
      showNotification(
        error.response?.data?.message || "Failed to save template",
        "error"
      );
    } finally {
      setSaving(false);
    }
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
    setMedicines([
      ...medicines,
      {
        inventoryItemId: "",
        name: "",
        type: "",
        dosageInstructions: "",
        quantity: "",
        daysSupply: "7",
        medicineWeight: null,
        availableQuantity: 0,
      },
    ]);
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
          daysSupply: "7",
          medicineWeight: null,
          availableQuantity: 0,
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
      const response = await axios.get(
        `${API_BASE_URL}/patients/${patientId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      setPatientName(`${newValue.firstName} ${newValue.lastName || ""}`);
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
      handleMedicineChange(index, "medicineWeight", newValue.medicineWeight);
      handleMedicineChange(
        index,
        "availableQuantity",
        newValue.remainingQuantity || 0
      );
    } else {
      handleMedicineChange(index, "inventoryItemId", "");
      handleMedicineChange(index, "name", "");
      handleMedicineChange(index, "medicineWeight", null);
      handleMedicineChange(index, "availableQuantity", 0);
    }
  };

  // Check if quantity is sufficient
  const isQuantitySufficient = (med) => {
    const totalQty = calculateTotalQuantity(med);
    return totalQty <= med.availableQuantity;
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
    const validMedicines = medicines.filter(
      (m) => m.inventoryItemId && m.quantity
    );

    if (validMedicines.length === 0) {
      showNotification(
        "Please add quantity for at least one medicine",
        "error"
      );
      return;
    }

    // Check if any medicine has insufficient quantity
    const insufficientMeds = validMedicines.filter(
      (med) => !isQuantitySufficient(med)
    );
    if (insufficientMeds.length > 0) {
      const medNames = insufficientMeds.map((med) => med.name).join(", ");
      showNotification(
        `Insufficient inventory quantity for: ${medNames}`,
        "error"
      );
      return;
    }

    // Format diagnosis and investigation as notes
    const diagnosisText = diagnosis.filter((d) => d.trim()).join("\n- ");
    const investigationText = investigation
      .filter((i) => i.trim())
      .join("\n- ");

    // Combine notes
    let prescriptionNotes = "";
    if (diagnosisText)
      prescriptionNotes += `Diagnosis:\n- ${diagnosisText}\n\n`;
    if (investigationText)
      prescriptionNotes += `Investigation:\n- ${investigationText}\n\n`;
    if (notes) prescriptionNotes += `Additional Notes:\n${notes}`;

    // Prepare prescription data according to backend API
    const prescriptionData = {
      patientId: patientId,
      prescriptionNotes: prescriptionNotes.trim(),
      items: validMedicines.map((med) => ({
        inventoryItemId: med.inventoryItemId,
        quantity: parseInt(med.quantity) || 0,
        dosageInstructions: med.dosageInstructions || `Take as directed`,
        daysSupply: parseInt(med.daysSupply) || 7,
      })),
    };

    // Add disease information
    if (selectedDisease && selectedDisease !== "other") {
      prescriptionData.diseaseId = parseInt(selectedDisease);
    } else if (customDisease.trim()) {
      prescriptionData.customDisease = customDisease.trim();
    }
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
                    `${option.firstName} ${option.lastName || ""} (${
                      option.email || "No email"
                    })`
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

              {/* Template Buttons */}
              <Box mt={2} display="flex" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleOpenTemplateDialog}
                  startIcon={<LibraryBooksIcon />}
                  sx={{
                    backgroundColor: colors.primary[300],
                    "&:hover": {
                      backgroundColor: colors.primary[200],
                    },
                  }}
                >
                  Load Template
                </Button>

                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleOpenSaveTemplateDialog}
                  startIcon={<SaveIcon />}
                >
                  Save as Template
                </Button>
              </Box>

              {/* Patient Medical Notes Section */}
              {patientId && (
                <Box mt={3}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      backgroundColor: colors.primary[400],
                      borderLeft: `4px solid ${colors.greenAccent[500]}`,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                      Patient Medical History
                    </Typography>
                    <Typography variant="body2">
                      {medicalNotes ||
                        "No medical history available for this patient."}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Main Content Area - Split into Left and Right Sections */}
              <Box
                display="flex"
                gap={4}
                mt={3}
                flexDirection={{ xs: "column", md: "row" }}
              >
                {/* Left Section - Diagnosis and Investigation */}
                <Box flex={1}>
                  <Box mb={4}>
                    <Typography fontWeight={600} mb={1}>
                      Disease Type
                    </Typography>
                    <FormControl fullWidth margin="dense">
                      <InputLabel>Select Disease</InputLabel>
                      <Select
                        value={selectedDisease}
                        onChange={handleDiseaseChange}
                        label="Select Disease"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {diseases.map((disease) => (
                          <MenuItem
                            key={disease.id}
                            value={disease.id.toString()}
                          >
                            {disease.name}
                          </MenuItem>
                        ))}
                        <MenuItem value="other">Other (specify)</MenuItem>
                      </Select>
                    </FormControl>

                    {showCustomDiseaseField && (
                      <TextField
                        fullWidth
                        margin="dense"
                        label="Specify Disease"
                        value={customDisease}
                        onChange={(e) => setCustomDisease(e.target.value)}
                        placeholder="Enter disease name"
                      />
                    )}
                  </Box>

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
                          onChange={(e) =>
                            handleDiagnosisChange(i, e.target.value)
                          }
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
                          onChange={(e) =>
                            handleInvestigationChange(i, e.target.value)
                          }
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
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography fontWeight={600}>Medicine</Typography>
                    <Tooltip title="Quantity represents tablets/capsules per dose. Total quantity = Qty per dose × Frequency × Days">
                      <InfoIcon fontSize="small" color="info" />
                    </Tooltip>
                  </Box>

                  {medicines.map((med, i) => (
                    <Box
                      sx={{
                        backgroundColor: colors.greenAccent[700],
                        borderRadius: "8px",
                        p: 2,
                        mb: 2,
                        boxShadow: theme.shadows[2],
                        borderLeft:
                          !med.quantity || isQuantitySufficient(med)
                            ? undefined
                            : `4px solid ${colors.redAccent[500]}`,
                      }}
                      key={i}
                      display="flex"
                      flexDirection="column"
                      gap={2}
                      ref={(el) => (medicineRefs.current[i] = el)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle2">
                          Medicine {i + 1}
                        </Typography>
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
                          // Show medicine name with weight and remaining quantity
                          const remainingQty = option.remainingQuantity || 0;
                          const weight = option.medicineWeight
                            ? `${option.medicineWeight} mg`
                            : "";
                          return option.medicineName
                            ? `${option.medicineName} ${
                                weight ? `(${weight})` : ""
                              } - ${remainingQty} available`
                            : "";
                        }}
                        onChange={(e, newValue) =>
                          handleMedicineSelect(i, newValue)
                        }
                        // Add this value prop to connect the medicine data to the component
                        value={
                          med.inventoryItemId
                            ? inventoryItems.find(
                                (item) => item.id === med.inventoryItemId
                              ) || null
                            : null
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Medicine"
                            fullWidth
                            onKeyDown={(e) =>
                              handleMedicineKeyDown(e, i, "name")
                            }
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Box>
                              <Typography variant="body1">
                                {option.medicineName}
                              </Typography>
                              <Box display="flex" gap={1} alignItems="center">
                                {option.medicineWeight && (
                                  <Chip
                                    size="small"
                                    label={`${option.medicineWeight} mg`}
                                    color="primary"
                                    variant="outlined"
                                    sx={{ color: 'white', borderColor: 'white' }}
                                  />
                                )}
                                <Typography
                                  variant="body2"
                                  color="white"
                                >
                                  {option.remainingQuantity || 0} available
                                </Typography>
                              </Box>
                            </Box>
                          </li>
                        )}
                      />

                      <Box display="flex" flexDirection="column" gap={2}>
                        {/* Medication Information (if selected) */}
                        {med.inventoryItemId && (
                          <Box
                            sx={{
                              backgroundColor: colors.primary[400],
                              borderRadius: "4px",
                              p: 1,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography variant="body2">
                              Available:{" "}
                              <strong>{med.availableQuantity}</strong>
                            </Typography>

                            {med.quantity && (
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body2">
                                  Total Required:
                                </Typography>
                                <Chip
                                  label={calculateTotalQuantity(med)}
                                  color={
                                    isQuantitySufficient(med)
                                      ? "success"
                                      : "error"
                                  }
                                  size="small"
                                />
                              </Box>
                            )}
                          </Box>
                        )}

                        <Box display="flex" gap={2} flexWrap="wrap">
                          {/* Quantity per dose input field */}
                          <TextField
                            label="Qty Per Dose"
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
                            sx={{ width: "110px" }}
                            onKeyDown={(e) =>
                              handleMedicineKeyDown(e, i, "quantity")
                            }
                          />

                          <TextField
                            select
                            label="Days Supply"
                            value={med.daysSupply}
                            onChange={(e) =>
                              handleMedicineChange(
                                i,
                                "daysSupply",
                                e.target.value
                              )
                            }
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
                            onChange={(e) =>
                              handleMedicineChange(
                                i,
                                "dosageInstructions",
                                e.target.value
                              )
                            }
                            label="Dosage Instructions"
                          >
                            <MenuItem value="">
                              <em>Select dosage pattern</em>
                            </MenuItem>
                            {dosageOptions.map((option) => (
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
                          onChange={(e) =>
                            handleMedicineChange(
                              i,
                              "additionalInstructions",
                              e.target.value
                            )
                          }
                        />
                      </Box>
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
                  sx={{ padding: "12px 16px" }}
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
                  sx={{ padding: "12px 16px" }}
                >
                  {saving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send Prescription"
                  )}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Template Select Dialog */}
        <Dialog
          open={templateDialogOpen}
          onClose={handleCloseTemplateDialog}
          maxWidth="md"
        >
          <DialogTitle>Select Prescription Template</DialogTitle>
          <DialogContent sx={{ width: 500, maxHeight: 400 }}>
            {templates.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No saved templates available.
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                {templates.map((template) => (
                  <Box
                    key={template.id}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid",
                      borderColor:
                        selectedTemplate?.id === template.id
                          ? "primary.main"
                          : "divider",
                      borderRadius: 1,
                      cursor: "pointer",
                      bgcolor:
                        selectedTemplate?.id === template.id
                          ? "action.selected"
                          : "background.paper",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                      position: "relative",
                    }}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {template.templateName}
                    </Typography>
                    {template.conditionName && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Condition: {template.conditionName}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {template.items.length}{" "}
                      {template.items.length === 1 ? "medicine" : "medicines"}
                    </Typography>

                    {/* Delete button */}
                    <IconButton
                      size="small"
                      color="error"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering template selection
                        if (
                          window.confirm(
                            `Are you sure you want to delete the template "${template.templateName}"?`
                          )
                        ) {
                          handleDeleteTemplate(template.id);
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseTemplateDialog}>Cancel</Button>
            <Button
              onClick={handleLoadTemplate}
              color="primary"
              variant="contained"
              disabled={!selectedTemplate || templates.length === 0}
            >
              Load Template
            </Button>
          </DialogActions>
        </Dialog>

        {/* Save as Template Dialog */}
        <Dialog
          open={saveTemplateDialogOpen}
          onClose={handleCloseSaveTemplateDialog}
        >
          <DialogTitle>Save as Template</DialogTitle>
          <DialogContent sx={{ width: 400 }}>
            <Box display="flex" flexDirection="column" gap={3} mt={2}>
              <TextField
                fullWidth
                label="Template Name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Common Cold Treatment"
                required
              />

              <TextField
                fullWidth
                label="Condition/Diagnosis"
                value={templateCondition}
                onChange={(e) => setTemplateCondition(e.target.value)}
                placeholder="e.g., Upper Respiratory Tract Infection"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSaveTemplateDialog}>Cancel</Button>
            <Button
              onClick={handleSaveAsTemplate}
              color="primary"
              variant="contained"
              disabled={!newTemplateName.trim() || saving}
            >
              {saving ? <CircularProgress size={24} /> : "Save Template"}
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

export default QuickPrescription;
