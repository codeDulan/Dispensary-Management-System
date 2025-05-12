import React, { useState, useEffect, useContext } from "react";
import { Box, IconButton, useTheme, Typography, Badge, Menu, MenuItem, Divider, ListItemIcon, ListItemText } from "@mui/material";
import { ColorModeContext, tokens } from "../../../../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import Medicinetitle from "./QuickPrescriptionTitle";
import axios from "axios";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  
  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Notification menu handlers
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };
  
  const handleClose = () => {
    setAnchorEl(null);
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
      handleClose();
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
    }, 60000); // Check every minute
    
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
          onClick={handleClick}
          aria-controls={open ? 'notification-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        
        {/* Notification Menu */}
        <Menu
          id="notification-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
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
        <IconButton>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;