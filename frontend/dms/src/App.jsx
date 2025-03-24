import React from 'react';
import Login from './components/Login Page/Doctor/Login.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Patient from './components/Dashboard/Doctor/Patient/Patient.jsx';
import AddPatient from './components/Dashboard/Doctor/Patient/AddPatient/AddPatient.jsx';
import Medicine from './components/Dashboard/Doctor/Medicine/Medicine.jsx';
import Prescription from './components/Dashboard/Doctor/Prescription/Prescription.jsx';
import Payment from './components/Dashboard/Doctor/Payment/Payment.jsx';

const App = () => {
  

  return (
    
        <div className="app">
          <main className="content">
            <Routes>
              <Route index element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/medicine" element={<Medicine />} />
              <Route path="/patients" element={<Patient />} />
              <Route path="/prescriptions" element={<Prescription />} />
              <Route path="/payments" element={<Payment />} />
              <Route path="/addPatient" element={<AddPatient />} />



            </Routes>
          </main>
        </div>
      
  );
};

export default App;