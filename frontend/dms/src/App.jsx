import React from 'react';
import Login from './components/Login Page/Doctor/Login.jsx';
import LandingPage from './pages/LandingPage.jsx';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';

const App = () => {
  

  return (
    
        <div className="app">
          <main className="content">
            <Routes>
              <Route index element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      
  );
};

export default App;