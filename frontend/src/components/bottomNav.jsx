import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiHome, FiEdit, FiBookOpen, FiUser } from "react-icons/fi";
import "../styles/bottomNav.css";

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav">
      <Link
        to="/feed"
        className={`nav-item ${location.pathname === "/feed" ? "active" : ""}`}
      >
        <FiHome className="icon" />
        <span>Stillspace</span>
      </Link>

      <Link
        to="/create"
        className={`nav-item ${location.pathname === "/create" ? "active" : ""}`}
      >
        <FiEdit className="icon" />
        <span>Cast</span>
      </Link>

      <Link
        to="/journal"
        className={`nav-item ${location.pathname === "/journal" ? "active" : ""}`}
      >
        <FiBookOpen className="icon" />
        <span>Journal</span>
      </Link>

      <Link
        to="/profile"
        className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
      >
        <FiUser className="icon" />
        <span>Profile</span>
      </Link>
    </nav>
  );
}

export default BottomNav;
