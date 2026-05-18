// TransApp Landing Page — intro/hero page
// Save as: E:\TransApp\frontend\src\LandingPage.jsx

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={s.page}>

      {/* ── Navbar ───────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <span style={s.logoIcon}>🚀</span>
          <span style={s.logoText}>TransApp</span>
        </div>
        <div style={s.navLinks}>
          <a href="#features" style={s.navLink}>Features</a>
          <a href="#how" style={s.navLink}>How it works</a>
          <button style={s.navBtn} onClick={onGetStarted}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroBadge}>🇧🇩 Built for Bangladesh</div>
        <h1 style={s.heroTitle}>
          Your ride,<br />
          <span style={s.heroAccent}>anywhere in Dhaka</span>
        </h1>
        <p style={s.heroSub}>
          Book a Bike, CNG, or Car in seconds. Track your driver live.
          Safe, fast, and affordable rides — right at your fingertips.
        </p>
        <div style={s.heroBtns}>
          <button style={s.heroPrimary} onClick={onGetStarted}>
            Book a Ride →
          </button>
          <button style={s.heroSecondary}>
            Learn More
          </button>
        </div>
        <div style={s.heroStats}>
          <div style={s.stat}>
            <span style={s.statNum}>10K+</span>
            <span style={s.statLabel}>Rides daily</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.stat}>
            <span style={s.statNum}>500+</span>
            <span style={s.statLabel}>Active drivers</span>
          </div>
          <div style={s.statDivider} />
          <div style={s.stat}>
            <span style={s.statNum}>4.9★</span>
            <span style={s.statLabel}>Average rating</span>
          </div>
        </div>
      </section>

      {/* ── Ride Types ───────────────────────────────────── */}
      <section id="features" style={s.section}>
        <p style={s.sectionTag}>RIDE OPTIONS</p>
        <h2 style={s.sectionTitle}>Choose your ride</h2>
        <p style={s.sectionSub}>From quick bike rides to comfortable cars — we have it all</p>
        <div style={s.rideGrid}>
          {[
            { icon: "🏍️", name: "Bike", price: "৳50–80", desc: "Beat the traffic. Perfect for short trips across the city.", tag: "Fastest" },
            { icon: "🛺", name: "CNG", price: "৳80–120", desc: "Comfortable and affordable. Great for medium distance trips.", tag: "Popular" },
            { icon: "🚗", name: "Car", price: "৳150–200", desc: "Sit back and relax. AC rides for longer journeys.", tag: "Premium" },
          ].map((r) => (
            <div key={r.name} style={s.rideCard}>
              <div style={s.rideTag}>{r.tag}</div>
              <div style={s.rideEmoji}>{r.icon}</div>
              <h3 style={s.rideName}>{r.name}</h3>
              <p style={s.rideDesc}>{r.desc}</p>
              <p style={s.ridePrice}>{r.price} per ride</p>
              <button style={s.rideBtn} onClick={onGetStarted}>Book {r.name}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section id="how" style={s.sectionDark}>
        <p style={s.sectionTagLight}>HOW IT WORKS</p>
        <h2 style={s.sectionTitleLight}>Ride in 3 simple steps</h2>
        <div style={s.stepsGrid}>
          {[
            { num: "01", icon: "📍", title: "Set your location", desc: "Tap on the map to set your pickup point and destination." },
            { num: "02", icon: "🚗", title: "Match with a driver", desc: "We instantly find the nearest available driver for you." },
            { num: "03", icon: "📱", title: "Track live", desc: "Watch your driver arrive in real-time on the map." },
          ].map((step) => (
            <div key={step.num} style={s.stepCard}>
              <div style={s.stepNum}>{step.num}</div>
              <div style={s.stepIcon}>{step.icon}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={s.section}>
        <p style={s.sectionTag}>WHY TRANSAPP</p>
        <h2 style={s.sectionTitle}>Everything you need</h2>
        <div style={s.featGrid}>
          {[
            { icon: "🗺️", title: "Live GPS Tracking", desc: "Watch your driver move on the map in real time." },
            { icon: "💬", title: "WhatsApp Updates", desc: "Get trip confirmations and receipts on WhatsApp." },
            { icon: "🔒", title: "Safe & Secure", desc: "All drivers are verified. Your safety is our priority." },
            { icon: "💰", title: "Fair Pricing", desc: "No surge pricing. What you see is what you pay." },
            { icon: "⚡", title: "Fast Matching", desc: "Get matched with a driver in under 30 seconds." },
            { icon: "⭐", title: "Rate Your Ride", desc: "Share feedback after every trip to keep quality high." },
          ].map((f) => (
            <div key={f.title} style={s.featCard}>
              <div style={s.featIcon}>{f.icon}</div>
              <h3 style={s.featTitle}>{f.title}</h3>
              <p style={s.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section style={{ ...s.section, backgroundColor: "#f9fafb" }}>
        <p style={s.sectionTag}>WHAT PEOPLE SAY</p>
        <h2 style={s.sectionTitle}>Loved by riders</h2>
        <div style={s.reviewGrid}>
          {[
            { name: "Fatima K.", area: "Dhanmondi", text: "Found a CNG in 2 minutes during rush hour. Amazing!", rating: 5 },
            { name: "Rahim H.", area: "Gulshan", text: "Live tracking made me feel so safe. Will use daily!", rating: 5 },
            { name: "Nasrin B.", area: "Uttara", text: "Best ride app in Dhaka. Fair prices and friendly drivers.", rating: 5 },
          ].map((r) => (
            <div key={r.name} style={s.reviewCard}>
              <div style={s.reviewStars}>{"⭐".repeat(r.rating)}</div>
              <p style={s.reviewText}>"{r.text}"</p>
              <div style={s.reviewer}>
                <div style={s.reviewAvatar}>{r.name[0]}</div>
                <div>
                  <p style={s.reviewName}>{r.name}</p>
                  <p style={s.reviewArea}>{r.area}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={s.cta}>
        <h2 style={s.ctaTitle}>Ready to ride?</h2>
        <p style={s.ctaSub}>Join thousands of daily riders across Dhaka. Sign up free today.</p>
        <button style={s.ctaBtn} onClick={onGetStarted}>
          Get Started — It's Free
        </button>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerTop}>
          <div>
            <div style={s.navLogo}>
              <span style={s.logoIcon}>🚀</span>
              <span style={{ ...s.logoText, color: "white" }}>TransApp</span>
            </div>
            <p style={s.footerDesc}>Fast, safe, affordable rides across Dhaka.</p>
          </div>
          <div style={s.footerLinks}>
            <p style={s.footerLinkHead}>Product</p>
            <a style={s.footerLink} href="#">Features</a>
            <a style={s.footerLink} href="#">Pricing</a>
            <a style={s.footerLink} href="#">Safety</a>
          </div>
          <div style={s.footerLinks}>
            <p style={s.footerLinkHead}>Company</p>
            <a style={s.footerLink} href="#">About</a>
            <a style={s.footerLink} href="#">Careers</a>
            <a style={s.footerLink} href="#">Contact</a>
          </div>
          <div style={s.footerLinks}>
            <p style={s.footerLinkHead}>Legal</p>
            <a style={s.footerLink} href="#">Privacy</a>
            <a style={s.footerLink} href="#">Terms</a>
          </div>
        </div>
        <div style={s.footerBottom}>
          <p style={s.footerCopy}>© 2025 TransApp. Made with ❤️ in Bangladesh.</p>
        </div>
      </footer>

    </div>
  )
}

const INDIGO = "#4f46e5"
const DARK   = "#0f0e1a"

const s = {
  page: { fontFamily: "sans-serif", margin: 0, padding: 0, overflowX: "hidden" },

  // nav
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "16px 48px", backgroundColor: "white",
    borderBottom: "1px solid #f0f0f0", position: "sticky", top: 0, zIndex: 100 },
  navLogo: { display: "flex", alignItems: "center", gap: "8px" },
  logoIcon: { fontSize: "24px" },
  logoText: { fontSize: "20px", fontWeight: "800", color: INDIGO },
  navLinks: { display: "flex", alignItems: "center", gap: "32px" },
  navLink: { textDecoration: "none", color: "#444", fontSize: "14px", fontWeight: "500" },
  navBtn: { backgroundColor: INDIGO, color: "white", border: "none",
    padding: "10px 20px", borderRadius: "8px", fontWeight: "600",
    fontSize: "14px", cursor: "pointer" },

  // hero
  hero: { background: `linear-gradient(135deg, #f8f7ff 0%, #eef2ff 50%, #e0e7ff 100%)`,
    padding: "100px 48px 80px", textAlign: "center", minHeight: "90vh",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  heroBadge: { backgroundColor: "#eef2ff", color: INDIGO, padding: "6px 16px",
    borderRadius: "999px", fontSize: "13px", fontWeight: "600",
    border: `1px solid ${INDIGO}33`, marginBottom: "24px", display: "inline-block" },
  heroTitle: { fontSize: "clamp(40px, 6vw, 72px)", fontWeight: "900",
    lineHeight: 1.1, color: "#0f0e1a", margin: "0 0 24px", maxWidth: "800px" },
  heroAccent: { color: INDIGO },
  heroSub: { fontSize: "18px", color: "#555", maxWidth: "560px",
    lineHeight: 1.7, margin: "0 auto 40px" },
  heroBtns: { display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" },
  heroPrimary: { backgroundColor: INDIGO, color: "white", border: "none",
    padding: "16px 32px", borderRadius: "12px", fontSize: "16px",
    fontWeight: "700", cursor: "pointer" },
  heroSecondary: { backgroundColor: "transparent", color: INDIGO,
    border: `2px solid ${INDIGO}`, padding: "16px 32px", borderRadius: "12px",
    fontSize: "16px", fontWeight: "700", cursor: "pointer" },
  heroStats: { display: "flex", gap: "32px", alignItems: "center",
    marginTop: "60px", flexWrap: "wrap", justifyContent: "center" },
  stat: { display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: { fontSize: "28px", fontWeight: "800", color: INDIGO },
  statLabel: { fontSize: "13px", color: "#777", marginTop: "4px" },
  statDivider: { width: "1px", height: "40px", backgroundColor: "#ddd" },

  // sections
  section: { padding: "80px 48px", backgroundColor: "white" },
  sectionTag: { textAlign: "center", color: INDIGO, fontSize: "12px",
    fontWeight: "700", letterSpacing: "2px", margin: "0 0 12px" },
  sectionTitle: { textAlign: "center", fontSize: "clamp(28px, 3vw, 42px)",
    fontWeight: "800", color: "#0f0e1a", margin: "0 0 16px" },
  sectionSub: { textAlign: "center", color: "#666", fontSize: "16px",
    maxWidth: "500px", margin: "0 auto 48px" },

  // ride cards
  rideGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px", maxWidth: "1000px", margin: "0 auto" },
  rideCard: { border: "1px solid #e5e7eb", borderRadius: "16px",
    padding: "32px 24px", textAlign: "center", position: "relative",
    transition: "transform 0.2s, box-shadow 0.2s" },
  rideTag: { position: "absolute", top: "16px", right: "16px",
    backgroundColor: "#eef2ff", color: INDIGO, fontSize: "11px",
    fontWeight: "700", padding: "4px 10px", borderRadius: "999px" },
  rideEmoji: { fontSize: "48px", marginBottom: "16px" },
  rideName: { fontSize: "22px", fontWeight: "800", color: "#0f0e1a", margin: "0 0 8px" },
  rideDesc: { fontSize: "14px", color: "#666", lineHeight: 1.6, margin: "0 0 16px" },
  ridePrice: { fontSize: "18px", fontWeight: "700", color: INDIGO, margin: "0 0 20px" },
  rideBtn: { backgroundColor: INDIGO, color: "white", border: "none",
    padding: "12px 24px", borderRadius: "8px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer", width: "100%" },

  // dark section
  sectionDark: { padding: "80px 48px", backgroundColor: DARK },
  sectionTagLight: { textAlign: "center", color: "#a78bfa", fontSize: "12px",
    fontWeight: "700", letterSpacing: "2px", margin: "0 0 12px" },
  sectionTitleLight: { textAlign: "center", fontSize: "clamp(28px, 3vw, 42px)",
    fontWeight: "800", color: "white", margin: "0 0 48px" },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "32px", maxWidth: "900px", margin: "0 auto" },
  stepCard: { textAlign: "center", padding: "32px 24px",
    border: "1px solid #ffffff22", borderRadius: "16px" },
  stepNum: { fontSize: "48px", fontWeight: "900", color: "#ffffff11",
    lineHeight: 1, marginBottom: "12px" },
  stepIcon: { fontSize: "36px", marginBottom: "16px" },
  stepTitle: { fontSize: "18px", fontWeight: "700", color: "white", margin: "0 0 8px" },
  stepDesc: { fontSize: "14px", color: "#aaa", lineHeight: 1.6, margin: 0 },

  // features
  featGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px", maxWidth: "1000px", margin: "0 auto" },
  featCard: { padding: "24px", borderRadius: "12px",
    border: "1px solid #e5e7eb", textAlign: "center" },
  featIcon: { fontSize: "32px", marginBottom: "12px" },
  featTitle: { fontSize: "15px", fontWeight: "700", color: "#0f0e1a", margin: "0 0 6px" },
  featDesc: { fontSize: "13px", color: "#666", lineHeight: 1.6, margin: 0 },

  // reviews
  reviewGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px", maxWidth: "900px", margin: "0 auto" },
  reviewCard: { backgroundColor: "white", border: "1px solid #e5e7eb",
    borderRadius: "16px", padding: "28px" },
  reviewStars: { fontSize: "16px", marginBottom: "12px" },
  reviewText: { fontSize: "15px", color: "#333", lineHeight: 1.7,
    fontStyle: "italic", margin: "0 0 20px" },
  reviewer: { display: "flex", alignItems: "center", gap: "12px" },
  reviewAvatar: { width: "40px", height: "40px", borderRadius: "50%",
    backgroundColor: "#eef2ff", color: INDIGO, display: "flex",
    alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "16px" },
  reviewName: { margin: 0, fontWeight: "700", fontSize: "14px", color: "#111" },
  reviewArea: { margin: 0, fontSize: "12px", color: "#888" },

  // cta
  cta: { background: `linear-gradient(135deg, ${INDIGO}, #7c3aed)`,
    padding: "100px 48px", textAlign: "center" },
  ctaTitle: { fontSize: "clamp(32px, 4vw, 52px)", fontWeight: "900",
    color: "white", margin: "0 0 16px" },
  ctaSub: { fontSize: "18px", color: "rgba(255,255,255,0.8)",
    maxWidth: "480px", margin: "0 auto 40px", lineHeight: 1.7 },
  ctaBtn: { backgroundColor: "white", color: INDIGO, border: "none",
    padding: "18px 40px", borderRadius: "12px", fontSize: "16px",
    fontWeight: "700", cursor: "pointer" },

  // footer
  footer: { backgroundColor: "#0a0910", padding: "60px 48px 32px" },
  footerTop: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: "40px", marginBottom: "48px" },
  footerDesc: { color: "#888", fontSize: "14px", marginTop: "12px", lineHeight: 1.7 },
  footerLinks: { display: "flex", flexDirection: "column", gap: "10px" },
  footerLinkHead: { color: "white", fontWeight: "700", fontSize: "14px",
    margin: "0 0 4px" },
  footerLink: { color: "#888", textDecoration: "none", fontSize: "14px" },
  footerBottom: { borderTop: "1px solid #222", paddingTop: "24px", textAlign: "center" },
  footerCopy: { color: "#555", fontSize: "13px", margin: 0 },
}



cat > /mnt/user-data/outputs/main_updated.py << 'PYEOF'
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fake databases
USERS = {
    "rahim":  {"password": "1234",  "role": "passenger"},
    "karim":  {"password": "5678",  "role": "passenger"},
    "salam":  {"password": "1234",  "role": "rider"},
}

DRIVERS = [
    {"name": "Salam", "vehicle": "Bike", "rating": 4.8, "phone": "01711111111"},
    {"name": "Jamal", "vehicle": "Bike", "rating": 4.6, "phone": "01722222222"},
    {"name": "Ratan", "vehicle": "CNG",  "rating": 4.9, "phone": "01733333333"},
    {"name": "Milon", "vehicle": "CNG",  "rating": 4.7, "phone": "01744444444"},
    {"name": "Kabir", "vehicle": "Car",  "rating": 4.5, "phone": "01755555555"},
    {"name": "Hasan", "vehicle": "Car",  "rating": 4.9, "phone": "01766666666"},
]

# Pending rider applications
RIDER_APPLICATIONS = []

# ── Data Models ───────────────────────────────────────────────
class LoginData(BaseModel):
    username: str
    password: str
    role: Optional[str] = "passenger"   # role sent from React

class SignupData(BaseModel):
    username: str
    password: str
    confirm_password: str
    role: Optional[str] = "passenger"

class RiderSignupData(BaseModel):
    username: str
    password: str
    confirm_password: str
    role: str = "rider"
    full_name: str
    phone: str
    address: str
    vehicle_type: str
    nid_number: str
    license_number: str
    plate_number: str

class BookRideData(BaseModel):
    username: str
    pickup: str
    destination: str
    vehicle_type: str

# ── Endpoints ─────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "TransApp server running!"}

@app.post("/login")
async def login(data: LoginData):
    if data.username not in USERS:
        return {"success": False, "message": "User not found"}

    user = USERS[data.username]

    if user["password"] != data.password:
        return {"success": False, "message": "Wrong password"}

    # check if role matches
    if user["role"] != data.role:
        return {
            "success": False,
            "message": f"This account is registered as a {user['role']}, not a {data.role}"
        }

    # generate token — in real app use JWT
    token = f"token_{data.role}_{data.username}"

    return {
        "success": True,
        "message": f"Welcome {data.username}!",
        "token": token,
        "role": user["role"],
    }

@app.post("/signup")
async def signup(data: SignupData):
    if data.username in USERS:
        return {"success": False, "message": "Username already taken"}
    if data.password != data.confirm_password:
        return {"success": False, "message": "Passwords do not match"}
    if len(data.password) < 6:
        return {"success": False, "message": "Password must be at least 6 characters"}

    USERS[data.username] = {"password": data.password, "role": data.role}

    return {"success": True, "message": f"Account created! Welcome {data.username}!"}

@app.post("/rider-signup")
async def rider_signup(data: RiderSignupData):
    if data.username in USERS:
        return {"success": False, "message": "Username already taken"}
    if data.password != data.confirm_password:
        return {"success": False, "message": "Passwords do not match"}
    if len(data.password) < 6:
        return {"success": False, "message": "Password must be at least 6 characters"}

    # save application for review
    RIDER_APPLICATIONS.append({
        "username": data.username,
        "full_name": data.full_name,
        "phone": data.phone,
        "vehicle_type": data.vehicle_type,
        "nid_number": data.nid_number,
        "license_number": data.license_number,
        "plate_number": data.plate_number,
        "status": "pending"
    })

    # save user but mark as pending
    USERS[data.username] = {
        "password": data.password,
        "role": "rider",
        "status": "pending",  # cannot login until approved
        "full_name": data.full_name,
        "phone": data.phone,
    }

    return {
        "success": True,
        "message": f"Application submitted! We will review and contact {data.phone} within 24 hours."
    }

@app.post("/book-ride")
async def book_ride(data: BookRideData):
    if not data.pickup or not data.destination:
        return {"success": False, "message": "Please enter pickup and destination"}
    if data.pickup == data.destination:
        return {"success": False, "message": "Pickup and destination cannot be same"}

    matching = [d for d in DRIVERS if d["vehicle"] == data.vehicle_type]
    driver = random.choice(matching)
    eta = random.randint(2, 10)
    fares = {"Bike": random.randint(50, 80), "CNG": random.randint(80, 120), "Car": random.randint(150, 200)}

    return {
        "success": True,
        "message": "Driver found!",
        "driver": driver["name"],
        "vehicle": driver["vehicle"],
        "rating": driver["rating"],
        "phone": driver["phone"],
        "eta": eta,
        "fare": fares[data.vehicle_type],
    }
PYEOF
echo "Done"
