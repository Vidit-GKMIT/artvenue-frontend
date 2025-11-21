import { Navigate } from "react-router-dom";
import React from "react";

export default function ProtectedRoute({ children, allowedRole = null }) {
  const isAuthenticated = localStorage.getItem("token");
  
  // If not authenticated, redirect to login immediately
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role checking is required
  if (allowedRole) {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      // If user data not available, redirect to login
      return <Navigate to="/login" replace />;
    }

    try {
      const user = JSON.parse(userStr);

      // Determine role with clear priority:
      // 1) Explicit role from backend if present
      // 2) Fallback: categories array -> artist, otherwise owner
      const explicitRole = user?.role?.role;
      let isArtist = false;
      let isOwner = false;

      if (explicitRole === "Artist") {
        isArtist = true;
      } else if (explicitRole === "Owner") {
        isOwner = true;
      } else if (Array.isArray(user?.categories) && user.categories.length > 0) {
        isArtist = true;
      } else {
        isOwner = true;
      }

      if (allowedRole === "owner" && !isOwner) {
        // Not owner, send to artist dashboard
        return <Navigate to="/artist" replace />;
      }

      if (allowedRole === "artist" && !isArtist) {
        // Not artist, send to owner dashboard
        return <Navigate to="/owner" replace />;
      }
    } catch (error) {
      // If parsing fails, redirect to login
      return <Navigate to="/login" replace />;
    }
  }

  // Only render children if all checks pass - return null while redirecting to prevent white screen
  return children;
}



