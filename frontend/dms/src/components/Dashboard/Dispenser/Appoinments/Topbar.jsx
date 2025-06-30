import React, { useState, useEffect, useContext } from "react";
import { Box, IconButton, useTheme, Typography, Badge, Menu, MenuItem, Divider, ListItemIcon, ListItemText } from "@mui/material";
import { ColorModeContext, tokens } from "../../../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import LockIcon from '@mui/icons-material/Lock';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Medicinetitle from "./ViewPaymentTitle";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import PasswordChangeDialog from "../../Doctor/PasswordChange/PasswordChangeDialog";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationOpen = Boolean(notificationAnchorEl);
  
  // State for user profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileOpen = Boolean(profileAnchorEl);
  
  // State for password change dialog
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  
  // Notification menu handlers
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    fetchNotifications();
  };
  
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Profile menu handlers
  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  
  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };
  
  // Handle change password
  const handleChangePassword = () => {
    setPasswordDialogOpen(true);
    handleProfileClose();
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  
  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/notifications/count", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };
  
  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:8080/api/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Remove from state
      setNotifications(notifications.filter(n => n.id !== id));
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:8080/api/notifications/read-all", {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setNotifications([]);
      setUnreadCount(0);
      handleNotificationClose();
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Get notifications on initial load and setup interval
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up interval to check for new notifications
    const intervalId = setInterval(() => {
      fetchUnreadCount();
    }, 60000); 
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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

        {/* Notification icon */}
        <IconButton 
          onClick={handleNotificationClick}
          aria-controls={notificationOpen ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={notificationOpen ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        
        {/* Notification Menu */}
        <Menu
          id="notification-menu"
          anchorEl={notificationAnchorEl}
          open={notificationOpen}
          onClose={handleNotificationClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 350,
              maxHeight: 400,
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
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="span">
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <IconButton onClick={markAllAsRead} size="small" sx={{ ml: 2 }}>
                <MarkEmailReadIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          <Divider />
          
          {notifications.length === 0 ? (
            <MenuItem sx={{ py: 2 }}>
              <ListItemText primary="No new notifications" />
            </MenuItem>
          ) : (
            notifications.map((notification) => (
              <MenuItem 
                key={notification.id} 
                onClick={() => markAsRead(notification.id)}
                sx={{ py: 1.5, borderLeft: 3, 
                  borderColor: notification.type === 'LOW_STOCK' ? 'warning.main' : 'error.main' 
                }}
              >
                <ListItemIcon>
                  {notification.type === 'LOW_STOCK' ? (
                    <InventoryOutlinedIcon color="warning" />
                  ) : (
                    <WarningAmberOutlinedIcon color="error" />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary={notification.medicineName}
                  secondary={notification.message}
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                  secondaryTypographyProps={{ style: { whiteSpace: 'normal' } }}
                />
              </MenuItem>
            ))
          )}
        </Menu>

        {/* User icon */}
        <IconButton
          onClick={handleProfileClick}
          aria-controls={profileOpen ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={profileOpen ? 'true' : undefined}
        >
          <PersonOutlinedIcon />
        </IconButton>
        
        {/* Profile Menu */}
        <Menu
          id="profile-menu"
          anchorEl={profileAnchorEl}
          open={profileOpen}
          onClose={handleProfileClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              width: 200,
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
          <MenuItem onClick={handleChangePassword}>
            <ListItemIcon>
              <LockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Change Password" />
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Password Change Dialog */}
      <PasswordChangeDialog 
        open={passwordDialogOpen}
        handleClose={() => setPasswordDialogOpen(false)}
      />
    </Box>
  );
};

export default Topbar;