import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function UserSearch({ onUserClick, onChatCreated }) {
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatLoadingId, setChatLoadingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);

    if (!name.trim()) {
      setError("Please enter a name.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/chats/users/search?username=${encodeURIComponent(
          name.trim()
        )}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unknown error while loading users.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (user) => {
    setError("");
    setChatLoadingId(user.id);

    try {
      const res = await fetch(`${API_BASE_URL}/chats/private`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username }),
      });

      if (!res.ok) {
        throw new Error(`Failed to start chat: ${res.status}`);
      }

      const chat = await res.json();
      if (onChatCreated) onChatCreated(chat, user);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not start chat.");
    } finally {
      setChatLoadingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "#16a34a";
      case "offline":
        return "#6b7280";
      case "busy":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  return (
    <div style={styles.card}>
      <h1 style={styles.title}>Find conversation partner</h1>

      <form onSubmit={handleSearch} style={styles.form}>
        <input
          type="text"
          placeholder="Enter a name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.resultsWrapper}>
        {results.length === 0 && !loading && !error && (
          <p style={styles.hint}>No results yet — start a search.</p>
        )}

        {results.map((user) => (
          <div key={user.id} style={styles.userCard}>
            <div
              style={styles.userMain}
              onClick={() => onUserClick && onUserClick(user)}
            >
              <div style={styles.avatarWrapper}>
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName || user.username}
                    style={styles.avatar}
                  />
                ) : (
                  <div style={styles.avatarFallback}>
                    {(user.displayName || user.username || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>

              <div style={styles.userInfo}>
                <div style={styles.userHeader}>
                  <span style={styles.displayName}>
                    {user.displayName || user.username}
                  </span>
                  <span style={styles.username}>@{user.username}</span>
                </div>

                <div style={styles.metaRow}>
                  <span
                    style={{
                      ...styles.statusDot,
                      backgroundColor: getStatusColor(user.status),
                    }}
                  />
                  <span style={styles.statusText}>{user.status}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              style={styles.startChatButton}
              onClick={() => handleStartChat(user)}
              disabled={chatLoadingId === user.id}
            >
              {chatLoadingId === user.id ? "Starting..." : "Start chat"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    maxWidth: "700px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
  },
  title: {
    margin: 0,
    marginBottom: "16px",
    fontSize: "24px",
    fontWeight: "600",
    color: "#111827",
  },
  form: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "14px",
  },
  error: {
    marginTop: "4px",
    marginBottom: "8px",
    padding: "8px 10px",
    background: "#fee2e2",
    borderRadius: "8px",
    color: "#b91c1c",
    fontSize: "13px",
  },

  resultsWrapper: {
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",

    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: "6px",
  },

  hint: {
    fontSize: "14px",
    color: "#6b7280",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    gap: "12px",
    width: "100%",
    boxSizing: "border-box",
    justifyContent: "space-between",
  },
  userMain: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    cursor: "pointer",
  },
  avatarWrapper: { flexShrink: 0 },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    objectFit: "cover",
  },
  avatarFallback: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "18px",
    color: "#374151",
  },
  userInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  userHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    marginBottom: "4px",
  },
  displayName: { fontWeight: 600, fontSize: 15, color: "#111827" },
  username: { fontSize: "13px", color: "#6b7280" },
  metaRow: { display: "flex", alignItems: "center", gap: "6px" },
  statusDot: { width: 8, height: 8, borderRadius: "999px" },
  statusText: { fontSize: "12px", color: "#4b5563" },
  startChatButton: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontWeight: "500",
    cursor: "pointer",
    fontSize: "13px",
  },
};
