// src/components/ChatList.jsx
import React, { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ChatList({ onChatSelect }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadChats = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE_URL}/chats`, {
          method: "GET",
          credentials: "include", // send JWT cookies
        });

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json(); // expects an array like in your screenshot
        setChats(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unknown error while loading chats.");
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

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
      <h1 style={styles.title}>Your chats</h1>

      {loading && <p style={styles.hint}>Loading chats…</p>}
      {error && <div style={styles.error}>{error}</div>}

      {!loading && !error && chats.length === 0 && (
        <p style={styles.hint}>You don’t have any chats yet.</p>
      )}

      <div style={styles.resultsWrapper}>
        {chats.map((chat) => {
          const chatName = chat.name || "Chat";
          const users = chat.users || [];

          return (
            <button
              key={chat.id}
              type="button"
              style={styles.chatCard}
              onClick={() => onChatSelect && onChatSelect(chat)}
            >
              <div style={styles.chatMain}>
                {/* Avatar area – use first user as representative */}
                <div style={styles.avatarWrapper}>
                  {users[0]?.avatarUrl ? (
                    <img
                      src={users[0].avatarUrl}
                      alt={users[0].displayName || users[0].username}
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.avatarFallback}>
                      {(users[0]?.displayName ||
                        users[0]?.username ||
                        chatName[0] ||
                        "?")
                        .toString()
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>

                <div style={styles.chatInfo}>
                  <div style={styles.chatHeader}>
                    <span style={styles.displayName}>{chatName}</span>
                    {chat.isPrivateChat && (
                      <span style={styles.chatBadge}>Private</span>
                    )}
                  </div>

                  {/* Show users in the chat */}
                  <div style={styles.usersRow}>
                    {users.map((u) => (
                      <div key={u.id} style={styles.userChip}>
                        <span
                          style={{
                            ...styles.statusDot,
                            backgroundColor: getStatusColor(u.status),
                          }}
                        />
                        <span style={styles.userChipText}>
                          {u.displayName || u.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Styling reused / aligned with UserSearch
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
  error: {
    marginTop: "4px",
    marginBottom: "8px",
    padding: "8px 10px",
    background: "#fee2e2",
    borderRadius: "8px",
    color: "#b91c1c",
    fontSize: "13px",
  },
  hint: {
    fontSize: "14px",
    color: "#6b7280",
    marginBottom: "8px",
  },
  resultsWrapper: {
    marginTop: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  chatCard: {
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
    cursor: "pointer",
    textAlign: "left",
  },
  chatMain: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  avatarWrapper: {
    flexShrink: 0,
  },
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
  chatInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  displayName: {
    fontWeight: "600",
    fontSize: "15px",
    color: "#111827",
  },
  chatBadge: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontWeight: "500",
  },
  usersRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#e5e7eb",
  },
  userChipText: {
    fontSize: "12px",
    color: "#374151",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
  },
};
