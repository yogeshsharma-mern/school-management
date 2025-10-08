import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg p-6 transition-transform transform hover:scale-105 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`flex flex-col gap-3 ${className}`}>{children}</div>;
}
