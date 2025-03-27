import React, { useState } from "react";
import { ColorModeContext, useMode } from "../../../../theme.js";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";

import { tokens } from "../../../../theme.js";
import Topbar from "../../Doctor/Topbar/Topbar.jsx";
import CustomerSidebar from "../Sidebar/CustomerSidebar.jsx";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { formatDate } from "@fullcalendar/core";

const Appoinment = () => {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);

  const handleDateClick = (selected) => {
    const title = prompt("Enter Event Title:");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };

  const handleEventClick = (selected) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${selected.event.title}'`
      )
    ) {
      selected.event.remove();
    }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box display="flex" height="100vh">
          {/* Sidebar */}
          <CustomerSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            <Topbar style={{ zIndex: 1000 }} />

            {/* Main Container with padding on sides */}
            <Box 
              p={{ xs: "10px", md: "20px 30px" }} // Responsive padding
              height="100%"
              sx={{
                backgroundColor: colors.primary[900],
                overflow: "auto",
              }}
            >
              {/* Calendar and Events Container */}
              <Box 
                display="flex" 
                flexDirection={{ xs: "column", md: "row" }} // Stack on mobile
                gap="20px" // Space between sections
                height="100%"
              >
                {/* Events Sidebar - 25% width on desktop, full width on mobile */}
                <Box
                  flex={{ xs: "1 1 auto", md: "1 1 25%" }}
                  backgroundColor={colors.primary[400]}
                  p="20px"
                  borderRadius="4px"
                  sx={{
                    minWidth: { xs: "100%", md: "250px" },
                    maxWidth: { md: "300px" },
                  }}
                >
                  <Typography variant="h5" mb="15px">Events</Typography>
                  <List sx={{ maxHeight: "70vh", overflow: "auto" }}>
                    {currentEvents.map((event) => (
                      <ListItem
                        key={event.id}
                        sx={{ 
                          backgroundColor: colors.greenAccent[500], 
                          margin: "8px 0", 
                          borderRadius: "4px",
                          '&:hover': {
                            backgroundColor: colors.greenAccent[600],
                          }
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
                              })}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Calendar - 75% width on desktop, full width on mobile */}
                <Box 
                  flex={{ xs: "1 1 auto", md: "1 1 75%" }}
                  sx={{
                    backgroundColor: colors.primary[400],
                    p: "20px",
                    borderRadius: "4px",
                  }}
                >
                  <FullCalendar
                    height="75vh"
                    plugins={[
                      dayGridPlugin,
                      timeGridPlugin,
                      listPlugin,
                      interactionPlugin,
                    ]}
                    headerToolbar={{
                      left: "prev,next today",
                      center: "title",
                      right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                    }}
                    initialView="dayGridMonth"
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    select={handleDateClick}
                    eventClick={handleEventClick}
                    eventsSet={(events) => setCurrentEvents(events)}
                    initialEvents={[
                      { 
                        id: "1234", 
                        title: "All Day Event", 
                        start: new Date().toISOString().split('T')[0],
                        color: colors.blueAccent[500]
                      },
                      { 
                        id: "4321", 
                        title: "Timed Event", 
                        start: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
                        end: new Date(new Date().setHours(new Date().getHours() + 3)).toISOString(),
                        color: colors.greenAccent[500]
                      },
                    ]}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Appoinment;