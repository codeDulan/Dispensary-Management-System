import { Box, IconButton, useTheme, Typography, InputBase } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import Medicinetitle from "./MedicineTitle";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* Title */} 
      <Box display="flex" alignItems="center">
        <Medicinetitle />
      </Box>

      {/* Icons */}
      <Box display="flex" alignItems="center" gap={2}>
        {/* Search bar */}
        <Box
          display="flex"
          alignItems="center"
          backgroundColor={colors.primary[400]}
          borderRadius="3px"
          sx={{ height: "40px" }}
        >
          <InputBase
            sx={{
              ml: 2,
              flex: 1,
              height: "100%",
              "& .MuiInputBase-input": {
                padding: "8px",
              },
            }}
            placeholder="Search"
          />
          <IconButton type="button" sx={{ p: 1 }}>
            <SearchIcon />
          </IconButton>
        </Box>

        {/* Theme toggle */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* Notification icon */}
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>

        {/* Settings icon */}
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>

        {/* User icon */}
        <IconButton>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;