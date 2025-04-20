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

  const fetchAppointments = useCallback(async (startDate, endDate) => {
    const token = localStorage.getItem("token");

    try {
      const allAppointmentsResponse = await axios.get(
        "http://localhost:8080/api/appointments",
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const myAppointmentsResponse = await axios.get(
        "http://localhost:8080/api/appointments/my-appointments",
        {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const allAppointments = Array.isArray(allAppointmentsResponse.data)
        ? allAppointmentsResponse.data
        : [];

      const myAppointments = Array.isArray(myAppointmentsResponse.data)
        ? myAppointmentsResponse.data
        : [];

      const myAppointmentIds = new Set(myAppointments.map((appt) => appt.id));

      const formattedEvents = allAppointments.map((appt) => {
        return {
          id: appt.id,
          title: appt.notes || "No notes",
          start: `${appt.date}T${appt.time}`,
          end: `${appt.date}T${appt.time}`,
          allDay: false,
          extendedProps: {
            isCurrentUser: myAppointmentIds.has(appt.id),
            patientId: appt.patient?.id,
          },
        };
      });

      const myFormattedEvents = myAppointments.map((appt) => ({
        id: appt.id,
        title: appt.notes || "No notes",
        start: `${appt.date}T${appt.time}`,
        end: `${appt.date}T${appt.time}`,
        allDay: false,
        extendedProps: {
          isCurrentUser: true,
          patientId: appt.patient?.id,
        },
      }));

      const otherFormattedEvents = formattedEvents.filter(
        (event) => !myAppointmentIds.has(event.id)
      );

      setCurrentEvents(formattedEvents);
      setMyEvents(myFormattedEvents);
      setOtherEvents(otherFormattedEvents);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }, []);

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

    setCurrentAppointment({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      action: "create",
    });
    setOpenDialog(true);
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const isCurrentUserEvent = event.extendedProps.isCurrentUser;

    if (!isCurrentUserEvent) {
      toast.info(`This appointment is booked by another patient.`);
      return;
    }

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
        await axios.post(
          `http://localhost:8080/api/appointments`,
          { date, time, notes },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Appointment created!");

        if (calendarApi) {
          const view = calendarApi.view;
          const startDate = view.activeStart.toISOString().split("T")[0];
          const endDate = view.activeEnd.toISOString().split("T")[0];
          fetchAppointments(startDate, endDate);
        }
      } else {
        await axios.put(
          `http://localhost:8080/api/appointments/${currentAppointment.id}`,
          { date, time, notes },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success("Appointment updated!");

        if (calendarApi) {
          const view = calendarApi.view;
          const startDate = view.activeStart.toISOString().split("T")[0];
          const endDate = view.activeEnd.toISOString().split("T")[0];
          fetchAppointments(startDate, endDate);
        }
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

      toast.success("Appointment deleted!");

      if (calendarApi) {
        const view = calendarApi.view;
        const startDate = view.activeStart.toISOString().split("T")[0];
        const endDate = view.activeEnd.toISOString().split("T")[0];
        fetchAppointments(startDate, endDate);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Deletion failed");
    }

    setOpenDialog(false);
    setNotes("");
  };

  const handleTabChange = (event, newValue) => {
    setSidebarTab(newValue);
  };

  useEffect(() => {
    if (calendarApi) {
      const view = calendarApi.view;
      const startDate = view.activeStart.toISOString().split("T")[0];
      const endDate = view.activeEnd.toISOString().split("T")[0];
      fetchAppointments(startDate, endDate);
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
              <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                gap="20px"
                height="100%"
                overflow="hidden"
              >
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
                    flexDirection: "column",
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
                    <>
                      <Typography
                        variant="h5"
                        mb="15px"
                        display="flex"
                        alignItems="center"
                      >
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
                                  <Typography
                                    variant="body2"
                                    color={colors.grey[100]}
                                  >
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
                                  const calendarEvent =
                                    calendarApi.getEventById(event.id);
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
                          <Typography
                            variant="body2"
                            color={colors.grey[100]}
                            sx={{ textAlign: "center", mt: 2 }}
                          >
                            You have no appointments scheduled
                          </Typography>
                        )}
                      </List>
                    </>
                  ) : (
                    <>
                      <Typography
                        variant="h5"
                        mb="15px"
                        display="flex"
                        alignItems="center"
                      >
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
                                backgroundColor: event.extendedProps
                                  .isCurrentUser
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
                                      sx={{
                                        ml: 1,
                                        height: "16px",
                                        fontSize: "10px",
                                      }}
                                    />
                                  )}
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
                                  const calendarEvent =
                                    calendarApi.getEventById(event.id);
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
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: colors.greenAccent[500],
                          p: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: colors.greenAccent[500],
                            mr: 1,
                          }}
                        />
                        My Appointments
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: colors.grey[700],
                          p: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: colors.grey[700],
                            mr: 1,
                          }}
                        />
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
                    eventMinHeight="20px"
                    slotHeight="20px"
                    eventTimeFormat={{
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                    events={currentEvents}
                    eventContent={(eventInfo) => {
                      const isCurrentUserEvent =
                        eventInfo.event.extendedProps.isCurrentUser;
                      return (
                        <Box
                          sx={{
                            p: "0 2px",
                            fontSize: "0.7rem",
                            lineHeight: "1.2",
                            display: "flex",
                            alignItems: "center",
                            overflow: "hidden",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              marginRight: "4px",
                              minWidth: "40px",
                            }}
                          >
                            {eventInfo.timeText}
                          </span>
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              flex: 1,
                            }}
                          >
                            {eventInfo.event.title}
                          </span>
                          {!isCurrentUserEvent && (
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginLeft: "4px",
                                fontSize: "0.6rem",
                              }}
                            >
                              <Person sx={{ fontSize: "0.6rem", mr: "2px" }} />
                              Booked
                            </span>
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
                      const isCurrentUserEvent =
                        arg.event.extendedProps.isCurrentUser;
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
