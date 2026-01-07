import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import logo from "../assets/nullpointlogo.png";
import "../styles/authentication.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginFeedback, setLoginFeedback] = useState("");

  const navigate = useNavigate();

  const handleLoginSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setLoginFeedback("All fields are required ＞︿＜");
      setTimeout(() => setLoginFeedback(""), 3000);
      return;
    }

    try {
      const response = await api.post("/authentication/login", {
        username,
        password
      });

      if (response.data.success) {
        localStorage.setItem("user_id", response.data.user_id);
        navigate("/feed");
      } else {
        setLoginFeedback("Invalid credentials (╯°□°）╯︵ ┻━┻");
        setTimeout(() => setLoginFeedback(""), 3000);
      }
    } catch {
      setLoginFeedback("Server error (╯°□°）╯︵ ┻━┻");
      setTimeout(() => setLoginFeedback(""), 3000);
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

        <h2 className="authentication-heading">Login to NullPoint</h2>

        <form
          className="authentication-form-element"
          onSubmit={handleLoginSubmit}
        >
          <div className="authentication-input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            Login
          </button>
        </form>

        {loginFeedback && (
          <div className="authentication-status-message">
            {loginFeedback}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
