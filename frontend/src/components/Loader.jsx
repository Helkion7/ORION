import React from "react";

const Loader = ({ message }) => {
  return (
    <div
      className="loader-container"
      style={{ textAlign: "center", padding: "20px" }}
    >
      <div className="progress-indicator">
        <span className="progress-indicator-bar" style={{ width: "80%" }} />
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Loader;
