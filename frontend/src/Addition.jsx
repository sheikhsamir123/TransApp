// // ═══════════════════════════════════════════════════════════════
// // STEP 1 — Update App() routing: replace your current App return
// // ═══════════════════════════════════════════════════════════════

// function App() {
//   const [page, setPage]               = useState("FirstPage")
//   const [loggedInUser, setLoggedInUser] = useState("")
//   const [userType, setUserType]       = useState("")
//   const [tripData, setTripData]       = useState(null)
//   const [selectedService, setSelectedService] = useState("Ride")  // ← NEW

//   useEffect(() => {
//     const saved = localStorage.getItem("username")
//     const type  = localStorage.getItem("userType")
//     if (saved && type) { setLoggedInUser(saved); setUserType(type) }
//   }, [])

//   function handleLoginSuccess(username, type) {
//     localStorage.setItem("username", username)
//     localStorage.setItem("userType", type)
//     setLoggedInUser(username)
//     setUserType(type)
//     setPage("FirstPage")
//   }

//   function handleLogout() {
//     localStorage.clear()
//     setLoggedInUser("")
//     setUserType("")
//     setPage("FirstPage")
//   }

//   function handleTripBooked(data) { setTripData(data); setPage("trip") }

//   function handleServiceBook(serviceName) {    // ← NEW
//     setSelectedService(serviceName)
//     if (!loggedInUser) { setPage("loginas"); return }
//     setPage("book")
//   }

//   const goHistory = () => {
//     if (!loggedInUser) { setPage("loginas"); return }
//     setPage("history")
//   }

//   return (
//     <div style={styles.app}>
//       {page === "FirstPage" && (
//         <FirstPage
//           username={loggedInUser} userType={userType}
//           onLogin={() => setPage("loginas")} onLogout={handleLogout}
//           onBookRide={() => loggedInUser ? setPage("book") : setPage("loginas")}
//           onHistory={goHistory}
//           onServices={() => setPage("services")}                  // ← NEW
//           onNotifications={() => setPage("notifications")}        // ← NEW
//         />
//       )}
//       {page === "loginas"      && <LoginAs onPassenger={() => setPage("login")} onDriver={() => setPage("driverLogin")} onBack={() => setPage("FirstPage")} />}
//       {page === "login"        && <LoginPage onSwitch={() => setPage("signup")} onLoginSuccess={(u) => handleLoginSuccess(u, "passenger")} onBack={() => setPage("loginas")} />}
//       {page === "signup"       && <SignupPage onSwitch={() => setPage("login")} onBack={() => setPage("loginas")} />}
//       {page === "driverLogin"  && <DriverLoginPage onSwitch={() => setPage("driverSignup")} onLoginSuccess={(u) => handleLoginSuccess(u, "driver")} onBack={() => setPage("loginas")} />}
//       {page === "driverSignup" && <DriverSignupPage onSwitch={() => setPage("driverLogin")} onBack={() => setPage("loginas")} />}
//       {page === "book"         && <BookRidePage username={loggedInUser} serviceType={selectedService} onBack={() => setPage("services")} onTripBooked={handleTripBooked} />}
//       {page === "trip"         && <TripPage trip={tripData} onDone={() => setPage("FirstPage")} />}
//       {page === "history"      && <HistoryPage username={loggedInUser} onBack={() => setPage("FirstPage")} />}
//       {page === "services"     && <ServicesPage onBack={() => setPage("FirstPage")} onBook={handleServiceBook} isLoggedIn={!!loggedInUser} />}   {/* ← NEW */}
//       {page === "notifications" && <NotificationsPage username={loggedInUser} onBack={() => setPage("FirstPage")} />}  {/* ← NEW */}
//     </div>
//   )
// }


// // ═══════════════════════════════════════════════════════════════
// // STEP 2 — Update FirstPage: add Services to navbar + driver Notifications link
// // Only change the <nav> section inside FirstPage:
// // ═══════════════════════════════════════════════════════════════

// // Replace the navLinks div inside FirstPage with this:

// <div style={s.navLinks}>
//   <a href="#features" style={s.navLink}>Features</a>
//   <a href="#how"      style={s.navLink}>How it works</a>
//   <a href="#top"      style={s.navLink}>Top Riders</a>
//   <a href="#" style={s.navLink} onClick={(e) => { e.preventDefault(); onServices() }}>Services</a>
//   <a href="#" style={s.navLink} onClick={(e) => { e.preventDefault(); onHistory()  }}>History</a>
//   {userType === "driver" && (
//     <a href="#" style={{ ...s.navLink, color:"#f59e0b", fontWeight:"bold" }}
//        onClick={(e) => { e.preventDefault(); onNotifications() }}>
//       🔔 Notifications
//     </a>
//   )}
//   {username
//     ? <><span style={{...s.navLink, color:"#4f46e5", fontWeight:"bold"}}>{username}</span>
//         <button style={s.navBtnRed} onClick={onLogout}>Logout</button></>
//     : <button style={s.navBtn} onClick={onLogin}>Login</button>
//   }
// </div>
// // Also add onServices and onNotifications to FirstPage's props:
// // function FirstPage({ username, userType, onLogin, onLogout, onBookRide, onHistory, onServices, onNotifications })


// // ═══════════════════════════════════════════════════════════════
// // STEP 3 — ServicesPage component  (add this as a new component)
// // ═══════════════════════════════════════════════════════════════

// function ServicesPage({ onBack, onBook, isLoggedIn }) {
//   const SERVICES = [
//     {
//       name: "Ride",
//       icon: "🚗",
//       color: "#4f46e5",
//       bg: "#eef2ff",
//       desc: "Book a bike, CNG, or car to get anywhere in the city fast.",
//       badge: "Most Popular",
//     },
//     {
//       name: "Delivery",
//       icon: "📦",
//       color: "#059669",
//       bg: "#ecfdf5",
//       desc: "Send parcels, food, or documents across Kathmandu.",
//       badge: "Fast",
//     },
//     {
//       name: "Towing",
//       icon: "🚛",
//       color: "#dc2626",
//       bg: "#fef2f2",
//       desc: "Vehicle broke down? Get a tow truck to your location quickly.",
//       badge: "24/7",
//     },
//     {
//       name: "Repair",
//       icon: "🔧",
//       color: "#d97706",
//       bg: "#fffbeb",
//       desc: "On-site mechanic dispatched to fix minor vehicle issues.",
//       badge: "On-site",
//     },
//     {
//       name: "Ride + Towing",
//       icon: "🚗🚛",
//       color: "#7c3aed",
//       bg: "#f5f3ff",
//       desc: "Tow your vehicle and get a separate ride — booked together.",
//       badge: "Combo",
//     },
//     {
//       name: "Book Driver",
//       icon: "🧑‍✈️",
//       color: "#0284c7",
//       bg: "#f0f9ff",
//       desc: "Hire a personal driver for the day for your own vehicle.",
//       badge: "Hourly",
//     },
//   ]

//   return (
//     <div style={sv.page}>
//       {/* Header */}
//       <div style={sv.header}>
//         <span style={styles.backBtn} onClick={onBack}>← Back</span>
//         <div style={sv.headerText}>
//           <p style={sv.tag}>WHAT WE OFFER</p>
//           <h1 style={sv.title}>Our Services</h1>
//           <p style={sv.sub}>Everything you need — rides, deliveries, repairs and more</p>
//         </div>
//       </div>

//       {/* Service Cards */}
//       <div style={sv.grid}>
//         {SERVICES.map((svc) => (
//           <div key={svc.name} style={{ ...sv.card, borderTop: `4px solid ${svc.color}` }}>
//             <div style={{ ...sv.iconBox, backgroundColor: svc.bg }}>
//               <span style={sv.icon}>{svc.icon}</span>
//             </div>
//             <div style={{ ...sv.badge, backgroundColor: svc.bg, color: svc.color }}>{svc.badge}</div>
//             <h3 style={sv.cardTitle}>{svc.name}</h3>
//             <p style={sv.cardDesc}>{svc.desc}</p>
//             <button
//               style={{ ...sv.bookBtn, backgroundColor: svc.color }}
//               onClick={() => onBook(svc.name)}
//             >
//               {isLoggedIn ? `Book ${svc.name}` : "Login to Book"}
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// const sv = {
//   page:      { minHeight:"100vh", backgroundColor:"#f9fafb", padding:"48px 60px", fontFamily:"'Segoe UI', sans-serif" },
//   header:    { marginBottom:"48px" },
//   headerText:{ marginTop:"16px" },
//   tag:       { fontSize:"12px", fontWeight:"800", color:"#4f46e5", letterSpacing:"2px", margin:"0 0 8px" },
//   title:     { fontSize:"40px", fontWeight:"900", color:"#111", margin:"0 0 8px" },
//   sub:       { fontSize:"16px", color:"#666", margin:0 },
//   grid:      { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"24px" },
//   card:      { backgroundColor:"white", borderRadius:"16px", padding:"28px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"12px" },
//   iconBox:   { width:"60px", height:"60px", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center" },
//   icon:      { fontSize:"28px" },
//   badge:     { display:"inline-block", padding:"3px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:"bold", width:"fit-content" },
//   cardTitle: { fontSize:"18px", fontWeight:"800", color:"#111", margin:0 },
//   cardDesc:  { fontSize:"14px", color:"#666", lineHeight:1.6, margin:0, flex:1 },
//   bookBtn:   { padding:"10px 0", color:"white", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"bold", cursor:"pointer", marginTop:"auto" },
// }


// // ═══════════════════════════════════════════════════════════════
// // STEP 4 — NotificationsPage (add this as a new component)
// // ═══════════════════════════════════════════════════════════════

// function NotificationsPage({ username, onBack }) {
//   const [requests,   setRequests]   = useState([])
//   const [loading,    setLoading]    = useState(true)
//   const [location,   setLocation]   = useState(null)
//   const [locError,   setLocError]   = useState("")
//   const [accepting,  setAccepting]  = useState(null)
//   const [message,    setMessage]    = useState("")
//   const radiusKm = 5

//   // Get driver's location once
//   useEffect(() => {
//     if (!navigator.geolocation) { setLocError("Geolocation not supported by your browser"); setLoading(false); return }
//     navigator.geolocation.getCurrentPosition(
//       (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
//       ()    => setLocError("Could not get your location. Please allow location access."),
//     )
//   }, [])

//   // Poll for nearby requests every 10 seconds once we have location
//   useEffect(() => {
//     if (!location) return
//     fetchNearby()
//     const interval = setInterval(fetchNearby, 10000)
//     return () => clearInterval(interval)
//   }, [location])

//   async function fetchNearby() {
//     try {
//       const { data } = await axios.get("http://127.0.0.1:8000/driver/nearby-requests", {
//         params: { lat: location.lat, lng: location.lng, radius_km: radiusKm, driver_username: username }
//       })
//       setRequests(data.requests || [])
//     } catch { /* silently fail on poll */ }
//     setLoading(false)
//   }

//   async function acceptRequest(requestId) {
//     setAccepting(requestId)
//     try {
//       const { data } = await axios.post("http://127.0.0.1:8000/driver/accept-request", {
//         driver_username: username, request_id: requestId,
//       })
//       if (data.success) {
//         setMessage(`✓ Accepted! Head to the pickup location.`)
//         setRequests(prev => prev.filter(r => r.id !== requestId))
//       } else { setMessage(`✗ ${data.message}`) }
//     } catch { setMessage("Server error") }
//     setAccepting(null)
//   }

//   const serviceColor = { "Ride":"#4f46e5", "Delivery":"#059669", "Towing":"#dc2626", "Repair":"#d97706", "Ride + Towing":"#7c3aed", "Book Driver":"#0284c7" }
//   const serviceIcon  = { "Ride":"🚗", "Delivery":"📦", "Towing":"🚛", "Repair":"🔧", "Ride + Towing":"🚗🚛", "Book Driver":"🧑‍✈️" }

//   return (
//     <div style={{ ...styles.card, width:"520px", maxHeight:"90vh", overflowY:"auto" }}>
//       <div style={styles.pageHeader}>
//         <span style={styles.backBtn} onClick={onBack}>← Back</span>
//         <h2 style={styles.pageTitle}>🔔 Nearby Requests</h2>
//       </div>
//       <hr style={{ border:"none", borderTop:"1px solid #eee" }} />

//       {/* Location status */}
//       <div style={{ backgroundColor: location ? "#ecfdf5" : "#fef3c7", borderRadius:"10px", padding:"12px 16px", fontSize:"13px",
//                     color: location ? "#065f46" : "#92400e", display:"flex", alignItems:"center", gap:"8px" }}>
//         {location
//           ? `✅ Location active — scanning ${radiusKm}km radius · Auto-refreshes every 10s`
//           : locError
//             ? `⚠️ ${locError}`
//             : "📍 Getting your location…"
//         }
//       </div>

//       {message && (
//         <p style={{ margin:0, fontSize:"13px", textAlign:"center", color: message.startsWith("✓") ? "#16a34a" : "red" }}>{message}</p>
//       )}

//       {loading && <p style={{ textAlign:"center", color:"#999" }}>Scanning for nearby requests…</p>}

//       {!loading && requests.length === 0 && (
//         <div style={{ textAlign:"center", padding:"40px 0" }}>
//           <span style={{ fontSize:"48px" }}>🔍</span>
//           <p style={{ color:"#999", marginTop:"12px" }}>No requests nearby right now.</p>
//           <p style={{ color:"#bbb", fontSize:"13px" }}>We'll keep checking automatically.</p>
//         </div>
//       )}

//       {requests.map(req => (
//         <div key={req.id} style={{ border:`2px solid ${serviceColor[req.service_type] || "#4f46e5"}`, borderRadius:"14px", padding:"18px", display:"flex", flexDirection:"column", gap:"10px" }}>
//           <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//             <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
//               <span style={{ fontSize:"28px" }}>{serviceIcon[req.service_type] || "🚗"}</span>
//               <div>
//                 <p style={{ margin:0, fontWeight:"bold", fontSize:"15px", color:"#111" }}>{req.service_type}</p>
//                 <p style={{ margin:0, fontSize:"12px", color:"#888" }}>by {req.username} · {req.distance_km} km away</p>
//               </div>
//             </div>
//             <span style={{ backgroundColor: serviceColor[req.service_type] || "#4f46e5", color:"white", padding:"4px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"bold" }}>
//               NPR {req.fare}
//             </span>
//           </div>
//           <div style={{ backgroundColor:"#f9fafb", borderRadius:"8px", padding:"10px", fontSize:"13px", color:"#444", display:"flex", flexDirection:"column", gap:"6px" }}>
//             <p style={{ margin:0 }}>📍 <strong>Pickup:</strong> {req.pickup}</p>
//             <p style={{ margin:0 }}>🏁 <strong>Drop:</strong>   {req.destination}</p>
//           </div>
//           <button
//             style={{ ...styles.button, opacity: accepting === req.id ? 0.7 : 1 }}
//             onClick={() => acceptRequest(req.id)}
//             disabled={accepting === req.id}
//           >
//             {accepting === req.id ? "Accepting…" : "✅ Accept Request"}
//           </button>
//         </div>
//       ))}
//     </div>
//   )
// }


// // ═══════════════════════════════════════════════════════════════
// // STEP 5 — Update BookRidePage to accept serviceType prop
// // Change the component signature and title:
// // ═══════════════════════════════════════════════════════════════

// function BookRidePage({ username, onBack, onTripBooked, serviceType = "Ride" }) {

// // And update handleBooking to send service_type:
//   const { data } = await axios.post("http://127.0.0.1:8000/book-ride", {
//     username, pickup, destination, vehicle_type: vehicleType, service_type: serviceType,
//   })

// // And update the page title:
//   <h2 style={styles.pageTitle}>Book {serviceType}</h2>

// // Some services don't need a vehicle selection (Delivery, Repair, Book Driver).
// // Add this above the vehicle selector:
//   const showVehicle = !["Delivery","Repair","Book Driver"].includes(serviceType)
// // Then wrap the vehicle selector in: {showVehicle && ( ... )}


// // ═══════════════════════════════════════════════════════════════
// // STEP 6 — Backend additions  (add to main.py)
// // ═══════════════════════════════════════════════════════════════

// /*
// ─── Add service_type to the TripHistory model ───
// In class TripHistory, add:
//     service_type = Column(String, default="Ride")

// ─── Update BookRideData schema ───
// class BookRideData(BaseModel):
//     username: str
//     pickup: str
//     destination: str
//     vehicle_type: str
//     service_type: str = "Ride"     # ← ADD THIS

// ─── Update /book-ride to save service_type and coords ───
// In the book_ride function, update the TripHistory creation:
//     trip = TripHistory(
//         username=data.username,
//         pickup=data.pickup,
//         destination=data.destination,
//         vehicle_type=data.vehicle_type,
//         service_type=data.service_type,    # ← ADD
//         driver_name=driver.username,
//         fare=fare,
//         eta=eta,
//         pickup_lat=...,     # extract from data if you send coords
//         pickup_lng=...,
//         status="pending",
//     )

// ─── Add pickup_lat, pickup_lng, status to TripHistory ───
//     pickup_lat  = Column(Float, nullable=True)
//     pickup_lng  = Column(Float, nullable=True)
//     status      = Column(String, default="pending")  # pending | accepted | done

// ─── Add /driver/nearby-requests endpoint ───
// import math

// def haversine(lat1, lng1, lat2, lng2):
//     R = 6371  # Earth radius in km
//     dlat = math.radians(lat2 - lat1)
//     dlng = math.radians(lng2 - lng1)
//     a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
//     return R * 2 * math.asin(math.sqrt(a))

// @app.get("/driver/nearby-requests")
// async def nearby_requests(lat: float, lng: float, radius_km: float = 5, driver_username: str = "", db: Session = Depends(get_db)):
//     driver = db.query(Driver).filter(Driver.username == driver_username).first()
//     pending = db.query(TripHistory).filter(TripHistory.status == "pending").all()

//     nearby = []
//     for trip in pending:
//         if trip.pickup_lat is None or trip.pickup_lng is None:
//             continue
//         dist = haversine(lat, lng, trip.pickup_lat, trip.pickup_lng)
//         if dist <= radius_km:
//             nearby.append({
//                 "id":           trip.id,
//                 "username":     trip.username,
//                 "pickup":       trip.pickup,
//                 "destination":  trip.destination,
//                 "service_type": trip.service_type or "Ride",
//                 "vehicle_type": trip.vehicle_type,
//                 "fare":         trip.fare,
//                 "distance_km":  round(dist, 1),
//             })

//     nearby.sort(key=lambda x: x["distance_km"])
//     return {"success": True, "requests": nearby}


// ─── Add /driver/accept-request endpoint ───
// class AcceptRequest(BaseModel):
//     driver_username: str
//     request_id: int

// @app.post("/driver/accept-request")
// async def accept_request(data: AcceptRequest, db: Session = Depends(get_db)):
//     trip = db.query(TripHistory).filter(TripHistory.id == data.request_id).first()
//     if not trip:
//         return {"success": False, "message": "Request not found"}
//     if trip.status != "pending":
//         return {"success": False, "message": "Request already accepted"}
//     trip.status = "accepted"
//     db.commit()
//     return {"success": True, "message": "Request accepted!"}
// */












// ─────────────────────────────────────────────
// STEP 1 — Replace these imports at the top of App.jsx
// Remove the @react-google-maps/api imports entirely
// Add these instead:
// ─────────────────────────────────────────────

// import Map, { Marker, Source, Layer } from "react-map-gl"
// import "mapbox-gl/dist/mapbox-gl.css"

// Remove these lines:
// import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api"
// const LIBRARIES = ["places"]

// Keep this (just update coordinates to Kathmandu):
// const MAP_CENTER = { lat: 27.7172, lng: 85.3240 }

// const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

// // ─────────────────────────────────────────────
// // STEP 2 — Full BookRidePage replacement
// // ─────────────────────────────────────────────

// function BookRidePage({ username, onBack, onTripBooked, serviceType = "Ride" }) {
//   const [pickup,        setPickup]        = useState("")
//   const [destination,   setDestination]   = useState("")
//   const [vehicleType,   setVehicleType]   = useState("Bike")
//   const [message,       setMessage]       = useState("")
//   const [loading,       setLoading]       = useState(false)
//   const [pickupCoords,  setPickupCoords]  = useState(null)
//   const [destCoords,    setDestCoords]    = useState(null)
//   const [routeGeometry, setRouteGeometry] = useState(null)  // GeoJSON line for route
//   const [selectingFor,  setSelectingFor]  = useState("pickup")

//   const [viewport, setViewport] = useState({
//     latitude:  27.7172,
//     longitude: 85.3240,
//     zoom: 13,
//   })

//   // ── Reverse geocode: coords → address ──────
//   async function reverseGeocode(lng, lat) {
//     const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`
//     const res  = await fetch(url)
//     const data = await res.json()
//     if (data.features && data.features.length > 0) {
//       return data.features[0].place_name
//     }
//     return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
//   }

//   // ── Directions: draw route between two points ──
//   async function fetchRoute(from, to) {
//     const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
//     const res  = await fetch(url)
//     const data = await res.json()
//     if (data.routes && data.routes.length > 0) {
//       setRouteGeometry(data.routes[0].geometry)
//     }
//   }

//   // ── Map click handler ───────────────────────
//   async function handleMapClick(e) {
//     if (!selectingFor) return
//     const { lng, lat } = e.lngLat
//     const coords  = { lat, lng }
//     const address = await reverseGeocode(lng, lat)

//     if (selectingFor === "pickup") {
//       setPickupCoords(coords)
//       setPickup(address)
//       setSelectingFor("destination")
//       setMessage("✓ Pickup set! Now click to set destination")
//     } else {
//       setDestCoords(coords)
//       setDestination(address)
//       setSelectingFor(null)
//       setMessage("✓ Both locations set! Choose vehicle and confirm")
//       // draw route if pickup already set
//       if (pickupCoords) fetchRoute(pickupCoords, coords)
//     }
//   }

//   function resetLocations() {
//     setPickup(""); setDestination("")
//     setPickupCoords(null); setDestCoords(null)
//     setRouteGeometry(null); setSelectingFor("pickup"); setMessage("")
//   }

//   async function handleBooking() {
//     if (!pickup || !destination) { setMessage("Please select pickup and destination on the map"); return }
//     setLoading(true); setMessage("")
//     try {
//       const { data } = await axios.post("http://127.0.0.1:8000/book-ride", {
//         username, pickup, destination,
//         vehicle_type: vehicleType,
//         service_type: serviceType,
//         pickup_lat:   pickupCoords?.lat,
//         pickup_lng:   pickupCoords?.lng,
//       })
//       if (data.success) { onTripBooked(data) }
//       else { setMessage(`✗ ${data.message}`) }
//     } catch { setMessage("Server error — is FastAPI running?") }
//     setLoading(false)
//   }

//   const vehicles = [
//     { type: "Bike", icon: "🏍️", price: "NPR 50-80"   },
//     { type: "CNG",  icon: "🛺",  price: "NPR 80-120"  },
//     { type: "Car",  icon: "🚗",  price: "NPR 150-200" },
//   ]

//   const showVehicle = !["Delivery", "Repair", "Book Driver"].includes(serviceType)

//   // Route layer style
//   const routeLayer = {
//     id:   "route",
//     type: "line",
//     paint: {
//       "line-color": "#4f46e5",
//       "line-width": 4,
//       "line-opacity": 0.8,
//     },
//   }

//   return (
//     <div style={{ ...styles.card, width: "500px" }}>
//       <div style={styles.pageHeader}>
//         <span style={styles.backBtn} onClick={onBack}>← Back</span>
//         <h2 style={styles.pageTitle}>Book {serviceType}</h2>
//       </div>
//       <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

//       {/* Pickup / Destination buttons */}
//       <div style={styles.mapInstructions}>
//         {[["pickup", "📍", "Pickup"], ["destination", "🏁", "Destination"]].map(([key, icon, label]) => (
//           <button key={key} style={{
//             ...styles.mapBtn,
//             backgroundColor: selectingFor === key ? "#4f46e5"
//               : (key === "pickup" ? pickupCoords : destCoords) ? "#d1fae5" : "#e5e7eb",
//             color: selectingFor === key ? "white" : "#111",
//           }} onClick={() => setSelectingFor(key)}>
//             {icon} {(key === "pickup" ? pickupCoords : destCoords) ? `${label} ✓` : `Set ${label}`}
//           </button>
//         ))}
//         {(pickupCoords || destCoords) && (
//           <button style={{ ...styles.mapBtn, backgroundColor: "#fee2e2", color: "#dc2626" }} onClick={resetLocations}>
//             🔄 Reset
//           </button>
//         )}
//       </div>

//       {message && (
//         <p style={{ margin: 0, fontSize: "13px", textAlign: "center",
//           color: message.startsWith("✓") ? "#16a34a" : message.startsWith("✗") ? "red" : "#4f46e5" }}>
//           {message}
//         </p>
//       )}
//       {selectingFor && !message && (
//         <p style={{ margin: 0, fontSize: "13px", color: "#4f46e5", textAlign: "center" }}>
//           👆 Click on the map to set your {selectingFor}
//         </p>
//       )}

//       {/* Mapbox Map */}
//       <div style={{ borderRadius: "12px", overflow: "hidden", height: "280px" }}>
//         <Map
//           {...viewport}
//           onMove={(e) => setViewport(e.viewState)}
//           style={{ width: "100%", height: "100%" }}
//           mapStyle="mapbox://styles/mapbox/streets-v12"
//           mapboxAccessToken={MAPBOX_TOKEN}
//           onClick={handleMapClick}
//           cursor={selectingFor ? "crosshair" : "grab"}
//         >
//           {/* Pickup marker */}
//           {pickupCoords && (
//             <Marker latitude={pickupCoords.lat} longitude={pickupCoords.lng}>
//               <div style={markerStyle("#4f46e5")}>P</div>
//             </Marker>
//           )}

//           {/* Destination marker */}
//           {destCoords && (
//             <Marker latitude={destCoords.lat} longitude={destCoords.lng}>
//               <div style={markerStyle("#dc2626")}>D</div>
//             </Marker>
//           )}

//           {/* Route line */}
//           {routeGeometry && (
//             <Source type="geojson" data={{ type: "Feature", geometry: routeGeometry }}>
//               <Layer {...routeLayer} />
//             </Source>
//           )}
//         </Map>
//       </div>

//       {/* Address tags */}
//       {pickup      && <div style={styles.locationTag}><span>📍</span><span style={{ fontSize: "12px", color: "#444", flex: 1 }}>{pickup}</span></div>}
//       {destination && <div style={styles.locationTag}><span>🏁</span><span style={{ fontSize: "12px", color: "#444", flex: 1 }}>{destination}</span></div>}

//       {/* Vehicle selector */}
//       {showVehicle && (
//         <div>
//           <p style={styles.fieldLabel}>🚦 Select Vehicle</p>
//           <div style={styles.rideOptions}>
//             {vehicles.map(v => (
//               <div key={v.type} style={{
//                 ...styles.rideCard,
//                 border: vehicleType === v.type ? "2px solid #4f46e5" : "1px solid #e5e7eb",
//                 backgroundColor: vehicleType === v.type ? "#eef2ff" : "white",
//               }} onClick={() => setVehicleType(v.type)}>
//                 <span style={styles.rideIcon}>{v.icon}</span>
//                 <p style={styles.rideLabel}>{v.type}</p>
//                 <p style={styles.ridePrice}>{v.price}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <button
//         style={{ ...styles.button, opacity: (!pickup || !destination) ? 0.5 : 1 }}
//         onClick={handleBooking}
//         disabled={loading || !pickup || !destination}
//       >
//         {loading ? "Finding driver…" : "Confirm Booking"}
//       </button>
//     </div>
//   )
// }

// // Marker style helper
// function markerStyle(color) {
//   return {
//     backgroundColor: color,
//     color: "white",
//     fontWeight: "bold",
//     fontSize: "12px",
//     width: "28px",
//     height: "28px",
//     borderRadius: "50%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     border: "2px solid white",
//     boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
//     cursor: "pointer",
//   }
// }