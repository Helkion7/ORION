import React from "react";

const SupportLevelBadge = ({ level }) => {
  // Make sure we're displaying the correct level
  const displayLevel = level === "secondLine" ? "Second Line" : "First Line";

  // Add a class based on the level for styling
  const badgeClass = `support-level-badge ${
    level === "secondLine" ? "second-line" : "first-line"
  }`;

  return <span className={badgeClass}>{displayLevel}</span>;
};

export default SupportLevelBadge;
