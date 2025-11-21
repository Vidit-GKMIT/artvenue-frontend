import React from "react";

export default function Toast({ message, type }) {
  return (
    <div
      className={`fixed top-5 right-5 z-60 px-4 py-2 rounded-lg shadow-lg text-white
      ${type === "success" ? "bg-green-600" : "bg-red-600"}
      animate-fade`}
    >
      {message}
    </div>
  );
}
