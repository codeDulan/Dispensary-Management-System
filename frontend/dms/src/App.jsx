import React from 'react';
import Login from './components/Login Page/Doctor/Login.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { Routes, Route } from 'react-router-dom';
import Dashboard_doctor from './pages/Doctor_Dashboard.jsx';
import Dashboard_dispenser from './pages/Dispenser_Dashboard.jsx';
import Dashboard_customer from './pages/Customer_Dashboard.jsx';
import Patient from './components/Dashboard/Doctor/Patient/Patient.jsx';
import AddPatient from './components/Dashboard/Doctor/Patient/AddPatient/AddPatient.jsx';
import QuickPrescription from './components/Dashboard/Doctor/Prescription/QuickPrescription/QuickPrescription.jsx';
import Medicine from './components/Dashboard/Doctor/Medicine/Medicine.jsx';
import Prescription from './components/Dashboard/Doctor/Prescription/Prescription.jsx';
import Payment from './components/Dashboard/Doctor/Payment/Payment.jsx';
import ViewPrescription from './components/Dashboard/Dispenser/ViewPrescription/ViewPrescription.jsx';
import Appoinment from './components/Dashboard/Customer/Appoinment/Appoinment.jsx';
import Signup from './components/Signup Page/SignupPage.jsx';

const App = () => {
  

  return (
    
        <div className="app">
          <main className="content">
            <Routes>
              <Route index element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard_doctor />} />
              <Route path="/dispenser/dashboard" element={<Dashboard_dispenser />} />
              <Route path="/customer/dashboard" element={<Dashboard_customer />} />
              <Route path="/customer/appoinments" element={<Appoinment />} />
              <Route path="/medicine" element={<Medicine />} />
              <Route path="/patients" element={<Patient />} />
              <Route path="/prescriptions" element={<Prescription />} />
              <Route path="/payments" element={<Payment />} />
              <Route path="/addPatient" element={<AddPatient />} />
              <Route path="/quickPrescription" element={<QuickPrescription />} />
              <Route path="/dispenser/prescriptions" element={<ViewPrescription />} />



            </Routes>
          </main>
        </div>
      
  );
};

export default App;