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
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ColorModeContext, useMode, tokens } from "../../../../theme";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { Link } from "react-router-dom";

import Topbar from "./Topbar";
import DoctorSidebar from "../Sidebar/DoctorSidebar";

const Medicine = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data states
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Edit medicine state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editMedicine, setEditMedicine] = useState({
    id: null,
    description: "",
    lethalDosagePerKg: "",
    weight: ""
  });

  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Fetch medicines from API
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token"); 
        const response = await axios.get("http://localhost:8080/api/medicines", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Process the data to handle null values for new fields
        const processedData = response.data.map(medicine => ({
          ...medicine,
          
          weight: medicine.weight || null
        }));
        
        setMedicines(processedData);
      } catch (err) {
        console.error("Error fetching medicines:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  // Delete medicine
  const deleteMedicine = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/medicines/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Remove from local state
        setMedicines(medicines.filter(med => med.id !== id));
        
        // Show success notification
        setNotification({
          open: true,
          message: "Medicine deleted successfully",
          severity: "success"
        });
      } catch (err) {
        console.error("Error deleting medicine:", err);
        setNotification({
          open: true,
          message: err.response?.data?.message || "Failed to delete medicine",
          severity: "error"
        });
      }
    }
  };

  // Handle edit medicine
  const handleEdit = (id) => {
    const medicineToEdit = medicines.find(med => med.id === id);
    if (medicineToEdit) {
      setEditMedicine({
        id: medicineToEdit.id,
        description: medicineToEdit.description || "",
        lethalDosagePerKg: medicineToEdit.lethalDosagePerKg || "",
        weight: medicineToEdit.weight || "" 
      });
      setEditDialogOpen(true);
    }
  };

  // Handle edit dialog close
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric values to numbers for the API
    const parsedValue = (name === "weight" || name === "lethalDosagePerKg") && value !== "" 
      ? parseFloat(value) 
      : value;
    
    setEditMedicine({
      ...editMedicine,
      [name]: parsedValue
    });
  };

  // Handle submit edit
  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem("token");
      
      
      const dataToSend = {
        ...editMedicine,
        weight: editMedicine.weight === "" ? null : editMedicine.weight,
        lethalDosagePerKg: editMedicine.lethalDosagePerKg === "" ? null : editMedicine.lethalDosagePerKg
      };
      
      const response = await axios.put(
        `http://localhost:8080/api/medicines/${editMedicine.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process the response data to ensure fields exist
      const processedData = {
        ...response.data,
        weight: response.data.weight || null
      };

      // Update local state
      setMedicines(medicines.map(med => 
        med.id === editMedicine.id ? processedData : med
      ));
      
      // Close dialog and show success notification
      setEditDialogOpen(false);
      setNotification({
        open: true,
        message: "Medicine updated successfully",
        severity: "success"
      });
    } catch (err) {
      console.error("Error updating medicine:", err);
      setNotification({
        open: true,
        message: err.response?.data?.message || "Failed to update medicine",
        severity: "error"
      });
    }
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({...notification, open: false});
  };

  
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { 
      field: "weight", 
      headerName: "Weight", 
      width: 120,
      renderCell: (params) => {
        return params.row.weight ? `${params.row.weight} mg` : 'N/A';
      }
    },
    { 
      field: "lethalDosagePerKg", 
      headerName: "Lethal Dosage (per kg)", 
      width: 180,
      renderCell: (params) => {
        return params.row.lethalDosagePerKg ? `${params.row.lethalDosagePerKg} mg/kg` : 'N/A';
      }
    },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: (params) => (
        <Box display="flex" justifyContent="space-around">
          <Tooltip title="Edit">
            <IconButton 
              aria-label="edit" 
              onClick={() => handleEdit(params.row.id)}
            >
              <EditIcon sx={{ color: iconColor }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton 
              color="error" 
              aria-label="delete"
              onClick={() => deleteMedicine(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Filtering Logic
  const filteredRows = medicines.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

            {/* Search and Add Button */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              {/* Search Input */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                sx={{ width: "40%" }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search Medicine"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* Add Medicine Button */}
              <Link
                to="/addMedicine"
                style={{ textDecoration: "none", width: "15%" }}
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: "100%", padding: "8px 16px" }}
                >
                  Add Medicine
                </Button>
              </Link>
            </Box>

            {/* Medicine DataGrid */}
            <Box
              flex="1"
              p={2}
              bgcolor={theme.palette.background.default}
              overflow="auto"
            >
              {loading ? (
                <Typography>Loading medicines...</Typography>
              ) : error ? (
                <Typography color="error">Error: {error}</Typography>
              ) : (
                <DataGrid 
                  rows={filteredRows.map(row => ({
                    id: row.id,
                    name: row.name || "",
                    description: row.description || "",
                    weight: row.weight || null,
                    lethalDosagePerKg: row.lethalDosagePerKg || null
                  }))} 
                  columns={columns}
                  loading={loading}
                  pageSizeOptions={[5, 10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10, page: 0 },
                    },
                  }}
                  disableRowSelectionOnClick
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Edit Medicine Dialog */}
        <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
          <DialogTitle>Edit Medicine</DialogTitle>
          <DialogContent>
            <Box
              component="form"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mt: 2,
                minWidth: 400
              }}
            >
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={editMedicine.description}
                onChange={handleEditFormChange}
                multiline
                rows={3}
              />
              
              <TextField
                fullWidth
                label="Weight (mg)"
                name="weight"
                type="number"
                value={editMedicine.weight}
                onChange={handleEditFormChange}
              />
              
              <TextField
                fullWidth
                label="Lethal Dosage (mg/kg)"
                name="lethalDosagePerKg"
                type="number"
                value={editMedicine.lethalDosagePerKg}
                onChange={handleEditFormChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button onClick={handleSubmitEdit} variant="contained" color="primary">
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notifications */}
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity}>
            {notification.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Medicine;