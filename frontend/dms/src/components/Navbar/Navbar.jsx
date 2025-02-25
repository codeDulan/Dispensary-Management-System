import React from 'react'
import './Navbar.css'
import logo from '../../assets/Navbar-logo.png'

const Navbar = () => {

  return (

    <nav className='container'>

      <div className='logo-div'>
        <img src= {logo} alt='logo' className='logo' />
        <p className='logo-text'>SAHANAYA</p>
      </div>
      
      <ul>
        <li>Home</li>
        <li>Dashboard</li>
        <li>Patients</li>
        <li>Drugs</li>
        <li>Reports</li>
        <li>About Us</li>
        <li><button className='btn'>Appoinment</button></li>
      </ul>


    </nav>
  )
}

export default Navbar