import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ColorModeContext, useMode } from "../../../../theme.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  useTheme,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Autocomplete,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Check,
  Close,
  CalendarMonth,
  PersonAdd,
  Cancel,
  EventBusy,
} from "@mui/icons-material";
import { tokens } from "../../../../theme.js";
import Topbar from "./Topbar.jsx";
import Sidebar from "../Sidebar/DispenserSidebar.jsx";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const appointmentTypes = [
  { value: "CHECKUP", label: "Checkup" },
  { value: "TAKE_MEDICINE", label: "Take Medicine" },
  { value: "GET_ADVICE", label: "Get Advice" },
  { value: "REPORT_CHECKING", label: "Report Checking" },
  { value: "OTHER", label: "Other" },
];

const appointmentStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

const DispenserAppointments = () => {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const colors = tokens(theme.palette.mode);
  
  // State for appointment data
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTab, setCurrentTab] = useState(0);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  // Dialog controls
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  
  // Form states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentData, setAppointmentData] = useState({
    patientId: null,
    date: format(new Date(), 'yyyy-MM-dd'),
    time: "09:00:00",
    appointmentType: "CHECKUP",
    notes: "",
  });
  const [appointmentStatus, setAppointmentStatus] = useState("PENDING");
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Fetch appointments based on date range
  const fetchAppointments = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get(
        "http://localhost:8080/api/appointments/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("All appointments response:", response.data);
      
      
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }, []);
  
  // Fetch patients for appointment creation
  const fetchPatients = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    try {
      const response = await axios.get(
        "http://localhost:8080/api/patients",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch patients"
      );
    }
  }, []);
  
  // Fetch available time slots for a date
  const fetchAvailableSlots = useCallback(async (date) => {
    const token = localStorage.getItem("token");
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      const response = await axios.get(
        "http://localhost:8080/api/appointments/available-slots",
        {
          params: { date: formattedDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      
      let slots = response.data;
      const today = new Date();
      if (formattedDate === format(today, 'yyyy-MM-dd')) {
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        
        slots = slots.filter(slot => {
          const [hours, minutes] = slot.split(':').map(Number);
          return hours > currentHour || (hours === currentHour && minutes > currentMinute);
        });
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch available time slots"
      );
    }
  }, []);
  
  // Fetch daily queue for a specific date
  const fetchDailyQueue = useCallback(async (date) => {
    const token = localStorage.getItem("token");
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    try {
      const response = await axios.get(
        "http://localhost:8080/api/appointments/daily-queue",
        {
          params: { date: formattedDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log("Daily queue response:", response.data);
      
      
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching daily queue:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch daily appointment queue"
      );
    }
  }, []);
  
  // Create a new appointment
  const createAppointment = async () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    
    // Validate appointment date and time
    const formattedTime = appointmentData.time.substring(0, 5);
    if (isPastDateTime(appointmentData.date, formattedTime)) {
      toast.error("Cannot create appointments in the past");
      return;
    }
    
    const token = localStorage.getItem("token");
    
    try {
      // Format the time to ensure it's in HH:MM:SS format
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
      let formattedTime = appointmentData.time;
      
      if (!timeRegex.test(formattedTime)) {
        formattedTime = `${formattedTime}:00`;
      }
      
      const response = await axios.post(
        `http://localhost:8080/api/appointments/create-for-patient/${selectedPatient.id}`,
        {
          date: appointmentData.date,
          time: formattedTime,
          appointmentType: appointmentData.appointmentType,
          notes: appointmentData.notes
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success("Appointment created successfully!");
      setOpenCreateDialog(false);
      fetchDailyQueue(selectedDate);
      
      // Reset form
      setAppointmentData({
        patientId: null,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: "09:00:00",
        appointmentType: "CHECKUP",
        notes: "",
      });
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(
        error.response?.data?.message || "Failed to create appointment"
      );
    }
  };
  
  // Update appointment status
  const updateAppointmentStatus = async () => {
    if (!selectedAppointment) return;
    
    const token = localStorage.getItem("token");
    
    try {
      await axios.put(
        `http://localhost:8080/api/appointments/${selectedAppointment.id}/status`,
        { status: appointmentStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success("Appointment status updated successfully!");
      setOpenUpdateDialog(false);
      fetchDailyQueue(selectedDate);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update appointment status"
      );
    }
  };
  
  // Cancel all appointments for a date
  const cancelAllAppointments = async () => {
    const token = localStorage.getItem("token");
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      await axios.put(
        `http://localhost:8080/api/appointments/cancel-all-by-date/${formattedDate}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      toast.success(`All appointments for ${formattedDate} cancelled successfully!`);
      setOpenCancelDialog(false);
      fetchDailyQueue(selectedDate);
    } catch (error) {
      console.error("Error cancelling appointments:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel appointments"
      );
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    
    if (newValue === 0) {
      // Today's appointments
      setSelectedDate(new Date());
      fetchDailyQueue(new Date());
    } else if (newValue === 1) {
      // All appointments
      fetchAppointments();
    }
  };
  
  // Handle date change
  const handleDateChange = (newDate) => {
    // Don't allow selecting dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newDate < today) {
      toast.warning("Cannot view appointments for past dates");
      return;
    }
    
    setSelectedDate(newDate);
    fetchDailyQueue(newDate);
    fetchAvailableSlots(newDate);
  };
  
  // Initialize data on component mount
  useEffect(() => {
    fetchDailyQueue(selectedDate);
    fetchPatients();
    fetchAvailableSlots(selectedDate);
  }, [fetchDailyQueue, fetchPatients, fetchAvailableSlots, selectedDate]);
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Helper function to get appointment type label
  const getAppointmentTypeLabel = (type) => {
    const found = appointmentTypes.find(t => t.value === type);
    return found ? found.label : type;
  };
  
  // Helper function to get status label and color
  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case "CONFIRMED":
        color = "primary";
        break;
      case "COMPLETED":
        color = "success";
        break;
      case "CANCELLED":
        color = "error";
        break;
      case "NO_SHOW":
        color = "warning";
        break;
      default:
        color = "default";
    }
    
    return (
      <Chip 
        label={status} 
        color={color} 
        size="small" 
        sx={{ fontWeight: "bold" }}
      />
    );
  };
  
  // Helper function to get patient name
const getPatientName = (patient) => {
  if (!patient) return "N/A";
  
  console.log("Patient object structure:", patient);
  
  
  if (patient.name) return patient.name;
  
  
  if (patient.firstName || patient.lastName) {
    return `${patient.firstName || ""} ${patient.lastName || ""}`.trim() || "N/A";
  }
  
  
  if (patient.user) {
    if (patient.user.name) return patient.user.name;
    if (patient.user.firstName || patient.user.lastName) {
      return `${patient.user.firstName || ""} ${patient.user.lastName || ""}`.trim() || "N/A";
    }
  }
  
  
  if (typeof patient === 'number' || typeof patient === 'string') {
    return `Patient #${patient}`;
  }
  
  
  if (patient.id) return `Patient #${patient.id}`;
  
  
  return "N/A";
}
  
  // Check if date/time is in the past
  const isPastDateTime = (date, time) => {
    const now = new Date();
    const appointmentDate = new Date(date);
    
    // If date is in the past, return true
    if (appointmentDate.setHours(0, 0, 0, 0) < now.setHours(0, 0, 0, 0)) {
      return true;
    }
    
    // If it's today, check the time
    if (appointmentDate.setHours(0, 0, 0, 0) === now.setHours(0, 0, 0, 0)) {
      const [hours, minutes] = time.split(':').map(Number);
      const nowHours = new Date().getHours();
      const nowMinutes = new Date().getMinutes();
      
      // Compare hours and minutes
      if (hours < nowHours || (hours === nowHours && minutes <= nowMinutes)) {
        return true;
      }
    }
    
    return false;
  };
  
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" height="100vh" overflow="hidden">
          <Sidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
            <Topbar />

            <Box
              p={{ xs: "10px", md: "20px 30px" }}
              height="100%"
              sx={{
                backgroundColor: colors.primary[900],
                overflow: "auto",
              }}
            >
              <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">Appointment Management</Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => {
                      setOpenCreateDialog(true);
                      fetchAvailableSlots(selectedDate);
                    }}
                  >
                    Create Appointment
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setOpenCancelDialog(true)}
                  >
                    Cancel All Appointments
                  </Button>
                </Box>
              </Box>

              <Paper sx={{ mb: 3, p: 2, backgroundColor: colors.primary[400] }}>
                <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2} alignItems={{ xs: "stretch", md: "center" }}>
                  <Typography variant="h6" minWidth="120px">Select Date:</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={new Date()} 
                    />
                  </LocalizationProvider>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: { md: 2 } }}>
                    {appointments.length} appointments scheduled
                  </Typography>
                </Box>
              </Paper>

              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={currentTab} onChange={handleTabChange}>
                  <Tab label="Daily Queue" />
                  <Tab label="All Appointments" />
                </Tabs>
              </Box>

              {currentTab === 0 ? (
                <Paper sx={{ backgroundColor: colors.primary[400], overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Queue #</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Patient Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Time</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Notes</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.length > 0 ? (
                          appointments.map((appointment) => (
                            <TableRow key={appointment.id}>
                              <TableCell>{appointment.queueNumber}</TableCell>
                              <TableCell>{getPatientName(appointment.patient)}</TableCell>
                              <TableCell>{appointment.time}</TableCell>
                              <TableCell>{getAppointmentTypeLabel(appointment.appointmentType)}</TableCell>
                              <TableCell>{getStatusChip(appointment.appointmentStatus)}</TableCell>
                              <TableCell>{appointment.notes || "No notes"}</TableCell>
                              <TableCell>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setAppointmentStatus(appointment.appointmentStatus);
                                    setOpenUpdateDialog(true);
                                  }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Box py={3} display="flex" flexDirection="column" alignItems="center" gap={1}>
                                <EventBusy sx={{ fontSize: 50, color: colors.grey[500] }} />
                                <Typography variant="h6">No appointments scheduled for this date</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              ) : (
                <Paper sx={{ backgroundColor: colors.primary[400], overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Queue #</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Patient Name</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Time</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Type</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: "bold", backgroundColor: colors.primary[600] }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {appointments.length > 0 ? (
                          appointments
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((appointment) => (
                              <TableRow key={appointment.id}>
                                <TableCell>{appointment.date}</TableCell>
                                <TableCell>{appointment.queueNumber}</TableCell>
                                <TableCell>{getPatientName(appointment.patient)}</TableCell>
                                <TableCell>{appointment.time}</TableCell>
                                <TableCell>{getAppointmentTypeLabel(appointment.appointmentType)}</TableCell>
                                <TableCell>{getStatusChip(appointment.appointmentStatus)}</TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setAppointmentStatus(appointment.appointmentStatus);
                                      setOpenUpdateDialog(true);
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Box py={3}>
                                <Typography variant="h6">No appointments found</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={appointments.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </Paper>
              )}
            </Box>
          </Box>
        </Box>

        {/* Create Appointment Dialog */}
        <Dialog 
          open={openCreateDialog} 
          onClose={() => setOpenCreateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Appointment</DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <Autocomplete
                options={patients}
                getOptionLabel={(patient) => {
                  const name = `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
                  return patient.email ? `${name} (${patient.email})` : name;
                }}
                value={selectedPatient}
                onChange={(event, newValue) => {
                  setSelectedPatient(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    variant="outlined"
                    fullWidth
                    required
                    margin="normal"
                  />
                )}
              />
              
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Appointment Date"
                  value={new Date(appointmentData.date)}
                  onChange={(newValue) => {
                    const formattedDate = format(newValue, 'yyyy-MM-dd');
                    setAppointmentData({
                      ...appointmentData,
                      date: formattedDate
                    });
                    fetchAvailableSlots(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      margin="normal"
                      required
                    />
                  )}
                  minDate={new Date()} 
                />
              </LocalizationProvider>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="time-select-label">Time Slot</InputLabel>
                <Select
                  labelId="time-select-label"
                  value={appointmentData.time}
                  label="Time Slot"
                  onChange={(e) => setAppointmentData({
                    ...appointmentData,
                    time: e.target.value
                  })}
                >
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <MenuItem key={slot} value={slot}>
                        {slot.substring(0, 5)} 
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled value="">
                      No available slots for this date
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              
              <FormControl fullWidth margin="normal">
                <InputLabel id="appointment-type-label">Appointment Type</InputLabel>
                <Select
                  labelId="appointment-type-label"
                  value={appointmentData.appointmentType}
                  label="Appointment Type"
                  onChange={(e) => setAppointmentData({
                    ...appointmentData,
                    appointmentType: e.target.value
                  })}
                >
                  {appointmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                margin="normal"
                label="Notes (Optional)"
                fullWidth
                multiline
                rows={3}
                value={appointmentData.notes}
                onChange={(e) => setAppointmentData({
                  ...appointmentData,
                  notes: e.target.value
                })}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button 
              onClick={createAppointment}
              variant="contained"
              color="primary"
            >
              Create Appointment
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Appointment Status Dialog */}
        <Dialog 
          open={openUpdateDialog} 
          onClose={() => setOpenUpdateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Appointment Status</DialogTitle>
          <DialogContent>
            {selectedAppointment && (
              <Box mt={2}>
                <Typography variant="h6" gutterBottom>
                  Appointment Details
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color={colors.grey[300]}>
                      Patient
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {getPatientName(selectedAppointment.patient)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color={colors.grey[300]}>
                      Date & Time
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {selectedAppointment.date} at {selectedAppointment.time.substring(0, 5)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color={colors.grey[300]}>
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {getAppointmentTypeLabel(selectedAppointment.appointmentType)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color={colors.grey[300]}>
                      Queue Number
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      #{selectedAppointment.queueNumber}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="status-select-label">Appointment Status</InputLabel>
                  <Select
                    labelId="status-select-label"
                    value={appointmentStatus}
                    label="Appointment Status"
                    onChange={(e) => setAppointmentStatus(e.target.value)}
                  >
                    {appointmentStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenUpdateDialog(false)}>Cancel</Button>
            <Button 
              onClick={updateAppointmentStatus}
              variant="contained"
              color="primary"
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>

        {/* Cancel All Appointments Dialog */}
        <Dialog 
          open={openCancelDialog} 
          onClose={() => setOpenCancelDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cancel All Appointments</DialogTitle>
          <DialogContent>
            <Box mt={2} textAlign="center">
              <EventBusy sx={{ fontSize: 60, color: colors.redAccent[500], mb: 2 }} />
              
              <Typography variant="h5" color="error" gutterBottom>
                Warning: This action cannot be undone
              </Typography>
              
              <Typography variant="body1" mb={3}>
                Are you sure you want to cancel all appointments scheduled for <strong>{format(selectedDate, 'MMMM dd, yyyy')}</strong>?
              </Typography>
              
              <Typography variant="body2" color={colors.grey[300]}>
                This will mark all {appointments.length} appointments for this date as "CANCELLED".
                Patients will need to reschedule if they still wish to visit.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCancelDialog(false)}>
              Keep Appointments
            </Button>
            <Button 
              onClick={cancelAllAppointments}
              variant="contained"
              color="error"
              startIcon={<Cancel />}
            >
              Cancel All Appointments
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default DispenserAppointments;