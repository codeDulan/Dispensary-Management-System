import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  useTheme,
  CssBaseline,
  ThemeProvider,
  TextField,
  Button,
  MenuItem,
  Select,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ColorModeContext, useMode, tokens } from "../../../../theme";
import { mockDataTeam } from "../../../../data/mockData";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

import Topbar from "./Topbar";
import DoctorSidebar from "../Sidebar/DoctorSidebar";
import { Link } from "react-router-dom";

const Patient = () => {
  const [theme, colorMode] = useMode();
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // or sessionStorage
    axios
      .get("http://localhost:8080/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPatients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
      });
  }, []);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Mock Filter Options
  const filterOptions = ["All", "Low Stock", "Expired", "High Price"];


  // Columns Configuration
  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "firstName", headerName: "First Name", flex: 1 },
    { field: "age", headerName: "Age", width: 100 },
    { field: "gender", headerName: "Gender", width: 100 },
    { field: "address", headerName: "Address", flex: 1 },
    { field: "contact", headerName: "Contact", width: 150 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: () => (
        <Box display="flex" justifyContent="space-around">
          <Tooltip title="Edit">
            <IconButton>
              <EditIcon sx={{ color: iconColor }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Filtering Logic
  const filteredRows = patients.filter((row) =>
    row.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box display="flex" height="100vh">
          {/* Sidebar */}
          <DoctorSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            {/* Topbar */}
            <Topbar />

            {/* Search, Filter, and Add Button */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              {/* Search Input and Filter Dropdown */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                sx={{ width: "40%" }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search Patient"
                  size="small"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{ width: "40%" }}
                >
                  <MenuItem value="">Filter</MenuItem>
                  {filterOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* Add Drug Button */}
              <Link
                to="/addPatient"
                style={{ textDecoration: "none", width: "15%" }}
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: "100%", padding: "8px 16px" }}
                >
                  Add Patient
                </Button>
              </Link>
            </Box>

            {/* Medicine DataGrid */}
            <Box
              flex="1"
              p={2}
              bgcolor={theme.palette.background.default}
              overflow="auto"
            >
              <DataGrid rows={filteredRows} columns={columns} />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Patient;
