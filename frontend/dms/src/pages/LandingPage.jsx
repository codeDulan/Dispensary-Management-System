import Navbar from '../components/Landing Page/Navbar/Navbar.jsx'
import Hero from '../components/Landing Page/Hero/Hero.jsx'
import Feagures from '../components/Landing Page/Feagures/Feagures.jsx'
import About from '../components/Landing Page/About/About.jsx'
import Testimonials from '../components/Landing Page/Testimonials/Testimonials.jsx'
import { Contact } from '../components/Landing Page/Contact/Contact.jsx'
import Footer from '../components/Landing Page/Footer/Footer.jsx'


const LandingPage = () => {

  return(
    <div>
      <Navbar/>
      <Hero/>
      <div className="container">
          <Feagures/>
          <About/>
          <Testimonials/>
          <Contact /> 
          <Footer />
      </div>
      
    </div>
  )

}

export default LandingPage