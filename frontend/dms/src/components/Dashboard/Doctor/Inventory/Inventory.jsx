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
  Snackbar,
  Alert,
  Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { ColorModeContext, useMode, tokens } from "../../../../theme";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Link } from "react-router-dom";

import Topbar from "./Topbar";
import DoctorSidebar from "../Sidebar/DoctorSidebar";

const Inventory = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data states
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch inventory items from API
  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/inventory", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Debug: Log the first item
        console.log("First inventory item:", response.data[0]);
        
        // Make sure all fields are properly defined for each item
        const normalizedData = response.data.map(item => ({
          ...item,
          buyPriceDisplay: formatCurrency(item.buyPrice),
          sellPriceDisplay: formatCurrency(item.sellPrice),
          receivedDateDisplay: formatDate(item.receivedDate)
        }));
        
        setInventoryItems(normalizedData);
      } catch (err) {
        console.error("Error fetching inventory items:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInventoryItems();
  }, []);

  // Delete inventory item
  const deleteInventoryItem = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this inventory item?")
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8080/api/inventory/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove from local state
        setInventoryItems(inventoryItems.filter((item) => item.id !== id));

        // Show success notification
        setNotification({
          open: true,
          message: "Inventory item deleted successfully",
          severity: "success",
        });
      } catch (err) {
        console.error("Error deleting inventory item:", err);
        setNotification({
          open: true,
          message:
            err.response?.data?.message || "Failed to delete inventory item",
          severity: "error",
        });
      }
    }
  };

  // Handle edit inventory item
  const handleEdit = (id) => {
    console.log("Edit inventory item with ID:", id);
    // You can navigate to an edit page or open a modal
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format price for display
  const formatCurrency = (amount) => {
    if (amount == null) return "N/A";
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  // Determine if an item is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  // Determine if an item is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  // Determine if an item is low in stock (less than 20% of original quantity)
  const isLowStock = (remaining, total) => {
    if (remaining == null || total == null) return false;
    return remaining > 0 && remaining / total < 0.2;
  };

  // Columns Configuration for inventory items
  // Columns Configuration for inventory items
const columns = [
  { field: "id", headerName: "ID", width: 60 },
  { field: "medicineName", headerName: "Medicine", flex: 1 },
  { field: "batchNumber", headerName: "Batch #", width: 120 },
  { 
    field: "expiryDate", 
    headerName: "Expiry Date", 
    width: 120,
    renderCell: (params) => {
      const expiryDate = params.row.expiryDate;
      const expired = isExpired(expiryDate);
      const expiringSoon = isExpiringSoon(expiryDate);
      
      return (
        <Box>
          {expired ? (
            <Chip label={formatDate(expiryDate)} color="error" size="small" />
          ) : expiringSoon ? (
            <Chip label={formatDate(expiryDate)} color="warning" size="small" />
          ) : (
            formatDate(expiryDate)
          )}
        </Box>
      );
    }
  },
  { 
    field: "quantity", 
    headerName: "Total Qty", 
    width: 100,
    type: "number"
  },
  { 
    field: "remainingQuantity", 
    headerName: "Remaining", 
    width: 100,
    type: "number",
    renderCell: (params) => {
      const quantity = params.row.quantity;
      const remaining = params.row.remainingQuantity;
      const lowStock = isLowStock(remaining, quantity);
      const outOfStock = remaining <= 0;
      
      return (
        <Box>
          {outOfStock ? (
            <Chip label="0" color="error" size="small" />
          ) : lowStock ? (
            <Chip label={remaining} color="warning" size="small" />
          ) : (
            remaining
          )}
        </Box>
      );
    }
  },
  { 
    field: "buyPrice", 
    headerName: "Buy Price", 
    width: 100,
    renderCell: (params) => {
      return formatCurrency(params.row.buyPrice);
    }
  },
  { 
    field: "sellPrice", 
    headerName: "Sell Price", 
    width: 100,
    renderCell: (params) => {
      return formatCurrency(params.row.sellPrice);
    }
  },
  { 
    field: "receivedDate", 
    headerName: "Received", 
    width: 120,
    renderCell: (params) => {
      return formatDate(params.row.receivedDate);
    }
  },
  {
    field: "actions",
    headerName: "Action",
    width: 120,
    renderCell: (params) => (
      <Box display="flex" justifyContent="space-around">
        <Tooltip title="Edit">
          <IconButton 
            aria-label="edit" 
            onClick={() => handleEdit(params.row.id)}
          >
            <EditIcon sx={{ color: iconColor }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete">
          <IconButton 
            color="error" 
            aria-label="delete"
            onClick={() => deleteInventoryItem(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  },
];

  // Filtering Logic - allow searching by medicine name or batch number
  const filteredRows = inventoryItems.filter(
    (item) =>
      item.medicineName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
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

            {/* Filter Options and Actions */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={2}
            >
              {/* Search Input */}
              <Box
                display="flex"
                alignItems="center"
                gap={2}
                sx={{ width: "40%" }}
              >
                <TextField
                  variant="outlined"
                  placeholder="Search by medicine name or batch number"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1 }}
                />
              </Box>

              {/* Quick Filter Buttons */}
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => {
                    const apiPath = searchQuery
                      ? "/low-stock?search=" + searchQuery
                      : "/low-stock";
                    setLoading(true);
                    const token = localStorage.getItem("token");
                    axios
                      .get(`http://localhost:8080/api/inventory${apiPath}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      .then((response) => {
                        setInventoryItems(response.data);
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.error("Error fetching low stock items:", err);
                        setError(err.message);
                        setLoading(false);
                      });
                  }}
                >
                  Low Stock
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    const apiPath = searchQuery
                      ? "/expiring?days=30&search=" + searchQuery
                      : "/expiring?days=30";
                    setLoading(true);
                    const token = localStorage.getItem("token");
                    axios
                      .get(`http://localhost:8080/api/inventory${apiPath}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      .then((response) => {
                        setInventoryItems(response.data);
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.error("Error fetching expiring items:", err);
                        setError(err.message);
                        setLoading(false);
                      });
                  }}
                >
                  Expiring Soon
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    const apiPath = searchQuery
                      ? "/available?search=" + searchQuery
                      : "/available";
                    setLoading(true);
                    const token = localStorage.getItem("token");
                    axios
                      .get(`http://localhost:8080/api/inventory${apiPath}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      .then((response) => {
                        setInventoryItems(response.data);
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.error("Error fetching available items:", err);
                        setError(err.message);
                        setLoading(false);
                      });
                  }}
                >
                  Available
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setLoading(true);
                    const token = localStorage.getItem("token");
                    axios
                      .get(`http://localhost:8080/api/inventory`, {
                        headers: { Authorization: `Bearer ${token}` },
                      })
                      .then((response) => {
                        setInventoryItems(response.data);
                        setLoading(false);
                      })
                      .catch((err) => {
                        console.error("Error fetching all items:", err);
                        setError(err.message);
                        setLoading(false);
                      });
                  }}
                >
                  All Items
                </Button>
              </Box>

              {/* Add Inventory Button */}
              <Link
                to="/addInventory"
                style={{ textDecoration: "none", width: "15%" }}
              >
                <Button
                  variant="contained"
                  color="success"
                  sx={{ width: "100%", padding: "8px 16px" }}
                >
                  Add Inventory
                </Button>
              </Link>
            </Box>

            {/* Inventory DataGrid */}
            <Box
              flex="1"
              p={2}
              bgcolor={theme.palette.background.default}
              overflow="auto"
            >
              {loading ? (
                <Typography>Loading inventory items...</Typography>
              ) : error ? (
                <Typography color="error">Error: {error}</Typography>
              ) : (
                <DataGrid
                  getRowId={(row) => row.id}
                  rows={filteredRows.map((row) => {
                    console.log("Processing row:", row);
                    return row;
                  })}
                  columns={columns}
                  loading={loading}
                  pageSizeOptions={[5, 10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10, page: 0 },
                    },
                  }}
                  disableRowSelectionOnClick
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default Inventory;
