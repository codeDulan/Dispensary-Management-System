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
  CircularProgress
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { ColorModeContext, useMode, tokens } from "../../../../theme";
import Topbar from "./Topbar";
import DoctorSidebar from "../Sidebar/DoctorSidebar";
import { Link } from "react-router-dom";
import axios from "axios";

const Prescription = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Filter Options
  const filterOptions = ["All", "Today", "This Week", "This Month"];

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // API base URL - adjust according to your backend configuration
  const API_BASE_URL = "http://localhost:8080/api";

  // Fetch prescriptions on component mount
  useEffect(() => {
    fetchPrescriptions();
  }, []);

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
    } finally {
      setLoading(false);
    }
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
                              : prescription.prescriptionNotes}
                          </TableCell>
                          <TableCell align="center">
                            <Box display="flex" justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton 
                                  component={Link} 
                                  to={`/prescriptions/${prescription.id}`}
                                  sx={{ 
                                    color: theme.palette.mode === 'dark' 
                                          ? colors.grey[100]
                                          : colors.primary[500]
                                  }}
                                >
                                  <VisibilityIcon />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Edit">
                                <IconButton 
                                  component={Link} 
                                  to={`/prescriptions/edit/${prescription.id}`}
                                  sx={{ 
                                    color: theme.palette.mode === 'dark' 
                                          ? colors.grey[100]
                                          : colors.primary[500]
                                  }}
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
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Prescription;