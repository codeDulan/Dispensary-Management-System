import React from 'react'
import { ColorModeContext, useMode } from '../theme.js'; 
import { ThemeProvider, CssBaseline } from '@mui/material';
import Topbar from '../components/Dashboard/Doctor/Topbar/Topbar.jsx';
// import Sidebar from '../components/Dashboard/Doctor/Sidebar/Sidebar.jsx';


const Dashboard = () => {
  const [theme, colorMode] = useMode();

  return (<ColorModeContext.Provider value={colorMode}>

    <ThemeProvider theme={theme}>

    <CssBaseline />

    <div className="dashboard">

      <Topbar />
      {/* <Sidebar /> */}


    </div>

    </ThemeProvider>

    </ColorModeContext.Provider>
  )
}

export default Dashboard