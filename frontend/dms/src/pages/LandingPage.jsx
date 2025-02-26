import Navbar from '../components/Landing Page/Navbar/Navbar.jsx'
import Hero from '../components/Landing Page/Hero/Hero.jsx'
import Feagures from '../components/Landing Page/Feagures/Feagures.jsx'
import About from '../components/Landing Page/About/About.jsx'


const LandingPage = () => {

  return(
    <div>
      <Navbar/>
      <Hero/>
      <div className="container">
          <Feagures/>
          <About/>
      </div>
      
    </div>
  )

}

export default LandingPage