// components/ToggleButton.jsx
import React from "react";

export default function ToggleButton({ isActive, onToggle, disabled }) {
  // Convert backend string or boolean to boolean
  const active = isActive === true || isActive === "active";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex cursor-pointer items-center h-6 w-12 rounded-full focus:outline-none 
        transition-colors duration-400 ease-in-out
        ${active ? "bg-green-500" : "bg-gray-300"}
      `}
    >
      <span
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md 
          transform transition-transform duration-300 ease-in-out
          ${active ? "translate-x-6" : "translate-x-0"}
        `}
      />
    </button>
  );
}
