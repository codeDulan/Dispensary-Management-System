import React, {useEffect, useState} from 'react'
import './Navbar.css'
import logo from '../../../assets/Navbar-logo.png'
import menu_icon from '../../../assets/icon-menu.png'
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


  const [mobileMenu, setMobileMenu] = useState(false);
  const toggleMenu = ()=>{
    mobileMenu ? setMobileMenu(false) : setMobileMenu(true);
  }



  return (

    <nav className={`container ${sticky?'dark-nav' : ''}`}>

      <div className='logo-div'>
        <img src= {logo} alt='logo' className='logo' />
        <p className='logo-text'>SAHANAYA</p>
      </div>
      
      <ul className={mobileMenu ? '' : 'hide-mobile-menu'}>
        <li><Link to='hero' smooth={true} offset={0} duration={500}>Home</Link></li>
        <li>Dashboard</li>
        <li><Link to='feagures' smooth={true} offset={-140} duration={500}>Feagures</Link></li>
        <li><Link to='about' smooth={true} offset={-140} duration={500}>About Us</Link></li>
        <li><Link to='testimonials' smooth={true} offset={-140} duration={500}>Testimonials</Link></li>
        <li><Link to='contact' smooth={true} offset={-140} duration={500}>Contact Us</Link></li>
        <li><button className='btn'>Appoinment</button></li>
      </ul>


      <img src={menu_icon} alt="" className='menu-icon' onClick={toggleMenu}/>


    </nav>
  )
}

export default Navbar