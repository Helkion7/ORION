import { useState, useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useAuth } from "../contexts/AuthContext";

const ResponseNotification = () => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket) return;

    const handleTicketResponse = (data) => {
      // Show notification only if the last response was not from the current user
      const lastResponse =
        data.ticket.responses[data.ticket.responses.length - 1];

      // Skip notification for internal notes if the user is not an admin
      if (lastResponse && (!lastResponse.isInternal || user.role === "admin")) {
        // Only show notification if the response wasn't created by the current user
        if (lastResponse.respondedBy._id !== user.id) {
          setNotification({
            ticketId: data.ticket._id,
            ticketTitle: data.ticket.title,
            respondedBy: lastResponse.respondedBy.name,
            isInternal: lastResponse.isInternal,
            timestamp: new Date().toLocaleTimeString(),
          });
          setVisible(true);

          // Hide notification after 5 seconds
          setTimeout(() => {
            setVisible(false);
          }, 5000);
        }
      }
    };

    socket.on("ticketResponse", handleTicketResponse);

    return () => {
      socket.off("ticketResponse", handleTicketResponse);
    };
  }, [socket, user]);

  if (!visible || !notification) return null;

  return (
    <div
      className="window"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "300px",
        zIndex: 1000,
      }}
    >
      <div className="title-bar">
        <div className="title-bar-text">
          {notification.isInternal ? "New Internal Note" : "New Response"}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={() => setVisible(false)}></button>
        </div>
      </div>
      <div className="window-body">
        <p>
          <strong>Ticket:</strong> #{notification.ticketId.slice(-5)} -{" "}
          {notification.ticketTitle}
        </p>
        <p>
          <strong>From:</strong> {notification.respondedBy}
        </p>
        <p>
          <strong>Time:</strong> {notification.timestamp}
        </p>
        {notification.isInternal && (
          <p className="status-badge" style={{ backgroundColor: "#AA5500" }}>
            INTERNAL NOTE
          </p>
        )}
      </div>
    </div>
  );
};

export default ResponseNotification;
