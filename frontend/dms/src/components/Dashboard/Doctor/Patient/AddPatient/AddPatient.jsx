import {
  Box,
  Button,
  TextField,
  ThemeProvider,
  CssBaseline,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import React, { useState } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../../theme";
import { Form, Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Topbar from "../AddPatient/Topbar";
import DoctorSidebar from "../../Sidebar/DoctorSidebar";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

import UserService from "../../../../../services/UserService";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  city: "",
  weight: "",
  dateOfBirth: "",
  gender: "",
  medicalNotes: "",
};

const phoneRegExp =
  /^(?:(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?|(\d{2,3})[-. ]*(\d{4})[-. ]*(\d{4})|\d{10}|(?:\d{3}-)?\d{3}-\d{4})$/;

const userSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup
    .string()
    .matches(phoneRegExp, "Phone number is not valid")
    .required("required"),
  city: yup.string().required("required"),
  weight: yup.string().required("required"),
  dateOfBirth: yup.string().required("required"),
  gender: yup.string().required("required"),
  medicalNotes: yup.string().required("required"),
});

const AddPatient = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values) => {
    console.log("Form submitted with values:", values);
    if (!UserService.doctorOnly()) {
      alert("You must be logged in as a doctor to perform this action");
      return;
    }

    try {
      setIsSubmitting(true);

      // Calculate age from dateOfBirth
      const age = calculateAge(values.dateOfBirth);

      const patientData = {
        firstName: values.firstName,
        lastName: values.lastName,
        address: values.address || values.city, // Combine or separate as needed
        contact: values.contact,
        email: values.email,
        gender: values.gender,
        age: age, // Calculated age
        weight: parseFloat(values.weight) || 0, // Convert to number
        medicalNotes: values.medicalNotes, // Field name must match
      };

      await UserService.doctorRegisterPatient(patientData);
      alert("Patient registered successfully!");
    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "Failed to register patient");
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of success/failure
    }
  };

  // Add this helper function
  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
    ) {
      age--;
    }
    return age;
  };

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

            <Box m="20px">
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={userSchema}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Box
                      display="grid"
                      gap="30px"
                      gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      sx={{
                        "& > div": {
                          gridColumn: isNonMobile ? undefined : "span 4",
                        },
                      }}
                    >
                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="First Name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.firstName}
                        name="firstName"
                        error={!!touched.firstName && !!errors.firstName}
                        helperText={touched.firstName && errors.firstName}
                        sx={{ gridColumn: "span 2 " }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Last Name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.lastName}
                        name="lastName"
                        error={!!touched.lastName && !!errors.lastName}
                        helperText={touched.lastName && errors.lastName}
                        sx={{ gridColumn: "span 2 " }}
                      />

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date of Birth"
                          value={
                            values.dateOfBirth
                              ? dayjs(values.dateOfBirth)
                              : null
                          }
                          onChange={(newValue) => {
                            handleChange({
                              target: {
                                name: "dateOfBirth",
                                value: newValue
                                  ? newValue.format("YYYY-MM-DD")
                                  : "",
                              },
                            });
                          }}
                          slotProps={{
                            textField: {
                              variant: "filled",
                              fullWidth: true,
                              error:
                                !!touched.dateOfBirth && !!errors.dateOfBirth,
                              helperText:
                                touched.dateOfBirth && errors.dateOfBirth,
                            },
                          }}
                          sx={{ gridColumn: "span 1" }}
                        />
                      </LocalizationProvider>

                      <FormControl
                        fullWidth
                        variant="filled"
                        sx={{ gridColumn: "span 1" }}
                      >
                        <InputLabel>Gender</InputLabel>
                        <Select
                          name="gender"
                          value={values.gender}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={!!touched.gender && !!errors.gender}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                          <MenuItem value="Prefer not to say">
                            Prefer not to say
                          </MenuItem>
                        </Select>
                        {touched.gender && errors.gender && (
                          <Box
                            sx={{
                              color: "error.main",
                              fontSize: "12px",
                              mt: 0.5,
                            }}
                          >
                            {errors.gender}
                          </Box>
                        )}
                      </FormControl>

                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Weight"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.weight}
                        name="weight"
                        error={!!touched.weight && !!errors.weight}
                        helperText={touched.weight && errors.weight}
                        sx={{ gridColumn: "span 1 " }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="City"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.city}
                        name="city"
                        error={!!touched.city && !!errors.city}
                        helperText={touched.city && errors.city}
                        sx={{ gridColumn: "span 1 " }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Email"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.email}
                        name="email"
                        error={!!touched.email && !!errors.email}
                        helperText={touched.email && errors.email}
                        sx={{ gridColumn: "span 4 " }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Mobile Number"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.contact}
                        name="contact"
                        error={!!touched.contact && !!errors.contact}
                        helperText={touched.contact && errors.contact}
                        sx={{ gridColumn: "span 4 " }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Medical Notes"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.medicalNotes}
                        name="medicalNotes"
                        error={!!touched.medicalNotes && !!errors.medicalNotes}
                        helperText={touched.medicalNotes && errors.medicalNotes}
                        sx={{ gridColumn: "span 4 " }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="end" mt="20px">
                      <Button
                        type="submit"
                        color="secondary"
                        variant="contained"
                        disabled={isSubmitting} // Disable the button while submitting
                        sx={{ py: 1.5, px: 3 }}
                      >
                        {isSubmitting ? "Creating..." : "Create New User"}
                      </Button>
                    </Box>
                  </Form>
                )}
              </Formik>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default AddPatient;
