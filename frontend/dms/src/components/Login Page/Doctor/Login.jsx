import React from "react";
import "./Login.css"; // Import CSS file
import Image from "../../../assets/login-logo.png"; // Import image file

const Login = () => {
  return (
    <div className="login-container">
      
      <div className="login-left">
        <img src={Image} alt="Logo" className="login-logo" />
      </div>

      {/* Right Side - Login Form */}
      <div className="login-right">
        <div className="login-box">
          <h2>Login</h2>

          <input type="email" placeholder="Email" className="input-field" />
          <input type="password" placeholder="Password" className="input-field" />

          <button className="login-button">Login</button>

          <p className="signup-text">
            Don’t have an account? <a href="#">Signup</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
