import React, { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../../../theme";
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import SickOutlinedIcon from '@mui/icons-material/SickOutlined';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import UserIcon from "../../../../assets/user.jpg";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === to}
      style={{
        color: selected === to ? colors.greenAccent[500] : colors.grey[100], 
        display: "block",
        width: "100%",
        boxSizing: "border-box",
      }}
      onClick={() => setSelected(to)}
      icon={icon}
    >
      <Link
        to={to}
        style={{ textDecoration: "none", color: "inherit", width: "100%" }}
      >
        <Typography sx={{ fontFamily: "Roboto, sans-serif" }}>
          {title}
        </Typography>
      </Link>
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState(window.location.pathname);

  return (
    <Box
      sx={{

        "& .pro-sidebar-layout nav":{
            width: 0,
        },
        

        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
          height: "100% !important",
          zIndex: 1, 
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
          width: "100%",
          boxSizing: "border-box",
        },
        "& .pro-inner-item:hover": {
          color: "#71864E !important",
        },
        "& .pro-menu-item.active": {
          color: "#71864E !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} style={{ width: isCollapsed ? "80px" : "250px", position: "relative", }}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <IconButton
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  aria-label="toggle sidebar"
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* USER PROFILE */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  src={UserIcon}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0", fontFamily: "Roboto, sans-serif" }}
                >
                  Dr. Samarasinghe
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  MBBS
                </Typography>
              </Box>
            </Box>
          )}

          {/* MENU ITEMS */}
          {!isCollapsed && (
            <Box
              paddingLeft="10%"
              sx={{
                overflowY: "auto",
                overflowX: "hidden",
                height: "calc(100vh - 300px)",
                paddingLeft: "5px",
                 
                // Custom Scrollbar Styles
                "&::-webkit-scrollbar": {
                  width: "8px", // Width of the scrollbar
                },
                "&::-webkit-scrollbar-track": {
                  background: colors.primary[400], // Track color
                  borderRadius: "4px", // Rounded corners for the track
                },
                "&::-webkit-scrollbar-thumb": {
                  background: colors.greenAccent[500], // Thumb color
                  borderRadius: "4px", // Rounded corners for the thumb
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: colors.greenAccent[400], // Thumb color on hover
                },
                // Firefox Scrollbar Styles
                scrollbarWidth: "thin", // Firefox scrollbar width
                scrollbarColor: `${colors.greenAccent[500]} ${colors.primary[400]}`, // Firefox thumb and track color
              }}
            >
              {/* Dashboard */}
              <Item
                title="Dashboard"
                to="/dashboard"
                icon={<DashboardOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

              
              <Item
                title="Medicine"
                to="/medicine"
                icon={<MedicationOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Patient"
                to="/patients"
                icon={<SickOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Prescriptions"
                to="/prescriptions"
                icon={<NoteAddOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

             
              <Item
                title="Reports"
                to="/reports"
                icon={<PostAddOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Payments"
                to="/payments"
                icon={<MonetizationOnOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title="Logout"
                to="/logout"
                icon={<LogoutOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />

            
              
            </Box>
          )}
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;