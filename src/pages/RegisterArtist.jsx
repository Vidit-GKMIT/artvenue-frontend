import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Toast from '../components/Toast'

export default function RegisterArtist() {
    const navigate = useNavigate()

    const [toast, setToast] = useState(null)

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Artist',
        age: '',
        category: [],
    })

    const categoriesList = [
        'Dancing',
        'Singing',
        'Comedy',
        'Magic',
        'Videographer',
    ]

    const showToast = (message, type) => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 2500)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleCategoryChange = (e) => {
        const value = e.target.value

        let updatedCategories = [...form.category]

        if (updatedCategories.includes(value)) {
            updatedCategories = updatedCategories.filter((c) => c !== value)
        } else {
            updatedCategories.push(value)
        }

        setForm({ ...form, category: updatedCategories })
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/registerArtist`,
                form
            )

            if (res.data.success === false) {
                if (res.data.errors && res.data.errors.length > 0) {
                    showToast(res.data.errors[0], 'error')
                } else {
                    showToast(
                        res.data.message || 'Registration failed',
                        'error'
                    )
                }
                return
            }

            if (res.data.success === true) {
                showToast(res.data.message, 'success')

                setTimeout(() => {
                    navigate(`/verify-otp?email=${form.email}`)
                }, 1200)
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const backend = error.response.data

                if (backend.errors && backend.errors.length > 0) {
                    showToast(backend.errors[0], 'error')
                } else if (backend.message) {
                    showToast(backend.message, 'error')
                } else {
                    showToast('Unexpected server error', 'error')
                }
            } else {
                showToast('Network error. Try again.', 'error')
            }
        }
    }

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} />}

            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <form
                    onSubmit={onSubmit}
                    className="bg-white p-6 rounded-xl shadow-md w-full max-w-md"
                >
                    <h2 className="text-3xl font-semibold text-center mb-6">
                        Artist Registration
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

                    <input
                        className="input mb-3"
                        name="age"
                        type="number"
                        placeholder="Enter Age"
                        onChange={handleChange}
                        required
                    />

                    <div className="mb-4">
                        <label className="block font-medium mb-2">
                            Select Categories
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            {categoriesList.map((cat) => (
                                <label
                                    key={cat}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="checkbox"
                                        value={cat}
                                        checked={form.category.includes(cat)}
                                        onChange={handleCategoryChange}
                                    />
                                    <span>{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block font-medium mb-1">Role</label>
                        <input
                            className="input bg-gray-200 cursor-not-allowed"
                            value="Artist"
                            readOnly
                        />
                        <input type="hidden" name="role" value="Artist" />
                    </div>

                    <button className="btn-green mb-4">Register Artist</button>

                    <div className="flex flex-col gap-2 text-center">
                        <a
                            href="/register-owner"
                            className="text-blue-600 hover:underline focus:no-underline active:no-underline outline-none"
                        >
                            Register as Owner instead?
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
    )
}
