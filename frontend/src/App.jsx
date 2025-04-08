import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import Router from "./Router";
import "./styles/charts.css"; // Import the new charts CSS

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router />
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
