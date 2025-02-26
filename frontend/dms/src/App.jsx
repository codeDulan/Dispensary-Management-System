import React from 'react'
import Login from './components/Login Page/Doctor/Login.jsx'
import LandingPage from './pages/landingPage.jsx'

import {BrowserRouter, Routes, Route} from 'react-router-dom';


const App = () => {

  return (

    <BrowserRouter>
      <Routes>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
      </Routes>
    </BrowserRouter>
    

  )
}

export default App