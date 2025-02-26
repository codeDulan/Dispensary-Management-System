import React from 'react'
import './About.css'
import AboutImg from '../../../assets/about-img.jpg'

const About = () => {
  return (
    <div className='about'>
      <div className='about-left'>

        <img src={AboutImg} alt='about' className='about-img' />

      </div>

      <div className='about-right'>

        <h3>ABOUT SAHANAYA</h3>
        <h2>Where Compassion Meets Quality Healthcare</h2>

        <p>At Sahanaya Medical Center, we believe that healthcare is more than just treating illnesses—it's about providing compassionate care, building trust, and empowering healthier lives. Founded with a vision to make quality healthcare accessible to everyone, we are committed to offering a wide range of medical services designed to meet the diverse needs of our community.</p>

        <p>Our dedicated team of experienced doctors, skilled pharmacists, and caring healthcare professionals work together to ensure every patient receives personalized attention and the highest standard of care. From routine check-ups and diagnostic services to medication management and specialized treatments, we strive to create a healing environment where your well-being is our top priority.</p>

        <p>With modern facilities, a patient-centered approach, and a focus on continuous improvement, Sahanaya Medical Center stands as a trusted partner in your healthcare journey. We aim not just to treat, but to listen, understand, and support you at every step—because your health and comfort truly matter to us.</p>

      </div>

    </div>
  )
}

export default About