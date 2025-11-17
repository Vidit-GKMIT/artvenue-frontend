import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";

export default function RegisterOwner() {
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Owner",
  });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/registerOwner`,
        form
      );

     
      if (res.data.success === false) {
        if (res.data.errors && res.data.errors.length > 0) {
          showToast(res.data.errors[0], "error");
        } else {
          showToast(res.data.message || "Registration failed", "error");
        }
        return;
      }


      if (res.data.success === true) {
        showToast(res.data.message, "success");

        setTimeout(() => {
          navigate(`/verify-otp?email=${form.email}`);
        }, 1200);
      }

    } catch (error) {
      if (error.response && error.response.data) {
        const backend = error.response.data;

        if (backend.errors && backend.errors.length > 0) {
          showToast(backend.errors[0], "error");
        } else if (backend.message) {
          showToast(backend.message, "error");
        } else {
          showToast("Unexpected server error", "error");
        }
      } else {
        showToast("Network error. Try again.", "error");
      }
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <form
          onSubmit={onSubmit}
          className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
        >
          <h2 className="text-3xl font-semibold text-center mb-6">
            Owner Registration
          </h2>


          <input
            className="input mb-3"
            name="name"
            placeholder="Enter Name"
            onChange={handleChange}
            required
          />

          <input
            className="input mb-3"
            name="email"
            type="email"
            placeholder="Enter Email"
            onChange={handleChange}
            required
          />

          <input
            className="input mb-3"
            name="password"
            type="password"
            placeholder="Enter Password"
            onChange={handleChange}
            required
          />

      
          <div className="mb-6">
            <label className="block font-medium mb-1">Role</label>
            <input
              className="input bg-gray-200 cursor-not-allowed"
              value="Owner"
              readOnly
            />
            <input type="hidden" name="role" value="Owner" />
          </div>

          <button className="btn-green mb-4">Register Owner</button>

          <div className="flex flex-col gap-2 text-center">
            <a
              href="/register-artist"
              className="text-blue-600 hover:underline focus:no-underline active:no-underline outline-none"
            >
              Register as Artist instead?
            </a>

            <a
              href="/login"
              className="text-gray-700 hover:underline focus:no-underline active:no-underline outline-none"
            >
              Already have an account? Login
            </a>
          </div>
        </form>
      </div>
    </>
  );
}
