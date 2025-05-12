import React, { useState, useEffect, useContext } from "react";
import { Box, IconButton, useTheme, Typography, Menu, MenuItem, Divider } from "@mui/material";
import { ColorModeContext, tokens } from "../../../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import Medicinetitle from "./DashboardTitle";
import UserService from "../../../../services/UserService";
import PatientProfilePopup from "../../Customer/Profile/PatientProfilePopup";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  
  // State for profile menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // State for profile dialog
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  // State for user name
  const [userName, setUserName] = useState("");
  
  // Profile menu handlers
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Handle profile edit
  const handleProfileEdit = () => {
    setProfileDialogOpen(true);
    handleClose();
  };
  
  // Handle logout
  const handleLogout = () => {
    UserService.logout();
    navigate("/login");
  };
  
  // Close profile dialog
  const handleCloseProfileDialog = () => {
    setProfileDialogOpen(false);
  };
  
  // Fetch user info on component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        if (UserService.isCustomer()) {
          const patientInfo = await UserService.getPatientProfile();
          setUserName(patientInfo.firstName + " " + patientInfo.lastName);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    
    fetchUserInfo();
  }, []);

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* Title */} 
      <Box display="flex" alignItems="center">
        <Medicinetitle />
      </Box>

      {/* Icons */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* Theme toggle */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* User profile */}
        <IconButton
          onClick={handleClick}
          aria-controls={open ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <PersonOutlinedIcon />
        </IconButton>
        
        {/* Profile Menu */}
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {userName && (
            <>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {userName}
                </Typography>
              </Box>
              <Divider />
            </>
          )}
          
          <MenuItem onClick={handleProfileEdit}>
            <AccountCircleIcon fontSize="small" sx={{ mr: 2 }} />
            Edit Profile
          </MenuItem>
          
          <MenuItem onClick={handleLogout}>
            <ExitToAppIcon fontSize="small" sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
        
        {/* Profile Dialog */}
        <PatientProfilePopup 
          open={profileDialogOpen} 
          handleClose={handleCloseProfileDialog} 
        />
      </Box>
    </Box>
  );
};

export default Topbar;