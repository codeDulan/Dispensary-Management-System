import React, { useState } from "react";
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

import Topbar from "./Topbar";
import DoctorSidebar from "../Sidebar/DoctorSidebar";

const Medicine = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Mock Filter Options
  const filterOptions = ["All", "Low Stock", "Expired", "High Price"];

  // Mock Data (Replace with real data from backend)
  const mockMedicineData = [
    { id: 1, name: "Paracetamol", description: "Pain relief", quantity: 50, expiry: "2025-12-01", price: 10 },
    { id: 2, name: "Amoxicillin", description: "Antibiotic", quantity: 30, expiry: "2024-08-15", price: 15 },
    { id: 3, name: "Ibuprofen", description: "Anti-inflammatory", quantity: 40, expiry: "2026-02-10", price: 20 },
    { id: 4, name: "Cetrizine", description: "Allergy relief", quantity: 20, expiry: "2023-10-05", price: 8 },
  ];

  // Columns Configuration
  const columns = [
    { field: "id", headerName: "Drug ID", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    { field: "quantity", headerName: "Quantity", width: 120 },
    { field: "expiry", headerName: "Expiry Date", width: 150 },
    { field: "price", headerName: "Price", width: 120 },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      renderCell: () => (
        <Box display="flex" justifyContent="space-around">
          <Button variant="text" color="primary">✏️</Button>
          <Button variant="text" color="error">🗑️</Button>
        </Box>
      ),
    },
  ];

  // Filtering Logic
  const filteredRows = mockMedicineData.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <Box display="flex" height="100vh">
          {/* Sidebar */}
          <DoctorSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

          {/* Main Content Area */}
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            {/* Topbar */}
            <Topbar />

            {/* Search, Filter, and Add Button */}
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
              {/* Search Input and Filter Dropdown */}
              <Box display="flex" alignItems="center" gap={2} sx={{ width: "40%" }}>
                <TextField
                  variant="outlined"
                  placeholder="Search Drug"
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
              <Button variant="contained" color="success" onClick={() => alert("Add Drug Form")} sx={{ width: "15%", padding: "8px 16px" }}>
                Add Drug
              </Button>
            </Box>

            {/* Medicine DataGrid */}
            <Box flex="1" p={2} bgcolor={theme.palette.background.default} overflow="auto">
              <DataGrid rows={filteredRows} columns={columns} />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Medicine;