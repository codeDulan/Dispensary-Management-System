import {
  Box,
  Button,
  TextField,
  ThemeProvider,
  CssBaseline
} from "@mui/material";
import React, { useState } from "react";
import { ColorModeContext, useMode, tokens } from "../../../../../theme";
import { Form, Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Topbar from "./Topbar"; // Assuming Topbar is for medicine page
import DoctorSidebar from "../../Sidebar/DoctorSidebar";

import UserService from "../../../../../services/UserService";

const initialValues = {
  name: "",
  description: "",
  lethalDosagePerKg: "",
  weight: "", // Added new weight field
};

const medicineSchema = yup.object().shape({
  name: yup.string().required("Medicine name is required"),
  description: yup.string().required("Description is required"),
  lethalDosagePerKg: yup
    .number()
    .positive("Must be a positive number"),
    
  weight: yup
    .number()
    .positive("Must be a positive number")
    
});

const AddMedicine = () => {
  const [theme, colorMode] = useMode();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const handleFormSubmit = async (values, { resetForm }) => {
    if (!UserService.doctorOnly()) {
      alert("You must be logged in as a doctor to perform this action");
      return;
    }

    try {
      await UserService.createMedicine(values);
      alert("Medicine created successfully!");
      resetForm();
    } catch (error) {
      console.error("Create Medicine Error:", error);
      alert(error.response?.data?.message || "Failed to create medicine");
    }
  };

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" height="100vh">
          <DoctorSidebar
            isCollapsed={isCollapsed}
            setIsCollapsed={setIsCollapsed}
          />
          <Box display="flex" flexDirection="column" flex="1" overflow="auto">
            <Topbar />
            <Box m="20px">
              <Formik
                onSubmit={handleFormSubmit}
                initialValues={initialValues}
                validationSchema={medicineSchema}
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
                        label="Medicine Name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.name}
                        name="name"
                        error={!!touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                        sx={{ gridColumn: "span 4" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="text"
                        label="Description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.description}
                        name="description"
                        error={!!touched.description && !!errors.description}
                        helperText={touched.description && errors.description}
                        multiline
                        rows={3}
                        sx={{ gridColumn: "span 4" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="number"
                        label="Weight (mg)"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.weight}
                        name="weight"
                        error={!!touched.weight && !!errors.weight}
                        helperText={touched.weight && errors.weight}
                        sx={{ gridColumn: "span 2" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        type="number"
                        label="Lethal Dosage (per kg)"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.lethalDosagePerKg}
                        name="lethalDosagePerKg"
                        error={
                          !!touched.lethalDosagePerKg &&
                          !!errors.lethalDosagePerKg
                        }
                        helperText={
                          touched.lethalDosagePerKg &&
                          errors.lethalDosagePerKg
                        }
                        sx={{ gridColumn: "span 2" }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="end" mt="20px">
                      <Button
                        type="submit"
                        color="secondary"
                        variant="contained"
                        sx={{ py: 1.5, px: 3 }}
                      >
                        Create Medicine
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

export default AddMedicine;