import React, { useState, useEffect } from "react";
import { ColorModeContext, useMode } from "../theme.js";
import { tokens } from "../theme.js";
import axios from "axios";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from "@mui/material";
import {
  MedicationOutlined,
  ArrowForward
} from "@mui/icons-material";
import Topbar from "../components/Dashboard/Doctor/Topbar/Topbar.jsx";
import CustomerSidebar from "../components/Dashboard/Customer/Sidebar/CustomerSidebar.jsx";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Function to fetch prescriptions
  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        setPrescriptions([]);
        return;
      }
      
      const response = await axios.get(
        "http://localhost:8080/api/prescriptions/my-prescriptions",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log("Prescription data:", response.data);
      setPrescriptions(response.data);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setPrescriptions([]);
      toast.error("Failed to load prescriptions");
    }
  };

  // Format a date safely
  const formatDateSafely = (dateString) => {
    try {
      if (!dateString) return "No date available";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return date.toLocaleDateString('en-US', {
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    setLoading(true);
    fetchPrescriptions()
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  // Render medication items from a prescription
  const renderMedicationItems = (prescription) => {
    if (!prescription.items || prescription.items.length === 0) {
      return <Typography variant="body2">No medication details available</Typography>;
    }
    
    return prescription.items.map((item, index) => (
      <Box key={index} mb={1}>
        <Typography variant="body2" fontWeight="bold">
          {item.medicineName || `Medication ${index + 1}`}
        </Typography>
        <Typography variant="body2" color={colors.grey[300]}>
          {item.dosageInstructions || "As directed"}
          {item.daysSupply && ` (${item.daysSupply} days supply)`}
        </Typography>
      </Box>
    ));
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastContainer position="top-right" autoClose={3000} />
        
        <Box display="flex" height="100vh">
          
          {/* Sidebar with controlled width */}
          <CustomerSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
            
            {/* Topbar at the top of the content area */}
            <Topbar style={{ zIndex: 1000 }} />

            {/* Page Content */}
            <Box 
              flex="1" 
              p={{ xs: 2, md: 4 }} 
              bgcolor={colors.primary[900]} 
              overflow="auto"
            >
              

              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Recent Prescriptions */}
                  <Grid item xs={12}>
                    <Paper 
                      sx={{ 
                        p: 3, 
                        bgcolor: colors.primary[400],
                        borderRadius: "10px"
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Box display="flex" alignItems="center">
                          <MedicationOutlined sx={{ fontSize: 28, color: colors.blueAccent[500], mr: 1 }} />
                          <Typography variant="h4" fontWeight="600">
                            My Prescriptions
                          </Typography>
                        </Box>
                      </Box>
                      
                      {prescriptions.length > 0 ? (
                        <List>
                          {prescriptions.map((prescription) => (
                            <ListItem 
                              key={prescription.id} 
                              sx={{ 
                                mb: 2, 
                                p: 0,
                                display: "block"
                              }}
                            >
                              <Card sx={{ backgroundColor: colors.primary[500] }}>
                                <CardContent>
                                  <Box display="flex" alignItems="flex-start">
                                    <Box 
                                      sx={{ 
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor: colors.blueAccent[500],
                                        borderRadius: '8px',
                                        width: "50px",
                                        height: "50px",
                                        mr: 2,
                                        flexShrink: 0
                                      }}
                                    >
                                      <MedicationOutlined sx={{ fontSize: 24 }} />
                                    </Box>
                                    <Box>
                                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                                        {formatDateSafely(prescription.issueDate)}
                                      </Typography>
                                      
                                      {prescription.items && prescription.items.length > 0 ? (
                                        <Box>
                                          {prescription.items.map((item, index) => (
                                            <Box key={index} mb={1.5}>
                                              <Typography variant="body1" fontWeight="bold" color={colors.grey[100]}>
                                                {item.medicineName || `Medication ${index + 1}`}
                                              </Typography>
                                              <Typography variant="body2" color={colors.grey[300]}>
                                                {item.dosageInstructions || "As directed"}
                                              </Typography>
                                              {item.daysSupply && (
                                                <Typography variant="body2" color={colors.grey[300]}>
                                                  {item.daysSupply} days supply
                                                </Typography>
                                              )}
                                            </Box>
                                          ))}
                                        </Box>
                                      ) : (
                                        <Typography variant="body2" color={colors.grey[300]}>
                                          No medication details available
                                        </Typography>
                                      )}
                                      
                                      {prescription.prescriptionNotes && (
                                        <Box mt={2} p={1.5} bgcolor={colors.primary[400]} borderRadius="4px">
                                          <Typography variant="body2" fontStyle="italic">
                                            Note: {prescription.prescriptionNotes}
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box 
                          sx={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center",
                            justifyContent: "center",
                            height: "200px",
                            textAlign: "center",
                            p: 2
                          }}
                        >
                          <MedicationOutlined sx={{ fontSize: 60, color: colors.grey[500], mb: 2 }} />
                          <Typography variant="body1" color={colors.grey[100]}>
                            You have no prescriptions yet
                          </Typography>
                          <Typography variant="body2" color={colors.grey[300]} mt={1}>
                            Prescriptions will appear here after your doctor creates them
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Dashboard;