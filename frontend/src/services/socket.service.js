import { io } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000" : "");

class SocketService {
  socket = null;

  connect() {
    if (this.socket?.connected) return;

    // Try to get token from cookies (HttpOnly cookies are auto-sent but socket.io
    // auth needs the token explicitly — read it from the store if available)
    this.socket = io(API_URL, {
      withCredentials: true, // sends HttpOnly cookie automatically
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket.id);
    });

    this.socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
