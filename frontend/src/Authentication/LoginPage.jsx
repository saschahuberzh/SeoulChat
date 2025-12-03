import { useState } from "react";
import "./LoginPage.css";
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
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Logged in:", res.data);

      navigate("/chat");
    } catch (err) {
      alert(err?.response?.data?.error || "Login failed");
    }
  };

  return (
    <div id="login-page">
      <div className="login-container">
        <img
          src="/SeoulTechLogo.png"
          alt="SeoulTech Logo"
          className="logo"
        />

        <h1 className="title">Seoul Chat</h1>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">
            Log in
          </button>
          <p style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
            No account yet?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              style={{
                border: "none",
                background: "none",
                color: "#2563eb",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
