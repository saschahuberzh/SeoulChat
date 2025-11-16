// src/components/LoginPage.jsx
import React, { useState } from "react";
import "./../styles/LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      // Example API call to backend auth endpoint
      const res = await axios.post(
        import.meta.env.VITE_API_URL + "/auth/login",
        { username, password },
        { withCredentials: true }
      );

      // On success navigate to chat
      navigate("/chat");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <img src="/logo.png" alt="SeoulTech Logo" className="logo" />
      <h1 className="title">Seoul Chat</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Username</label>
          <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        </div>
        <button type="submit" className="login-btn">Log in</button>
      </form>
    </div>
  );
}
