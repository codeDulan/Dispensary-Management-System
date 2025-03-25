import { Box, Button, Typography, Card, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider, CssBaseline, Grid } from "@mui/material";
import React, { useState } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../theme";
import DispenserSidebar from "../Sidebar/DispenserSidebar";
import Topbar from "./Topbar";

const PrescriptionView = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const patient = {
    name: "Dulan Anjana",
    age: 24,
    medicines: [
      { name: "Paracetamol", dose: "500mg", type: "Tablet", qty: 10 },
      { name: "Amoxicillin", dose: "250mg", type: "Capsule", qty: 15 },
      { name: "Cough Syrup", dose: "10ml", type: "Syrup", qty: 1 },
    ],
    amount: 1000,
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
              {/* Patient Card */}
              <Card sx={{ 
                backgroundColor: colors.primary[theme.palette.mode === 'dark' ? 400 : 50],
                padding: 2,
                boxShadow: theme.shadows[2],
                mb: 2
              }}>
                <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>
                  Patient Name: <strong>{patient.name}</strong>
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>
                  Age: {patient.age} years
                </Typography>
              </Card>

              {/* Main Content Grid */}
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
                            <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold' }}>Dose</TableCell>
                            <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', fontWeight: 'bold' }}>Quantity</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {patient.medicines.map((med, index) => (
                            <TableRow key={index} >
                              <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{med.name}</TableCell>
                              <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{med.type}</TableCell>
                              <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{med.dose}</TableCell>
                              <TableCell sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000' }}>{med.qty}</TableCell>
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
                    <Typography variant="body1" sx={{ color: theme.palette.mode === 'dark' ? colors.grey[100] : '#000000', my: 2 }}>
                      Amount: Rs. {patient.amount.toFixed(2)}
                    </Typography>
                    <Box display="flex" gap={2} mt="auto">
                      <Button 
                        variant="contained"
                        fullWidth
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

              {/* BUTTONS SECTION - Right aligned */}
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
                    sx={{
                      backgroundColor: colors.greenAccent[500],
                      '&:hover': { backgroundColor: colors.greenAccent[600] }
                    }}
                  >
                    Next Prescription
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default PrescriptionView;