import React, { useState } from "react";
import UserSearch from "./UserSearch";
import ChatList from "./ChatList";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);

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
        <div style={{ flex: 1 }}>
          <ChatList onChatSelect={setActiveChat} />
          <div style={{ height: 24 }} />
          <UserSearch onChatCreated={(chat) => setActiveChat(chat)} />
        </div>

        <div
          style={{
            flex: 1,
            background: "#ffffff",
            borderRadius: 16,
            padding: 24,
            boxShadow:
              "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          }}
        >
          {activeChat ? (
            <>
              <h2 style={{ marginTop: 0 }}>{activeChat.name || "Chat"}</h2>
              <pre
                style={{
                  fontSize: 12,
                  background: "#f3f4f6",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                {JSON.stringify(activeChat, null, 2)}
              </pre>
            </>
          ) : (
            <p>Select a chat from the left, or create a new one using search.</p>
          )}
        </div>
      </div>
    </div>
  );
}
