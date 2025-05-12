import React, { useState, useEffect, useCallback } from "react";
import "./Appointment.css";
import axios from "axios";
import { ColorModeContext, useMode } from "../../../../theme.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  List,
  ListItem,
  ListItemText,
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
} from "@mui/material";
import { Edit, Delete, AccessTime, EventAvailable, EventBusy } from "@mui/icons-material";
import { tokens } from "../../../../theme.js";
import Topbar from "../../Doctor/Topbar/PatientTopbar.jsx";
import CustomerSidebar from "../Sidebar/CustomerSidebar.jsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate } from "@fullcalendar/core";

const appointmentTypes = [
  { value: "CHECKUP", label: "Checkup" },
  { value: "TAKE_MEDICINE", label: "Take Medicine" },
  { value: "GET_ADVICE", label: "Get Advice" },
  { value: "REPORT_CHECKING", label: "Report Checking" },
  { value: "OTHER", label: "Other" },
];

const Appointment = () => {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const colors = tokens(theme.palette.mode);
  const [myEvents, setMyEvents] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [appointmentType, setAppointmentType] = useState("CHECKUP");
  const [notes, setNotes] = useState("");
  const [calendarApi, setCalendarApi] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchAppointments = useCallback(async (startDate, endDate) => {
    const token = localStorage.getItem("token");

    try {
      // Fetch my appointments
      const myAppointmentsResponse = await axios.get(
        "http://localhost:8080/api/appointments/my-appointments",
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const myAppointments = Array.isArray(myAppointmentsResponse.data)
        ? myAppointmentsResponse.data
        : [];

      const myFormattedEvents = myAppointments.map((appt) => ({
        id: appt.id,
        title: getAppointmentTypeLabel(appt.appointmentType),
        start: `${appt.date}T${appt.time}`,
        end: `${appt.date}T${appt.time}`,
        allDay: false,
        extendedProps: {
          isCurrentUser: true,
          queueNumber: appt.queueNumber,
          appointmentType: appt.appointmentType,
          notes: appt.notes,
        },
      }));

      setMyEvents(myFormattedEvents);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }, []);

  const fetchAvailableSlots = async (date) => {
    console.log("fetchAvailableSlots called with date:", date);
    const token = localStorage.getItem("token");
    
    try {
      // Clear previous slots first
      setAvailableSlots([]);
      setBookedSlots([]);
      
      const response = await axios.get(
        "http://localhost:8080/api/appointments/available-slots",
        {
          params: { date },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("Available slots from server for date", date, ":", response.data);
      
      const slots = Array.isArray(response.data) ? response.data : [];
      
      // Create a set of all possible time slots from 9:00 to 14:55 with 5-minute intervals
      const allTimeSlots = [];
      const startTime = new Date(`${date}T09:00:00`);
      const endTime = new Date(`${date}T15:00:00`);
      
      // Generate all time slots
      let currentTime = new Date(startTime);
      while (currentTime < endTime) {
        // Format time as HH:MM:SS
        const hours = String(currentTime.getHours()).padStart(2, '0');
        const minutes = String(currentTime.getMinutes()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:00`;
        
        allTimeSlots.push(timeString);
        currentTime.setMinutes(currentTime.getMinutes() + 5);
      }
      
      // Create a set of available time slots for faster lookup
      const availableTimeSet = new Set(slots);
      
      // Create events for available slots
      const availableEvents = slots.map((timeSlot) => ({
        id: `available-${date}-${timeSlot}`,
        title: "Available",
        start: `${date}T${timeSlot}`,
        end: `${date}T${timeSlot}`,
        allDay: false,
        color: '#4caf50',  // Green color
        extendedProps: {
          isAvailableSlot: true
        }
      }));
      
      // Create events for booked slots (all slots not in available slots)
      const bookedEvents = allTimeSlots
        .filter(time => !availableTimeSet.has(time))
        .map(timeSlot => ({
          id: `booked-${date}-${timeSlot}`,
          title: "Booked",
          start: `${date}T${timeSlot}`,
          end: `${date}T${timeSlot}`,
          allDay: false,
          color: colors.grey[500],
          extendedProps: {
            isBookedSlot: true
          }
        }));
      
      console.log(`Generated ${availableEvents.length} available events and ${bookedEvents.length} booked events for date ${date}`);
      
      setAvailableSlots(availableEvents);
      setBookedSlots(bookedEvents);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch available time slots"
      );
    }
  };

  const handleDateSelect = async (selectInfo) => {
    const startTime = new Date(selectInfo.startStr);
    const hours = startTime.getHours();
    const minutes = startTime.getMinutes();
    const now = new Date();
  
    if (startTime < now) {
      toast.error("Cannot book appointments in the past");
      return;
    }
  
    if (hours < 9 || (hours === 15 && minutes > 0) || hours > 15) {
      toast.error(
        "Appointments can only be booked between 9:00 AM and 3:00 PM"
      );
      return;
    }
  
    // Format the selected time to match the format from the backend
    const selectedDate = selectInfo.startStr.split('T')[0];
    
    // Format hours and minutes with leading zeros if needed
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    // Create a time string that matches the backend format (HH:MM:00)
    const selectedTimeString = `${formattedHours}:${formattedMinutes}:00`;
    
    console.log("Selected time:", selectedTimeString);
    console.log("Available slot times:", availableSlots.map(slot => slot.start.split('T')[1]));
    
    // Check if the time is in the booked slots
    const isBooked = bookedSlots.some(slot => 
      slot.start.split('T')[1] === selectedTimeString
    );
    
    if (isBooked) {
      toast.error("This time slot is already booked");
      return;
    }
  
    // Check if the time is in the available slots
    const isAvailable = availableSlots.some(slot => 
      slot.start.split('T')[1] === selectedTimeString
    );
  
    if (!isAvailable) {
      toast.error("This time slot is not available");
      return;
    }
  
    setCurrentAppointment({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      action: "create",
    });
    setAppointmentType("CHECKUP");
    setNotes("");
    setOpenDialog(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    
    // If it's a booked slot, show a message
    if (event.extendedProps.isBookedSlot) {
      toast.info("This time slot is already booked");
      return;
    }
    
    // If it's an available slot, treat it as a selection
    if (event.extendedProps.isAvailableSlot) {
      handleDateSelect({
        startStr: event.startStr,
        endStr: event.endStr
      });
      return;
    }
  };

  const handleAppointmentClick = (event) => {
    setCurrentAppointment({
      id: event.id,
      start: event.start,
      end: event.end,
      queueNumber: event.extendedProps.queueNumber,
      action: "update",
    });
    setAppointmentType(event.extendedProps.appointmentType || "CHECKUP");
    setNotes(event.extendedProps.notes || "");
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!appointmentType) {
      toast.error("Please select an appointment type");
      return;
    }

    const token = localStorage.getItem("token");
    const date = currentAppointment.start.split("T")[0];
    const time = currentAppointment.start.split("T")[1].substring(0, 5);

    try {
      if (currentAppointment.action === "create") {
        await axios.post(
          `http://localhost:8080/api/appointments`,
          { date, time, appointmentType, notes },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Appointment created successfully!");
      } else {
        await axios.put(
          `http://localhost:8080/api/appointments/${currentAppointment.id}`,
          { date, time, appointmentType, notes },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Appointment updated successfully!");
      }

      if (calendarApi) {
        const view = calendarApi.view;
        const startDate = view.activeStart.toISOString().split("T")[0];
        const endDate = view.activeEnd.toISOString().split("T")[0];
        fetchAppointments(startDate, endDate);
        
        // Get the current date in local timezone
        const currentViewDate = calendarApi.getDate();
        const currentDateFormatted = 
          `${currentViewDate.getFullYear()}-${String(currentViewDate.getMonth() + 1).padStart(2, '0')}-${String(currentViewDate.getDate()).padStart(2, '0')}`;
        
        fetchAvailableSlots(currentDateFormatted);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }

    setOpenDialog(false);
    setAppointmentType("CHECKUP");
    setNotes("");
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `http://localhost:8080/api/appointments/${currentAppointment.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Appointment deleted successfully!");

      if (calendarApi) {
        const view = calendarApi.view;
        const startDate = view.activeStart.toISOString().split("T")[0];
        const endDate = view.activeEnd.toISOString().split("T")[0];
        fetchAppointments(startDate, endDate);
        
        // Also update available slots for the current date
        const currentDate = currentAppointment.start.split("T")[0];
        fetchAvailableSlots(currentDate);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    }

    setOpenDialog(false);
    setAppointmentType("CHECKUP");
    setNotes("");
  };

  const getAppointmentTypeLabel = (type) => {
    const found = appointmentTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getAppointmentTypeColor = (type) => {
    switch (type) {
      case "CHECKUP":
        return colors.greenAccent[500];
      case "TAKE_MEDICINE":
        return colors.blueAccent[500];
      case "GET_ADVICE":
        return colors.orangeAccent ? colors.orangeAccent[500] : "#ff9800";
      case "REPORT_CHECKING":
        return colors.purpleAccent ? colors.purpleAccent[500] : "#9c27b0";
      case "OTHER":
        return colors.grey[500];
      default:
        return colors.grey[500];
    }
  };

  useEffect(() => {
    if (calendarApi) {
      // Get the current date in the calendar view (in local timezone)
      const currentViewDate = calendarApi.getDate();
      
      // Format it as YYYY-MM-DD string in the local timezone
      const currentDateFormatted = 
        `${currentViewDate.getFullYear()}-${String(currentViewDate.getMonth() + 1).padStart(2, '0')}-${String(currentViewDate.getDate()).padStart(2, '0')}`;
      
      // Get the date range for appointments
      const view = calendarApi.view;
      const startDate = view.activeStart.toISOString().split("T")[0];
      const endDate = view.activeEnd.toISOString().split("T")[0];
      
      console.log("Initial calendar setup - fetching data for date:", currentDateFormatted);
      
      // Fetch appointments and available slots
      fetchAppointments(startDate, endDate);
      fetchAvailableSlots(currentDateFormatted);
      setSelectedDate(currentDateFormatted);
    }
  }, [calendarApi, fetchAppointments]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" height="100vh" overflow="hidden">
          <CustomerSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
            <Topbar style={{ zIndex: 1000 }} />

            <Box
              p={{ xs: "10px", md: "20px 30px" }}
              height="100%"
              sx={{
                backgroundColor: colors.primary[900],
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Grid container spacing={2} height="100%">
                {/* Left sidebar */}
                <Grid item xs={12} md={3} lg={3}>
                  <Paper
                    sx={{
                      p: 2,
                      height: "100%",
                      backgroundColor: colors.primary[400],
                      borderRadius: "4px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      variant="h5"
                      mb="15px"
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      My Appointments
                      <Chip
                        label={myEvents.length}
                        size="small"
                        color="primary"
                      />
                    </Typography>

                    {myEvents.length > 0 ? (
                      <List sx={{ overflow: "auto", flexGrow: 1 }}>
                        {myEvents.map((event) => (
                          <ListItem
                            key={event.id}
                            sx={{
                              backgroundColor: getAppointmentTypeColor(event.extendedProps.appointmentType),
                              margin: "8px 0",
                              borderRadius: "4px",
                              "&:hover": {
                                backgroundColor: colors.greenAccent[600],
                              },
                              cursor: "pointer"
                            }}
                            onClick={() => handleAppointmentClick(event)}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: colors.primary[800],
                                color: "white",
                                borderRadius: "50%",
                                width: "32px",
                                height: "32px",
                                fontWeight: "bold",
                                marginRight: "10px",
                              }}
                            >
                              {event.extendedProps.queueNumber}
                            </Box>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography fontWeight="bold">
                                    {event.title}
                                  </Typography>
                                  <Typography variant="caption" display="block">
                                    Queue #{event.extendedProps.queueNumber} - {formatDate(event.start, {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Typography
                                  variant="body2"
                                  color={colors.grey[100]}
                                >
                                  {formatDate(event.start, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </Typography>
                              }
                            />
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAppointmentClick(event);
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
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
                          height: "100%",
                          p: 2,
                          textAlign: "center",
                        }}
                      >
                        <EventAvailable sx={{ fontSize: 40, color: colors.grey[500], mb: 2 }} />
                        <Typography variant="body1" color={colors.grey[100]}>
                          You have no scheduled appointments
                        </Typography>
                        <Typography variant="body2" color={colors.grey[300]} mt={1}>
                          Click on an available time slot in the calendar to book an appointment
                        </Typography>
                      </Box>
                    )}
                    
                    <Box mt={2}>
                      <Typography variant="h6" gutterBottom>
                        Booking Instructions
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: colors.primary[500], 
                        p: 2, 
                        borderRadius: "4px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1
                      }}>
                        <Box display="flex" alignItems="top" gap={1}>
                          <Box sx={{ minWidth: "20px", textAlign: "center" }}>1.</Box>
                          <Typography variant="body2" color={colors.grey[100]}>
                            Look for slots marked "Available" in the calendar
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="top" gap={1}>
                          <Box sx={{ minWidth: "20px", textAlign: "center" }}>2.</Box>
                          <Typography variant="body2" color={colors.grey[100]}>
                            Click on your preferred available time slot
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="top" gap={1}>
                          <Box sx={{ minWidth: "20px", textAlign: "center" }}>3.</Box>
                          <Typography variant="body2" color={colors.grey[100]}>
                            Select appointment type and add optional notes
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="top" gap={1}>
                          <Box sx={{ minWidth: "20px", textAlign: "center" }}>4.</Box>
                          <Typography variant="body2" color={colors.grey[100]}>
                            Use the sidebar to view or edit your appointments
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Calendar section */}
                <Grid item xs={12} md={9} lg={9}>
                  <Paper
                    sx={{
                      p: 2,
                      height: "100%",
                      backgroundColor: colors.primary[400],
                      borderRadius: "4px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                  <Box sx={{ mb: 2 }}>
                      <Typography variant="h4">Appointment Calendar</Typography>
                      <Typography variant="body2" color={colors.grey[300]}>
                        Select a date and click on an available time slot to book your appointment
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          backgroundColor: 'rgba(76, 175, 80, 0.2)',
                          p: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}>
                          <EventAvailable sx={{ color: '#4caf50', fontSize: "1rem", mr: 1 }} />
                          Available Slots
                        </Box>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          backgroundColor: 'rgba(150, 150, 150, 0.2)',
                          p: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                        }}>
                          <EventBusy sx={{ color: colors.grey[500], fontSize: "1rem", mr: 1 }} />
                          Booked Slots
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box sx={{ 
                        flexGrow: 1, 
                        position: "relative",
                        "& .fc-event": {
                          cursor: "pointer"
                        },
                        "& .fc-timegrid-event": {
                          borderRadius: "4px"
                        }
                      }}>
                      <FullCalendar
                        plugins={[
                          dayGridPlugin,
                          timeGridPlugin,
                          interactionPlugin,
                          listPlugin,
                        ]}
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "timeGridDay,timeGridWeek,dayGridMonth",
                        }}
                        initialView="timeGridDay"
                        slotDuration="00:05:00"
                        slotMinTime="09:00:00"
                        slotMaxTime="15:00:00"
                        slotLabelInterval="00:30:00"
                        slotLabelFormat={{
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }}
                        allDaySlot={false}
                        nowIndicator={true}
                        editable={false}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={false}
                        businessHours={{
                          daysOfWeek: [1, 2, 3, 4, 5],
                          startTime: "09:00",
                          endTime: "15:00",
                        }}
                        height="100%"
                        eventMinHeight="20px"
                        eventTimeFormat={{
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }}
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        events={[...availableSlots, ...bookedSlots]} // Don't include user appointments here
                        eventContent={(eventInfo) => {
                          // For booked slots
                          if (eventInfo.event.extendedProps.isBookedSlot) {
                            return (
                              <Box
                                sx={{
                                  p: "0 2px",
                                  fontSize: "0.7rem",
                                  lineHeight: "1.2",
                                  display: "flex",
                                  alignItems: "center",
                                  color: colors.grey[200],
                                  backgroundColor: 'rgba(150, 150, 150, 0.4)',
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '2px',
                                  justifyContent: 'center'
                                }}
                              >
                                <EventBusy sx={{ fontSize: "0.8rem", marginRight: "2px" }} />
                                <span>Booked</span>
                              </Box>
                            );
                          }
                          
                          // For available slots
                          if (eventInfo.event.extendedProps.isAvailableSlot) {
                            return (
                              <Box
                                sx={{
                                  p: "0 2px",
                                  fontSize: "0.7rem",
                                  lineHeight: "1.2",
                                  display: "flex",
                                  alignItems: "center",
                                  color: '#006400',
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  width: '100%',
                                  height: '100%',
                                  borderRadius: '2px',
                                  cursor: 'pointer',
                                  justifyContent: 'center',
                                  '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.4)',
                                  }
                                }}
                              >
                                <EventAvailable sx={{ fontSize: "0.8rem", marginRight: "2px" }} />
                                <span>Available</span>
                              </Box>
                            );
                          }
                        }}
                        datesSet={(arg) => {
                          // Get the date in local timezone
                          const currentViewDate = arg.view.currentStart;
                          
                          // Format it as YYYY-MM-DD string in local timezone
                          const currentDateFormatted = 
                            `${currentViewDate.getFullYear()}-${String(currentViewDate.getMonth() + 1).padStart(2, '0')}-${String(currentViewDate.getDate()).padStart(2, '0')}`;
                          
                          console.log("Calendar date (local):", currentViewDate);
                          console.log("Fetching available slots for date:", currentDateFormatted);
                          
                          fetchAvailableSlots(currentDateFormatted);
                          setSelectedDate(currentDateFormatted);
                          
                          // Also update appointments
                          const startDate = arg.startStr.split("T")[0];
                          const endDate = arg.endStr.split("T")[0];
                          fetchAppointments(startDate, endDate);
                        }}
                        eventDidMount={(arg) => {
                          if (arg.event.extendedProps.isAvailableSlot) {
                            arg.el.title = "Available slot - Click to book";
                          } else if (arg.event.extendedProps.isBookedSlot) {
                            arg.el.title = "This time slot is already booked";
                          } 
                        }}
                        ref={(ref) => {
                          if (ref) {
                            setCalendarApi(ref.getApi());
                          }
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {currentAppointment?.action === "create"
              ? "Create New Appointment"
              : "Edit Appointment"}
          </DialogTitle>
          <DialogContent>
            {currentAppointment?.action === "update" && (
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                mb: 2,
                backgroundColor: colors.primary[300],
                p: 2,
                borderRadius: "4px"
              }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: colors.primary[800],
                    color: "white",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    marginRight: "16px",
                  }}
                >
                  {currentAppointment.queueNumber}
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    Your Queue Number
                  </Typography>
                  <Typography variant="body2">
                    Remember this number for your visit
                  </Typography>
                </Box>
              </Box>
            )}
            
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel id="appointment-type-label">Appointment Type</InputLabel>
              <Select
                labelId="appointment-type-label"
                value={appointmentType}
                label="Appointment Type"
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                {appointmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="dense"
              label="Additional Notes (Optional)"
              type="text"
              fullWidth
              variant="outlined"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={2}
            />
            
            <Typography variant="body2" mt={2}>
              Date: {currentAppointment?.start?.split("T")[0]}
            </Typography>
            <Typography variant="body2">
              Time: {currentAppointment?.start?.split("T")[1]?.substring(0, 5)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            {currentAppointment?.action === "update" && (
              <Button
                onClick={handleDelete}
                color="error"
                startIcon={<Delete />}
              >
                Delete
              </Button>
            )}
            <Button onClick={handleSubmit} color="primary" variant="contained">
              {currentAppointment?.action === "create" ? "Create" : "Update"}
            </Button>
          </DialogActions>
        </Dialog>

        <ToastContainer position="top-right" autoClose={3000} />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Appointment;