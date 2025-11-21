import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import Toast from '../components/Toast'
import { useNavigate } from 'react-router-dom'
import { getVenues } from '../api/venue.api'
import { getEvents, optInEvent } from '../api/event.api'
import { logoutUser } from '../api/auth.api'

const VIEW = {
  VENUES: 'venues',
  EVENTS: 'events'
}
const VIEW_STORAGE_KEY = 'artistActiveView'

export default function ArtistDashboard() {
  const navigate = useNavigate()
  const [venues, setVenues] = useState([])
  const [events, setEvents] = useState([])
  const [view, setView] = useState(() => {
    const storedView = localStorage.getItem(VIEW_STORAGE_KEY)
    return storedView && Object.values(VIEW).includes(storedView) ? storedView : VIEW.VENUES
  })
  const updateView = useCallback((nextView) => {
    setView(nextView)
    localStorage.setItem(VIEW_STORAGE_KEY, nextView)
  }, [])
  const [loading, setLoading] = useState({ venues: false, events: false })
  const [toast, setToast] = useState(null)
  const [optedInEvents, setOptedInEvents] = useState(new Set())
  const [user] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [token] = useState(() => localStorage.getItem('token') || '')

  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : {}), [token])
  const baseUrl = import.meta.env.VITE_BASE_URL

  const showToast = useCallback((message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }, [])

  const safeExtract = useCallback((res) => {
    if (Array.isArray(res?.data?.data)) return res.data.data
    if (Array.isArray(res?.data)) return res.data
    return []
  }, [])

  const fetchVenues = useCallback(async () => {
    setLoading((prev) => ({ ...prev, venues: true }))
    try {
      const res = await getVenues(token)
      setVenues(safeExtract(res))
    } catch (error) {
      showToast('Failed to load venues', 'error')
    } finally {
      setLoading((prev) => ({ ...prev, venues: false }))
    }
  }, [authHeader, baseUrl, safeExtract, showToast])

  const fetchEvents = useCallback(async () => {
    setLoading((prev) => ({ ...prev, events: true }))
    try {
      const res = await getEvents(token)
      const eventList = safeExtract(res)
      setEvents(eventList)

      const initiallyOpted = eventList
        .filter((event) => String(event.optedIn).toLowerCase() === 'yes')
        .map((event) => event.id)
      setOptedInEvents(new Set(initiallyOpted))
    } catch (error) {
      showToast('Failed to load events', 'error')
    } finally {
      setLoading((prev) => ({ ...prev, events: false }))
    }
  }, [authHeader, baseUrl, safeExtract, showToast])

  const handleOptIn = useCallback(
    async (eventId) => {
      try {
        const res = await optInEvent(eventId, authHeader)
        setOptedInEvents((prev) => new Set([...prev, eventId]))
        showToast('Opt-in successful! Owner has been notified.', 'success')
      } catch (error) {
        showToast('Failed to opt-in. Please try again.', 'error')
      }
    },
    [authHeader, baseUrl, showToast]
  )

  useEffect(() => {
    if (!user || !token) {
      navigate('/login')
      return
    }

    if (view === VIEW.VENUES) {
      fetchVenues()
    } else {
      fetchEvents()
    }
  }, [fetchEvents, fetchVenues, navigate, token, user, view])

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
        localStorage.removeItem(VIEW_STORAGE_KEY)
        navigate('/login', { replace: true })
      }, 600)
    }
  }, [authHeader, baseUrl, navigate, showToast, token])

  const renderEmptyState = (message) => (
    <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/60 px-6 py-14 text-center text-gray-500">
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-gray-400">Come back later to see new updates.</p>
    </div>
  )

  const renderVenues = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {venues.length === 0 && !loading.venues
        ? renderEmptyState('No venues are live on the platform yet.')
        : venues.map((venue) => (
            <article
              key={venue.id}
              className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-sm transition hover:shadow-lg"
            >
              <header className="mb-4">
                <p className="text-xs uppercase tracking-wide text-blue-500">{venue.category}</p>
                <h3 className="text-xl font-semibold text-gray-900">{venue.name}</h3>
              </header>
              <p className="text-gray-600">{venue.address}</p>
            </article>
          ))}
    </div>
  )

  const renderEvents = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.length === 0 && !loading.events
        ? renderEmptyState('No upcoming events at the moment.')
        : events.map((event) => {
            const hasOpted = optedInEvents.has(event.id)
            return (
            <article
              key={event.id}
              className="flex flex-col rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-sm transition hover:shadow-lg"
            >
              <header className="mb-3">
                <p className="text-xs uppercase tracking-wide text-purple-500">{event.venue?.category}</p>
                <h3 className="text-xl font-semibold text-gray-900">{event.event_name}</h3>
                <p className="text-sm text-gray-500">{event.venue?.name}</p>
              </header>

              <dl className="mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Start</dt>
                  <dd className="font-medium text-gray-900">{event.start}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">End</dt>
                  <dd className="font-medium text-gray-900">{event.end}</dd>
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

              {hasOpted && (
                <div className="mb-2">
                  <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    Already Opt In
                  </span>
                </div>
              )}

              <button
                onClick={() => handleOptIn(event.id)}
                disabled={hasOpted}
                className={`mt-auto rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                  hasOpted
                    ? 'cursor-not-allowed bg-gray-400 hover:bg-gray-400'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {hasOpted ? 'Already Opted In' : "I'm Interested"}
              </button>
            </article>
          )
          })}
    </div>
  )

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-gray-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-blue-500">Artist Dashboard</p>
              <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => updateView(VIEW.VENUES)}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                  view === VIEW.VENUES
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-blue-600 text-white/70 hover:text-white'
                }`}
              >
                View Venues
              </button>
              <button
                onClick={() => updateView(VIEW.EVENTS)}
                className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                  view === VIEW.EVENTS
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-purple-500 text-white/90 hover:bg-purple-600/90'
                }`}
              >
                View Events
              </button>
              <button
                onClick={logout}
                className="rounded-xl border border-indigo-200 px-5 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          <section className="mb-8 rounded-3xl bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg">
            <p className="text-sm uppercase tracking-wide text-white/70">Profile Summary</p>
            <div className="mt-3 flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-white/70">Name</p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Email</p>
                <p className="text-lg font-semibold break-all">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-white/70">Role</p>
                <p className="text-lg font-semibold">
                  {user?.role?.role || 'Artist'}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white/80 p-6 shadow">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">
                  {view === VIEW.VENUES ? 'Venues' : 'Events'}
                </p>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {view === VIEW.VENUES ? 'Discover stages to perform' : 'Upcoming gigs you can opt-in'}
                </h2>
              </div>
              {(loading.venues && view === VIEW.VENUES) || (loading.events && view === VIEW.EVENTS) ? (
                <span className="text-sm text-gray-500">Loading...</span>
              ) : null}
            </div>

            {view === VIEW.VENUES ? renderVenues() : renderEvents()}
          </section>
        </main>
      </div>
    </>
  )
}
