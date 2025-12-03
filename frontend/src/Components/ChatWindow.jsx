import { useEffect, useState, useRef } from "react";
import { socket } from "../socket";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ChatWindow({ chat, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const messagesContainerRef = useRef(null);

  // Load messages when chat changes
  useEffect(() => {
    if (!chat || !chat.id) {
      setMessages([]);
      setError("");
      return;
    }

    const loadMessages = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${API_BASE_URL}/chats/${chat.id}/messages`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to load messages: ${res.status}`);
        }

        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Unknown error while loading messages.");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [chat?.id]);

  // WebSocket: listen for new messages
  useEffect(() => {
    if (!chat || !chat.id) return;

    const chatId = chat.id;

    const handleNewMessage = (msg) => {
      const msgChatId = msg.groupID;

      if (msgChatId !== chatId) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev; // avoid duplicates
        return [...prev, msg];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [chat?.id]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    el.scrollTop = el.scrollHeight;
  }, [messages, chat?.id]);

  if (!chat) {
    return (
      <div style={styles.card}>
        <p style={styles.hint}>Select a chat to see messages.</p>
      </div>
    );
  }

  const chatTitle = chat.name || "Chat";
  const participants = Array.isArray(chat.users) ? chat.users : [];

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chat.id || !newMessage.trim() || sending) return;

    setSending(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/chats/${chat.id}/messages`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to send message: ${res.status}`);
      }

      await res.json().catch(() => {});
      setNewMessage("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={styles.card}>
      {/* header */}
      <div style={styles.header}>
        <h2 style={styles.title}>{chatTitle}</h2>
        <div style={styles.participantsRow}>
          {participants.map((u) => (
            <span key={u.id} style={styles.participantChip}>
              {u.username}
            </span>
          ))}
        </div>
      </div>

      {/* messages */}
      <div
        style={styles.messagesContainer}
        ref={messagesContainerRef}
      >
        {loading && <p style={styles.hint}>Loading messages…</p>}
        {error && <div style={styles.error}>{error}</div>}

        {!loading && !error && messages.length === 0 && (
          <p style={styles.hint}>No messages yet.</p>
        )}

        {messages.map((msg) => {
          const sender = msg.sender || {};
          const senderId = msg.senderId || msg.senderID || sender.id;

          const isOwnMessage =
            currentUserId && senderId && senderId === currentUserId;

          const initials = (sender.username || "?")
            .toString()
            .charAt(0)
            .toUpperCase();

          return (
            <div
              key={msg.id}
              style={{
                ...styles.messageRow,
                justifyContent: isOwnMessage ? "flex-end" : "flex-start",
              }}
            >
              {!isOwnMessage && (
                <div style={styles.avatarWrapper}>
                  {sender.avatarUrl ? (
                    <img
                      src={sender.avatarUrl}
                      alt={sender.username || "User"}
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.avatarFallback}>{initials}</div>
                  )}
                </div>
              )}

              <div
                style={{
                  ...styles.messageBubble,
                  background: isOwnMessage ? "#c7d2fe" : "#eff6ff",
                  alignItems: isOwnMessage ? "flex-end" : "flex-start",
                }}
              >
                <div style={styles.messageMeta}>
                  <span style={styles.senderName}>
                    {isOwnMessage ? "You" : sender.username || "Unknown"}
                  </span>
                  <span style={styles.messageTime}>
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <div style={styles.messageText}>{msg.content}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* input area */}
      <form style={styles.inputRow} onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message…"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={styles.input}
          disabled={sending || !chat.id}
        />
        <button
          type="submit"
          style={styles.sendButton}
          disabled={sending || !newMessage.trim() || !chat.id}
        >
          {sending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}


const styles = {
  card: {
    width: "100%",
    height: "100%",
    background: "#ffffff",
    borderRadius: 16,
    padding: 24,
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    marginBottom: 16,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 8,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: "#111827",
  },
  participantsRow: {
    marginTop: 6,
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  participantChip: {
    padding: "2px 8px",
    borderRadius: 999,
    background: "#e5e7eb",
    fontSize: 12,
    color: "#374151",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 10,

    // dirty but same height as chatlist + usersearch
    maxHeight: "calc(90vh - 285px)",
  },
  hint: {
    fontSize: 14,
    color: "#6b7280",
  },
  error: {
    padding: "8px 10px",
    background: "#fee2e2",
    borderRadius: 8,
    color: "#b91c1c",
    fontSize: 13,
    marginBottom: 8,
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
  },
  avatarWrapper: {
    flexShrink: 0,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    objectFit: "cover",
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    fontSize: 14,
    color: "#374151",
  },
  messageBubble: {
    maxWidth: "70%",
    borderRadius: 12,
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  messageMeta: {
    display: "flex",
    gap: 8,
    fontSize: 11,
    color: "#6b7280",
  },
  senderName: {
    fontWeight: 600,
  },
  messageTime: {},
  messageText: {
    fontSize: 14,
    color: "#111827",
    wordBreak: "break-word",
  },
  inputRow: {
    marginTop: 12,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 8,
    display: "flex",
    gap: 8,
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
  },
  sendButton: {
    padding: "8px 16px",
    borderRadius: 999,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: 14,
  },
};
