import React, { useState } from "react";
import "./Signup.css";
import Image from "../../assets/signup-logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

import UserService from '../../services/UserService';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Account Information
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Information
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    
    // Health Information (optional)
    weight: '',
    medicalNotes: '',
    
    // Contact Information
    phone: '',
    city: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };


  const validate = () => {
    const newErrors = {};
    
    // Account Information Validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Personal Information Validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    
    // Contact Information Validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    
    if (!formData.city) newErrors.city = 'City is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      await UserService.registerPatient({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        contact: formData.phone,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        address: `${formData.city}, ${formData.address}`,
        age: calculateAge(formData.dateOfBirth),
        medicalNotes: formData.medicalNotes
      });
      
      toast.success('Registration successful! Check your email for your barcode.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      {/* Left Side with Logo */}
      <div className="signup-left">
        <img src={Image} alt="MedCare Logo" className="signup-logo" />
      </div>

      {/* Right Side - Form Container */}
      <div className="form-outer-container">
        <form className="signup-box" onSubmit={handleSubmit}>
          <h2>Create Your Account</h2>
          
          {/* 1. ACCOUNT INFORMATION */}
          <div className="form-section account-section">
            <h3 className="section-title">Account Information</h3>
            
            <div className="input-group">
              <label htmlFor="email">Email Address*</label>
              <input 
                type="email" 
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email" 
                className={`input-field ${errors.email ? 'error' : ''}`}
                required 
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            
            <div className="input-group password-field">
              <label htmlFor="password">Password*</label>
              <div className="password-input-container">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min 8 chars)" 
                  className={`input-field ${errors.password ? 'error' : ''}`}
                  minLength="8"
                  required
                />
                <span 
                  className="password-toggle-icon"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            
            <div className="input-group password-field">
              <label htmlFor="confirmPassword">Confirm Password*</label>
              <div className="password-input-container">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password" 
                  className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                  required
                />
                <span 
                  className="password-toggle-icon"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          {/* 2. PERSONAL INFORMATION */}
          <div className="form-section personal-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="name-fields">
              <div className="input-group half-width">
                <label htmlFor="firstName">First Name*</label>
                <input 
                  type="text" 
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name" 
                  className={`input-field ${errors.firstName ? 'error' : ''}`}
                  required
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>
              
              <div className="input-group half-width">
                <label htmlFor="lastName">Last Name*</label>
                <input 
                  type="text" 
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name" 
                  className={`input-field ${errors.lastName ? 'error' : ''}`}
                  required
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="dateOfBirth">Date of Birth*</label>
              <input 
                type="date" 
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`input-field ${errors.dateOfBirth ? 'error' : ''}`}
                required
              />
              {errors.dateOfBirth && (
                <span className="error-message">{errors.dateOfBirth}</span>
              )}
            </div>
            
            <div className="input-group">
              <label htmlFor="gender">Gender</label>
              <select 
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* 3. HEALTH INFORMATION (Optional) */}
          <div className="form-section health-section">
            <h3 className="section-title">Health Information (Optional)</h3>
            
            <div className="input-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input 
                type="number" 
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Enter weight" 
                className="input-field"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="medicalNotes">Medical Notes</label>
              <textarea 
                id="medicalNotes"
                name="medicalNotes"
                value={formData.medicalNotes}
                onChange={handleChange}
                placeholder="Allergies, conditions, etc." 
                className="input-field textarea-field"
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* 4. CONTACT INFORMATION */}
          <div className="form-section contact-section">
            <h3 className="section-title">Contact Information</h3>
            
            <div className="input-group">
              <label htmlFor="phone">Mobile Number*</label>
              <input 
                type="tel" 
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number" 
                className={`input-field ${errors.phone ? 'error' : ''}`}
                pattern="[0-9]{10}"
                required
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>
            
            <div className="input-group">
              <label htmlFor="city">City*</label>
              <input 
                type="text" 
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city" 
                className={`input-field ${errors.city ? 'error' : ''}`}
                required
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
            
            
          </div>

          {/* Form Footer */}
          <div className="form-footer">
            <button 
              type="submit" 
              className="signup-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            <p className="login-text">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;