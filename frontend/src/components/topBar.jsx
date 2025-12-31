import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/topBar.css";
import logo from "../assets/nullpointlogo.png";

function TopBar({ title }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div className="topbar-content">

        <button
          className="topbar-logo-btn"
          onClick={() => navigate("/feed")}
          aria-label="Go to Feed"
        >
          <img src={logo} alt="NullPoint logo" className="topbar-logo" />
        </button>
        
        <h1 className="topbar-title">{title}</h1>

        <span class="spacer"></span>

         <button
          className="topbar-logo-btn"
        >
          <img src={logo} alt="NullPoint logo" className="topbar-logo" />
        </button>
      </div>
    </header>
  );
}

export default TopBar;