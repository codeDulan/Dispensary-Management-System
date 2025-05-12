import React, { useState, useEffect } from "react";
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Grid, 
  MenuItem, 
  Tab, 
  Tabs, 
  Typography, 
  IconButton, 
  Alert, 
  CircularProgress 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UserService from "../../../../services/UserService";

// TabPanel component for profile tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientProfilePopup = ({ open, handleClose }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    address: "",
    contact: "",
    gender: "",
    age: "",
    weight: "",
    medicalNotes: ""
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Password validation
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Fetch profile data when component mounts
  useEffect(() => {
    if (open) {
      fetchProfileData();
    }
  }, [open]);
  
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await UserService.getPatientFullProfile();
      setProfileData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        nic: data.nic || "",
        address: data.address || "",
        contact: data.contact || "",
        gender: data.gender || "",
        age: data.age || "",
        weight: data.weight || "",
        medicalNotes: data.medicalNotes || ""
      });
    } catch (error) {
      setErrorMessage("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Clear messages when switching tabs
    setSuccessMessage("");
    setErrorMessage("");
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error for the field being changed
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ""
      });
    }
    
    // Validate confirm password match
    if (name === "confirmPassword" || (name === "newPassword" && passwordData.confirmPassword)) {
      if (name === "newPassword" && value !== passwordData.confirmPassword) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: "Passwords do not match"
        });
      } else if (name === "confirmPassword" && value !== passwordData.newPassword) {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: "Passwords do not match"
        });
      } else {
        setPasswordErrors({
          ...passwordErrors,
          confirmPassword: ""
        });
      }
    }
  };
  
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    };
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }
    
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    
    setPasswordErrors(errors);
    
    // Return true if no errors
    return !Object.values(errors).some(error => error);
  };
  
  const handleUpdateProfile = async () => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      await UserService.updatePatientProfile(profileData);
      setSuccessMessage("Profile updated successfully");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      await UserService.changePatientPassword(passwordData);
      setSuccessMessage("Password changed successfully");
      // Reset password form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Your Profile
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
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
          <Tab label="Edit Profile" />
          <Tab label="Change Password" />
        </Tabs>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mx: 3, mt: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert severity="error" sx={{ mx: 3, mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="NIC"
              name="nic"
              value={profileData.nic}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Contact"
              name="contact"
              value={profileData.contact}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
              inputProps={{ maxLength: 10 }}
              helperText="10 digit number"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Address"
              name="address"
              value={profileData.address}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="Gender"
              name="gender"
              value={profileData.gender || ""}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
            >
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Age"
              name="age"
              type="number"
              value={profileData.age}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
              inputProps={{ min: 0, max: 120 }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={profileData.weight}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
              inputProps={{ step: "0.1" }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Medical Notes"
              name="medicalNotes"
              value={profileData.medicalNotes}
              onChange={handleProfileChange}
              fullWidth
              margin="dense"
              multiline
              rows={4}
            />
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword || "Password must be at least 8 characters"}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              fullWidth
              margin="normal"
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
            />
          </Grid>
        </Grid>
      </TabPanel>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined" color="secondary">
          Cancel
        </Button>
        {tabValue === 0 && (
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            Update Profile
          </Button>
        )}
        {tabValue === 1 && (
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            Change Password
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PatientProfilePopup;