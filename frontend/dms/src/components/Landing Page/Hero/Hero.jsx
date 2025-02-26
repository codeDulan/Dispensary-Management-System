import React from 'react'
import './Hero.css'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className='hero container'>

    <div className='hero-text'>
      <h1>WELCOME TO <br></br> SAHANAYA</h1>
      <p>Empowering health and well-being through seamless, accessible, and efficient medication management for everyone</p>
      <Link to="/login"><button className='btn'>Get Started</button></Link>
      </div>

    </div>
  )
}

export default Hero