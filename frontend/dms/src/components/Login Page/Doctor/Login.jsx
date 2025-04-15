import React, { useState } from "react";
import "./Login.css";
import Image from "../../../assets/login-logo.png";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import UserService from "../../../services/UserService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userData = await UserService.login(email, password);
      
      if (userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("role", userData.role);
        
        // Redirect based on role
        if (userData.role === "DOCTOR") {
          navigate("/dashboard");  // Doctor dashboard
        } else if (userData.role === "DISPENSER") {
          navigate("/dispenser/dashboard");
        } else if (userData.role === "CUSTOMER") {  // Fix typo if needed
          navigate("/customer/dashboard");
        } else {
          navigate("/");  // Fallback
        }
      } else {
        setError(userData.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "An error occurred during login");
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
          
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
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