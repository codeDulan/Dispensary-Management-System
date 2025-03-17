import React, { useState } from "react";
import { ColorModeContext, useMode } from "../theme.js";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import Topbar from "../components/Dashboard/Doctor/Topbar/Topbar.jsx";
import DoctorSidebar from "../components/Dashboard/Doctor/Sidebar/DoctorSidebar.jsx";

const Dashboard = () => {
  const [theme, colorMode] = useMode();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        
        <Box display="flex" height="100vh">
          
          {/* Sidebar with controlled width */}
          <DoctorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            
            {/* Topbar at the top of the content area */}
            <Topbar style={{ zIndex: 1000 }} />

            {/* Page Content */}
            <Box flex="1" p={2} bgcolor="background.default" overflow="auto">
              Content Area
            </Box>

          </Box>
        </Box>
        
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Dashboard;
