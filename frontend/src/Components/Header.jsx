import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function Header({ currentUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout-all`,
        {},
        { withCredentials: true }
      );
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/login");
    }
  };

  if (!currentUser) return null;

  return (
    <div
      style={{
        width: "parent",
        maxWidth: 1100,
        margin: "0 auto 30px auto",
        background: "#ffffff",
        padding: "16px 24px",
        borderRadius: 12,
        boxShadow:
          "0 4px 8px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: "#111827" }}>
        Seoul Chat
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 16, color: "#374151", fontWeight: 500 }}>
          {currentUser.displayName || currentUser.username}
        </span>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 18px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            transition: "0.15s",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
