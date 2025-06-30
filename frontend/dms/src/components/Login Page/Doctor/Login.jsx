import React, { useState } from "react";
import "./Login.css";
import Image from "../../../assets/login-logo.png";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import UserService from "../../../services/UserService";
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [userType, setUserType] = useState("DOCTOR"); 

  const navigate = useNavigate();

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      let userData;
  
      
      if (userType === "PATIENT") {
        userData = await UserService.patientLogin(email, password);
      } else {
        userData = await UserService.login(email, password);
      }
  
      if (userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("role", userType);
  
        if (userType === "DOCTOR") {
          navigate("/dashboard");
        } else if (userType === "DISPENSER") {
          navigate("/dispenser/appointments");
        } else if (userType === "PATIENT") {
          navigate("/customer/dashboard");
        } else {
          navigate("/");
        }
      } else {
       
        setError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      
      if (error.response) {
        
        if (error.response.status === 401 || error.response.status === 403) {
          setError("Invalid email or password. Please try again.");
        } else if (error.response.status === 404) {
          setError("User not found. Please check your credentials.");
        } else if (error.response.status === 429) {
          setError("Too many login attempts. Please try again later.");
        } else {
          setError("Login failed. Please try again later.");
        }
      } else if (error.request) {
        
        setError("Unable to connect to the server. Please check your internet connection.");
      } else {
        
        setError("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <div className="login-left">
        <img src={Image} alt="Logo" className="login-logo" />
      </div>

      <div className="login-right">
        <form className="login-box" onSubmit={handleSubmit}>
          <h2>Login</h2>
          
          {error && <div className="error-message">{error}</div>}

          <select
            className="input-field"
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
          >
            <option value="DOCTOR">Doctor</option>
            <option value="DISPENSER">Dispenser</option>
            <option value="PATIENT">Patient</option>
          </select>
          
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <div className="password-field-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              className="password-toggle-button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          
          <button 
            className="login-button" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          
          <p className="signup-text">
            Don't have an account? <Link to="/signup">Signup</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;