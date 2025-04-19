import React, { useState, useEffect, useCallback } from "react";
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
  Tab,
  Tabs,
  Chip,
} from "@mui/material";
import { Edit, Delete, Person } from "@mui/icons-material";
import { tokens } from "../../../../theme.js";
import Topbar from "../../Doctor/Topbar/Topbar.jsx";
import CustomerSidebar from "../Sidebar/CustomerSidebar.jsx";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate } from "@fullcalendar/core";

const Appointment = () => {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [otherEvents, setOtherEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [notes, setNotes] = useState("");
  const [calendarApi, setCalendarApi] = useState(null);
  const [sidebarTab, setSidebarTab] = useState(0);

  // Fetch all appointments on component mount
  // Updated fetchAppointments function
const fetchAppointments = useCallback(async (startDate, endDate) => {
  const token = localStorage.getItem("token");
  const currentUserId = getCurrentUserId();

  try {
    const response = await axios.get("http://localhost:8080/api/appointments", {
      params: {
        startDate,
        endDate,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if response.data is an array
    const appointmentsArray = Array.isArray(response.data) ? response.data : [];
    
    // Debug the raw data
    console.log('Raw appointments data:', appointmentsArray);
    
    const events = appointmentsArray.map((appt) => {
      // Get patient email with better fallback logic
      let patientEmail = null;
      
      // Try different ways to access the email
      if (appt.patient && appt.patient.email) {
        patientEmail = appt.patient.email;
      } else if (getCurrentUserId() && appt.patient) {
        // If we have current user and this is their appointment
        patientEmail = getCurrentUserId();
      }
      
      // Normalize both values before comparing
      const normalizedPatientEmail = patientEmail ? patientEmail.toLowerCase().trim() : null;
      const normalizedCurrentUserId = currentUserId ? currentUserId.toLowerCase().trim() : null;
      
      // Check if this appointment belongs to the current user
      const isCurrentUserAppointment = normalizedPatientEmail === normalizedCurrentUserId;
      
      console.log(`Appointment ID ${appt.id} patient email:`, patientEmail);
      console.log(`Normalized patient email: "${normalizedPatientEmail}"`);
      console.log(`Normalized current user ID: "${normalizedCurrentUserId}"`);
      console.log(`Appointment ID ${appt.id} is current user:`, isCurrentUserAppointment);
      
      return {
        id: appt.id,
        title: appt.notes,
        start: `${appt.date}T${appt.time}`,
        end: `${appt.date}T${appt.time}`,
        allDay: false,
        extendedProps: {
          userId: patientEmail,
          isCurrentUser: isCurrentUserAppointment
        }
      };
    });
    
    // Split events into my events and other events
    // Make sure we're not duplicating events between the two arrays
    const myEvents = events.filter(event => event.extendedProps.isCurrentUser === true);
    const otherEvents = events.filter(event => event.extendedProps.isCurrentUser === false);
    
    setCurrentEvents(events);
    setMyEvents(myEvents);
    setOtherEvents(otherEvents);
    
    console.log(`Total events: ${events.length}`);
    console.log(`My events: ${myEvents.length}`, myEvents);
    console.log(`Other events: ${otherEvents.length}`, otherEvents);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    toast.error(error.response?.data?.message || "Failed to fetch appointments");
  }
}, []);
  
  // Updated getCurrentUserId function
const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  
  try {
    // For JWT decoding without a library
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    
    // Extract the email which is the user identifier
    // Try multiple possible fields where the email might be stored
    const userId = payload.sub || payload.email || payload.username;
    // Return userId in lowercase for consistent comparison
    return userId ? userId.toLowerCase().trim() : null;
  } catch (error) {
    console.error("Error parsing token:", error);
    return null;
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
      toast.error("Appointments can only be booked between 9:00 AM and 3:00 PM");
      return;
    }

    setCurrentAppointment({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      action: "create",
    });
    setOpenDialog(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const eventUserId = event.extendedProps.userId;
    const currentUserId = getCurrentUserId();
    const isCurrentUserEvent = event.extendedProps.isCurrentUser;
    
    // Debug output
    console.log('Event clicked:', event);
    console.log('Is current user event:', isCurrentUserEvent);
    console.log('Event user ID:', eventUserId);
    console.log('Current user ID:', currentUserId);
  
    // If not current user's event, show info toast and return
    if (!isCurrentUserEvent && eventUserId !== null) {
      toast.info(`This appointment is booked by another patient.`);
      return;
    }
  
    // If we get here, the event belongs to the current user
    setCurrentAppointment({
      id: event.id,
      start: event.startStr,
      end: event.endStr,
      title: event.title,
      action: "update",
    });
    setNotes(event.title);
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Please enter appointment notes");
      return;
    }
  
    const token = localStorage.getItem("token");
    const date = currentAppointment.start.split("T")[0];
    const time = currentAppointment.start.split("T")[1].substring(0, 5);
  
    try {
      if (currentAppointment.action === "create") {
        const response = await axios.post(
          `http://localhost:8080/api/appointments`,
          { date, time, notes },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const currentUserId = getCurrentUserId();
        
        // Add new event to calendar
        const newEvent = {
          id: response.data.id,
          title: notes,
          start: `${date}T${time}`,
          end: `${date}T${time}`,
          allDay: false,
          extendedProps: {
            userId: currentUserId,
            isCurrentUser: true,
            patientId: response.data.patient?.id
          }
        };
  
        // Update both the main events list and my events list
        setCurrentEvents([...currentEvents, newEvent]);
        setMyEvents([...myEvents, newEvent]);
        
        calendarApi.addEvent(newEvent);
        toast.success("Appointment created!");
      } else {
        await axios.put(
          `http://localhost:8080/api/appointments/${currentAppointment.id}`,
          { date, time, notes },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        // Update existing event
        const updatedEvent = { 
          id: currentAppointment.id,
          title: notes, 
          start: `${date}T${time}`, 
          end: `${date}T${time}`,
          extendedProps: {
            userId: getCurrentUserId(),
            isCurrentUser: true
          }
        };
        
        // Update in all relevant state arrays
        setCurrentEvents(currentEvents.map(event => 
          event.id === currentAppointment.id ? updatedEvent : event
        ));
        
        setMyEvents(myEvents.map(event => 
          event.id === currentAppointment.id ? updatedEvent : event
        ));
        
        // Update the calendar event
        const event = calendarApi.getEventById(currentAppointment.id);
        if (event) {
          event.setProp("title", notes);
          event.setDates(`${date}T${time}`, `${date}T${time}`);
        }
        
        toast.success("Appointment updated!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  
    setOpenDialog(false);
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

      // Remove event from all state arrays
      setCurrentEvents(currentEvents.filter(e => e.id !== currentAppointment.id));
      setMyEvents(myEvents.filter(e => e.id !== currentAppointment.id));
      
      // Remove from calendar
      const event = calendarApi.getEventById(currentAppointment.id);
      if (event) event.remove();
      
      toast.success("Appointment deleted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    }

    setOpenDialog(false);
    setNotes("");
  };
  
  // Handle tab change in sidebar
  const handleTabChange = (event, newValue) => {
    setSidebarTab(newValue);
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" height="100vh" overflow="hidden">
          {/* Sidebar */}
          <CustomerSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="hidden">
            <Topbar style={{ zIndex: 1000 }} />

            {/* Main Container */}
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
              {/* Calendar and Events Container */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                gap="20px"
                height="100%"
                overflow="hidden"
              >
                {/* Events Sidebar */}
                <Box
                  flex={{ xs: "0 0 auto", md: "1 1 25%" }}
                  backgroundColor={colors.primary[400]}
                  p="20px"
                  borderRadius="4px"
                  sx={{
                    minWidth: { xs: "100%", md: "250px" },
                    maxWidth: { md: "300px" },
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <Tabs 
                    value={sidebarTab} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ mb: 2 }}
                  >
                    <Tab label="My Appointments" />
                    <Tab label="All Appointments" />
                  </Tabs>
                  
                  {sidebarTab === 0 ? (
                    /* My Appointments Tab */
                    <>
                      <Typography variant="h5" mb="15px" display="flex" alignItems="center">
                        My Appointments
                        <Chip 
                          label={myEvents.length} 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }} 
                        />
                      </Typography>
                      <List sx={{ maxHeight: "100%", overflow: "auto" }}>
                        {myEvents.length > 0 ? (
                          myEvents.map((event) => (
                            <ListItem
                              key={event.id}
                              sx={{
                                backgroundColor: colors.greenAccent[500],
                                margin: "8px 0",
                                borderRadius: "4px",
                                "&:hover": {
                                  backgroundColor: colors.greenAccent[600],
                                },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography fontWeight="bold">
                                    {event.title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="body2" color={colors.grey[100]}>
                                    {formatDate(event.start, {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </Typography>
                                }
                              />
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  const calendarEvent = calendarApi.getEventById(event.id);
                                  if (calendarEvent) {
                                    calendarEvent.select();
                                    handleEventClick({ event: calendarEvent });
                                  }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </ListItem>
                          ))
                        ) : (
                          <Typography variant="body2" color={colors.grey[100]} sx={{ textAlign: 'center', mt: 2 }}>
                            You have no appointments scheduled
                          </Typography>
                        )}
                      </List>
                    </>
                  ) : (
                    /* All Appointments Tab */
                    <>
                      <Typography variant="h5" mb="15px" display="flex" alignItems="center">
                        All Appointments
                        <Chip 
                          label={currentEvents.length} 
                          size="small" 
                          color="primary" 
                          sx={{ ml: 1 }} 
                        />
                      </Typography>
                      <List sx={{ maxHeight: "100%", overflow: "auto" }}>
                        {currentEvents.map((event) => (
                          <ListItem
                            key={event.id}
                            sx={{
                              backgroundColor: event.extendedProps.isCurrentUser 
                                ? colors.greenAccent[500] 
                                : colors.grey[700],
                              margin: "8px 0",
                              borderRadius: "4px",
                              "&:hover": {
                                backgroundColor: event.extendedProps.isCurrentUser 
                                  ? colors.greenAccent[600] 
                                  : colors.grey[800],
                              },
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center">
                                  <Typography fontWeight="bold">
                                    {event.title}
                                  </Typography>
                                  {event.extendedProps.isCurrentUser && (
                                    <Chip 
                                      label="Mine" 
                                      size="small" 
                                      color="primary" 
                                      sx={{ ml: 1, height: '16px', fontSize: '10px' }} 
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <Typography variant="body2" color={colors.grey[100]}>
                                  {formatDate(event.start, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>
                              }
                            />
                            {event.extendedProps.isCurrentUser && (
                              <IconButton 
                                size="small" 
                                onClick={() => {
                                  const calendarEvent = calendarApi.getEventById(event.id);
                                  if (calendarEvent) {
                                    calendarEvent.select();
                                    handleEventClick({ event: calendarEvent });
                                  }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </>
                  )}
                </Box>

                {/* Calendar */}
                <Box
                  flex={{ xs: "1 1 auto", md: "1 1 75%" }}
                  sx={{
                    backgroundColor: colors.primary[400],
                    p: "20px",
                    borderRadius: "4px",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4">Appointment Calendar</Typography>
                    <Box display="flex" gap={1} mt={1}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: colors.greenAccent[500],
                        p: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: colors.greenAccent[500],
                          mr: 1
                        }} />
                        My Appointments
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        backgroundColor: colors.grey[700],
                        p: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.85rem'
                      }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          backgroundColor: colors.grey[700],
                          mr: 1
                        }} />
                        Other Appointments
                      </Box>
                    </Box>
                  </Box>
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
                    editable={true}
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
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    events={currentEvents}
                    eventContent={(eventInfo) => {
                      const isCurrentUserEvent = eventInfo.event.extendedProps.isCurrentUser;
                      return (
                        <Box sx={{ 
                          p: "2px 4px",
                          borderRadius: "2px",
                          width: "100%",
                          display: "flex",
                          flexDirection: "column"
                        }}>
                          <Typography variant="caption" fontWeight="bold">
                            {eventInfo.timeText}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                            {eventInfo.event.title}
                          </Typography>
                          {!isCurrentUserEvent && (
                            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                              <Person fontSize="small" sx={{ fontSize: '0.75rem', mr: 0.5 }} />
                              <Typography variant="caption">Booked</Typography>
                            </Box>
                          )}
                        </Box>
                      );
                    }}
                    datesSet={(arg) => {
                      const startDate = arg.startStr.split("T")[0];
                      const endDate = arg.endStr.split("T")[0];
                      fetchAppointments(startDate, endDate);
                    }}
                    eventDidMount={(arg) => {
                      // Style events differently based on ownership
                      const isCurrentUserEvent = arg.event.extendedProps.isCurrentUser;
                      if (!isCurrentUserEvent) {
                        arg.el.style.backgroundColor = colors.grey[700];
                        arg.el.style.borderColor = colors.grey[600];
                        arg.el.title = "This time slot is already booked";
                      } else {
                        arg.el.style.backgroundColor = colors.greenAccent[500];
                        arg.el.style.borderColor = colors.greenAccent[600];
                        arg.el.title = "Your appointment - Click to edit";
                      }
                    }}
                    ref={(ref) => {
                      if (ref) {
                        setCalendarApi(ref.getApi());
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Appointment Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>
            {currentAppointment?.action === "create"
              ? "Create New Appointment"
              : "Edit Appointment"}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Appointment Notes"
              type="text"
              fullWidth
              variant="outlined"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={4}
            />
            <Typography variant="body2" mt={2}>
              Date: {currentAppointment?.start.split("T")[0]}
            </Typography>
            <Typography variant="body2">
              Time: {currentAppointment?.start.split("T")[1].substring(0, 5)}
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