import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Toast from '../components/Toast'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../api/auth.api'
import { getEvents, createEvent } from '../api/event.api'
import { createVenue } from '../api/venue.api'

const parseEventDate = (value) => {
  if (!value) return null
  const [datePart, timePart] = value.split(',')
  if (!datePart || !timePart) return null
  const [day, month, year] = datePart.trim().split('-')
  if (!day || !month || !year) return null
  const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart.trim()}:00`
  const parsed = new Date(isoString)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function OwnerEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const CATEGORY_OPTIONS = useMemo(() => ['Dancing', 'Singing', 'Magic', 'Videography', 'Comedy'], [])
  const [showEventForm, setShowEventForm] = useState(false)
  const [submittingEvent, setSubmittingEvent] = useState(false)
  const [eventForm, setEventForm] = useState({
    event_name: '',
    payout: '',
    capacity: '',
    startDate: '',
    startHour: '',
    startMinute: '',
    endDate: '',
    endHour: '',
    endMinute: '',
    category: []
  })
  const [showVenueModal, setShowVenueModal] = useState(false)
  const [creatingVenue, setCreatingVenue] = useState(false)
  const [venueForm, setVenueForm] = useState({
    name: '',
    category: '',
    address: ''
  })
  const [user] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token] = useState(() => localStorage.getItem('token') || '')

  const baseUrl = import.meta.env.VITE_BASE_URL
  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token])

  const showToast = useCallback((message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const safeExtract = useCallback((res) => {
    if (Array.isArray(res?.data?.data)) return res.data.data
    if (Array.isArray(res?.data)) return res.data
    return []
  }, [])

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getEvents(token);
      setEvents(safeExtract(res))
    } catch (error) {
      // Silently handle error - don't show toast
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [authHeader, baseUrl, safeExtract])

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }

    // Role check is handled by ProtectedRoute, so we can proceed directly
    fetchEvents()
  }, [fetchEvents, navigate, token, user])

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
  }, [authHeader, baseUrl, navigate, showToast, token])

  const goToDashboard = () => navigate('/owner')
  const goToVenue = () => navigate('/owner-venues')

  const handleVenueChange = (e) => {
    const { name, value } = e.target
    setVenueForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetVenueForm = () => {
    setVenueForm({
      name: '',
      category: '',
      address: ''
    })
  }

  const submitVenue = async (e) => {
    e.preventDefault()
    setCreatingVenue(true)

    if (!venueForm.name || !venueForm.category || !venueForm.address) {
      showToast('All fields are required', 'error')
      setCreatingVenue(false)
      return
    }

    try {
      const res = await createVenue(venueForm, authHeader);
      showToast('Venue created successfully', 'success')
      setShowVenueModal(false)
      resetVenueForm()
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        'Failed to create venue'
      showToast(message, 'error')
    } finally {
      setCreatingVenue(false)
    }
  }

  const handleEventFormChange = (e) => {
    const { name, value } = e.target
    setEventForm((prev) => ({ ...prev, [name]: value }))
  }

  const resetEventForm = () => {
    setEventForm({
      event_name: '',
      payout: '',
      capacity: '',
      startDate: '',
      startHour: '',
      startMinute: '',
      endDate: '',
      endHour: '',
      endMinute: '',
      category: []
    })
  }

  const formatTime = (hour, minute) => {
    if (hour === '' || minute === '') return ''
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  const toggleCategory = (option) => {
    setEventForm((prev) => {
      const isSelected = prev.category.includes(option)
      const updated = isSelected ? prev.category.filter((item) => item !== option) : [...prev.category, option]
      return { ...prev, category: updated }
    })
  }

  const buildIsoString = (dateStr, timeStr) => {
    if (!dateStr) return null
    const [day, month, year] = dateStr.split('/').map((part) => part.trim())
    if (!day || !month || !year || day.length !== 2 || month.length !== 2 || year.length !== 4) return null

    const [hours = '00', minutes = '00'] = (timeStr || '').split(':')
    if (hours.length !== 2 || minutes.length !== 2) return null

    return `${year}-${month}-${day}T${hours}:${minutes}:00`
  }

  const submitEvent = async (e) => {
    e.preventDefault()
    setSubmittingEvent(true)

    if (!eventForm.category.length) {
      showToast('Select at least one category', 'error')
      setSubmittingEvent(false)
      return
    }

    const startTime = formatTime(eventForm.startHour, eventForm.startMinute)
    const endTime = formatTime(eventForm.endHour, eventForm.endMinute)

    const startIso = buildIsoString(eventForm.startDate, startTime)
    const endIso = buildIsoString(eventForm.endDate, endTime)

    if (!startIso || !endIso) {
      showToast('Please use DD/MM/YYYY for dates and select a time.', 'error')
      setSubmittingEvent(false)
      return
    }

    const startDateObj = new Date(startIso)
    const endDateObj = new Date(endIso)
    const tenDaysLater = new Date()
    tenDaysLater.setDate(tenDaysLater.getDate() + 10)

    if (startDateObj < tenDaysLater) {
      showToast('Events must start at least 10 days from today.', 'error')
      setSubmittingEvent(false)
      return
    }

    if (endDateObj <= startDateObj) {
      showToast('End time must be after the start time.', 'error')
      setSubmittingEvent(false)
      return
    }

    const payload = {
      event_name: eventForm.event_name,
      payout: Number(eventForm.payout),
      start_date_time: startIso,
      end_date_time: endIso,
      capacity: Number(eventForm.capacity),
      category: eventForm.category
    }

    try {
      const res = await createEvent(payload, authHeader);
      showToast('Event created successfully', 'success')
      setShowEventForm(false)
      resetEventForm()
      fetchEvents() // Refresh the events list
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.[0] ||
        'Failed to create event'
      showToast(message, 'error')
    } finally {
      setSubmittingEvent(false)
    }
  }

  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-linear-to-br from-orange-50 to-pink-50 px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-orange-100 p-4">
        <svg
          className="h-12 w-12 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">No events found</h3>
      <p className="mb-6 text-sm text-gray-600">You haven't created any events yet. Create your first event to get started!</p>
      <button
        onClick={() => setShowEventForm(true)}
        className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 shadow-md hover:shadow-lg"
      >
        Create Event
      </button>
    </div>
  )

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-pink-500">Manage Events</p>
              <h1 className="text-2xl font-semibold text-gray-900">All gigs created by {user?.name}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={goToDashboard}
                className="rounded-xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          <section className="mb-8 rounded-3xl bg-linear-to-r from-orange-600 via-pink-600 to-rose-600 p-6 text-white shadow-lg">
            <p className="text-sm uppercase tracking-wide text-white/80">Event Overview</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs text-white/70">Owner</p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Email</p>
                <p className="text-lg font-semibold break-all">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Total Events</p>
                <p className="text-3xl font-bold">{events.length}</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white/90 p-6 shadow">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">Created Events</p>
                <h2 className="text-2xl font-semibold text-gray-900">All active and incoming events</h2>
              </div>
              {loading ? <span className="text-sm text-gray-500">Loading...</span> : null}
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {events.length === 0 && !loading
                ? renderEmptyState()
                : events.map((event, idx) => {
                    const startDate = parseEventDate(event.start_date_time)
                    const endDate = parseEventDate(event.end_date_time)
                    const now = new Date()
                    const isPast = endDate ? endDate < now : startDate ? startDate < now : false
                    const badgeText = isPast ? 'Past Event' : 'Upcoming Event'
                    const badgeClasses = isPast
                      ? 'border border-gray-200 bg-gray-100 text-gray-700'
                      : 'border border-emerald-200 bg-emerald-50 text-emerald-700'

                    return (
                      <article
                        key={event.id}
                        className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <header className="mb-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-orange-500">Event #{idx + 1}</p>
                              <h3 className="text-xl font-semibold text-gray-900">{event.event_name}</h3>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses}`}>
                              {badgeText}
                            </span>
                          </div>
                        </header>

                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Start</dt>
                            <dd className="font-medium text-gray-900">{event.start_date_time}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">End</dt>
                            <dd className="font-medium text-gray-900">{event.end_date_time}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Capacity</dt>
                            <dd className="font-medium text-gray-900">{event.capacity}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-gray-500">Payout</dt>
                            <dd className="font-semibold text-emerald-600">₹{event.payout}</dd>
                          </div>
                        </dl>

                        <div className="mt-4">
                          <p className="text-sm text-gray-500">Categories</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {event.categories?.length
                              ? event.categories.map((category) => (
                                  <span
                                    key={`${event.id}-${category}`}
                                    className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
                                  >
                                    {category}
                                  </span>
                                ))
                              : (
                                <span className="text-sm text-gray-400">Not specified</span>
                                )}
                          </div>
                        </div>
                      </article>
                    )
                  })}
            </div>
          </section>
        </main>
      </div>

      {showVenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Create Venue</p>
                <h3 className="text-2xl font-semibold text-gray-900">List your space for performances</h3>
              </div>
              <button
                onClick={() => {
                  setShowVenueModal(false)
                  resetVenueForm()
                }}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitVenue} className="space-y-4">
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Venue Name
                <input
                  name="name"
                  value={venueForm.name}
                  onChange={handleVenueChange}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-orange-400 focus:ring focus:ring-orange-100"
                  required
                />
              </label>

              <div>
                <p className="mb-2 text-sm font-semibold text-gray-700">Category</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={`venue-${option}`}
                      onClick={() => setVenueForm((prev) => ({ ...prev, category: option }))}
                      aria-pressed={venueForm.category === option}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        venueForm.category === option
                          ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
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
                  value={venueForm.address}
                  onChange={handleVenueChange}
                  rows={3}
                  className="rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-orange-400 focus:ring focus:ring-orange-100"
                  required
                />
              </label>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowVenueModal(false)
                    resetVenueForm()
                  }}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingVenue}
                  className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-400"
                >
                  {creatingVenue ? 'Creating...' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">Create Event</p>
                <h3 className="text-2xl font-semibold text-gray-900">List a new performance opportunity</h3>
                <p className="text-xs text-gray-400">You can only create events scheduled at least 10 days later.</p>
              </div>
              <button
                onClick={() => {
                  setShowEventForm(false)
                  resetEventForm()
                }}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900"
                aria-label="Close form"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitEvent} className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700 md:col-span-2">
                Event Name
                <input
                  name="event_name"
                  value={eventForm.event_name}
                  onChange={handleEventFormChange}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Payout (₹)
                <input
                  name="payout"
                  type="number"
                  min="0"
                  value={eventForm.payout}
                  onChange={handleEventFormChange}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring focus:ring-emerald-100"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                Capacity
                <input
                  name="capacity"
                  type="number"
                  min="0"
                  value={eventForm.capacity}
                  onChange={handleEventFormChange}
                  className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring focus:ring-emerald-100"
                  required
                />
              </label>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                  Start Date (DD/MM/YYYY)
                  <input
                    name="startDate"
                    value={eventForm.startDate}
                    onChange={handleEventFormChange}
                    pattern="\d{2}/\d{2}/\d{4}"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-orange-400 focus:ring focus:ring-orange-100"
                    required
                  />
                </label>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-700">Start Time (24h)</p>
                  <div className="mt-3 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Hour</span>
                        <span className="font-semibold text-gray-900">
                          {eventForm.startHour === '' ? '--' : eventForm.startHour.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <input
                        type="range"
                        name="startHour"
                        min="0"
                        max="23"
                        value={eventForm.startHour === '' ? 0 : Number(eventForm.startHour)}
                        onChange={(e) => setEventForm((prev) => ({ ...prev, startHour: e.target.value }))}
                        className="mt-2 w-full accent-orange-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Minute</span>
                        <span className="font-semibold text-gray-900">
                          {eventForm.startMinute === ''
                            ? '--'
                            : Number(eventForm.startMinute).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <input
                        type="range"
                        name="startMinute"
                        min="0"
                        max="45"
                        step="15"
                        value={eventForm.startMinute === '' ? 0 : Number(eventForm.startMinute)}
                        onChange={(e) => setEventForm((prev) => ({ ...prev, startMinute: e.target.value }))}
                        className="mt-2 w-full accent-orange-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
                  End Date (DD/MM/YYYY)
                  <input
                    name="endDate"
                    value={eventForm.endDate}
                    onChange={handleEventFormChange}
                    pattern="\d{2}/\d{2}/\d{4}"
                    className="rounded-xl border border-gray-200 px-4 py-3 text-gray-900 outline-none transition focus:border-orange-400 focus:ring focus:ring-orange-100"
                    required
                  />
                </label>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-700">End Time (24h)</p>
                  <div className="mt-3 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Hour</span>
                        <span className="font-semibold text-gray-900">
                          {eventForm.endHour === '' ? '--' : eventForm.endHour.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <input
                        type="range"
                        name="endHour"
                        min="0"
                        max="23"
                        value={eventForm.endHour === '' ? 0 : Number(eventForm.endHour)}
                        onChange={(e) => setEventForm((prev) => ({ ...prev, endHour: e.target.value }))}
                        className="mt-2 w-full accent-orange-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Minute</span>
                        <span className="font-semibold text-gray-900">
                          {eventForm.endMinute === '' ? '--' : Number(eventForm.endMinute).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <input
                        type="range"
                        name="endMinute"
                        min="0"
                        max="45"
                        step="15"
                        value={eventForm.endMinute === '' ? 0 : Number(eventForm.endMinute)}
                        onChange={(e) => setEventForm((prev) => ({ ...prev, endMinute: e.target.value }))}
                        className="mt-2 w-full accent-orange-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-semibold text-gray-700">Categories (select multiple)</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map((option) => {
                    const selected = eventForm.category.includes(option)
                    return (
                      <button
                        type="button"
                        key={option}
                        onClick={() => toggleCategory(option)}
                        aria-pressed={selected}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          selected
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventForm(false)
                    resetEventForm()
                  }}
                  className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvent}
                  className="rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-pink-400"
                >
                  {submittingEvent ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

