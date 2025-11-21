import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { verifyOtp } from "../api/auth.api";

export default function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || ""; 

  const [otp, setOtp] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await verifyOtp(email, otp);

      if (res.data.success) {
        // Set token and user immediately
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.data));

        showToast(res.data.message, "success");

        // Navigate immediately after a short delay to show the success message
        setTimeout(() => {
          try {
            // Determine role: check for categories field (artist has it, owner doesn't)
            if (res.data.data.categories) {
              navigate("/artist", { replace: true });
            } else {
              navigate("/owner", { replace: true });
            }
          } catch (error) {
            console.error("Error during redirect:", error);
            showToast("Error during redirect. Please try logging in.", "error");
          }
        }, 500);

      } else {

        showToast(res.data.message, "error");
      }
    } catch (error) {
      showToast("Invalid or expired OTP", "error");
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
        >
          <h2 className="text-3xl font-semibold text-center mb-6">
            OTP Verification
          </h2>

         
          <label className="font-medium mb-1 block">Email</label>
          <input
            className="input mb-4 bg-gray-200 cursor-not-allowed"
            value={email}
            readOnly
          />

          <label className="font-medium mb-1 block">Enter OTP</label>
          <input
            className="input mb-5"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button className="w-full rounded-xl bg-pink-600 py-3 text-sm font-semibold text-white transition hover:bg-pink-700">
            Verify OTP
          </button>

          <div className="mt-4">
            <a
              href="/login"
              className="w-full rounded-xl bg-pink-50 py-2 text-pink-700 transition hover:bg-pink-100 font-medium block text-center"
            >
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
