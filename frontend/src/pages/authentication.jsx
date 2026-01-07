import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import logo from "../assets/nullpointlogo.png";
import "../styles/authentication.css";

function Authentication() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticationFeedback, setAuthenticationFeedback] = useState("");

  const navigate = useNavigate();

  const handleAuthenticationSubmit = async (event) => {
    event.preventDefault();

    if (!fullName || !username || !email || !password) {
      setAuthenticationFeedback("All fields are required (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setAuthenticationFeedback(""), 3000);
      return;
    }

    try {
      const response = await api.post("/register", {
        fullName,
        username,
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem("user_id", response.data.user_id);

        setAuthenticationFeedback(
          "Account created successfully (๑˃̵ᴗ˂̵)و"
        );

        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        if (response.data.message === "user_exists") {
          setAuthenticationFeedback(
            "Account already exists (╯°□°）╯︵ ┻━┻"
          );
        } else {
          setAuthenticationFeedback(
            "Something went wrong (╯°□°）╯︵ ┻━┻"
          );
        }

        setTimeout(() => setAuthenticationFeedback(""), 3000);
      }
    } catch (error) {
      setAuthenticationFeedback(
        "Server error (╯°□°）╯︵ ┻━┻"
      );
      setTimeout(() => setAuthenticationFeedback(""), 3000);
    }
  };

  return (
    <div className="authentication-page">
      <div className="authentication-card">
        <img
          src={logo}
          alt="NullPoint logo"
          className="authentication-brand-logo"
        />

        <h2 className="authentication-heading">Join NullPoint</h2>

        <form
          className="authentication-form-element"
          onSubmit={handleAuthenticationSubmit}
        >
          <div className="authentication-input-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="authentication-input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="authentication-input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="authentication-input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="authentication-confirm-button"
          >
            Confirm
          </button>
        </form>

        {authenticationFeedback && (
          <div className="authentication-status-message">
            {authenticationFeedback}
          </div>
        )}
      </div>
    </div>
  );
}

export default Authentication;
