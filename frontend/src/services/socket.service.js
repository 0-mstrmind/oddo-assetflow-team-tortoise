import { io } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');

class SocketService {
    socket = null;

    connect() {
        if (this.socket) return;

        const token = useAuthStore.getState().token;
        if (!token) return;

        this.socket = io(API_URL, {
            auth: { token },
            withCredentials: true,
        });

        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket.id);
        });

        this.socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket disconnected");
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
}

export const socketService = new SocketService();
