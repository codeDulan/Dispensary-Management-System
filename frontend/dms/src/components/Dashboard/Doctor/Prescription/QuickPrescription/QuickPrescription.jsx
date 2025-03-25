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
} from "@mui/material";
import React, { useState, useRef, useEffect } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../../theme";
import Topbar from "./Topbar";
import DoctorSidebar from "../../Sidebar/DoctorSidebar";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

const QuickPrescription = () => {
  const [theme, colorMode] = useMode();

  const colors = tokens(theme.palette.mode);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const medicineRefs = useRef([]);

  const [diagnosis, setDiagnosis] = useState([""]);
  const [investigation, setInvestigation] = useState([""]);
  const [medicines, setMedicines] = useState([
    { name: "", type: "", dose: "", qty: "" },
  ]);

  // Diagnosis handlers (unchanged)
  const handleAddDiagnosis = () => setDiagnosis([...diagnosis, ""]);
  const handleRemoveDiagnosis = (index) => {
    if (diagnosis.length > 1)
      setDiagnosis(diagnosis.filter((_, i) => i !== index));
  };

  // Investigation handlers (unchanged)
  const handleAddInvestigation = () => setInvestigation([...investigation, ""]);
  const handleRemoveInvestigation = (index) => {
    if (investigation.length > 1)
      setInvestigation(investigation.filter((_, i) => i !== index));
  };

  // Medicine handlers
  const handleAddMedicine = (focusIndex = medicines.length - 1) => {
    setMedicines([...medicines, { name: "", type: "", dose: "", qty: "" }]);
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

  // New: Shift+Tab to add field above current row
  const handleMedicineKeyDown = (e, index, field) => {
    // Shift+Tab from name field adds new row above
    if (e.key === "Tab" && e.shiftKey && field === "name") {
      e.preventDefault();
      if (medicines[index].name.trim()) {
        const newMedicines = [...medicines];
        newMedicines.splice(index, 0, {
          name: "",
          type: "",
          dose: "",
          qty: "",
        });
        setMedicines(newMedicines);
        setTimeout(() => {
          if (medicineRefs.current[index]) {
            medicineRefs.current[index].querySelector("input").focus();
          }
        }, 0);
      }
    }
    // Normal Tab from qty field adds new row below (existing functionality)
    else if (
      e.key === "Tab" &&
      !e.shiftKey &&
      field === "qty" &&
      index === medicines.length - 1 &&
      medicines[index].name.trim()
    ) {
      e.preventDefault();
      handleAddMedicine(index);
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
              <Box display="flex" gap={2}>
                <TextField label="Patient Name" fullWidth />
                <TextField label="Age" sx={{ width: 100 }} />
                <Select displayEmpty defaultValue="" sx={{ width: 150 }}>
                  <MenuItem value="">Gender</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </Box>

              {/* Main Content Area - Split into Left and Right Sections */}
              <Box display="flex" gap={4} mt={3}>
                {/* Left Section - Diagnosis and Investigation */}
                <Box flex={1}>
                  <Box mb={4}>
                    <Typography fontWeight={600} mb={1}>
                      Diagnosis
                    </Typography>
                    {diagnosis.map((_, i) => (
                      <Box
                        key={i}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1}
                      >
                        <TextField fullWidth margin="dense" />
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
                    {investigation.map((_, i) => (
                      <Box
                        key={i}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        mb={1}
                      >
                        <TextField fullWidth margin="dense" />
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
                </Box>

                {/* Right Section - Medicine */}
                <Box flex={1}>
                  <Typography fontWeight={600} mb={1}>
                    Medicine
                  </Typography>
                  {medicines.map((med, i) => (
                    <Box
                      sx={{
                        backgroundColor: colors.greenAccent[700], // Green background
                        borderRadius: "8px", // Rounded corners
                        p: 2, // Internal padding
                        boxShadow: theme.shadows[2], // Subtle shadow
                      }}
                      key={i}
                      display="flex"
                      gap={2}
                      mb={1}
                      alignItems="center"
                      ref={(el) => (medicineRefs.current[i] = el)}
                    >
                      <TextField
                        fullWidth
                        label={`Medicine ${i + 1}`}
                        value={med.name}
                        onChange={(e) =>
                          handleMedicineChange(i, "name", e.target.value)
                        }
                        onKeyDown={(e) => handleMedicineKeyDown(e, i, "name")}
                      />
                      <Select
                        value={med.type}
                        onChange={(e) =>
                          handleMedicineChange(i, "type", e.target.value)
                        }
                        displayEmpty
                        sx={{ width: 120 }}
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                      >
                        <MenuItem value="">Type</MenuItem>
                        <MenuItem value="Tablet">Tablet</MenuItem>
                        <MenuItem value="Syrup">Syrup</MenuItem>
                      </Select>
                      <Select
                        value={med.dose}
                        onChange={(e) =>
                          handleMedicineChange(i, "dose", e.target.value)
                        }
                        displayEmpty
                        sx={{ width: 100 }}
                        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                      >
                        <MenuItem value="">Dose</MenuItem>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                      </Select>
                      <Select
                        value={med.qty}
                        onChange={(e) =>
                          handleMedicineChange(i, "qty", e.target.value)
                        }
                        displayEmpty
                        sx={{ width: 100 }}
                        onKeyDown={(e) => handleMedicineKeyDown(e, i, "qty")}
                      >
                        <MenuItem value="">Qty</MenuItem>
                        <MenuItem value="10">10</MenuItem>
                        <MenuItem value="20">20</MenuItem>
                      </Select>
                      {medicines.length > 1 && (
                        <IconButton onClick={() => handleRemoveMedicine(i)}>
                          <RemoveCircleOutlineIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  <IconButton onClick={() => handleAddMedicine()}>
                    <AddCircleOutlineIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Action Buttons - Aligned to right with more padding */}
              <Box
                mt={4}
                display="flex"
                justifyContent="flex-end"
                gap={3}
                pr={2}
              >
                <Button variant="contained" color="inherit" sx={{padding: "12px 16px"}}>
                  Cancel
                </Button>
                <Button variant="outlined" color="success">
                  Print
                </Button>
                <Button variant="contained" color="success">
                  Save and Send
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default QuickPrescription;
