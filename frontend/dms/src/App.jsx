import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Feagures from './components/Feagures/Feagures'
import About from './components/About/About'


const App = () => {

  return (

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

export default App