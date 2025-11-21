import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import RegisterArtist from './pages/RegisterArtist'
import RegisterOwner from './pages/RegisterOwner'
import Login from './pages/Login'
import OtpVerify from './pages/OtpVerify'
import OwnerDashboard from './pages/OwnerDashboard'
import ArtistDashboard from './pages/ArtistDashboard'
import OwnerVenues from "./pages/OwnerVenue";
import OwnerEvents from "./pages/OwnerEvents";
import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/register-owner" />} />

                <Route path="/register-artist" element={<PublicRoute><RegisterArtist /></PublicRoute>} />
                <Route path="/register-owner" element={<PublicRoute><RegisterOwner /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/verify-otp" element={<PublicRoute><OtpVerify /></PublicRoute>} />

                <Route path="/owner" element={<ProtectedRoute allowedRole="owner"><OwnerDashboard /></ProtectedRoute>} />
                <Route path="/artist" element={<ProtectedRoute allowedRole="artist"><ArtistDashboard /></ProtectedRoute>} />
                <Route path="/owner-venues" element={<ProtectedRoute allowedRole="owner"><OwnerVenues /></ProtectedRoute>} />
                <Route path="/owner-events" element={<ProtectedRoute allowedRole="owner"><OwnerEvents /></ProtectedRoute>} />
            </Routes>
        </BrowserRouter>
    )
}
