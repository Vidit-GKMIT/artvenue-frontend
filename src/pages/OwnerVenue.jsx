import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Toast from '../components/Toast'
import { useNavigate } from 'react-router-dom'
import { getVenues, createVenue, updateVenue } from '../api/venue.api'
import { logoutUser } from '../api/auth.api'


export default function OwnerVenues() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [venue, setVenue] = useState(null)
  const [form, setForm] = useState({ name: '', category: '', address: '' })

  const user = useMemo(() => JSON.parse(localStorage.getItem('user') || 'null'), [])
  const token = localStorage.getItem('token')
  const baseUrl = import.meta.env.VITE_BASE_URL
  const CATEGORY_OPTIONS = ['Hotel', 'Restaurant', 'Bar', 'Club']

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const fetchVenue = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const res = await getVenues(token);
      const venueData = res?.data?.data || null
      setVenue(venueData)
      if (venueData) {
        setForm({
          name: venueData.name || '',
          category: venueData.category || '',
          address: venueData.address || ''
        })
      } else {
        setForm({ name: '', category: '', address: '' })
      }
    } catch (error) {
      setVenue(null)
      setForm({ name: '', category: '', address: '' })
      if (error?.response?.data?.message) {
        showToast(error.response.data.message, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }
    fetchVenue()
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser(token);
    } catch (error) {
      console.error('Failed to logout', error)
    } finally {
      showToast('Logged out successfully', 'success')
      setTimeout(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login', { replace: true })
      }, 600)
    }
  }, [baseUrl, navigate, showToast, token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const submitVenue = async (e, isUpdate) => {
    e.preventDefault()
    if (!form.category) {
      showToast('Please select a category', 'error')
      return
    }

    setSaving(true)
    try {
      if (venue && isUpdate) {
        const res = await updateVenue(venue.id, form, token);
        showToast('Venue updated successfully', 'success')
      } else {
        const res = await createVenue(form, token);
        showToast('Venue created successfully', 'success')
      }
      fetchVenue()
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        'Failed to save venue'
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const renderEmptyState = () => (
    <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/60 p-10 text-center text-rose-700">
      <p className="text-lg font-semibold">No venue on record</p>
      <p className="mt-2 text-sm text-rose-500">Create one to start listing events.</p>
    </div>
  )

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <nav className="w-full bg-white shadow px-6 py-4 flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => navigate('/owner')}
          className="rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800"
        >
          Go to Dashboard
        </button>
      </nav>

      <main className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4 py-10">
        <section className="w-full max-w-xl space-y-6">
          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center text-gray-500 shadow">Loading venue...</div>
          ) : (
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
              {venue ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm text-center space-y-2">
                  <p className="text-sm uppercase tracking-wide text-rose-500">Your Venue</p>
                  <h3 className="text-2xl font-semibold text-gray-900">{venue.name}</h3>
                  <p className="text-gray-500">{venue.category}</p>
                  <p className="text-gray-700">{venue.address}</p>
                </div>
              ) : (
                renderEmptyState()
              )}

              <form onSubmit={(e) => submitVenue(e, Boolean(venue))} className="space-y-4">
                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Venue Name
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring focus:ring-rose-100"
                    placeholder="Radison"
                    required
                  />
                </label>

                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_OPTIONS.map((option) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => setForm((prev) => ({ ...prev, category: option }))}
                        aria-pressed={form.category === option}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          form.category === option
                            ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                  Address
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    className="rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-rose-400 focus:ring focus:ring-rose-100"
                    required
                  />
                </label>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-rose-400"
                  >
                    {saving ? 'Saving...' : venue ? 'Update Venue' : 'Create Venue'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
