import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

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
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/verify-otp`, {
        email,
        otp,
      });

      if (res.data.success) {
       
        showToast(res.data.message, "success");

  
        setTimeout(() => {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.data));

       
          const role = res.data.data.role.role.toLowerCase();

          if (role === "owner") navigate("/owner");
          else navigate("/artist");
        }, 1200);

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

          <button className="btn-primary">Verify OTP</button>

          <div className="text-center mt-4">
            <a
              href="/login"
              className="text-gray-700 hover:underline focus:no-underline active:no-underline outline-none"
            >
              Back to Login
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
