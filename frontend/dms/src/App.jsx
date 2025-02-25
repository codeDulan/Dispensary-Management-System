import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Feagures from './components/Feagures/Feagures'


const App = () => {

  return (

    <div>
      <Navbar/>
      <Hero/>
      <div className="container">
          <Feagures/>
      </div>
      
    </div>

  )
}

export default App