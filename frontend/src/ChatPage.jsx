// src/pages/ChatPage.jsx
import React, { useEffect, useState } from "react";
import UserSearch from "./Components/UserSearch";
import ChatList from "./Components/ChatList";
import ChatWindow from "./Components/ChatWindow";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Load the currently logged-in user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // send JWT cookies
        });

        if (!res.ok) {
          throw new Error("Failed to load user");
        }

        const data = await res.json();
        setCurrentUser(data); // save full user object
      } catch (err) {
        console.error("Error loading current user:", err);
      }
    };

    loadUser();
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 16px",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", gap: 24 }}>
        
        {/* Left column */}
        <div style={{ flex: 1 }}>
          <ChatList onChatSelect={setActiveChat} />
          <div style={{ height: 24 }} />
          <UserSearch onChatCreated={(chat) => setActiveChat(chat)} />
        </div>

        {/* Right column */}
        <div style={{ flex: 1, minHeight: 400 }}>
          <ChatWindow
            chat={activeChat}
            currentUserId={currentUser?.id}   // THIS IS THE IMPORTANT PART
          />
        </div>
      </div>
    </div>
  );
}
