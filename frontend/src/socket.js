// src/socket.js
import { io } from "socket.io-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const socket = io(API_BASE_URL, {
  withCredentials: true, // send cookies so verifySocketToken works
});
