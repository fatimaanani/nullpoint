import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/splash.css";
import splashImg from "../assets/splash2.jpg";

function Splash() {
  const navigate = useNavigate();

useEffect(() => {
  const timer = setTimeout(() => {
    const savedUser = localStorage.getItem("user_username");

    if (savedUser) {
      navigate("/feed");
    } else {
      navigate("/authentication");
    }
  }, 3000);
  
  return () => clearTimeout(timer);
}, [navigate]);
  return (
    <div className="splash-container">
      <img src={splashImg} alt="splash" className="splash-image" />
    </div>
  );
}

export default Splash;
