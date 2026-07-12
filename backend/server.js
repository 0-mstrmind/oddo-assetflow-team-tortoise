import http from "http";
import app from "./src/app.js";
import { connectDB } from "./src/core/config/db.config.js";
import { config } from "./src/core/config/env.config.js";
import logger from "./src/core/config/logger.config.js";
import { initializeSocket } from "./src/core/socket/socket.config.js";

const PORT = config.port || 4000;

// Connect to the database
connectDB();

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Start the server
server.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

