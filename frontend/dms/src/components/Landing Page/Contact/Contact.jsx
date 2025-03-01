import React from 'react'
import './Contact.css'
import messageIcon from '../../../assets/msg-icon.png'
import emailIcon from '../../../assets/icon-email.png'
import telephoneIcon from '../../../assets/icon-telephone.png'
import locationIcon from '../../../assets/icon-location.png'

export const Contact = () => {


  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "3e5599de-6586-46c6-822b-63d3243135cd");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Form Submitted Successfully");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };


  return (
    <div className='contact'>
      <div className="contact-col">
        <h3>Send us a message <img src={messageIcon}></img></h3>
        <p>Feel free to reach out thorugh contact form or find our contact information below. Your feedback, questions, and
        suggestions are important to us as we strive to provide the best service possible.</p>

        <ul>
          <li><img src={emailIcon} alt="" />dulansamarasingha81@gmail.com</li>
          <li><img src={telephoneIcon} alt="" />+94 76-4007562</li>
          <li><img src={locationIcon} alt="" />No 18, Kapugalla, Horana.</li>
        </ul>
  
      </div>
      <div className="contact-col contact-form">

        <form onSubmit={onSubmit}>
          <label>Your Name</label>
          <input type="text" name='name' placeholder='Enter your name' required />

          <label>Phone Number</label>
          <input type="tel" name='phone' placeholder='Enter your mobile number' required />

          <label>Your Message</label>
          <textarea name="message" rows="6" placeholder='Enter your message' required></textarea>

          <button type='submit' className='btn dark-btn'>Submit Now</button>

        </form>

        <span>{result}</span>

      </div>
    </div>
  )
}
