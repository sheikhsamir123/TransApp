import { useState, useCallback, useEffect, useRef } from "react"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap,useMapEvents } from "react-leaflet"

import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix broken marker icons (required for Leaflet + Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon   from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
const API = "https://transapp-1.onrender.com"

import { HistoryPage, styles, s, sv,ActiveTripPage,TripPage,BookRidePage,AutoPan,RecenterMap,TrackingPage } from "./App1"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const LIBRARIES = ["places"]
const MAP_CENTER = { lat: 27.7172, lng: 85.3240 } // Kathmandu
// Add this once at the top of your App.jsx, outside all components
axios.defaults.timeout = 8000  // 8 seconds, then auto-throw error\\




// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
function App() {
  const [page, setPage]               = useState("FirstPage")
  const [loggedInUser, setLoggedInUser] = useState("")
  const [userType, setUserType]       = useState("")
  const [tripData, setTripData]       = useState(null)
  const [selectedService, setSelectedService] = useState("Ride")  // ← NEW
  const [trackingTripId, setTrackingTripId] = useState(null)

  useEffect(() => {
    console.log("Checking URL params for tracking...", window.location.search)
    const params = new URLSearchParams(window.location.search)
    const tripId = params.get("trip_id")
    if (tripId) {
      setTrackingTripId(Number(tripId))
      setPage("track")
    }
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("username")
    const type  = localStorage.getItem("userType")
    if (saved && type) { setLoggedInUser(saved); setUserType(type) }
  }, [])

  function handleLoginSuccess(username, type) {
    localStorage.setItem("username", username)
    localStorage.setItem("userType", type)
    setLoggedInUser(username)
    setUserType(type)
    setPage("FirstPage")
  }

  function handleLogout() {
    localStorage.clear()
    setLoggedInUser("")
    setUserType("")
    setPage("FirstPage")
  }
  
  function handleProfile() {
  if (!loggedInUser) { setPage("loginas"); return }
  setPage("profile")
  }

  function handleTripBooked(data) { setTripData(data); setPage("trip") }

  function handleServiceBook(serviceName) {    // ← NEW
    setSelectedService(serviceName)
    if (!loggedInUser) { setPage("loginas"); return }
    setPage("book")
  }

  const goHistory = () => {
    if (!loggedInUser) { setPage("loginas"); return }
    setPage("history")
  }

  return (
    <div style={styles.app}>
      {page === "FirstPage" && (
        <FirstPage
          username={loggedInUser} userType={userType}
          onLogin={() => setPage("loginas")} onLogout={handleLogout}
          onBookRide={() => loggedInUser ? setPage("book") : setPage("loginas")}
          onHistory={goHistory}
          onServices={() => setPage("services")}                  // ← NEW
          onNotifications={() => setPage("notifications")}        // ← NEW
          onProfile={handleProfile}
        />
      )}

      {page === "loginas"      && <LoginAs onPassenger={() => setPage("login")} onDriver={() => setPage("driverLogin")} onBack={() => setPage("FirstPage")} />}
      {page === "login"        && <LoginPage onSwitch={() => setPage("signup")} onLoginSuccess={(u) => handleLoginSuccess(u, "passenger")} onBack={() => setPage("loginas")} />}
      {page === "signup"       && <SignupPage onSwitch={() => setPage("login")} onBack={() => setPage("loginas")} />}
      {page === "driverLogin"  && <DriverLoginPage onSwitch={() => setPage("driverSignup")} onLoginSuccess={(u) => handleLoginSuccess(u, "driver")} onBack={() => setPage("loginas")} />}
      {page === "driverSignup" && <DriverSignupPage onSwitch={() => setPage("driverLogin")} onBack={() => setPage("loginas")} />}
      {page === "book"         && <BookRidePage username={loggedInUser} serviceType={selectedService} onBack={() => setPage("services")} onTripBooked={handleTripBooked} />}
      {page === "trip"         && (<TripPage trip={tripData} onDone={() => setPage("FirstPage")}/>)}
      {page === "track" && <TrackingPage tripId={trackingTripId} />}
      {page === "history"      && <HistoryPage username={loggedInUser} onBack={() => setPage("FirstPage")} userType={userType} />}
      {page === "services"     && <ServicesPage onBack={() => setPage("FirstPage")} onBook={handleServiceBook} isLoggedIn={!!loggedInUser} />}   {/* ← NEW */}
      {page === "notifications" && <NotificationsPage username={loggedInUser} onBack={() => setPage("FirstPage")} />}  {/* ← NEW */}
      {page === "profile" && (<ProfilePage username={loggedInUser} userType={userType} onBack={() => setPage("FirstPage")}/>)}
      {page === "admin" && <AdminPage onBack={() => setPage("FirstPage")} />}
    </div>
  )
}

// ─────────────────────────────────────────────
// FirstPage
// ─────────────────────────────────────────────
function FirstPage({ username, userType, onLogin, onLogout, onBookRide, onHistory, onServices, onNotifications, onProfile }) {
  const [topDrivers, setTopDrivers] = useState([])

  useEffect(() => {
    axios.get(`${API}/top-drivers`)
      .then(r => setTopDrivers(r.data.drivers || []))
      .catch(() => {}) 
  }, [])

  return (
    <div style={s.page}>
      {/* Navbar */}
      <nav style={s.nav}>
        <div style={s.navLogo}><span style={s.logoIcon}>🚀</span><span style={s.logoText}>TransApp</span></div>
        <div style={s.navLinks}>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#how"      style={s.navLink}>How it works</a>
          <a href="#top"      style={s.navLink}>Top Riders</a>
          <a href="#" style={s.navLink} onClick={(e) => { e.preventDefault(); onServices() }}>Services</a>
          <a href="#" style={s.navLink} onClick={(e) => { e.preventDefault(); onHistory()  }}>History</a>
          <a href="#" style={s.navLink} onClick={(e) => { e.preventDefault(); setPage("admin") }}>🛡 Admin</a>
          {userType === "driver" && (
            <a href="#" style={{ ...s.navLink, color:"#f59e0b", fontWeight:"bold" }}
              onClick={(e) => { e.preventDefault(); onNotifications() }}>
              🔔 Notifications
            </a>
          )}
          {username && (
            <a href="#" style={s.navLink} onClick={(e) => { e.preventDefault(); onProfile() }}>
              👤 Profile
            </a>
          )}
          {username
            ? <><span style={{...s.navLink, color:"#4f46e5", fontWeight:"bold"}}>{username}</span>
                <button style={s.navBtnRed} onClick={onLogout}>Logout</button></>
            : <button style={s.navBtn} onClick={onLogin}>Login</button>
          }
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge}>Built for Nepal</div>
        <h1 style={s.heroTitle}>Your ride,<br /><span style={s.heroAccent}>anywhere in Kathmandu</span></h1>
        <p style={s.heroSub}>Book a Bike, CNG, or Car in seconds. Track your driver live. Safe, fast, and affordable.</p>
        <button style={s.heroPrimary} onClick={onBookRide}>Book a Ride →</button>
        <div style={s.heroStats}>
          {[["10K+","Rides daily"],["500+","Active drivers"],["4.9★","Avg rating"]].map(([n,l]) => (
            <div key={l} style={s.stat}><span style={s.statNum}>{n}</span><span style={s.statLabel}>{l}</span></div>
          ))}
        </div>
      </section>

      {/* Ride Types */}
      <section id="features" style={s.section}>
        <p style={s.sectionTag}>RIDE OPTIONS</p>
        <h2 style={s.sectionTitle}>Choose your ride</h2>
        <div style={s.rideGrid}>
          {[
            { icon:"🏍️", name:"Bike",  price:"NPR 50–80",   desc:"Beat the traffic. Perfect for short trips.", tag:"Fastest" },
            { icon:"🛺",  name:"CNG",   price:"NPR 80–120",  desc:"Comfortable and affordable. Great for medium trips.", tag:"Popular" },
            { icon:"🚗",  name:"Car",   price:"NPR 150–200", desc:"AC rides for longer journeys.", tag:"Premium" },
          ].map(r => (
            <div key={r.name} style={s.rideCard}>
              <div style={s.rideTag}>{r.tag}</div>
              <div style={s.rideEmoji}>{r.icon}</div>
              <h3 style={s.rideName}>{r.name}</h3>
              <p style={s.rideDesc}>{r.desc}</p>
              <p style={s.ridePrice}>{r.price} per ride</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={s.sectionDark}>
        <p style={s.sectionTagLight}>HOW IT WORKS</p>
        <h2 style={s.sectionTitleLight}>Ride in 3 simple steps</h2>
        <div style={s.stepsGrid}>
          {[
            { num:"01", icon:"📍", title:"Set your location",    desc:"Tap on the map to set your pickup and destination." },
            { num:"02", icon:"🚗", title:"Match with a driver",  desc:"We instantly find the nearest available driver." },
            { num:"03", icon:"📱", title:"Track live",           desc:"Watch your driver arrive in real-time on the map." },
          ].map(step => (
            <div key={step.num} style={s.stepCard}>
              <div style={s.stepNum}>{step.num}</div>
              <div style={s.stepIcon}>{step.icon}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Top Drivers */}
      <section id="top" style={s.section}>
        <p style={s.sectionTag}>LEADERBOARD</p>
        <h2 style={s.sectionTitle}>Top Rated Drivers</h2>
        <p style={s.sectionSub}>Our highest-rated drivers, ranked by passenger feedback</p>
        {topDrivers.length === 0
          ? <p style={{ textAlign:"center", color:"#999", marginTop:"20px" }}>Loading top drivers…</p>
          : <div style={s.driverGrid}>
              {topDrivers.map((d, i) => (
                <div key={d.username} style={s.driverCard}>
                  <div style={s.driverRank}>#{i+1}</div>
                  <div style={s.driverEmoji}>{d.vehicle_type === "Bike" ? "🏍️" : d.vehicle_type === "CNG" ? "🛺" : "🚗"}</div>
                  <h3 style={s.driverName}>{d.username}</h3>
                  <p style={s.driverVehicle}>{d.vehicle_type}</p>
                  <div style={s.driverStats}>
                    <span style={s.driverStat}>⭐ {d.rating.toFixed(1)}</span>
                    <span style={s.driverStat}>🛣️ {d.number_of_rides} rides</span>
                    <span style={s.driverStat}>📅 {d.experience_years}yr exp</span>
                  </div>
                </div>
              ))}
            </div>
        }
      </section>

      {/* Testimonials */}
      <section style={{ ...s.section, backgroundColor:"#f9fafb" }}>
        <p style={s.sectionTag}>WHAT PEOPLE SAY</p>
        <h2 style={s.sectionTitle}>Loved by riders</h2>
        <div style={s.reviewGrid}>
          {[
            { name:"Fatima K.", area:"Baneshwor", text:"Found a CNG in 2 minutes during rush hour. Amazing!", rating:5 },
            { name:"Rahim H.",  area:"Thamel",    text:"Live tracking made me feel so safe. Will use daily!", rating:5 },
            { name:"Nasrin B.", area:"Patan",      text:"Best ride app in Kathmandu. Fair prices and friendly drivers.", rating:5 },
          ].map(r => (
            <div key={r.name} style={s.reviewCard}>
              <div style={s.reviewStars}>{"⭐".repeat(r.rating)}</div>
              <p style={s.reviewText}>"{r.text}"</p>
              <div style={s.reviewer}>
                <div style={s.reviewAvatar}>{r.name[0]}</div>
                <div><p style={s.reviewName}>{r.name}</p><p style={s.reviewArea}>{r.area}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <h2 style={s.ctaTitle}>Ready to ride?</h2>
        <p style={s.ctaSub}>Join thousands of daily riders across Kathmandu.</p>
        <button style={s.ctaBtn} onClick={onBookRide}>Get Started — It's Free</button>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div>
            <div style={s.navLogo}><span style={s.logoIcon}>🚀</span><span style={{...s.logoText, color:"white"}}>TransApp</span></div>
            <p style={s.footerDesc}>Fast, safe, affordable rides across Kathmandu.</p>
          </div>
          {[["Product",["Features","Pricing","Safety"]],["Company",["About","Careers","Contact"]],["Legal",["Privacy","Terms"]]].map(([head,links]) => (
            <div key={head} style={s.footerLinks}>
              <p style={s.footerLinkHead}>{head}</p>
              {links.map(l => <a key={l} style={s.footerLink} href="#">{l}</a>)}
            </div>
          ))}
        </div>
        <div style={s.footerBottom}><p style={s.footerCopy}>© 2025 TransApp. Made with ❤️ in Nepal.</p></div>
      </footer>
    </div>
  )
}

function ServicesPage({ onBack, onBook, isLoggedIn }) {
  const SERVICES = [
    {
      name: "Ride",
      icon: "🚗",
      color: "#4f46e5",
      bg: "#eef2ff",
      desc: "Book a bike, CNG, or car to get anywhere in the city fast.",
      badge: "Most Popular",
    },
    {
      name: "Delivery",
      icon: "📦",
      color: "#059669",
      bg: "#ecfdf5",
      desc: "Send parcels, food, or documents across Kathmandu.",
      badge: "Fast",
    },
    {
      name: "Towing",
      icon: "🚛",
      color: "#dc2626",
      bg: "#fef2f2",
      desc: "Vehicle broke down? Get a tow truck to your location quickly.",
      badge: "24/7",
    },
    {
      name: "Repair",
      icon: "🔧",
      color: "#d97706",
      bg: "#fffbeb",
      desc: "On-site mechanic dispatched to fix minor vehicle issues.",
      badge: "On-site",
    },
    {
      name: "Ride + Towing",
      icon: "🚗🚛",
      color: "#7c3aed",
      bg: "#f5f3ff",
      desc: "Tow your vehicle and get a separate ride — booked together.",
      badge: "Combo",
    },
    {
      name: "Book Driver",
      icon: "🧑‍✈️",
      color: "#0284c7",
      bg: "#f0f9ff",
      desc: "Hire a personal driver for the day for your own vehicle.",
      badge: "Hourly",
    },
  ]

  return (
    <div style={sv.page}>
      {/* Header */}
      <div style={sv.header}>
        <span style={styles.backBtn} onClick={onBack}>← Back</span>
        <div style={sv.headerText}>
          <p style={sv.tag}>WHAT WE OFFER</p>
          <h1 style={sv.title}>Our Services</h1>
          <p style={sv.sub}>Everything you need — rides, deliveries, repairs and more</p>
        </div>
      </div>

      {/* Service Cards */}
      <div style={sv.grid}>
        {SERVICES.map((svc) => (
          <div key={svc.name} style={{ ...sv.card, borderTop: `4px solid ${svc.color}` }}>
            <div style={{ ...sv.iconBox, backgroundColor: svc.bg }}>
              <span style={sv.icon}>{svc.icon}</span>
            </div>
            <div style={{ ...sv.badge, backgroundColor: svc.bg, color: svc.color }}>{svc.badge}</div>
            <h3 style={sv.cardTitle}>{svc.name}</h3>
            <p style={sv.cardDesc}>{svc.desc}</p>
            <button
              style={{ ...sv.bookBtn, backgroundColor: svc.color }}
              onClick={() => onBook(svc.name)}
            >
              {isLoggedIn ? `Book ${svc.name}` : "Login to Book"}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


function NotificationsPage({ username, onBack }) {
  const [requests,   setRequests]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [location,   setLocation]   = useState(null)
  const [locError,   setLocError]   = useState("")
  const [accepting,  setAccepting]  = useState(null)
  const [message,    setMessage]    = useState("")
  const radiusKm = 5
  const [activeTripId,   setActiveTripId]   = useState(null)
  const [activeTripData, setActiveTripData] = useState(null)
  // Get driver's location once
  useEffect(() => {
    if (!navigator.geolocation) { setLocError("Geolocation not supported by your browser"); setLoading(false); return }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      ()    => setLocError("Could not get your location. Please allow location access."),
    )
  }, [])

  // Poll for nearby requests every 10 seconds once we have location
  useEffect(() => {
    if (!location) return
    fetchNearby()
    const interval = setInterval(fetchNearby, 10000)
    return () => clearInterval(interval)
  }, [location])

  async function fetchNearby() {
    try {
      const { data } = await axios.get(`${API}/driver/nearby-requests`, {
        params: { lat: location.lat, lng: location.lng, radius_km: radiusKm, driver_username: username }
      })
      setRequests(data.requests || [])
    } catch { /* silently fail on poll */ }
    setLoading(false)
  }


  async function acceptRequest(requestId) {
    setAccepting(requestId)
    try {
      const { data } = await axios.post(`${API}/driver/accept-request`, {
        driver_username: username, request_id: requestId,
      })
      if (data.success) {
        setActiveTripData(data)
        setActiveTripId(data.trip_id)
      } else { setMessage(`✗ ${data.message}`) }
          } catch { setMessage("Server error") }
          setAccepting(null)
  }

  const serviceColor = { "Ride":"#4f46e5", "Delivery":"#059669", "Towing":"#dc2626", "Repair":"#d97706", "Ride + Towing":"#7c3aed", "Book Driver":"#0284c7" }
  const serviceIcon  = { "Ride":"🚗", "Delivery":"📦", "Towing":"🚛", "Repair":"🔧", "Ride + Towing":"🚗🚛", "Book Driver":"🧑‍✈️" }

  if (activeTripId) {
  return (
    <ActiveTripPage
      trip={activeTripData}
      driverUsername={username}
      tripId={activeTripId}
      onDone={() => { setActiveTripId(null); setActiveTripData(null) }}
    />
  )
  }
  return (
    <div style={{ ...styles.card, width:"520px", maxHeight:"90vh", overflowY:"auto" }}>
      <div style={styles.pageHeader}>
        <span style={styles.backBtn} onClick={onBack}>← Back</span>
        <h2 style={styles.pageTitle}>🔔 Nearby Requests</h2>
      </div>
      <hr style={{ border:"none", borderTop:"1px solid #eee" }} />

      {/* Location status */}
      <div style={{ backgroundColor: location ? "#ecfdf5" : "#fef3c7", borderRadius:"10px", padding:"12px 16px", fontSize:"13px",
                    color: location ? "#065f46" : "#92400e", display:"flex", alignItems:"center", gap:"8px" }}>
        {location
          ? `✅ Location active — scanning ${radiusKm}km radius · Auto-refreshes every 10s`
          : locError
            ? `⚠️ ${locError}`
            : "📍 Getting your location…"
        }
      </div>

      {message && (
        <p style={{ margin:0, fontSize:"13px", textAlign:"center", color: message.startsWith("✓") ? "#16a34a" : "red" }}>{message}</p>
      )}

      {loading && <p style={{ textAlign:"center", color:"#999" }}>Scanning for nearby requests…</p>}

      {!loading && requests.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <span style={{ fontSize:"48px" }}>🔍</span>
          <p style={{ color:"#999", marginTop:"12px" }}>No requests nearby right now.</p>
          <p style={{ color:"#bbb", fontSize:"13px" }}>We'll keep checking automatically.</p>
        </div>
      )}

      {requests.map(req => (
        <div key={req.id} style={{ border:`2px solid ${serviceColor[req.service_type] || "#4f46e5"}`, borderRadius:"14px", padding:"18px", display:"flex", flexDirection:"column", gap:"10px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <span style={{ fontSize:"28px" }}>{serviceIcon[req.service_type] || "🚗"}</span>
              <div>
                <p style={{ margin:0, fontWeight:"bold", fontSize:"15px", color:"#111" }}>{req.service_type}</p>
                <p style={{ margin:0, fontSize:"12px", color:"#888" }}>by {req.username} · {req.distance_km} km away</p>
              </div>
            </div>
            <span style={{ backgroundColor: serviceColor[req.service_type] || "#4f46e5", color:"white", padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"bold" }}>
              NPR {req.fare}
            </span>
          </div>
          <div style={{ backgroundColor:"#f9fafb", borderRadius:"8px", padding:"10px", fontSize:"13px", color:"#444", display:"flex", flexDirection:"column", gap:"6px" }}>
            <p style={{ margin:0 }}>📍 <strong>Pickup:</strong> {req.pickup}</p>
            <p style={{ margin:0 }}>🏁 <strong>Drop:</strong>   {req.destination}</p>
            {req.service_type === "Repair" ?(
              <>
            <p style={{ margin:0 }}>🕒 <strong>Requested:</strong> {req.repair_issues}</p>
            <p style={{ margin:0 }}>📝 <strong>Details:</strong> {req.repair_note}</p>
            </>
            ):(<></>)
            }
            </div>
          <button
            style={{ ...styles.button, opacity: accepting === req.id ? 0.7 : 1 }}
            onClick={() => acceptRequest(req.id)}
            disabled={accepting === req.id}
          >
            {accepting === req.id ? "Accepting…" : "✅ Accept Request"}
          </button>
        </div>
      ))}
    </div>
  )
}

const ADMIN_PASSWORD = "transapp_admin_2025"
const BASE_URL = `${API}`

function AdminPage({ onBack }) {
  const [authed,         setAuthed]         = useState(false)
  const [passwordInput,  setPasswordInput]  = useState("")
  const [passwordError,  setPasswordError]  = useState("")
  const [drivers,        setDrivers]        = useState([])
  const [loading,        setLoading]        = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)  // for doc preview modal
  const [rejectReason,   setRejectReason]   = useState("")
  const [actionMsg,      setActionMsg]      = useState("")
  const [acting,         setActing]         = useState(false)

  function handleLogin() {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthed(true)
      fetchPending()
    } else {
      setPasswordError("Wrong password")
    }
  }

  async function fetchPending() {
    setLoading(true)
    try {
      const { data } = await axios.get(`${BASE_URL}/admin/pending-drivers`, {
        params: { password: ADMIN_PASSWORD }
      })
      setDrivers(data.drivers || [])
    } catch { }
    setLoading(false)
  }

  async function handleAction(driverUsername, action) {
    if (action === "reject" && !rejectReason) {
      setActionMsg("❌ Please enter a rejection reason first.")
      return
    }
    setActing(true)
    try {
      const { data } = await axios.post(
        `${BASE_URL}/admin/verify-driver?password=${ADMIN_PASSWORD}`,
        {
          driver_username: driverUsername,
          action,
          reason: action === "reject" ? rejectReason : "",
        }
      )
      if (data.success) {
        setActionMsg(`✅ Driver ${action}d successfully!`)
        setDrivers(prev => prev.filter(d => d.username !== driverUsername))
        setSelectedDriver(null)
        setRejectReason("")
      } else {
        setActionMsg("❌ " + data.message)
      }
    } catch { setActionMsg("❌ Server error") }
    setActing(false)
  }

  const docLabels = {
    selfie:      "🤳 Selfie",
    citizenship: "🪪 Citizenship",
    license:     "🚗 License",
    bluebook:    "📘 Bluebook",
    bike_front:  "🏍️ Vehicle Front",
    bike_back:   "🔙 Vehicle Back",
  }

  // ── Login Screen ──
  if (!authed) {
    return (
      <div style={{ minHeight:"100vh", backgroundColor:"#f3f4f6", display:"flex",
                    alignItems:"center", justifyContent:"center" }}>
        <div style={{ backgroundColor:"white", borderRadius:"16px", padding:"40px",
                      width:"360px", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
          <span style={{ cursor:"pointer", fontSize:"13px", color:"#6b7280" }} onClick={onBack}>← Back</span>
          <h2 style={{ margin:"16px 0 4px", fontSize:"22px", fontWeight:"800" }}>🛡 Admin Panel</h2>
          <p style={{ margin:"0 0 24px", fontSize:"13px", color:"#6b7280" }}>TransApp internal use only</p>
          <input
            type="password"
            placeholder="Admin password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            style={{ width:"100%", padding:"12px", borderRadius:"8px", border:"1px solid #d1d5db",
                    fontSize:"14px", boxSizing:"border-box", marginBottom:"8px" }}
          />
          {passwordError && <p style={{ color:"#dc2626", fontSize:"13px", margin:"0 0 8px" }}>{passwordError}</p>}
          <button onClick={handleLogin}
            style={{ width:"100%", backgroundColor:"#4f46e5", color:"white", border:"none",
                    borderRadius:"10px", padding:"12px", fontWeight:"700", fontSize:"14px", cursor:"pointer" }}>
            Login
          </button>
        </div>
      </div>
    )
  }

  // ── Main Admin Panel ──
  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#f3f4f6", padding:"30px 16px" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
          <div>
            <span style={{ cursor:"pointer", fontSize:"13px", color:"#6b7280" }} onClick={onBack}>← Back</span>
            <h1 style={{ margin:"8px 0 0", fontSize:"24px", fontWeight:"800" }}>🛡 Document Verification</h1>
            <p style={{ margin:"4px 0 0", fontSize:"13px", color:"#6b7280" }}>
              {drivers.length} pending driver{drivers.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={fetchPending}
            style={{ backgroundColor:"white", border:"1px solid #d1d5db", borderRadius:"10px",
                  padding:"10px 18px", cursor:"pointer", fontSize:"14px", fontWeight:"600" }}>
            🔄 Refresh
          </button>
        </div>

        {actionMsg && (
          <div style={{ backgroundColor: actionMsg.startsWith("✅") ? "#ecfdf5" : "#fef2f2",
                        border: `1px solid ${actionMsg.startsWith("✅") ? "#6ee7b7" : "#fca5a5"}`,
                        borderRadius:"10px", padding:"12px 16px", marginBottom:"16px",
                        fontSize:"14px", color: actionMsg.startsWith("✅") ? "#065f46" : "#dc2626" }}>
            {actionMsg}
          </div>
        )}

        {loading && <p style={{ textAlign:"center", color:"#9ca3af" }}>Loading pending drivers…</p>}

        {!loading && drivers.length === 0 && (
          <div style={{ textAlign:"center", padding:"60px", backgroundColor:"white",
                        borderRadius:"16px", color:"#9ca3af" }}>
            <span style={{ fontSize:"48px" }}>🎉</span>
            <p style={{ marginTop:"12px", fontSize:"16px" }}>No pending verifications!</p>
          </div>
        )}

        {/* Driver Cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {drivers.map(driver => (
            <div key={driver.username}
              style={{ backgroundColor:"white", borderRadius:"16px", padding:"24px",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.06)", border:"1px solid #e5e7eb" }}>

              {/* Driver Info Row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                  <div style={{ width:"48px", height:"48px", borderRadius:"50%", backgroundColor:"#eef2ff",
                                display:"flex", alignItems:"center", justifyContent:"center",
                                fontSize:"20px", fontWeight:"800", color:"#4f46e5" }}>
                    {driver.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ margin:0, fontWeight:"700", fontSize:"16px" }}>@{driver.username}</p>
                    <p style={{ margin:0, fontSize:"13px", color:"#6b7280" }}>
                      {driver.vehicle_type} · {driver.phone} · Submitted {driver.submitted_at}
                    </p>
                  </div>
                </div>
                <span style={{ backgroundColor:"#fffbeb", color:"#d97706", padding:"4px 14px",
                            borderRadius:"20px", fontSize:"12px", fontWeight:"700", border:"1px solid #fcd34d" }}>
                  🕐 Pending
                </span>
              </div>

              {/* Document Thumbnails */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"10px", marginBottom:"16px" }}>
                {Object.entries(docLabels).map(([key, label]) => {
                  const filename = driver.documents[key]
                  return (
                    <div key={key} style={{ borderRadius:"10px", overflow:"hidden",
                                            border:"1px solid #e5e7eb", backgroundColor:"#f9fafb" }}>
                      {filename ? (
                        <a href={`${BASE_URL}/uploads/driver_docs/${filename}`} target="_blank" rel="noreferrer">
                          <img
                            src={`${BASE_URL}/uploads/driver_docs/${filename}`}
                            alt={label}
                            style={{ width:"100%", height:"100px", objectFit:"cover", display:"block" }}
                            onError={e => { e.target.style.display="none" }}
                          />
                          <p style={{ margin:0, padding:"6px 8px", fontSize:"11px",
                                      color:"#4f46e5", fontWeight:"600", textAlign:"center" }}>
                            {label} 🔗
                          </p>
                        </a>
                      ) : (
                        <div style={{ height:"100px", display:"flex", alignItems:"center",
                                      justifyContent:"center", flexDirection:"column", gap:"4px" }}>
                          <span style={{ fontSize:"24px" }}>❌</span>
                          <p style={{ margin:0, fontSize:"11px", color:"#9ca3af" }}>{label}</p>
                          <p style={{ margin:0, fontSize:"10px", color:"#d1d5db" }}>Not uploaded</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Reject Reason Input */}
              <input
                placeholder="Rejection reason (required if rejecting)…"
                value={selectedDriver === driver.username ? rejectReason : ""}
                onChange={e => { setSelectedDriver(driver.username); setRejectReason(e.target.value) }}
                style={{ width:"100%", padding:"10px 14px", borderRadius:"8px", fontSize:"13px",
                        border:"1px solid #d1d5db", boxSizing:"border-box", marginBottom:"12px" }}
              />

              {/* Action Buttons */}
              <div style={{ display:"flex", gap:"10px" }}>
                <button
                  onClick={() => handleAction(driver.username, "approve")}
                  disabled={acting}
                  style={{ flex:1, backgroundColor:"#059669", color:"white", border:"none",
                          borderRadius:"10px", padding:"12px", fontWeight:"700",
                          fontSize:"14px", cursor:"pointer" }}>
                  ✅ Approve
                </button>
                <button
                  onClick={() => { setSelectedDriver(driver.username); handleAction(driver.username, "reject") }}
                  disabled={acting}
                  style={{ flex:1, backgroundColor:"#dc2626", color:"white", border:"none",
                          borderRadius:"10px", padding:"12px", fontWeight:"700",
                          fontSize:"14px", cursor:"pointer" }}>
                  ❌ Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ProfilePage({ username, userType, onBack }) {
  // ── Passenger state ──
  const [contacts,        setContacts]        = useState([])
  const [name,            setName]            = useState("")
  const [phone,           setPhone]           = useState("")
  const [relation,        setRelation]        = useState("")
  const [email,           setEmail]           = useState("")
  const [contactMsg,      setContactMsg]      = useState("")

  // ── Driver state ──
  const [citizenshipFile, setCitizenshipFile] = useState(null)
  const [licenseFile,     setLicenseFile]     = useState(null)
  const [bluebookFile,    setBluebookFile]    = useState(null)
  const [selfieFile,      setSelfieFile]      = useState(null)
  const [bikeFrontFile,   setBikeFrontFile]   = useState(null)
  const [bikeBackFile,    setBikeBackFile]    = useState(null)
  const [uploadMsg,       setUploadMsg]       = useState("")
  const [uploading,       setUploading]       = useState(false)
  const [verificationInfo,setVerificationInfo]= useState(null)

  // Fetch verification status on mount (driver only)
  useEffect(() => {
    if (userType !== "driver") return
    axios.get(`${API}/driver/profile/${username}`)
      .then(r => {
        if (r.data.success) {
          setVerificationInfo({
            status: r.data.verification_status,
            reason: r.data.verification_reason,
            isNew:  r.data.newly_notified,
          })
        }
      })
      .catch(() => {})
  }, [username, userType])

  // Load saved contacts on mount (passenger only)
  useEffect(() => {
    if (userType !== "passenger") return
    axios.get(`${API}/passenger/family-contacts?username=${username}`)
      .then(r => setContacts(r.data.contacts || []))
      .catch(() => {})
  }, [username, userType])

  async function addContact() {
    if (!name || !phone || !email) {
      setContactMsg("Name, phone and email are required."); return
    }
    try {
      const { data } = await axios.post(`${API}/passenger/family-contacts`, {
        username, name, phone, email, relation,
      })
      if (data.success) {
        setContacts(prev => [...prev, { name, phone, email, relation }])
        setName(""); setPhone(""); setEmail(""); setRelation("")
        setContactMsg("✅ Contact added!")
      } else { setContactMsg("❌ " + data.message) }
    } catch { setContactMsg("❌ Server error") }
  }

  async function removeContact(index) {
    try {
      await axios.delete(`${API}/passenger/family-contacts`, {
        data: { username, index }
      })
      setContacts(prev => prev.filter((_, i) => i !== index))
    } catch { setContactMsg("❌ Could not remove contact") }
  }

  async function uploadDocs() {
    if ([selfieFile, citizenshipFile, licenseFile, bluebookFile, bikeFrontFile, bikeBackFile].some(f => !f)) {
      setUploadMsg("All 6 documents are required."); return
    }
    setUploading(true)
    const form = new FormData()
    form.append("username",    username)
    form.append("selfie",      selfieFile)
    form.append("citizenship", citizenshipFile)
    form.append("license",     licenseFile)
    form.append("bluebook",    bluebookFile)
    form.append("bike_front",  bikeFrontFile)
    form.append("bike_back",   bikeBackFile)
    try {
      const { data } = await axios.post(`${API}/driver/upload-docs`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      if (data.success) {
        setUploadMsg("✅ " + data.message)
        setVerificationInfo({ status: "pending", reason: "", isNew: false })
      } else {
        setUploadMsg("❌ " + data.message)
      }
    } catch { setUploadMsg("❌ Upload failed") }
    setUploading(false)
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #d1d5db", fontSize: "14px", outline: "none",
    boxSizing: "border-box",
  }
  const labelStyle = {
    fontSize: "13px", fontWeight: "600", color: "#374151",
    marginBottom: "4px", display: "block"
  }
  const sectionBox = {
    backgroundColor: "#f9fafb", borderRadius: "14px",
    padding: "24px", marginTop: "20px"
  }
  const uploadBox = {
    border: "2px dashed #d1d5db", borderRadius: "10px", padding: "5px",
    textAlign: "center", cursor: "pointer", backgroundColor: "white"
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "30px 16px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
          <span style={{ cursor: "pointer", fontSize: "14px", color: "#6b7280" }} onClick={onBack}>← Back</span>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#111" }}>👤 My Profile</h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>@{username} · {userType}</p>
          </div>
        </div>

        {/* ── PASSENGER: Family Contacts ── */}
        {userType === "passenger" && (
          <div style={sectionBox}>
            <h2 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700" }}>
              🏠 Family / Emergency Contacts
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#6b7280" }}>
              These contacts will receive a live tracking link when you book a ride.
            </p>

            {/* Existing contacts — display only */}
            {contacts.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
                {contacts.map((c, i) => (
                  <div key={i} style={{
                    backgroundColor: "white", borderRadius: "10px", padding: "12px 16px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "600", fontSize: "14px" }}>{c.name}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>
                        📞 {c.phone} · {c.relation || "—"}
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#4f46e5" }}>
                        ✉️ {c.email || "No email saved"}
                      </p>
                    </div>
                    <button onClick={() => removeContact(i)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "#ef4444", fontSize: "18px"
                    }}>🗑</button>
                  </div>
                ))}
              </div>
            )}

            {contacts.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", fontSize: "13px" }}>
                No contacts added yet.
              </div>
            )}

            {/* Add contact form */}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "18px" }}>
              <p style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "14px", color: "#111" }}>
                + Add New Contact
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input
                    style={inputStyle}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sita Thapa"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    style={inputStyle}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 98XXXXXXXX"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    style={inputStyle}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. family@gmail.com"
                    type="email"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Relation</label>
                  <input
                    style={inputStyle}
                    value={relation}
                    onChange={e => setRelation(e.target.value)}
                    placeholder="e.g. Mother, Brother"
                  />
                </div>

                {contactMsg && (
                  <p style={{
                    margin: 0, fontSize: "13px",
                    color: contactMsg.startsWith("✅") ? "#16a34a" : "#dc2626"
                  }}>
                    {contactMsg}
                  </p>
                )}

                <button onClick={addContact} style={{
                  backgroundColor: "#4f46e5", color: "white", border: "none",
                  borderRadius: "10px", padding: "12px", fontWeight: "700",
                  fontSize: "14px", cursor: "pointer"
                }}>
                  + Add Contact
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DRIVER: Document Upload ── */}
        {userType === "driver" && (
          <div style={sectionBox}>

            {/* Verification Status Banner */}
            {verificationInfo && (
              <div style={{
                borderRadius: "12px", padding: "14px 18px", marginBottom: "18px",
                backgroundColor:
                  verificationInfo.status === "verified" ? "#ecfdf5" :
                  verificationInfo.status === "rejected" ? "#fef2f2" :
                  verificationInfo.status === "pending"  ? "#fffbeb" : "#f3f4f6",
                border: `1.5px solid ${
                  verificationInfo.status === "verified" ? "#6ee7b7" :
                  verificationInfo.status === "rejected" ? "#fca5a5" :
                  verificationInfo.status === "pending"  ? "#fcd34d" : "#e5e7eb"}`,
                display: "flex", alignItems: "center", gap: "12px"
              }}>
                <span style={{ fontSize: "28px" }}>
                  {verificationInfo.status === "verified" ? "✅"
                  : verificationInfo.status === "rejected" ? "❌"
                  : verificationInfo.status === "pending"  ? "🕐"
                  : "📋"}
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "#111" }}>
                    {verificationInfo.status === "verified"  ? "Account Verified!"
                    : verificationInfo.status === "rejected" ? "Documents Rejected"
                    : verificationInfo.status === "pending"  ? "Verification Pending"
                    : "Documents Not Submitted"}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    {verificationInfo.status === "verified"  ? "You can now accept ride requests."
                    : verificationInfo.status === "rejected" ? `Reason: ${verificationInfo.reason} — Please re-upload.`
                    : verificationInfo.status === "pending"  ? "Our team will review your documents within 24–48 hours."
                    : "Submit your documents below to get verified."}
                  </p>
                </div>
                {verificationInfo.isNew && (
                  <span style={{
                    marginLeft: "auto", backgroundColor: "#4f46e5", color: "white",
                    padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700"
                  }}>
                    NEW
                  </span>
                )}
              </div>
            )}

            <h2 style={{ margin: "0 0 4px", fontSize: "17px", fontWeight: "700" }}>
              📄 Verification Documents
            </h2>
            <p style={{ margin: "0 0 18px", fontSize: "13px", color: "#6b7280" }}>
              Upload all required documents. Accepted: JPG, PNG.
            </p>

            {[
              { label:"🤳 Real-time Selfie *",         key:"selfie",      state:selfieFile,      setter:setSelfieFile,      hint:"Take a clear selfie of your face right now" },
              { label:"🪪 Citizenship Certificate *",   key:"citizenship", state:citizenshipFile, setter:setCitizenshipFile, hint:"All 4 corners visible" },
              { label:"🚗 Driving License *",           key:"license",     state:licenseFile,     setter:setLicenseFile,     hint:"Front side" },
              { label:"📘 Bluebook (Vehicle Reg.) *",   key:"bluebook",    state:bluebookFile,    setter:setBluebookFile,    hint:"First page" },
              { label:"🏍️ Vehicle Front Photo *",       key:"bike_front",  state:bikeFrontFile,   setter:setBikeFrontFile,   hint:"Number plate clearly visible" },
              { label:"🔙 Vehicle Back Photo *",        key:"bike_back",   state:bikeBackFile,    setter:setBikeBackFile,    hint:"Number plate clearly visible" },
            ].map(doc => (
              <div key={doc.key} style={{ marginBottom: "14px" }}>
                <label style={labelStyle}>{doc.label}</label>
                <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#9ca3af" }}>💡 {doc.hint}</p>
                <label style={{ ...uploadBox, borderColor: doc.state ? "#6ee7b7" : "#d1d5db" }}>
                  {doc.state
                    ? <span style={{ color: "#16a34a", fontWeight: "600" }}>✅ {doc.state.name}</span>
                    : <span style={{ color: "#9ca3af" }}>Click to choose file</span>
                  }
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={e => doc.setter(e.target.files[0] || null)}
                  />
                </label>
              </div>
            ))}

            {uploadMsg && (
              <p style={{
                margin: "0 0 12px", fontSize: "13px",
                color: uploadMsg.startsWith("✅") ? "#16a34a" : "#dc2626"
              }}>
                {uploadMsg}
              </p>
            )}

            <button onClick={uploadDocs} disabled={uploading} style={{
              backgroundColor: uploading ? "#a5b4fc" : "#4f46e5",
              color: "white", border: "none", borderRadius: "10px", padding: "12px",
              fontWeight: "700", fontSize: "14px",
              cursor: uploading ? "not-allowed" : "pointer", width: "100%"
            }}>
              {uploading ? "Uploading…" : "📤 Submit for Verification"}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LoginAs
// ─────────────────────────────────────────────
function LoginAs({ onPassenger, onDriver, onBack }) {
  return (
    <section style={s.sectionBright}>
      <span style={styles.backBtn3} onClick={onBack}>← Back</span>
      <p style={{...s.sectionTag, paddingTop:"80px", textAlign:"center"}}>CONTINUE AS</p>
      <h2 style={{...s.sectionTitle, textAlign:"center", marginBottom:"40px"}}>Who are you?</h2>
      <div style={s.stepsGrid}>
        <div style={s.loginBox}>
          <div style={s.stepNum}>01</div>
          <div style={s.stepIcon}>🧍</div>
          <h3 style={s.stepTitle}>Passenger</h3>
          <p style={s.stepDesc}>Book rides and track your driver live.</p>
          <button style={s.navBtn} onClick={onPassenger}>Login as Passenger</button>
        </div>
        <div style={s.loginBox}>
          <div style={s.stepNum}>02</div>
          <div style={s.stepIcon}>🚗</div>
          <h3 style={s.stepTitle}>Driver</h3>
          <p style={s.stepDesc}>Accept ride requests and manage your trips.</p>
          <button style={s.navBtn} onClick={onDriver}>Login as Driver</button>
        </div>
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
function PasswordInput({ placeholder, value, onChange, onKeyDown }) {
  const [show, setShow] = useState(false)
  return (
    <div style={styles.passwordWrapper}>
      <input style={styles.passwordInput} type={show ? "text" : "password"} placeholder={placeholder}
        value={value} onChange={onChange} onKeyDown={onKeyDown} />
      <span style={styles.eyeBtn} onClick={() => setShow(!show)}>{show ? "🙈" : "👁️"}</span>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type="text", onKeyDown }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
      <label style={styles.fieldLabel}>{label}</label>
      <input style={styles.input} type={type} placeholder={placeholder} value={value}
        onChange={onChange} onKeyDown={onKeyDown} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Passenger Login / Signup
// ─────────────────────────────────────────────
function LoginPage({ onSwitch, onLoginSuccess, onBack }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message,  setMessage]  = useState("")
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!username || !password) { setMessage("Please fill all fields"); return }
    setLoading(true); setMessage("")
    try {
      const { data } = await axios.post(`${API}/login`, { username, password })
      if (data.success) { onLoginSuccess(username) }
      else { setMessage(`✗ ${data.message}`) }
    } catch { setMessage("Server error — is FastAPI running?") }
    setLoading(false)
  }

  return (
    <div style={styles.card}>
      <span style={styles.backBtn2} onClick={onBack}>← Back</span>
      <h1 style={styles.title}>Welcome Back 👋</h1>
      <p style={styles.subtitle}>Passenger sign in</p>
      <Field label="Username" value={username} placeholder="Enter username" onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
      <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
        <label style={styles.fieldLabel}>Password</label>
        <PasswordInput placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
      </div>
      {message && <p style={{ ...styles.message, color:"red" }}>{message}</p>}
      <button style={styles.button} onClick={handleLogin} disabled={loading}>{loading ? "Signing in…" : "Login"}</button>
      <p style={styles.switchText}>Don't have an account?{" "}<span style={styles.switchLink} onClick={onSwitch}>Sign up</span></p>
    </div>
  )
}

 function SignupPage({ onSwitch, onBack }) {
  const [form, setForm] = useState({
    username: "", password: "", confirm_password: "", phone: ""
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSignup() {
    const { username, password, confirm_password, phone } = form
    if (!username || !password || !confirm_password || !phone) {
      setMessage("Please fill all fields"); return
    }
    setLoading(true); setMessage("")
    try {
      const { data } = await axios.post(`${API}/signup`, {
        username, password, confirm_password, phone,
      })
      if (data.success) { setMessage(`✓ ${data.message}`); setTimeout(() => onSwitch(), 2000) }
      else { setMessage(`✗ ${data.message}`) }
    } catch { setMessage("Server error — is FastAPI running?") }
    setLoading(false)
  }

  return (
    <div style={styles.card}>
      {onBack && <span style={styles.backBtn2} onClick={onBack}>← Back</span>}
      <h1 style={styles.title}>Create Account</h1>
      <p style={styles.subtitle}>Passenger sign up</p>

      <Field label="Username"     value={form.username}          placeholder="Choose a username"  onChange={set("username")} />
      <Field label="Phone Number" value={form.phone}             placeholder="e.g. 9800000000"    onChange={set("phone")} type="tel" />

      <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
        <label style={styles.fieldLabel}>Password</label>
        <PasswordInput placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
        <label style={styles.fieldLabel}>Confirm Password</label>
        <PasswordInput placeholder="Repeat password" value={form.confirm_password} onChange={set("confirm_password")}
          onKeyDown={e => e.key === "Enter" && handleSignup()} />
      </div>

      {message && <p style={{ ...styles.message, color: message.startsWith("✓") ? "green" : "red" }}>{message}</p>}
      <button style={styles.button} onClick={handleSignup} disabled={loading}>
        {loading ? "Creating account…" : "Sign Up"}
      </button>
      <p style={styles.switchText}>Already have an account?{" "}
        <span style={styles.switchLink} onClick={onSwitch}>Login</span>
      </p>
    </div>
  )
}


// ─────────────────────────────────────────────
// Driver Login / Signup
// ─────────────────────────────────────────────
function DriverLoginPage({ onSwitch, onLoginSuccess, onBack }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message,  setMessage]  = useState("")
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!username || !password) { setMessage("Please fill all fields"); return }
    setLoading(true); setMessage("")
    try {
      const { data } = await axios.post(`${API}/driver/login`, { username, password })
      if (data.success) { onLoginSuccess(username) }
      else { setMessage(`✗ ${data.message}`) }
    } catch { setMessage("Server error — is FastAPI running?") }
    setLoading(false)
  }

  return (
    <div style={styles.card}>
      <span style={styles.backBtn2} onClick={onBack}>← Back</span>
      <h1 style={styles.title}>Driver Login 🚗</h1>
      <p style={styles.subtitle}>Welcome back, driver</p>
      <Field label="Username" value={username} placeholder="Enter username" onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
      <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
        <label style={styles.fieldLabel}>Password</label>
        <PasswordInput placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key==="Enter" && handleLogin()} />
      </div>
      {message && <p style={{ ...styles.message, color:"red" }}>{message}</p>}
      <button style={styles.button} onClick={handleLogin} disabled={loading}>{loading ? "Signing in…" : "Login"}</button>
      <p style={styles.switchText}>New driver?{" "}<span style={styles.switchLink} onClick={onSwitch}>Register here</span></p>
    </div>
  )
}

function DriverSignupPage({ onSwitch, onBack }) {
  const [form, setForm] = useState({
    username:"", password:"", confirm_password:"",
    phone:"", vehicle_type:"Bike", experience_years:""
  })
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  async function handleSignup() {
    const { username, password, confirm_password, phone, vehicle_type, experience_years } = form
    if (!username || !password || !confirm_password || !phone || !experience_years) {
      setMessage("Please fill all fields"); return
    }
    setLoading(true); setMessage("")
    try {
      const { data } = await axios.post(`${API}/driver/signup`, {
        username, password, confirm_password,
        phone, vehicle_type, experience_years: parseFloat(experience_years),
      })
      if (data.success) { setMessage(`✓ ${data.message}`); setTimeout(() => onSwitch(), 2000) }
      else { setMessage(`✗ ${data.message}`) }
    } catch { setMessage("Server error — is FastAPI running?") }
    setLoading(false)
  }

  return (
    <div style={{ ...styles.card, width:"420px", maxHeight:"90vh", overflowY:"auto" }}>
      <span style={styles.backBtn2} onClick={onBack}>← Back</span>
      <h1 style={styles.title}>Driver Registration 🏍️</h1>
      <p style={styles.subtitle}>Fill in your details to get started</p>

      <Field label="Username"    value={form.username}    placeholder="Choose a username"    onChange={set("username")} />
      <Field label="Phone Number" value={form.phone}      placeholder="e.g. 9800000000"      onChange={set("phone")} type="tel" />

      <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
        <label style={styles.fieldLabel}>Vehicle Type</label>
        <select style={styles.input} value={form.vehicle_type} onChange={set("vehicle_type")}>
          <option value="Bike">🏍️ Bike</option>
          <option value="CNG">🛺 CNG</option>
          <option value="Car">🚗 Car</option>
        </select>
      </div>

      <Field label="Years of Experience" value={form.experience_years} placeholder="e.g. 2.5" onChange={set("experience_years")} type="number" />

      <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
        <label style={styles.fieldLabel}>Password</label>
        <PasswordInput placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
        <label style={styles.fieldLabel}>Confirm Password</label>
        <PasswordInput placeholder="Repeat password" value={form.confirm_password} onChange={set("confirm_password")} onKeyDown={e => e.key==="Enter" && handleSignup()} />
      </div>

      <div style={styles.infoBox}>
        <p style={{ margin:0, fontSize:"12px", color:"#6b7280" }}>
          📄 After registering, you can upload your license, NID and vehicle registration from your driver profile.
        </p>
      </div>

      {message && <p style={{ ...styles.message, color: message.startsWith("✓") ? "green" : "red" }}>{message}</p>}
      <button style={styles.button} onClick={handleSignup} disabled={loading}>{loading ? "Registering…" : "Register as Driver"}</button>
      <p style={styles.switchText}>Already have an account?{" "}<span style={styles.switchLink} onClick={onSwitch}>Login</span></p>
    </div>
  )
}

export default App











