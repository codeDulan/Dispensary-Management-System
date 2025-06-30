import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Alert,
  CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const PasswordChangeDialog = ({ open, handleClose }) => {
  // Form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Validation errors
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  // Notification states
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });

    // Clear error for the field being changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }

    // Validate password confirmation match
    if (name === "confirmPassword" || (name === "newPassword" && passwordData.confirmPassword)) {
      if (name === "newPassword" && value !== passwordData.confirmPassword) {
        setErrors({
          ...errors,
          confirmPassword: "Passwords do not match"
        });
      } else if (name === "confirmPassword" && value !== passwordData.newPassword) {
        setErrors({
          ...errors,
          confirmPassword: "Passwords do not match"
        });
      } else {
        setErrors({
          ...errors,
          confirmPassword: ""
        });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    };
    let isValid = true;

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      isValid = false;
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
      isValid = false;
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      isValid = false;
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = async () => {
    
    setSuccessMessage("");
    setErrorMessage("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Use the new password change endpoint that validates the current password
      const response = await axios.put(
        "http://localhost:8080/user/change-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.statusCode === 200) {
        setSuccessMessage(response.data.message || "Password changed successfully");
        
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        setErrorMessage(response.data.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg = error.response?.data?.message || "Failed to change password";
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Change Password
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <Box sx={{ pt: 1 }}>
          <TextField
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            error={!!errors.currentPassword}
            helperText={errors.currentPassword}
            disabled={loading}
          />

          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            error={!!errors.newPassword}
            helperText={errors.newPassword || "Password must be at least 8 characters"}
            disabled={loading}
          />

          <TextField
            margin="dense"
            label="Confirm New Password"
            type="password"
            fullWidth
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            disabled={loading}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Change Password"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordChangeDialog;