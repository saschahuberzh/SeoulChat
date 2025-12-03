import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !email || !password || !displayName) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                {
                    username,
                    email,
                    password,
                    displayName,
                },
                {
                    withCredentials: true,
                }
            );

            alert("Registration successful! You can now log in.");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert(err?.response?.data?.error || "Registration failed");
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

                <h1 className="title">Seoul Chat – Register</h1>

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
                        <label>Full name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        Register
                    </button>
                </form>

                <p style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
                    Already have an account?{" "}
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        style={{
                            border: "none",
                            background: "none",
                            color: "#2563eb",
                            cursor: "pointer",
                            padding: 0,
                        }}
                    >
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
}
