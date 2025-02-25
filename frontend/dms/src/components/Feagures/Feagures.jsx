import React from 'react'
import './Feagures.css'
import patientimg from '../../assets/Vector-patient.png'
import drugimg from '../../assets/Vector-drugs.png'
import prescriptionimg from '../../assets/Vector-prescriptions.png'

const Feagures = () => {

  return (
    <div className="feagures">

      <div className="feagure">

        <div className='feagure-title'>
        <h2>Patients</h2>
        <div className="line"></div>
        </div>
        
        <img src={patientimg} alt="patient"/>
        <p>500+</p>
      </div>

      <div className="feagure">

      <div className='feagure-title'>
        <h2>Drugs</h2>
        <div className="line"></div>
      </div>

        <img src={drugimg} alt="patient"/>
        <p>200+</p>
      </div>

      <div className="feagure">

      <div className='feagure-title'>
        <h2>Prescriptions</h2>
        <div className="line"></div>
        </div>

        <img src={prescriptionimg} alt="patient"/>
        <p>1000+</p>
      </div>

    </div>
  )
}

export default Feagures