import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config/env.config.js";
import logger from "../config/logger.config.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // allow all or use config.allowedOrigins if it exists
            methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        let token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
        
        if (!token && socket.handshake.headers.cookie) {
            import("cookie").then(cookie => {
                const cookies = cookie.parse(socket.handshake.headers.cookie);
                token = cookies.accessToken;
                
                if (!token) {
                    return next(new Error("Authentication error: No token provided"));
                }
                try {
                    const decoded = jwt.verify(token, config.jwtSecret);
                    socket.user = decoded;
                    next();
                } catch (err) {
                    return next(new Error("Authentication error: Invalid token"));
                }
            }).catch(err => {
                return next(new Error("Failed to parse cookies"));
            });
            return;
        }

        if (!token) {
            return next(new Error("Authentication error: No token provided"));
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            socket.user = decoded;
            next();
        } catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        logger.info(`Socket User connected: ${socket.user.id}`);

        // Each user joins their own personal room for targeted notifications
        const userRoom = `user:${socket.user.id}`;
        socket.join(userRoom);
        logger.info(`Socket User ${socket.user.id} joined room: ${userRoom}`);

        // Also join a role-based room so we can broadcast to all admins at once
        if (socket.user.role) {
            const roleRoom = `role:${socket.user.role}`;
            socket.join(roleRoom);
        }

        socket.on("disconnect", () => {
            logger.info(`Socket User disconnected: ${socket.user.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
