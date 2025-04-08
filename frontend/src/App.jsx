import React, { useState, useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import Router from "./Router";
import BootSequence from "./components/BootSequence/BootSequence";
import "./styles/charts.css"; // Import the new charts CSS

function App() {
  const [bootComplete, setBootComplete] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // If boot is complete or skipped, fade in the app content
    if (bootComplete) {
      const timer = setTimeout(() => {
        setAppReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bootComplete]);

  return (
    <>
      <BootSequence onComplete={() => setBootComplete(true)} />

      <div className={`app-content ${appReady ? "app-content-visible" : ""}`}>
        <AuthProvider>
          <SocketProvider>
            <Router />
          </SocketProvider>
        </AuthProvider>
      </div>
    </>
  );
}

export default App;
