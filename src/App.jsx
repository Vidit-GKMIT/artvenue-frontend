import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import RegisterArtist from './pages/RegisterArtist'
import RegisterOwner from './pages/RegisterOwner'
import Login from './pages/Login'
import OtpVerify from './pages/OtpVerify' // ✔ correct import

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/register-owner" />} />

                <Route path="/register-artist" element={<RegisterArtist />} />
                <Route path="/register-owner" element={<RegisterOwner />} />
                <Route path="/login" element={<Login />} />

                <Route path="/verify-otp" element={<OtpVerify />} />
            </Routes>
        </BrowserRouter>
    )
}
