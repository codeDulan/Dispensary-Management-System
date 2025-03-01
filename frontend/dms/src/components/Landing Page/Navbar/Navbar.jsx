import React, {useEffect, useState} from 'react'
import './Navbar.css'
import logo from '../../../assets/Navbar-logo.png'
import { Link } from 'react-scroll';

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
        <li><Link to='hero' smooth={true} offset={0} duration={500}>Home</Link></li>
        <li>Dashboard</li>
        <li><Link to='feagures' smooth={true} offset={-140} duration={500}>Feagures</Link></li>
        <li><Link to='about' smooth={true} offset={-140} duration={500}>About Us</Link></li>
        <li><Link to='testimonials' smooth={true} offset={-140} duration={500}>Testimonials</Link></li>
        <li><Link to='contact' smooth={true} offset={-140} duration={500}>Contact Us</Link></li>
        <li><button className='btn'>Appoinment</button></li>
      </ul>


    </nav>
  )
}

export default Navbar