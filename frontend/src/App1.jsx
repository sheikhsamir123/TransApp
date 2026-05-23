
import { useState, useEffect } from "react"
import axios from "axios"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap,useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix broken marker icons (required for Leaflet + Vite)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon   from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
const API = "https://transapp-1.onrender.com"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })



function makeIcon(color) {
  return L.divIcon({
    className: "",
    html: `<div style="
      background:${color};
      color:white;
      font-weight:bold;
      font-size:13px;
      width:30px;
      height:30px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    ">${color === "#4f46e5" ? "P" : "D"}</div>`,
    iconSize:   [30, 30],
    iconAnchor: [15, 15],
  })
}

// Inner component — handles map click events
function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: onMapClick })
  return null
}




    // ─────────────────────────────────────────────
// MAP HELPERS — defined OUTSIDE all page components
// ─────────────────────────────────────────────

function RecenterMap({ center }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

function AutoPan({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords) map.panTo([coords.lat, coords.lng], { animate: true, duration: 1 })
  }, [coords])
  return null
}

const REPAIR_ISSUES = [
  { id:"flat_tyre",      icon:"🔧", label:"Flat Tyre",          desc:"Puncture or completely flat tyre" },
  { id:"dead_battery",   icon:"🔋", label:"Dead Battery",        desc:"Car won't start, battery issue" },
  { id:"engine_trouble", icon:"⚙️", label:"Engine Trouble",      desc:"Strange noise or engine not running" },
  { id:"overheating",    icon:"🌡️", label:"Overheating",         desc:"Temperature warning light on" },
  { id:"brake_issue",    icon:"🛑", label:"Brake Issue",         desc:"Brakes feel weak or making noise" },
  { id:"fuel_empty",     icon:"⛽", label:"Out of Fuel",         desc:"Vehicle ran out of fuel" },
  { id:"chain_broken",   icon:"🔗", label:"Chain Broken",        desc:"Bike chain snapped or fell off" },
  { id:"accident_damage",icon:"💥", label:"Accident Damage",     desc:"Minor collision, need assessment" },
  { id:"electrical",     icon:"💡", label:"Electrical Issue",    desc:"Lights, indicators not working" },
  { id:"other",          icon:"❓", label:"Other Issue",         desc:"Something else not listed above" },
]

function RepairIssuePicker({ onSelect, selected, onConfirm }) {
  const [customNote, setCustomNote] = useState("")

  return (
    <div style={{ width:"500px", backgroundColor:"white", borderRadius:"16px",
                  padding:"24px", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>

      {/* Header */}
      <h2 style={{ margin:"0 0 4px", fontSize:"20px", fontWeight:"800", color:"#111" }}>
        🔧 What's the issue?
      </h2>
      <p style={{ margin:"0 0 20px", fontSize:"13px", color:"#6b7280" }}>
        Select all that apply — our mechanic will be prepared
      </p>

      {/* Issue Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
        {REPAIR_ISSUES.map(issue => {
          const isSelected = selected.includes(issue.id)
          return (
            <div key={issue.id}
              onClick={() => onSelect(issue.id)}
              style={{
                border: isSelected ? "2px solid #d97706" : "1px solid #e5e7eb",
                backgroundColor: isSelected ? "#fffbeb" : "white",
                borderRadius:"12px", padding:"14px", cursor:"pointer",
                transition:"all 0.15s"
              }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <span style={{ fontSize:"24px" }}>{issue.icon}</span>
                <div>
                  <p style={{ margin:0, fontWeight:"600", fontSize:"13px", color:"#111" }}>{issue.label}</p>
                  <p style={{ margin:0, fontSize:"11px", color:"#9ca3af" }}>{issue.desc}</p>
                </div>
                {isSelected && (
                  <span style={{ marginLeft:"auto", color:"#d97706", fontWeight:"800" }}>✓</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Custom note if "Other" selected */}
      {selected.includes("other") && (
        <div style={{ marginBottom:"16px" }}>
          <label style={{ fontSize:"13px", fontWeight:"600", color:"#374151",
                          marginBottom:"6px", display:"block" }}>
            Describe your issue *
          </label>
          <textarea
            value={customNote}
            onChange={e => setCustomNote(e.target.value)}
            placeholder="e.g. Strange sound from the engine when accelerating..."
            rows={3}
            style={{ width:"100%", padding:"10px 14px", borderRadius:"8px", border:"1px solid #d1d5db",
                    fontSize:"13px", outline:"none", boxSizing:"border-box", resize:"none" }}
          />
        </div>
      )}

      {/* Selected summary */}
      {selected.length > 0 && (
        <div style={{ backgroundColor:"#fffbeb", borderRadius:"10px", padding:"12px 16px",
                      marginBottom:"16px", fontSize:"13px", color:"#92400e" }}>
          <strong>Selected:</strong>{" "}
          {selected.map(id => REPAIR_ISSUES.find(i => i.id === id)?.label).join(", ")}
        </div>
      )}

      <button
        onClick={() => onConfirm(selected, customNote)}
        disabled={selected.length === 0}
        style={{
          width:"100%", backgroundColor: selected.length === 0 ? "#e5e7eb" : "#d97706",
          color: selected.length === 0 ? "#9ca3af" : "white",
          border:"none", borderRadius:"10px", padding:"13px",
          fontWeight:"700", fontSize:"15px",
          cursor: selected.length === 0 ? "not-allowed" : "pointer"
        }}>
        {selected.length === 0 ? "Select at least one issue" : `Continue with ${selected.length} issue${selected.length > 1 ? "s" : ""} →`}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// BookRidePage
// ─────────────────────────────────────────────
function BookRidePage({ username, onBack, onTripBooked, serviceType = "Ride" }) {
  const [pickup,       setPickup]       = useState("")
  const [destination,  setDestination]  = useState("")
  const [vehicleType,  setVehicleType]  = useState("Bike")
  const [message,      setMessage]      = useState("")
  const [loading,      setLoading]      = useState(false)
  const [pickupCoords, setPickupCoords] = useState(null)  // { lat, lng }
  const [destCoords,   setDestCoords]   = useState(null)
  const [routePoints,  setRoutePoints]  = useState([])    // array of [lat,lng] for polyline
  const [selectingFor, setSelectingFor] = useState("pickup")
  const [geocoding,    setGeocoding]    = useState(false)

  const [step,           setStep]           = useState(
    serviceType === "Repair" ? "issues" : "map"  // ← start on issues if Repair
  )
  const [selectedIssues, setSelectedIssues] = useState([])
  const [repairNote,     setRepairNote]     = useState("")

  // Auto-detect user's current location as default pickup
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setPickupCoords({ lat, lng })
      reverseGeocode(lat, lng).then(address => setPickup(address))
    })
  }, [])

  function toggleIssue(id) {
    setSelectedIssues(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  function handleIssueConfirm(issues, note) {
    setSelectedIssues(issues)
    setRepairNote(note)
    setStep("map")   // ← move to map after selecting issues
  }

  // ── Reverse geocode via Nominatim (free, no key) ──
  async function reverseGeocode(lat, lng) {
    setGeocoding(true)
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      )
      const data = await res.json()
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    } finally {
      setGeocoding(false)
    }
  }

  // ── Fetch route via OSRM (free, no key) ──
  async function fetchRoute(from, to) {
    try {
      const res  = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
      )
      const data = await res.json()
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        setRoutePoints(coords)
      }
    } catch { /* silently fail */ }
  }

  // ── Map click handler ──
  async function handleMapClick(e) {
    if (!selectingFor) return
    const { lat, lng } = e.latlng
    const coords  = { lat, lng }
    const address = await reverseGeocode(lat, lng)

    if (selectingFor === "pickup") {
      setPickupCoords(coords)
      setPickup(address)
      setSelectingFor("destination")
      setMessage("✓ Pickup set! Now click to set destination")
    } else {
      setDestCoords(coords)
      setDestination(address)
      setSelectingFor(null)
      setMessage("✓ Both locations set! Choose vehicle and confirm")
      if (pickupCoords) fetchRoute(pickupCoords, coords)
    }
  }

  function resetLocations() {
    setPickup(""); setDestination("")
    setPickupCoords(null); setDestCoords(null)
    setRoutePoints([]); setSelectingFor("pickup"); setMessage("")
  }

  async function handleBooking() {
    if (!pickup || !destination) { setMessage("Please select pickup and destination on the map"); return }
    setLoading(true); setMessage("")
    try {
      const { data } = await axios.post(`${API}/book-ride`, {
        username,
        pickup,
        destination,
        vehicle_type: vehicleType,
        service_type: serviceType,
        pickup_lat:   pickupCoords?.lat,
        pickup_lng:   pickupCoords?.lng,
        repair_issues : selectedIssues ,  // ← ADD
        repair_note :   repairNote ,     // ← ADD
      })
      if (data.success) {
        onTripBooked({
          ...data,
          pickup_lat: pickupCoords?.lat,  // pass coords to TripPage
          pickup_lng: pickupCoords?.lng,
        })
      } else {
        setMessage(`✗ ${data.message}`)
      }
    } catch (err) {
    // ← CHANGE THIS to see the real error
      console.log("Full error:", err)
      console.log("Response:", err.response?.data)
      console.log("Status:", err.response?.status)
      console.log("Message:", err.message)
      setMessage(`Error: ${err.message} — ${JSON.stringify(err.response?.data)}`)
    }
    setLoading(false)
  }

  const vehicles = [
    { type: "Bike", icon: "🏍️", price: "NPR 50-80"   },
    { type: "CNG",  icon: "🛺",  price: "NPR 80-120"  },
    { type: "Car",  icon: "🚗",  price: "NPR 150-200" },
  ]

  const showVehicle = !["Delivery", "Repair", "Book Driver"].includes(serviceType)

  if (step === "issues") {
    return (
      <div style={{ minHeight:"100vh", backgroundColor:"#f3f4f6",
                    display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
        <div>
          <span style={{ cursor:"pointer", color:"#4f46e5", fontWeight:"bold",
                        fontSize:"14px", display:"block", marginBottom:"12px" }}
            onClick={onBack}>← Back</span>
          <RepairIssuePicker
            selected={selectedIssues}
            onSelect={toggleIssue}
            onConfirm={handleIssueConfirm}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ ...styles.card, width: "500px" }}>
      <div style={styles.pageHeader}>
        <span style={styles.backBtn} onClick={() => serviceType === "Repair" ? setStep("issues") : onBack()}>← Back</span>
        <h2 style={styles.pageTitle}>Book {serviceType}</h2>
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #eee" }} />

      {serviceType === "Repair" && selectedIssues.length > 0 && (
        <div style={{ backgroundColor:"#fffbeb", border:"1px solid #fcd34d", borderRadius:"10px",
                      padding:"10px 14px", fontSize:"13px", color:"#92400e",
                      display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>🔧 {selectedIssues.map(id => REPAIR_ISSUES.find(i => i.id === id)?.label).join(", ")}</span>
          <span style={{ cursor:"pointer", color:"#d97706", fontWeight:"600" }}
            onClick={() => setStep("issues")}>Change</span>
        </div>
      )}

      {/* Pickup / Destination toggle buttons */}
      <div style={styles.mapInstructions}>
        {[["pickup", "📍", "Pickup"], ["destination", "🏁", "Destination"]].map(([key, icon, label]) => (
          <button key={key} style={{
            ...styles.mapBtn,
            backgroundColor: selectingFor === key ? "#4f46e5"
              : (key === "pickup" ? pickupCoords : destCoords) ? "#d1fae5" : "#e5e7eb",
            color: selectingFor === key ? "white" : "#111",
          }} onClick={() => setSelectingFor(key)}>
            {icon} {(key === "pickup" ? pickupCoords : destCoords) ? `${label} ✓` : `Set ${label}`}
          </button>
        ))}
        {(pickupCoords || destCoords) && (
          <button style={{ ...styles.mapBtn, backgroundColor: "#fee2e2", color: "#dc2626" }} onClick={resetLocations}>
            🔄 Reset
          </button>
        )}
      </div>

      {/* Status messages */}
      {geocoding && (
        <p style={{ margin: 0, fontSize: "13px", color: "#888", textAlign: "center" }}>
          📍 Getting address…
        </p>
      )}
      {!geocoding && message && (
        <p style={{ margin: 0, fontSize: "13px", textAlign: "center",
          color: message.startsWith("✓") ? "#16a34a" : message.startsWith("✗") ? "red" : "#4f46e5" }}>
          {message}
        </p>
      )}
      {selectingFor && !message && !geocoding && (
        <p style={{ margin: 0, fontSize: "13px", color: "#4f46e5", textAlign: "center" }}>
          👆 Click on the map to set your {selectingFor}
        </p>
      )}

      {/* Leaflet Map */}
      <div style={{ borderRadius: "12px", overflow: "hidden", height: "280px",
        cursor: selectingFor ? "crosshair" : "grab" }}>
        <MapContainer
          center={[27.7172, 85.3240]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Auto-center map on detected pickup location */}
          <RecenterMap
            center={pickupCoords ? [pickupCoords.lat, pickupCoords.lng] : [27.7172, 85.3240]}
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {pickupCoords && (
            <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={makeIcon("#4f46e5")} />
          )}
          {destCoords && (
            <Marker position={[destCoords.lat, destCoords.lng]} icon={makeIcon("#dc2626")} />
          )}
          {routePoints.length > 0 && (
            <Polyline positions={routePoints} color="#4f46e5" weight={4} opacity={0.8} />
          )}
        </MapContainer>
      </div>

      {/* Address display */}
      {pickup      && <div style={styles.locationTag}><span>📍</span><span style={{ fontSize: "12px", color: "#444", flex: 1 }}>{pickup}</span></div>}
      {destination && <div style={styles.locationTag}><span>🏁</span><span style={{ fontSize: "12px", color: "#444", flex: 1 }}>{destination}</span></div>}

      {/* Vehicle selector */}
      {showVehicle && (
        <div>
          <p style={styles.fieldLabel}>🚦 Select Vehicle</p>
          <div style={styles.rideOptions}>
            {vehicles.map(v => (
              <div key={v.type} style={{
                ...styles.rideCard,
                border:          vehicleType === v.type ? "2px solid #4f46e5" : "1px solid #e5e7eb",
                backgroundColor: vehicleType === v.type ? "#eef2ff" : "white",
              }} onClick={() => setVehicleType(v.type)}>
                <span style={styles.rideIcon}>{v.icon}</span>
                <p style={styles.rideLabel}>{v.type}</p>
                <p style={styles.ridePrice}>{v.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        style={{ ...styles.button, opacity: (!pickup || !destination) ? 0.5 : 1 }}
        onClick={handleBooking}
        disabled={loading || !pickup || !destination}
      >
        {loading ? "Finding driver…" : "Confirm Booking"}
      </button>
    </div>
  )
}


function TrackingPage({ tripId }) {
  const [tripInfo,     setTripInfo]     = useState(null)
  const [driverCoords, setDriverCoords] = useState(null)
  const [loading,      setLoading]      = useState(true)

  // Fetch trip info + poll driver location every 5s
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(`${API}/track/${tripId}`)
        if (data.success) {
          setTripInfo(data)
          if (data.driver_lat && data.driver_lng) {
            setDriverCoords({ lat: data.driver_lat, lng: data.driver_lng })
          }
        }
      } catch {}
      setLoading(false)
    }
    fetchData()
    const poll = setInterval(fetchData, 5000)
    return () => clearInterval(poll)
  }, [tripId])

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px" }}>
      <span style={{ fontSize:"48px" }}>📍</span>
      <p>Loading trip…</p>
    </div>
  )

  if (!tripInfo) return (
    <div style={{ textAlign:"center", padding:"60px" }}>
      <p style={{ color:"red" }}>Trip not found.</p>
    </div>
  )

  const pickupLatLng = tripInfo.pickup_lat && tripInfo.pickup_lng
    ? [Number(tripInfo.pickup_lat), Number(tripInfo.pickup_lng)]
    : [27.7172, 85.3240]

  return (
    <div style={{ minHeight:"100vh", backgroundColor:"#f3f4f6" }}>

      {/* Header */}
      <div style={{ backgroundColor:"#4f46e5", padding:"20px 24px", color:"white" }}>
        <h1 style={{ margin:0, fontSize:"20px", fontWeight:"800" }}>🚀 TransApp Live Tracking</h1>
        <p style={{ margin:"4px 0 0", fontSize:"13px", opacity:0.8 }}>Tracking {tripInfo.passenger}'s trip</p>
      </div>

      {/* Status bar */}
      <div style={{ backgroundColor: tripInfo.status==="accepted" ? "#ecfdf5" : "#fffbeb",
                    padding:"12px 24px", fontSize:"13px",
                    color: tripInfo.status==="accepted" ? "#065f46" : "#92400e",
                    display:"flex", alignItems:"center", gap:"8px" }}>
        {tripInfo.status === "accepted"
          ? `✅ Driver assigned — ${tripInfo.driver} is on the way`
          : "🕐 Waiting for driver to be assigned…"
        }
      </div>

      {/* Live Map */}
      <div style={{ height:"60vh" }}>
        <MapContainer center={pickupLatLng} zoom={14} style={{ width:"100%", height:"100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Passenger pickup — blue */}
          <Marker position={pickupLatLng} icon={makeIcon("#4f46e5")}>
            <Popup>📍 {tripInfo.passenger}'s pickup</Popup>
          </Marker>

          {/* Driver — yellow (live) */}
          {driverCoords && (
            <>
              <Marker position={[driverCoords.lat, driverCoords.lng]} icon={makeIcon("#f59e0b")}>
                <Popup>🚗 Driver is here</Popup>
              </Marker>
              <AutoPan coords={driverCoords} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Trip Details */}
      <div style={{ padding:"20px 24px" }}>
        <div style={{ backgroundColor:"white", borderRadius:"14px", padding:"18px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
          <p style={{ margin:"0 0 12px", fontWeight:"700", fontSize:"15px" }}>Trip Details</p>
          {[
            ["👤 Passenger", tripInfo.passenger],
            ["📍 Pickup",    tripInfo.pickup],
            ["🏁 Destination", tripInfo.destination],
            ["🚗 Driver",    tripInfo.driver || "Not assigned yet"],
            ["📊 Status",    tripInfo.status],
          ].map(([l, v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f3f4f6" }}>
              <span style={{ fontSize:"13px", color:"#6b7280" }}>{l}</span>
              <span style={{ fontSize:"13px", color:"#111", fontWeight:"600", textAlign:"right", maxWidth:"200px" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:"16px", justifyContent:"center", marginTop:"16px" }}>
          {[["#4f46e5","Passenger pickup"],["#f59e0b","Driver (live)"]].map(([color,label]) => (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#6b7280" }}>
              <div style={{ width:"12px", height:"12px", borderRadius:"50%", backgroundColor:color }} />
              {label}
            </div>
          ))}
        </div>

        <p style={{ textAlign:"center", fontSize:"12px", color:"#9ca3af", marginTop:"16px" }}>
          🔄 Auto-refreshes every 5 seconds
        </p>
      </div>
    </div>
  )
}


// ─────────────────────────────────────────────
// TripPage
// ─────────────────────────────────────────────
function TripPage({ trip, onDone }) {
  const [status,        setStatus]        = useState("pending")
  const [driverInfo,    setDriverInfo]    = useState(null)
  const [driverCoords,  setDriverCoords]  = useState(null)
  const [dots,          setDots]          = useState(".")
  const [rated,         setRated]         = useState(false)
  const [rating,        setRating]        = useState(0)
  const [ratingMessage, setRatingMessage] = useState("")

  // Universal error handler
  function handleError(err, customMessage = "Something went wrong") {
    console.log("========== ERROR START ==========")
    console.log("Message:", err?.message)
    console.log("Full Error:", err)
    console.log("Response:", err?.response)
    console.log("Response Data:", err?.response?.data)
    console.log("Status Code:", err?.response?.status)
    console.log("Request:", err?.request)
    console.log("Config:", err?.config)
    console.log("========== ERROR END ==========")

    setError(
      err?.response?.data?.message ||
      err?.message ||
      customMessage
    )
  }

  // Animate waiting dots
  useEffect(() => {
    if (status !== "pending") return
    const i = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 500)
    return () => clearInterval(i)
  }, [status])

  // Poll trip status every 3s until driver accepts
  useEffect(() => {
    if (!trip?.trip_id || status === "accepted") return
    const poll = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/trip-status/${trip.trip_id}`)
        if (data.status === "accepted") {
          setDriverInfo(data)
          setStatus("accepted")
          clearInterval(poll)
        }
      } catch (err) {
        handleError(err, "Failed to fetch trip status")
      }
    }, 3000)
    return () => clearInterval(poll)
  }, [trip?.trip_id, status])

  // Poll driver live location every 5s after accepted
  useEffect(() => {
    if (status !== "accepted" || !trip?.trip_id) return
    const poll = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/trip/driver-location/${trip.trip_id}`)
        if (data.success) setDriverCoords({ lat: data.lat, lng: data.lng })
      } catch (err) {
        handleError(err, "Failed to fetch trip status")
      }
    }, 5000)
    return () => clearInterval(poll)
  }, [status, trip?.trip_id])

  async function submitRating() {
    if (rating === 0) { setRatingMessage("Please select a star rating"); return }
    try {
      const { data } = await axios.post(`${API}/rate-driver`, {
        driver_username: driverInfo.driver, rating,
      })
      if (data.success) {
        setRated(true)
        setRatingMessage(`✓ Thanks! New rating: ⭐ ${data.new_rating}`)
      } else {
        setRatingMessage(`✗ ${data.message}`)
      }
    } catch {
      setRatingMessage("Could not submit rating")
    }
  }

  // ── Waiting screen ──
  if (status === "pending") {
    return (
      <div style={styles.card}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <span style={{ fontSize: "48px" }}>🔍</span>
          <h2 style={{ ...styles.title, textAlign: "center", marginTop: "16px" }}>
            Finding your driver{dots}
          </h2>
          <p style={{ ...styles.subtitle, textAlign: "center" }}>Nearby drivers are being notified</p>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
        <div style={styles.tripDetails}>
          {[
            ["📍 Pickup",  trip?.pickup      ?? "—"],
            ["🏁 Drop",    trip?.destination ?? "—"],
            ["Vehicle",    trip?.vehicle     ?? "—"],
            ["Fare",       `NPR ${trip?.fare ?? "—"}`],
          ].map(([l, v]) => (
            <div key={l} style={styles.tripRow}>
              <span style={styles.tripLabel}>{l}</span>
              <span style={{ ...styles.tripValue, fontSize: "11px", maxWidth: "200px", textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: "12px", color: "#bbb" }}>Checking every 3 seconds…</p>
        <button style={{ ...styles.button, backgroundColor: "#fee2e2", color: "#dc2626" }} onClick={onDone}>
          Cancel
        </button>
      </div>
    )
  }

  // Guard — driverInfo null safety
  if (!driverInfo) return (
    <div style={styles.card}>
      <p style={{ textAlign: "center", color: "#999" }}>Loading driver info…</p>
    </div>
  )

  // Safe coords — fall back to Kathmandu center if not available
  const pickupLatLng =
    trip?.pickup_lat != null && trip?.pickup_lng != null
      ? [Number(trip.pickup_lat), Number(trip.pickup_lng)]
      : [27.7172, 85.3240]

  // ── Accepted screen ──
  return (
    <div style={styles.card}>
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: "48px" }}>🎉</span>
        <h2 style={{ ...styles.title, textAlign: "center" }}>Driver Found!</h2>
        <p style={{ ...styles.subtitle, textAlign: "center" }}>Your ride is on the way</p>
      </div>

      {/* Driver Info Card */}
      <div style={styles.driverCard}>
        <div style={styles.driverAvatar}>
          {driverInfo.vehicle === "Bike" ? "🏍️" : driverInfo.vehicle === "CNG" ? "🛺" : "🚗"}
        </div>
        <div>
          <p style={styles.driverName}>{driverInfo.driver}</p>
          <p style={styles.driverDetail}>{driverInfo.vehicle} • ⭐ {driverInfo.rating}</p>
          <p style={styles.driverDetail}>📞 {driverInfo.phone}</p>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#4f46e5" }}>{driverInfo.eta}</p>
          <p style={{ margin: 0, fontSize: "11px", color: "#6b7280" }}>min away</p>
        </div>
      </div>

      {/* Live Map */}
      <div style={{ borderRadius: "12px", overflow: "hidden", height: "260px",
                    marginBottom: "12px", border: "2px solid #e0e7ff", position: "relative" }}>

        {/* Overlay shown until driver shares location */}
        {!driverCoords && (
          <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)",
                        backgroundColor: "white", padding: "6px 14px", borderRadius: "20px", fontSize: "12px",
                        color: "#6b7280", zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        whiteSpace: "nowrap", pointerEvents: "none" }}>
            📡 Waiting for driver location…
          </div>
        )}

        <MapContainer center={pickupLatLng} zoom={14} style={{ width: "100%", height: "100%" }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />

          {/* Blue marker = passenger pickup */}
          <Marker position={pickupLatLng} icon={makeIcon("#4f46e5")}>
            <Popup>Your pickup</Popup>
          </Marker>

          {/* Yellow marker = live driver position */}
          {driverCoords && (
            <>
              <Marker position={[driverCoords.lat, driverCoords.lng]} icon={makeIcon("#f59e0b")}>
                <Popup>🚗 {driverInfo.driver} is here</Popup>
              </Marker>
              <AutoPan coords={driverCoords} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "12px" }}>
        {[["#4f46e5", "Your pickup"], ["#f59e0b", "Driver (live)"]].map(([color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>

      {/* Trip Details */}
      <div style={styles.tripDetails}>
        {[
          ["ETA",     `⏱ ${driverInfo.eta} min`],
          ["Fare",    `NPR ${driverInfo.fare}`],
          ["Vehicle", driverInfo.vehicle],
        ].map(([l, v]) => (
          <div key={l} style={styles.tripRow}>
            <span style={styles.tripLabel}>{l}</span>
            <span style={styles.tripValue}>{v}</span>
          </div>
        ))}
      </div>

      {/* Rating */}
      {!rated ? (
        <div style={styles.ratingBox}>
          <p style={{ margin: "0 0 8px", fontSize: "14px", fontWeight: "bold", color: "#111" }}>
            Rate your driver
          </p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "8px" }}>
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star}
                style={{ fontSize: "28px", cursor: "pointer", opacity: star <= rating ? 1 : 0.3, transition: "opacity 0.15s" }}
                onClick={() => setRating(star)}>⭐</span>
            ))}
          </div>
          {ratingMessage && (
            <p style={{ margin: "0 0 8px", fontSize: "12px", color: "red", textAlign: "center" }}>
              {ratingMessage}
            </p>
          )}
          <button style={{ ...styles.button, padding: "8px", fontSize: "14px" }} onClick={submitRating}>
            Submit Rating
          </button>
        </div>
      ) : (
        <p style={{ textAlign: "center", color: "#16a34a", fontSize: "14px", fontWeight: "bold" }}>
          {ratingMessage}
        </p>
      )}

      <button style={{ ...styles.button, backgroundColor: "#f3f4f6", color: "#111" }} onClick={onDone}>
        Done
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────
// ActiveTripPage — Driver's navigation view
// ─────────────────────────────────────────────
function ActiveTripPage({ trip, driverUsername, tripId, onDone }) {
  const [driverCoords, setDriverCoords] = useState(null)
  const [routePoints,  setRoutePoints]  = useState([])
  const [watchId,      setWatchId]      = useState(null)
  const [locationErr,  setLocationErr]  = useState("")
  const [eta,          setEta]          = useState(null)
console.log("ActiveTripPage rendered with trip:", trip)
console.log("Pickup lat/lng from trip:", trip?.pickup_lat, trip?.pickup_lng)
console.log("Parsed pickup coords:", trip?.pickup_lat ? Number(trip.pickup_lat) : null, trip?.pickup_lng ? Number(trip.pickup_lng) : null)
console.log("Driver username:", driverUsername)
console.log("Trip ID:", tripId)
console.log("Driver coords state:", driverCoords)
  // Pickup position from trip data (sent by backend after accept)
  const pickupPosition = trip?.pickup_lat && trip?.pickup_lng
    ? [Number(trip.pickup_lat), Number(trip.pickup_lng)]
    : [27.7172, 85.3240]

  // Start watching driver GPS and sending to backend
  useEffect(() => {
    if (!navigator.geolocation) { setLocationErr("Geolocation not supported"); return }

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setDriverCoords(coords)

        // Send live location to backend so passenger can see it
        try {
          await axios.post(`${API}/driver/update-location`, {
            trip_id:         tripId,
            driver_username: driverUsername,
            lat:             coords.lat,
            lng:             coords.lng,
          })
        } catch (err) {
          console.log("===== ERROR START =====")
          console.log("Message:", err.message)
          console.log("Full Error Object:", err)
          console.log("Response:", err.response)
          console.log("Response Data:", err.response?.data)
          console.log("Status Code:", err.response?.status)
          console.log("Request:", err.request)
          console.log("Config:", err.config)
          console.log("===== ERROR END =====")

          setError(
            err.response?.data?.message ||
            err.message ||
            "Something went wrong"
          )
        }
      },
      () => setLocationErr("Could not get your location"),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
    setWatchId(id)
    return () => navigator.geolocation.clearWatch(id)
  }, [tripId])

  // Recalculate route every time driver moves
  useEffect(() => {
    if (!driverCoords || !trip?.pickup_lat) return
    fetchRoute(driverCoords, { lat: Number(trip.pickup_lat), lng: Number(trip.pickup_lng) })
  }, [driverCoords])

  async function fetchRoute(from, to) {
    try {
      const res  = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`
      )
      const data = await res.json()
      if (data.routes?.length > 0) {
        const coords = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
        setRoutePoints(coords)
        setEta(Math.ceil(data.routes[0].duration / 60))
      }
    } catch (err) {
      console.log("===== ERROR START =====")
      console.log("Message:", err.message)
      console.log("Full Error Object:", err)
      console.log("Response:", err.response)
      console.log("Response Data:", err.response?.data)
      console.log("Status Code:", err.response?.status)
      console.log("Request:", err.request)
      console.log("Config:", err.config)
      console.log("===== ERROR END =====")

      setError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong"
      )
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: "16px" }}>
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ backgroundColor: "#4f46e5", borderRadius: "16px", padding: "20px",
                      color: "white", marginBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", opacity: 0.8 }}>ACTIVE TRIP</p>
              <h2 style={{ margin: "4px 0 0", fontSize: "20px", fontWeight: "800" }}>Head to Pickup 📍</h2>
            </div>
            {eta && (
              <div style={{ textAlign: "center", backgroundColor: "rgba(255,255,255,0.2)",
                            borderRadius: "12px", padding: "10px 16px" }}>
                <p style={{ margin: 0, fontSize: "24px", fontWeight: "800" }}>{eta}</p>
                <p style={{ margin: 0, fontSize: "11px", opacity: 0.8 }}>min</p>
              </div>
            )}
          </div>
        </div>

        {/* GPS status */}
        <div style={{ backgroundColor: driverCoords ? "#ecfdf5" : "#fef3c7", borderRadius: "10px",
                      padding: "10px 16px", fontSize: "13px", marginBottom: "12px",
                      color: driverCoords ? "#065f46" : "#92400e" }}>
          {driverCoords
            ? "✅ GPS active — sharing location with passenger"
            : locationErr || "📍 Getting your location…"
          }
        </div>

        {/* Live Map */}
        <div style={{ borderRadius: "14px", overflow: "hidden", height: "380px",
                      marginBottom: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          <MapContainer
            center={driverCoords ? [driverCoords.lat, driverCoords.lng] : pickupPosition}
            zoom={14}
            style={{ width: "100%", height: "100%" }}
            zoomControl={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Driver's current position — yellow */}
            {driverCoords && (
              <>
                <Marker position={[driverCoords.lat, driverCoords.lng]} icon={makeIcon("#f59e0b")}>
                  <Popup>📍 You are here</Popup>
                </Marker>
                <AutoPan coords={driverCoords} />
              </>
            )}

            {/* Passenger pickup — blue */}
            <Marker position={pickupPosition} icon={makeIcon("#4f46e5")}>
              <Popup>🧍 Passenger pickup</Popup>
            </Marker>

            {/* Route line */}
            {routePoints.length > 0 && (
              <Polyline positions={routePoints} color="#4f46e5" weight={5} opacity={0.8} />
            )}
          </MapContainer>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "16px" }}>
          {[["#f59e0b", "You (driver)"], ["#4f46e5", "Passenger pickup"]].map(([color, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6b7280" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>

        {/* Trip Info */}
        <div style={{ backgroundColor: "white", borderRadius: "14px", padding: "18px",
                      marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 12px", fontWeight: "700", fontSize: "15px" }}>Trip Details</p>
          {[["📍 Pickup", trip?.pickup ?? "—"], ["🏁 Destination", trip?.destination ?? "—"]].map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
              <span style={{ fontSize: "13px", color: "#6b7280", minWidth: "90px" }}>{l}</span>
              <span style={{ fontSize: "12px", color: "#111", textAlign: "right", maxWidth: "280px" }}>{v}</span>
            </div>
          ))}
        </div>

        <button
          style={{ width: "100%", backgroundColor: "#dc2626", color: "white", border: "none",
            borderRadius: "12px", padding: "14px", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}
          onClick={() => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
            onDone()
          }}
        >
          ✅ Trip Complete
        </button>

      </div>
    </div>
  )
}


// ─────────────────────────────────────────────
// HistoryPage
// ─────────────────────────────────────────────
function HistoryPage({ username, onBack,userType }) {
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState("")

  useEffect(() => {
      console.log("Fetching history for:", username)  // ← add this
    axios.get(`${API}/history/${username}/${userType}`)   // ← include userType
      .then(r => { setTrips(r.data.trips || []); setLoading(false) })
      .catch(() => { setError("Could not load history"); setLoading(false) })
  }, [username])

  return (
    <div style={{ ...styles.card, width:"500px", maxHeight:"90vh", overflowY:"auto" }}>
      <div style={styles.pageHeader}>
        <span style={styles.backBtn} onClick={onBack}>← Back</span>
        <h2 style={styles.pageTitle}>Trip History</h2>
      </div>
      <hr style={{ border:"none", borderTop:"1px solid #eee" }} />

      {loading && <p style={{ textAlign:"center", color:"#999" }}>Loading your trips…</p>}
      {error   && <p style={{ textAlign:"center", color:"red"  }}>{error}</p>}
      {!loading && !error && trips.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 0" }}>
          <span style={{ fontSize:"48px" }}>🗺️</span>
          <p style={{ color:"#999", marginTop:"12px" }}>No trips yet — book your first ride!</p>
        </div>
      )}
      {trips.map(trip => (
        <div key={trip.id} style={styles.historyCard}>
          <div style={styles.historyLeft}>
            <span style={{ fontSize:"28px" }}>{trip.vehicle_type==="Bike" ? "🏍️" : trip.vehicle_type==="CNG" ? "🛺" : "🚗"}</span>
            <div>
              <p style={styles.historyVehicle}>{trip.vehicle_type} • NPR {trip.fare}</p>
              <p style={styles.historyDate}>{trip.booked_at}</p>
            </div>
          </div>
          <div style={styles.historyRoute}>
            <p style={styles.historyStop}><span style={{ color:"#4f46e5" }}>📍</span> {trip.pickup}</p>
            <div style={styles.historyLine} />
            <p style={styles.historyStop}><span style={{ color:"#dc2626" }}>🏁</span> {trip.destination}</p>
          </div>
          <div style={styles.historyMeta}>
            {userType === "passenger" ? 
              (
                <>
                  <span style={styles.historyBadge}>
                    Driver: {trip.driver_name || "Pending"}
                  </span>

                  <span style={styles.historyBadge}>
                    📞 {trip.driver_phone || "N/A"}
                  </span>
                </>
              ) : 
              (
                <>
                  <span style={styles.historyBadge}>
                    Passenger: {trip.user_name || "Pending"}
                  </span>

                  <span style={styles.historyBadge}>
                    📞 {trip.user_phone || "N/A"}
                  </span>
                </>
              )
            }
            <span style={styles.historyBadge}>ETA was {trip.eta} min</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const styles = {
  app: { minHeight:"100vh", backgroundColor:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  card: { backgroundColor:"white", padding:"40px", borderRadius:"16px", boxShadow:"0 4px 24px rgba(0,0,0,0.08)", width:"380px", display:"flex", flexDirection:"column", gap:"16px" },
  title: { margin:0, fontSize:"22px", fontWeight:"bold", color:"#111" },
  subtitle: { margin:0, fontSize:"14px", color:"#666" },
  input: { padding:"12px 16px", borderRadius:"10px", border:"1px solid #ddd", fontSize:"14px", outline:"none", width:"100%", boxSizing:"border-box" },
  passwordWrapper: { position:"relative", width:"100%" },
  passwordInput: { padding:"12px 44px 12px 16px", borderRadius:"10px", border:"1px solid #ddd", fontSize:"14px", outline:"none", width:"100%", boxSizing:"border-box" },
  eyeBtn: { position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", cursor:"pointer", fontSize:"18px", userSelect:"none" },
  button: { padding:"12px", backgroundColor:"#4f46e5", color:"white", border:"none", borderRadius:"10px", fontSize:"16px", cursor:"pointer", fontWeight:"bold" },
  message: { margin:0, fontSize:"14px", textAlign:"center" },
  switchText: { margin:0, fontSize:"13px", color:"#666", textAlign:"center" },
  switchLink: { color:"#4f46e5", cursor:"pointer", fontWeight:"bold" },
  fieldLabel: { fontSize:"12px", fontWeight:"600", color:"#555", textTransform:"uppercase", letterSpacing:"0.5px" },
  backBtn: { cursor:"pointer", color:"#4f46e5", fontWeight:"bold", fontSize:"14px" },
  backBtn2: { position:"absolute", top:"169px", left:"400px", cursor:"pointer", color:"#4f46e5", fontWeight:"bold" },
  backBtn3: { position:"absolute", top:"120px", left:"230px", cursor:"pointer", color:"#4f46e5", fontWeight:"bold" },
  pageHeader: { display:"flex", alignItems:"center", gap:"12px" },
  pageTitle: { margin:0, fontSize:"18px", fontWeight:"bold", color:"#111" },
  mapInstructions: { display:"flex", gap:"10px" },
  mapBtn: { flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight:"bold", fontSize:"12px" },
  mapPlaceholder: { width:"100%", height:"280px", backgroundColor:"#f3f4f6", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", color:"#999" },
  locationTag: { display:"flex", alignItems:"flex-start", gap:"8px", backgroundColor:"#f9fafb", borderRadius:"8px", padding:"10px" },
  rideOptions: { display:"flex", gap:"12px", justifyContent:"space-between" },
  rideCard: { flex:1, borderRadius:"12px", padding:"16px 8px", textAlign:"center", cursor:"pointer" },
  rideIcon: { fontSize:"28px" },
  rideLabel: { margin:"4px 0 0", fontSize:"13px", fontWeight:"bold", color:"#111" },
  ridePrice: { margin:"2px 0 0", fontSize:"11px", color:"#666" },
  driverCard: { display:"flex", alignItems:"center", gap:"16px", backgroundColor:"#f9fafb", borderRadius:"12px", padding:"16px" },
  driverAvatar: { fontSize:"40px" },
  driverName: { margin:0, fontSize:"16px", fontWeight:"bold", color:"#111" },
  driverDetail: { margin:"2px 0 0", fontSize:"13px", color:"#666" },
  tripDetails: { backgroundColor:"#f9fafb", borderRadius:"12px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" },
  tripRow: { display:"flex", justifyContent:"space-between" },
  tripLabel: { fontSize:"13px", color:"#666" },
  tripValue: { fontSize:"13px", fontWeight:"bold", color:"#111" },
  ratingBox: { backgroundColor:"#fffbeb", border:"1px solid #fde68a", borderRadius:"12px", padding:"16px", display:"flex", flexDirection:"column", gap:"6px" },
  historyCard: { border:"1px solid #e5e7eb", borderRadius:"12px", padding:"16px", display:"flex", flexDirection:"column", gap:"10px" },
  historyLeft: { display:"flex", alignItems:"center", gap:"12px" },
  historyVehicle: { margin:0, fontWeight:"bold", fontSize:"14px", color:"#111" },
  historyDate: { margin:0, fontSize:"12px", color:"#999" },
  historyRoute: { display:"flex", flexDirection:"column", gap:"4px", paddingLeft:"8px", borderLeft:"2px solid #e5e7eb" },
  historyStop: { margin:0, fontSize:"12px", color:"#444" },
  historyLine: { height:"8px", borderLeft:"2px dashed #ddd", marginLeft:"6px" },
  historyMeta: { display:"flex", gap:"8px", flexWrap:"wrap" },
  historyBadge: { backgroundColor:"#f3f4f6", borderRadius:"6px", padding:"4px 8px", fontSize:"11px", color:"#555" },
  infoBox: { backgroundColor:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:"8px", padding:"12px" },
}

// ─────────────────────────────────────────────
// Landing page styles (s.*)
// ─────────────────────────────────────────────
const s = {
  page: { fontFamily:"'Segoe UI', sans-serif", backgroundColor:"white", minHeight:"100vh" },
  nav: { position:"sticky", top:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 60px", backgroundColor:"white", boxShadow:"0 1px 0 #eee" },
  navLogo: { display:"flex", alignItems:"center", gap:"8px" },
  logoIcon: { fontSize:"22px" },
  logoText: { fontSize:"20px", fontWeight:"800", color:"#111" },
  navLinks: { display:"flex", alignItems:"center", gap:"24px" },
  navLink: { fontSize:"14px", color:"#555", textDecoration:"none", fontWeight:"500", cursor:"pointer" },
  navBtn: { padding:"8px 20px", backgroundColor:"#4f46e5", color:"white", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"bold", cursor:"pointer" },
  navBtnRed: { padding:"8px 20px", backgroundColor:"#fee2e2", color:"#dc2626", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"bold", cursor:"pointer" },
  hero: { padding:"100px 60px 80px", background:"linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)", textAlign:"center" },
  heroBadge: { display:"inline-block", backgroundColor:"#eef2ff", color:"#4f46e5", padding:"6px 16px", borderRadius:"20px", fontSize:"13px", fontWeight:"bold", marginBottom:"20px" },
  heroTitle: { fontSize:"56px", fontWeight:"900", color:"#111", lineHeight:1.1, margin:"0 0 20px" },
  heroAccent: { color:"#4f46e5" },
  heroSub: { fontSize:"18px", color:"#555", maxWidth:"560px", margin:"0 auto 32px", lineHeight:1.6 },
  heroPrimary: { padding:"14px 32px", backgroundColor:"#4f46e5", color:"white", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:"bold", cursor:"pointer", marginBottom:"48px" },
  heroStats: { display:"flex", justifyContent:"center", gap:"48px" },
  stat: { display:"flex", flexDirection:"column", alignItems:"center" },
  statNum: { fontSize:"28px", fontWeight:"900", color:"#4f46e5" },
  statLabel: { fontSize:"13px", color:"#888", marginTop:"4px" },
  section: { padding:"80px 60px", backgroundColor:"white" },
  sectionDark: { padding:"80px 60px", backgroundColor:"#111" },
  sectionBright: { padding:"80px 60px", backgroundColor:"#f9fafb", minHeight:"100vh" },
  sectionTag: { fontSize:"12px", fontWeight:"800", color:"#4f46e5", letterSpacing:"2px", marginBottom:"12px" },
  sectionTagLight: { fontSize:"12px", fontWeight:"800", color:"#a5b4fc", letterSpacing:"2px", marginBottom:"12px" },
  sectionTitle: { fontSize:"36px", fontWeight:"800", color:"#111", marginBottom:"12px" },
  sectionTitleLight: { fontSize:"36px", fontWeight:"800", color:"white", marginBottom:"40px" },
  sectionSub: { fontSize:"16px", color:"#777", marginBottom:"40px" },
  rideGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"24px" },
  rideCard: { borderRadius:"16px", border:"1px solid #eee", padding:"28px 20px", position:"relative", textAlign:"center" },
  rideTag: { position:"absolute", top:"12px", right:"12px", backgroundColor:"#eef2ff", color:"#4f46e5", fontSize:"11px", fontWeight:"bold", padding:"3px 10px", borderRadius:"20px" },
  rideEmoji: { fontSize:"40px", marginBottom:"12px" },
  rideName: { fontSize:"20px", fontWeight:"800", color:"#111", margin:"0 0 8px" },
  rideDesc: { fontSize:"14px", color:"#666", margin:"0 0 12px", lineHeight:1.5 },
  ridePrice: { fontSize:"14px", fontWeight:"bold", color:"#4f46e5", margin:0 },
  stepsGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"32px" },
  stepCard: { textAlign:"center" },
  stepNum: { fontSize:"48px", fontWeight:"900", color:"#a5b4fc", lineHeight:1 },
  stepIcon: { fontSize:"36px", margin:"8px 0" },
  stepTitle: { fontSize:"18px", fontWeight:"700", color:"white", margin:"0 0 8px" },
  stepDesc: { fontSize:"14px", color:"#9ca3af", lineHeight:1.6 },
  featGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"24px" },
  featCard: { padding:"24px", borderRadius:"12px", border:"1px solid #f3f4f6", backgroundColor:"#fafafa" },
  featIcon: { fontSize:"32px", marginBottom:"12px" },
  featTitle: { fontSize:"16px", fontWeight:"700", color:"#111", margin:"0 0 8px" },
  featDesc: { fontSize:"14px", color:"#666", margin:0, lineHeight:1.5 },
  driverGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"24px", marginTop:"40px" },
  driverCard: { borderRadius:"16px", border:"1px solid #eee", padding:"24px 20px", textAlign:"center", position:"relative" },
  driverRank: { position:"absolute", top:"12px", left:"12px", backgroundColor:"#fef3c7", color:"#d97706", fontSize:"12px", fontWeight:"bold", padding:"3px 10px", borderRadius:"20px" },
  driverEmoji: { fontSize:"40px", marginBottom:"12px" },
  driverName: { fontSize:"18px", fontWeight:"800", color:"#111", margin:"0 0 4px" },
  driverVehicle: { fontSize:"13px", color:"#888", margin:"0 0 12px" },
  driverStats: { display:"flex", flexDirection:"column", gap:"4px" },
  driverStat: { fontSize:"13px", color:"#555" },
  reviewGrid: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"24px", marginTop:"40px" },
  reviewCard: { backgroundColor:"white", borderRadius:"16px", padding:"24px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  reviewStars: { marginBottom:"12px" },
  reviewText: { fontSize:"15px", color:"#333", lineHeight:1.6, margin:"0 0 16px" },
  reviewer: { display:"flex", alignItems:"center", gap:"12px" },
  reviewAvatar: { width:"36px", height:"36px", borderRadius:"50%", backgroundColor:"#4f46e5", color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold" },
  reviewName: { margin:0, fontSize:"14px", fontWeight:"bold", color:"#111" },
  reviewArea: { margin:0, fontSize:"12px", color:"#999" },
  loginBox: { backgroundColor:"white", borderRadius:"20px", padding:"40px 32px", textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"12px", alignItems:"center" },
  cta: { padding:"80px 60px", backgroundColor:"#4f46e5", textAlign:"center" },
  ctaTitle: { fontSize:"40px", fontWeight:"900", color:"white", margin:"0 0 16px" },
  ctaSub: { fontSize:"18px", color:"#c7d2fe", margin:"0 0 32px" },
  ctaBtn: { padding:"14px 40px", backgroundColor:"white", color:"#4f46e5", border:"none", borderRadius:"10px", fontSize:"16px", fontWeight:"bold", cursor:"pointer" },
  footer: { backgroundColor:"#111", padding:"60px" },
  footerTop: { display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"40px", marginBottom:"40px" },
  footerDesc: { color:"#9ca3af", fontSize:"14px", marginTop:"8px", lineHeight:1.6 },
  footerLinks: { display:"flex", flexDirection:"column", gap:"8px" },
  footerLinkHead: { color:"white", fontWeight:"700", fontSize:"14px", margin:"0 0 8px" },
  footerLink: { color:"#9ca3af", fontSize:"14px", textDecoration:"none", cursor:"pointer" },
  footerBottom: { borderTop:"1px solid #333", paddingTop:"24px" },
  footerCopy: { color:"#9ca3af", fontSize:"13px", margin:0 },
}

const sv = {
  page:      { minHeight:"100vh", backgroundColor:"#f9fafb", padding:"48px 60px", fontFamily:"'Segoe UI', sans-serif" },
  header:    { marginBottom:"48px" },
  headerText:{ marginTop:"16px" },
  tag:       { fontSize:"12px", fontWeight:"800", color:"#4f46e5", letterSpacing:"2px", margin:"0 0 8px" },
  title:     { fontSize:"40px", fontWeight:"900", color:"#111", margin:"0 0 8px" },
  sub:       { fontSize:"16px", color:"#666", margin:0 },
  grid:      { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"24px" },
  card:      { backgroundColor:"white", borderRadius:"16px", padding:"28px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column", gap:"12px" },
  iconBox:   { width:"60px", height:"60px", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center" },
  icon:      { fontSize:"28px" },
  badge:     { display:"inline-block", padding:"3px 12px", borderRadius:"20px", fontSize:"11px", fontWeight:"bold", width:"fit-content" },
  cardTitle: { fontSize:"18px", fontWeight:"800", color:"#111", margin:0 },
  cardDesc:  { fontSize:"14px", color:"#666", lineHeight:1.6, margin:0, flex:1 },
  bookBtn:   { padding:"10px 0", color:"white", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"bold", cursor:"pointer", marginTop:"auto" },
}


export { HistoryPage, styles, s, sv,ActiveTripPage,TripPage,BookRidePage,AutoPan,RecenterMap,TrackingPage } 

