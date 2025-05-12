import React, { useState, useEffect } from "react";
import axios from "axios";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ColorModeContext, useMode, tokens } from "../../../../theme";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import Topbar from "./Topbar";
import DoctorSidebar from "../Sidebar/DoctorSidebar";
import { Link } from "react-router-dom";

const Patient = () => {
  const [theme, colorMode] = useMode();
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data states
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Edit patient state
  const [editPatient, setEditPatient] = useState({
    id: null,
    firstName: "",
    lastName: "",
    nic: "",
    address: "",
    contact: "",
    gender: "",
    age: "",
    weight: "",
    medicalNotes: ""
  });

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Filter options
  const filterOptions = ["All", "Male", "Female", "Recent"];

  // Fetch patients
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Make sure each row has an id field for DataGrid
      const patientsWithId = response.data.map(patient => ({
        ...patient,
        id: patient.id || patient.patientId // Ensure id exists
      }));
      
      setPatients(patientsWithId);
      setError(null);
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Failed to load patients");
      setNotification({
        open: true,
        message: "Failed to load patients",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Handle edit click
  const handleEdit = (id) => {
    const patientToEdit = patients.find(patient => patient.id === id);
    if (patientToEdit) {
      setEditPatient({
        id: patientToEdit.id,
        firstName: patientToEdit.firstName || "",
        lastName: patientToEdit.lastName || "",
        nic: patientToEdit.nic || "",
        address: patientToEdit.address || "",
        contact: patientToEdit.contact || "",
        gender: patientToEdit.gender || "",
        age: patientToEdit.age || "",
        weight: patientToEdit.weight || "",
        medicalNotes: patientToEdit.medicalNotes || ""
      });
      setEditDialogOpen(true);
    }
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric values to numbers for the API
    const parsedValue = (name === "weight" || name === "age") && value !== "" 
      ? parseFloat(value) 
      : value;
    
    setEditPatient({
      ...editPatient,
      [name]: parsedValue
    });
  };

  // Handle submit edit
  const handleSubmitEdit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Prepare data for API - convert empty strings to null
      const dataToSend = {
        ...editPatient,
        weight: editPatient.weight === "" ? null : editPatient.weight,
        age: editPatient.age === "" ? null : editPatient.age
      };
      
      await axios.put(
        `http://localhost:8080/api/patients/${editPatient.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setPatients(patients.map(patient => 
        patient.id === editPatient.id ? { ...patient, ...dataToSend } : patient
      ));
      
      // Close dialog and show success notification
      setEditDialogOpen(false);
      setNotification({
        open: true,
        message: "Patient updated successfully",
        severity: "success"
      });
    } catch (err) {
      console.error("Error updating patient:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Failed to update patient",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (id) => {
    setSelectedPatientId(id);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/patients/${selectedPatientId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove deleted patient from state
      setPatients(patients.filter(patient => patient.id !== selectedPatientId));
      setDeleteDialogOpen(false);
      setNotification({
        open: true,
        message: "Patient deleted successfully",
        severity: "success"
      });
    } catch (error) {
      console.error("Error deleting patient:", error);
      setNotification({
        open: true,
        message: error.response?.data?.message || "Failed to delete patient",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  // Columns Configuration
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "lastName", headerName: "Last Name", flex: 1 },
    { field: "age", headerName: "Age", width: 100 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "contact", headerName: "Contact", width: 150 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-around">
          <Tooltip title="Edit">
            <IconButton 
              onClick={() => handleEdit(params.row.id)}
            >
              <EditIcon sx={{ color: iconColor }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton 
              color="error"
              onClick={() => handleDeleteClick(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Filtering Logic
  const filteredRows = patients.filter((row) => {
    // Text search filter
    const textMatch = 
      (row.firstName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (row.lastName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (row.email?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    // Category filter
    if (filterValue === "" || filterValue === "All") {
      return textMatch;
    } else if (filterValue === "Male") {
      return textMatch && row.gender === "MALE";
    } else if (filterValue === "Female") {
      return textMatch && row.gender === "FEMALE";
    } else if (filterValue === "Recent") {
      // Assuming there's a createdAt field or similar
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return textMatch && new Date(row.createdAt) >= thirtyDaysAgo;
    }
    
    return textMatch;
  });

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

            {/* Search, Filter, and Add Button */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              {/* Search Input and Filter Dropdown */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                sx={{ width: "40%" }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search Patient"
                  size="small"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{ width: "40%" }}
                >
                  <MenuItem value="">Filter</MenuItem>
                  {filterOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Add Patient Button */}
              <Link
                to="/addPatient"
                style={{ textDecoration: "none", width: "15%" }}
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: "100%", padding: "8px 16px" }}
                >
                  Add Patient
                </Button>
              </Link>
            </Box>

            {/* Patient DataGrid */}
            <Box
              flex="1"
              p={2}
              bgcolor={theme.palette.background.default}
              overflow="auto"
            >
              {loading && patients.length === 0 ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error" align="center">{error}</Typography>
              ) : (
                <DataGrid 
                  rows={filteredRows} 
                  columns={columns}
                  loading={loading}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[5, 10, 25, 50]}
                  disableRowSelectionOnClick
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Edit Patient Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Patient</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={editPatient.firstName}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={editPatient.lastName}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NIC"
                  name="nic"
                  value={editPatient.nic}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact"
                  name="contact"
                  value={editPatient.contact}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                  inputProps={{ maxLength: 10 }}
                  helperText="10 digit number"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editPatient.address}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={editPatient.gender || ""}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                >
                  <MenuItem value="MALE">Male</MenuItem>
                  <MenuItem value="FEMALE">Female</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={editPatient.age}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                  inputProps={{ min: 0, max: 120 }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={editPatient.weight}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                  inputProps={{ step: "0.1" }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Medical Notes"
                  name="medicalNotes"
                  value={editPatient.medicalNotes}
                  onChange={handleEditFormChange}
                  variant="outlined"
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmitEdit} 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Patient</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this patient? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

export default Patient;