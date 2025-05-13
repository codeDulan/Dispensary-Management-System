import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserService from './services/UserService';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './components/Login Page/Doctor/Login';
import Signup from './components/Signup Page/SignupPage';

// Doctor Routes
import Dashboard_doctor from './pages/Doctor_Dashboard';
import Patient from './components/Dashboard/Doctor/Patient/Patient';
import AddPatient from './components/Dashboard/Doctor/Patient/AddPatient/AddPatient';
import QuickPrescription from './components/Dashboard/Doctor/Prescription/QuickPrescription/QuickPrescription';
import Medicine from './components/Dashboard/Doctor/Medicine/Medicine';
import Inventory from './components/Dashboard/Doctor/Inventory/Inventory';
import Prescription from './components/Dashboard/Doctor/Prescription/Prescription';
import Payment from './components/Dashboard/Doctor/Payment/PaymentList';

// Dispenser Routes
import Dashboard_dispenser from './pages/Dispenser_Dashboard';
import ViewPrescription from './components/Dashboard/Dispenser/ViewPrescription/ViewPrescription';
import DispenserAppointments from './components/Dashboard/Dispenser/Appoinments/DispenserAppointments';
// Customer Routes
import Dashboard_customer from './pages/Customer_Dashboard';
import Appoinment from './components/Dashboard/Customer/Appoinment/Appoinment';
import AddMedicine from './components/Dashboard/Doctor/Medicine/AddMedicine/AddMedicine';
import AddInventory from './components/Dashboard/Doctor/Inventory/AddInventory/AddInventory';
import PaymentList from './components/Dashboard/Dispenser/Payment/PaymentList';

const App = () => {
  // Protected Route Components
  const DoctorRoute = ({ element }) => {
    return UserService.doctorOnly() ? element : <Navigate to="/login" replace />;
  };

  const DispenserRoute = ({ element }) => {
    return UserService.isDispenser() ? element : <Navigate to="/login" replace />;
  };

  const CustomerRoute = ({ element }) => {
    return UserService.isCustomer() ? element : <Navigate to="/login" replace />;
  };

  return (
    <div className="app">
      <main className="content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Doctor Protected Routes */}
          <Route
            path="/dashboard"
            element={<DoctorRoute element={<Dashboard_doctor />} />}
          />
          <Route
            path="/medicine"
            element={<DoctorRoute element={<Medicine />} />}
          />
          <Route
            path="/inventory"
            element={<DoctorRoute element={<Inventory />} />}
          />
          <Route
            path="/patients"
            element={<DoctorRoute element={<Patient />} />}
          />
          <Route
            path="/prescriptions"
            element={<DoctorRoute element={<Prescription />} />}
          />
          <Route
            path="/payments"
            element={<DoctorRoute element={<Payment />} />}
          />
          <Route
            path="/addPatient"
            element={<DoctorRoute element={<AddPatient />} />}
          />
          <Route
            path="/addMedicine"
            element={<DoctorRoute element={<AddMedicine />} />}
          />
          <Route
            path="/addInventory"
            element={<DoctorRoute element={<AddInventory />} />}
          />
          <Route
            path="/quickPrescription"
            element={<DoctorRoute element={<QuickPrescription />} />}
          />

          {/* Dispenser Protected Routes */}
          <Route
            path="/dispenser/dashboard"
            element={<DispenserRoute element={<Dashboard_dispenser />} />}
          />
          <Route
            path="/dispenser/prescriptions"
            element={<DispenserRoute element={<ViewPrescription />} />}
          />
          <Route
            path="/dispenser/payments"
            element={<DispenserRoute element={<PaymentList />} />}
          />
          <Route
            path="/dispenser/appointments"
            element={<DispenserRoute element={<DispenserAppointments />} />}
          />

          {/* Customer Protected Routes */}
          <Route
            path="/customer/dashboard"
            element={<CustomerRoute element={<Dashboard_customer />} />}
          />
          <Route
            path="/customer/appointments"
            element={<CustomerRoute element={<Appoinment />} />}
          />

          {/* Fallback Routes */}
          <Route
            path="*"
            element={
              UserService.isAuthenticated() ? (
                UserService.isDoctor() ? (
                  <Navigate to="/dashboard" replace />
                ) : UserService.isDispenser() ? (
                  <Navigate to="/dispenser/dashboard" replace />
                ) : (
                  <Navigate to="/customer/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;