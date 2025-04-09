import React from "react";

const SupportLevelBadge = ({ level }) => {
  const getColor = (level) => {
    switch (level) {
      case "firstLine":
        return "#3385ff"; // Blue
      case "secondLine":
        return "#ff5c33"; // Orange
      default:
        return "#cccccc"; // Gray
    }
  };

  const getLabel = (level) => {
    switch (level) {
      case "firstLine":
        return "First Line Support";
      case "secondLine":
        return "Second Line Support";
      default:
        return level;
    }
  };

  return (
    <span
      style={{
        backgroundColor: getColor(level),
        color: "#fff",
        fontWeight: "bold",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "0.85em",
        display: "inline-block",
      }}
    >
      {getLabel(level)}
    </span>
  );
};

export default SupportLevelBadge;
