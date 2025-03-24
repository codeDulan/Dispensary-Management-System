import { Box, Button, TextField, ThemeProvider, CssBaseline } from "@mui/material";
import React, { useState } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../../theme";
import { Form, Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Topbar from "../AddPatient/Topbar";
import DoctorSidebar from "../../Sidebar/DoctorSidebar";

const initialValues = {
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    city: "",
    weight: "",
    dateOfBirth: "",
    gender: "",
    specialNotes: "",

};

const phoneRegExp = /^(?:(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?|(\d{2,3})[-. ]*(\d{4})[-. ]*(\d{4})|\d{10}|(?:\d{3}-)?\d{3}-\d{4})$/;


const userSchema = yup.object().shape({

  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  contact: yup.string().matches(phoneRegExp, "Phone number is not valid").required("required"),
  city: yup.string().required("required"),
  weight: yup.string().required("required"),
  dateOfBirth: yup.string().required("required"),
  gender: yup.string().required("required"),
  specialNotes: yup.string().required("required"),


});


const AddPatient = () => {


    const [theme, colorMode] = useMode();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);


    const isNonMobile = useMediaQuery("(min-width:600px)");

    const handleFormSubmit = (values) => {
        console.log(values);
    };

  return(
  
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


            <Box m="20px">


    <Formik
      onSubmit={handleFormSubmit}
      initialValues={initialValues}
      validationSchema={userSchema}
    >

    {({values, errors, touched, handleBlur, handleChange, handleSubmit}) => (
      <Form onSubmit={handleSubmit}>
        <Box 
        display="grid" 
        gap="30px" 
        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
        sx={{
          "& > div" : { gridColumn: isNonMobile ? undefined : "span 4" },
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
            sx={{ gridColumn: "span 2 "}}
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
            sx={{ gridColumn: "span 2 "}}
           />

            <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Date of Birth"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.dateOfBirth}
            name="dateOfBirth"
            error={!!touched.dateOfBirth && !!errors.dateOfBirth}
            helperText={touched.dateOfBirth && errors.dateOfBirth}
            sx={{ gridColumn: "span 1 "}}
           />

            <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Gender"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.gender}
            name="gender"
            error={!!touched.gender && !!errors.gender}
            helperText={touched.gender && errors.gender}
            sx={{ gridColumn: "span 1 "}}
           />

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
            sx={{ gridColumn: "span 1 "}}
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
            sx={{ gridColumn: "span 1 "}}
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
            sx={{ gridColumn: "span 4 "}}
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
            sx={{ gridColumn: "span 4 "}}
           />

            <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Special Notes"
            onBlur={handleBlur}
            onChange={handleChange}
            value={values.specialNotes}
            name="specialNotes"
            error={!!touched.specialNotes && !!errors.specialNotes}
            helperText={touched.specialNotes && errors.specialNotes}
            sx={{ gridColumn: "span 4 "}}
           />

        </Box>
      </Form>
    )}

    </Formik>


  </Box>

            

            
          </Box>
        </Box>

  </ThemeProvider>
      </ColorModeContext.Provider>


)}

export default AddPatient;