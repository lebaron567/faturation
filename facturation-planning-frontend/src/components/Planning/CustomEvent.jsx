// CustomEvent.jsx
import React from "react";

const CustomEvent = ({ event, title, onRightClick }) => {
  const handleContextMenu = (e) => {
    e.preventDefault(); // Bloque le menu natif
    if (onRightClick) {
      onRightClick(event, e);
    }
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      style={{
        height: "100%",
        width: "100%",
        cursor: "context-menu",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {title}
    </div>
  );
};

export default CustomEvent;
