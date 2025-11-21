import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { loginUser } from "../api/auth.api" 

export default function Login() {
  const navigate = useNavigate();

  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form);

      if (!res.data.success) {
        if (res.data.errors && res.data.errors.length > 0) {
          showToast(res.data.errors[0], "error");
        } else {
          showToast(res.data.message || "Login failed", "error");
        }
        return;
      }

      if (res.data.success) {
        const token = res.data.token;
        const user = res.data.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        const role = user.role.role.toLowerCase();

        showToast("Login Successful!", "success");

        setTimeout(() => {
          if (role === "artist") {
            navigate("/artist");
          } else if (role === "owner") {
            navigate("/owner");
          }
        }, 1000);
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
          <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>

          <input
            className="input mb-3"
            name="email"
            type="email"
            placeholder="Enter Email"
            onChange={handleChange}
            required
          />

          <input
            className="input mb-5"
            name="password"
            type="password"
            placeholder="Enter Password"
            onChange={handleChange}
            required
          />

          <button className="mb-5 w-full rounded-xl bg-pink-600 py-3 text-sm font-semibold text-white transition hover:bg-pink-700">
            Login
          </button>

          <div className="flex flex-col gap-3 text-center mt-2">
            <a
              href="/register-artist"
              className="w-full rounded-lg bg-pink-50 py-2 font-semibold text-pink-700 transition hover:bg-pink-100"
            >
              Register as Artist
            </a>

            <a
              href="/register-owner"
              className="w-full rounded-lg bg-pink-50 py-2 font-semibold text-pink-700 transition hover:bg-pink-100"
            >
              Register as Owner
            </a>
          </div>
        </form>
      </div>
    </>
  );
}