import { Navigate, useLocation } from "react-router-dom";
import React from "react";

export default function PublicRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isVerifyOtp = location.pathname === "/verify-otp";

  if (token && !isVerifyOtp) {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
      return <Navigate to="/login" replace />;
    }

    try {
      const user = JSON.parse(userStr);

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

      if (isArtist) {
        return <Navigate to="/artist" replace />;
      }
      if (isOwner) {
        return <Navigate to="/owner" replace />;
      }

      return <Navigate to="/login" replace />;
    } catch (error) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

