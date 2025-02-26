import React, {useEffect, useState} from 'react'
import './Navbar.css'
import logo from '../../../assets/Navbar-logo.png'

const Navbar = () => {

  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', () => {
      if(window.scrollY > 50){
        setSticky(true);
      }else{
        setSticky(false);
      }
    })
  },[]);



  return (

    <nav className={`container ${sticky?'dark-nav' : ''}`}>

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