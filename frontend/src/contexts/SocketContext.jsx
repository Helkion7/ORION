import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

// Create the context
const SocketContext = createContext(null);

// Define the API URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (isAuthenticated && user) {
      console.log("Attempting to connect to Socket.IO server at", SOCKET_URL);

      // Create socket connection with explicit path and options
      const socketConnection = io(SOCKET_URL, {
        withCredentials: true,
        path: "/socket.io/", // Make sure this matches your server configuration
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      socketConnection.on("connect", () => {
        console.log(
          "Successfully connected to Socket.IO server with ID:",
          socketConnection.id
        );
        setConnectionError(null);

        // Send user data to server
        socketConnection.emit("userConnected", {
          userId: user.id,
          role: user.role,
        });
      });

      socketConnection.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setConnectionError(`Failed to connect: ${error.message}`);
      });

      socketConnection.on("reconnect_attempt", (attemptNumber) => {
        console.log(`Attempting to reconnect (${attemptNumber})...`);
      });

      setSocket(socketConnection);

      // Cleanup on unmount
      return () => {
        console.log("Disconnecting socket");
        socketConnection.disconnect();
      };
    }

    return undefined;
  }, [isAuthenticated, user]);

  // Provide both the socket and any connection errors
  return (
    <SocketContext.Provider value={{ socket, connectionError }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  return context.socket; // For backward compatibility
};

// New hook to get both socket and connection error
export const useSocketWithError = () => useContext(SocketContext);
