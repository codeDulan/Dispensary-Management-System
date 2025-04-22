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
import Topbar from "./Topbar";
import DoctorSidebar from "../../Sidebar/DoctorSidebar";
import UserService from "../../../../../services/UserService";

const initialValues = {
  medicineId: "",
  batchNumber: "",
  expiryDate: "",
  quantity: "",
  buyPrice: "",
  sellPrice: "",
  receivedDate: "",
};

const inventorySchema = yup.object().shape({
  medicineId: yup.number().required("Medicine ID is required"),
  batchNumber: yup.string().required("Batch number is required"),
  expiryDate: yup.date().required("Expiry date is required"),
  quantity: yup
    .number()
    .positive("Quantity must be positive")
    .required("Quantity is required"),
  buyPrice: yup
    .number()
    .min(0, "Must be a valid price")
    .required("Buy price is required"),
  sellPrice: yup
    .number()
    .min(0, "Must be a valid price")
    .required("Sell price is required"),
  receivedDate: yup.date().nullable(),
});

const AddInventory = () => {
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
      await UserService.addInventoryItem(values);
      alert("Inventory item added successfully!");
      resetForm();
    } catch (error) {
      console.error("Create Inventory Error:", error);
      alert(error.response?.data?.message || "Failed to add inventory item");
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
                validationSchema={inventorySchema}
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
                        label="Medicine ID"
                        name="medicineId"
                        type="number"
                        value={values.medicineId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touched.medicineId && !!errors.medicineId}
                        helperText={touched.medicineId && errors.medicineId}
                        sx={{ gridColumn: "span 4" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        label="Batch Number"
                        name="batchNumber"
                        value={values.batchNumber}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touched.batchNumber && !!errors.batchNumber}
                        helperText={touched.batchNumber && errors.batchNumber}
                        sx={{ gridColumn: "span 4" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        label="Expiry Date"
                        name="expiryDate"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={values.expiryDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touched.expiryDate && !!errors.expiryDate}
                        helperText={touched.expiryDate && errors.expiryDate}
                        sx={{ gridColumn: "span 2" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        label="Received Date"
                        name="receivedDate"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={values.receivedDate}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        sx={{ gridColumn: "span 2" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={values.quantity}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touched.quantity && !!errors.quantity}
                        helperText={touched.quantity && errors.quantity}
                        sx={{ gridColumn: "span 2" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        label="Buy Price"
                        name="buyPrice"
                        type="number"
                        value={values.buyPrice}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touched.buyPrice && !!errors.buyPrice}
                        helperText={touched.buyPrice && errors.buyPrice}
                        sx={{ gridColumn: "span 1" }}
                      />

                      <TextField
                        fullWidth
                        variant="filled"
                        label="Sell Price"
                        name="sellPrice"
                        type="number"
                        value={values.sellPrice}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={!!touched.sellPrice && !!errors.sellPrice}
                        helperText={touched.sellPrice && errors.sellPrice}
                        sx={{ gridColumn: "span 1" }}
                      />
                    </Box>

                    <Box display="flex" justifyContent="end" mt="20px">
                      <Button
                        type="submit"
                        color="secondary"
                        variant="contained"
                        sx={{ py: 1.5, px: 3 }}
                      >
                        Add Inventory
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

export default AddInventory;
