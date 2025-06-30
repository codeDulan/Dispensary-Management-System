import React, { useRef } from 'react'
import './Testimonials.css'
import next_icon from '../../../assets/next-button.png'
import back_icon from '../../../assets/previous-button.png'
import user_1 from '../../../assets/user-1.jpg'
import user_2 from '../../../assets/user-2.jpg'
import user_3 from '../../../assets/user-3.jpg'
import user_4 from '../../../assets/user-4.jpg'

const Testimonials = () => {

  const slider = useRef();
  let tx = 0;


  const slideForward = () => {

    if(tx > -50){
      tx -= 25;
    }

    slider.current.style.transform = `translateX(${tx}%)`;

  }


  const slideBackward = () => {

    if(tx < 0){
      tx += 25;
    }

    slider.current.style.transform = `translateX(${tx}%)`;


  }




  return (
    <div className='testimonials'>

      <img src={next_icon} alt="" className='next-btn' onClick={slideForward} />
      <img src={back_icon} alt="" className='back-btn' onClick={slideBackward}/>
      <div className="slider">

        <ul ref={slider}>
          <li>
            <div className="slide">
              <div className="user-info">
                <img src={user_1} alt="" />
                <div>
                  <h3>Navo Chamodi</h3>
                  <span>Bulathsinhala</span>
                </div>
              </div>
              <p>
              Sahanaya Dispensary has been a lifesaver for me! The staff is incredibly friendly, and the medicines are always available at affordable prices. I highly recommend it to everyone!
              </p>
            </div>
          </li>



          <li>
            <div className="slide">
              <div className="user-info">
                <img src={user_2} alt="" />
                <div>
                  <h3>Dulan Sam</h3>
                  <span>Horana</span>
                </div>
              </div>
              <p>
              Sahanaya Dispensary provides excellent service with a caring touch. The staff is knowledgeable, and I always get the medicines I need without any hassle. Highly recommended!
              </p>
            </div>
          </li>



          <li>
            <div className="slide">
              <div className="user-info">
                <img src={user_3} alt="" />
                <div>
                  <h3>Mathmini Kavindya</h3>
                  <span>Colombo</span>
                </div>
              </div>
              <p>
              I appreciate the professionalism and kindness of the Sahanaya team. Their quick service and availability of essential medicines make it my go-to pharmacy!
              </p>
            </div>
          </li>



          <li>
            <div className="slide">
              <div className="user-info">
                <img src={user_4} alt="" />
                <div>
                  <h3>Tharindu Lakmal</h3>
                  <span>Panadura</span>
                </div>
              </div>
              <p>
              Sahanaya Dispensary is a trusted place for my family's healthcare needs. The staff is always helpful, and the prices are reasonable. I wouldn’t go anywhere else!
              </p>
            </div>
          </li>
        </ul>

      </div>

    </div>
  )
}

export default Testimonials;