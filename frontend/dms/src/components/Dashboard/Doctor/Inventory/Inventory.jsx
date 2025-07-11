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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
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

import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

const Inventory = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const iconColor = theme.palette.mode === "dark" ? "#fff" : "#000";
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Data states
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState({
    id: null,
    medicineName: "",
    medicineWeight: "",
    batchNumber: "",
    expiryDate: "",
    quantity: "",
    sellPrice: "",
    buyPrice: "",
  });

  // Notification states
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Fetch inventory items from API
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async (apiPath = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/inventory${apiPath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Process inventory data
      const normalizedData = response.data.map((item) => {
        const medicineWeight =
          item.medicineWeight ||
          (item.medicine && item.medicine.weight) ||
          null;

        return {
          ...item,
          buyPriceDisplay: formatCurrency(item.buyPrice),
          sellPriceDisplay: formatCurrency(item.sellPrice),
          receivedDateDisplay: formatDate(item.receivedDate),
          medicineWeight: medicineWeight,
        };
      });

      setInventoryItems(normalizedData);

      // Check for critical inventory items and trigger notifications if not already triggered
      checkForCriticalItems(normalizedData);
    } catch (err) {
      console.error("Error fetching inventory items:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkForCriticalItems = async (items) => {
    // Find items that need attention
    const lowStockItems = items.filter(
      (item) =>
        item.remainingQuantity > 0 &&
        item.remainingQuantity / item.quantity < 0.2
    );

    const expiringItems = items.filter((item) => {
      if (!item.expiryDate) return false;
      const today = new Date();
      const expiry = new Date(item.expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays > 0;
    });

    // Only trigger check if we found critical items AND we haven't checked recently (in the last hour)
    if (
      (lowStockItems.length > 0 || expiringItems.length > 0) &&
      shouldCheckNotifications()
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          "http://localhost:8080/api/notifications/check-now",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update the last check timestamp
        setLastNotificationCheck(new Date());
      } catch (err) {
        console.error("Error triggering notification check:", err);
      }
    }
  };

  
  const shouldCheckNotifications = () => {
    
    if (!lastNotificationCheck) {
      return true;
    }

    const now = new Date();
    const hoursSinceLastCheck =
      (now - lastNotificationCheck) / (1000 * 60 * 60);

    // Only check if it's been more than 1 hour since the last check
    return hoursSinceLastCheck >= 1;
  };

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
    const itemToEdit = inventoryItems.find((item) => item.id === id);
    if (itemToEdit) {
      
      console.log("Editing item:", itemToEdit);

      setEditItem({
        id: itemToEdit.id,
        medicineName: itemToEdit.medicineName || "",
        medicineWeight: itemToEdit.medicineWeight || "",
        batchNumber: itemToEdit.batchNumber || "",
        expiryDate: itemToEdit.expiryDate
          ? itemToEdit.expiryDate.substring(0, 10)
          : "", 
        quantity: itemToEdit.quantity || "",
        sellPrice: itemToEdit.sellPrice || "",
        buyPrice: itemToEdit.buyPrice || "",
        remainingQuantity: itemToEdit.remainingQuantity || "",
      });
      setEditDialogOpen(true);
    }
  };

  
  const handleEditDialogClose = () => {
    setEditDialogOpen(false);
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    // Convert numeric values to numbers for the API
    const parsedValue =
      (name === "quantity" || name === "sellPrice" || name === "buyPrice") &&
      value !== ""
        ? parseFloat(value)
        : value;

    setEditItem({
      ...editItem,
      [name]: parsedValue,
    });
  };

  // Handle submit edit
  const handleSubmitEdit = async () => {
    try {
      const token = localStorage.getItem("token");

      
      const dataToSend = {
        batchNumber: editItem.batchNumber,
        expiryDate: editItem.expiryDate,
        sellPrice: editItem.sellPrice,
        buyPrice: editItem.buyPrice,
      };

      const response = await axios.put(
        `http://localhost:8080/api/inventory/${editItem.id}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      
      fetchInventoryItems();

      
      setEditDialogOpen(false);
      setNotification({
        open: true,
        message: "Inventory item updated successfully",
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating inventory item:", err);
      setNotification({
        open: true,
        message:
          err.response?.data?.message || "Failed to update inventory item",
        severity: "error",
      });
    }
  };

  
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  
  const formatCurrency = (amount) => {
    if (amount == null) return "N/A";
    return `Rs. ${parseFloat(amount).toFixed(2)}`;
  };

  // Determine if an item is expiring soon (within 90 days)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays > 0;
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
  const columns = [
    { field: "id", headerName: "ID", width: 60 },
    {
      field: "medicine",
      headerName: "Medicine",
      flex: 1,
      renderCell: (params) => {
        const medicineName = params.row.medicineName || "Unknown";
        const medicineWeight = params.row.medicineWeight;

        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2">{medicineName}</Typography>
            {medicineWeight && (
              <Typography variant="caption" color="text.secondary">
                {medicineWeight} mg
              </Typography>
            )}
          </Box>
        );
      },
    },
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
              <Chip
                label={formatDate(expiryDate)}
                color="warning"
                size="small"
              />
            ) : (
              formatDate(expiryDate)
            )}
          </Box>
        );
      },
    },
    {
      field: "quantity",
      headerName: "Total Qty",
      width: 100,
      type: "number",
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
      },
    },
    {
      field: "buyPrice",
      headerName: "Buy Price",
      width: 100,
      renderCell: (params) => {
        return formatCurrency(params.row.buyPrice);
      },
    },
    {
      field: "sellPrice",
      headerName: "Sell Price",
      width: 100,
      renderCell: (params) => {
        return formatCurrency(params.row.sellPrice);
      },
    },
    {
      field: "receivedDate",
      headerName: "Received",
      width: 120,
      renderCell: (params) => {
        return formatDate(params.row.receivedDate);
      },
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
                  startIcon={<InventoryOutlinedIcon />}
                  onClick={() => {
                    const apiPath = searchQuery
                      ? "/low-stock?search=" + searchQuery
                      : "/low-stock";
                    fetchInventoryItems(apiPath);
                  }}
                >
                  Low Stock
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<WarningAmberOutlinedIcon />}
                  onClick={() => {
                    const apiPath = searchQuery
                      ? "/expiring?days=2&search=" + searchQuery
                      : "/expiring?days=2";
                    fetchInventoryItems(apiPath);
                  }}
                >
                  Expiring Soon
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: colors.primary[100],
                    borderColor: colors.primary[100],
                    "&:hover": {
                      backgroundColor: colors.primary[400],
                      color: "white",
                    },
                  }}
                  onClick={() => {
                    const apiPath = searchQuery
                      ? "/available?search=" + searchQuery
                      : "/available";
                    fetchInventoryItems(apiPath);
                  }}
                >
                  Available
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    color: colors.primary[100],
                    borderColor: colors.primary[100],
                    "&:hover": {
                      backgroundColor: colors.primary[400],
                      color: "white",
                    },
                  }}
                  onClick={() => {
                    fetchInventoryItems("");
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
                    
                    console.log(
                      `Row ${row.id} medicine: ${row.medicineName}, weight: ${row.medicineWeight}`
                    );

                    
                    return {
                      ...row,
                      medicineName: row.medicineName || "Unknown",
                      
                      medicineWeight:
                        row.medicineWeight ||
                        (row.medicine && row.medicine.weight) ||
                        null,
                    };
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

        {/* Edit Inventory Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={handleEditDialogClose}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Inventory Item</DialogTitle>
          <DialogContent>
            <Box
              component="form"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 2,
              }}
            >
              {/* Display Medicine Name (read-only) */}
              <TextField
                label="Medicine"
                value={`${editItem.medicineName}${
                  editItem.medicineWeight
                    ? ` (${editItem.medicineWeight} mg)`
                    : ""
                }`}
                InputProps={{
                  readOnly: true,
                }}
                variant="filled"
                fullWidth
              />

              <TextField
                label="Batch Number"
                name="batchNumber"
                value={editItem.batchNumber}
                onChange={handleEditFormChange}
                fullWidth
              />

              <TextField
                label="Expiry Date"
                name="expiryDate"
                type="date"
                value={editItem.expiryDate}
                onChange={handleEditFormChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              {/* Display Quantity (read-only) */}
              <TextField
                label="Total Quantity"
                value={editItem.quantity}
                InputProps={{
                  readOnly: true,
                }}
                variant="filled"
                fullWidth
              />

              {/* Display Remaining Quantity (read-only) */}
              <TextField
                label="Remaining Quantity"
                value={editItem.remainingQuantity}
                InputProps={{
                  readOnly: true,
                }}
                variant="filled"
                fullWidth
              />

              <TextField
                label="Buy Price"
                name="buyPrice"
                type="number"
                value={editItem.buyPrice}
                onChange={handleEditFormChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Rs.</InputAdornment>
                  ),
                }}
                fullWidth
              />

              <TextField
                label="Sell Price"
                name="sellPrice"
                type="number"
                value={editItem.sellPrice}
                onChange={handleEditFormChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">Rs.</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button
              onClick={handleSubmitEdit}
              variant="contained"
              color="primary"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>

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