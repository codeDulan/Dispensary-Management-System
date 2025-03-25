import React from "react";
import "./Signup.css";
import Image from "../../assets/signup-logo.png";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="signup-container">
      {/* Left Side with Logo */}
      <div className="signup-left">
        <img src={Image} alt="Logo" className="signup-logo" />
      </div>

      {/* Right Side - Form Container */}
      <div className="form-outer-container">
        <div className="signup-box">
          <h2>Create Your Account</h2>
          
          {/* 1. ACCOUNT INFORMATION (ALWAYS VISIBLE FIRST) */}
          <div className="form-section account-section">
            <h3 className="section-title">Account Information</h3>
            <div className="input-group">
              <label>Email Address*</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="input-field" 
                required 
              />
            </div>
            <div className="input-group">
              <label>Password*</label>
              <input 
                type="password" 
                placeholder="Create a password (min 8 chars)" 
                className="input-field" 
                minLength="8"
                required
              />
            </div>
            <div className="input-group">
              <label>Confirm Password*</label>
              <input 
                type="password" 
                placeholder="Confirm your password" 
                className="input-field" 
                required
              />
            </div>
          </div>

          {/* 2. PERSONAL INFORMATION */}
          <div className="form-section personal-section">
            <h3 className="section-title">Personal Information</h3>
            <div className="name-fields">
              <div className="input-group half-width">
                <label>First Name*</label>
                <input 
                  type="text" 
                  placeholder="First name" 
                  className="input-field" 
                  required
                />
              </div>
              <div className="input-group half-width">
                <label>Last Name*</label>
                <input 
                  type="text" 
                  placeholder="Last name" 
                  className="input-field" 
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Date of Birth*</label>
              <input 
                type="date" 
                className="input-field" 
                required
              />
            </div>
            <div className="input-group">
              <label>Gender</label>
              <select className="input-field">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* 3. HEALTH INFORMATION */}
          <div className="form-section health-section">
            <h3 className="section-title">Health Information</h3>
            <div className="input-group">
              <label>Weight (kg)</label>
              <input 
                type="number" 
                placeholder="Enter weight" 
                className="input-field" 
                min="0"
              />
            </div>
            <div className="input-group">
              <label>Medical Notes</label>
              <textarea 
                placeholder="Allergies, conditions, etc." 
                className="input-field textarea-field"
              ></textarea>
            </div>
          </div>

          {/* 4. CONTACT INFORMATION */}
          <div className="form-section contact-section">
            <h3 className="section-title">Contact Information</h3>
            <div className="input-group">
              <label>Mobile Number*</label>
              <input 
                type="tel" 
                placeholder="Enter phone number" 
                className="input-field" 
                pattern="[0-9]{10}"
                required
              />
            </div>
            <div className="input-group">
              <label>City*</label>
              <input 
                type="text" 
                placeholder="Enter your city" 
                className="input-field" 
                required
              />
            </div>
          </div>

          {/* Form Footer */}
          <div className="form-footer">
            <button type="submit" className="signup-button">
              Create Account
            </button>
            <p className="login-text">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;