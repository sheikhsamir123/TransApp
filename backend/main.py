from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import bcrypt
import random
import json
import math
from typing import Optional
import os
import shutil
from fastapi import UploadFile, File, Form
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi.background import BackgroundTasks
from dotenv import load_dotenv
import os

load_dotenv()

# ─────────────────────────────────────────────
# Database Setup
# ─────────────────────────────────────────────
DATABASE_URL = "sqlite:///./transapp.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



# ─────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────
class Passenger(Base):
    __tablename__ = "passengers"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)
    phone         = Column(String)
    family_contacts  = Column(Text, default="[]")   # ← ADD THIS (JSON list)


class TripHistory(Base):
    __tablename__ = "trip_history"

    id           = Column(Integer, primary_key=True, index=True)
    username     = Column(String, ForeignKey("passengers.username"), nullable=False)
    pickup       = Column(Text)
    destination  = Column(Text)
    vehicle_type = Column(String)
    service_type = Column(String, default="Ride")
    driver_name  = Column(String)
    fare         = Column(Float)
    eta          = Column(Integer)
    pickup_lat   = Column(Float, nullable=True)       # ← must be Column()
    pickup_lng   = Column(Float, nullable=True)       # ← must be Column()
    status       = Column(String, default="pending")  # ← must be Column()
    booked_at    = Column(DateTime, default=datetime.utcnow)
    repair_issues = Column(Text, default="[]")
    repair_note   = Column(String, default="")

class Driver(Base):
    __tablename__ = "drivers"

    id                 = Column(Integer, primary_key=True, index=True)
    username           = Column(String, unique=True, nullable=False)
    hashed_password    = Column(String, nullable=False)
    phone              = Column(String)
    vehicle_type       = Column(String)          # Bike / CNG / Car
    documents          = Column(Text, default="{}") # JSON: { license, nid, vehicle_reg }
    number_of_rides    = Column(Integer, default=0)
    total_rating_points= Column(Float, default=0.0)
    rating_count       = Column(Integer, default=0)
    experience_years   = Column(Float, default=0.0)
    created_at         = Column(DateTime, default=datetime.utcnow)
    verification_status  = Column(String, default="unsubmitted")  # unsubmitted | pending | verified | rejected
    verification_reason  = Column(String, default="")             # rejection reason from admin
    verification_notified = Column(Boolean, default=True)         # False = driver hasn't seen result yet

    @property
    def average_rating(self):
        if self.rating_count == 0:
            return 0.0
        return round(self.total_rating_points / self.rating_count, 2)


Base.metadata.create_all(bind=engine)

# ─────────────────────────────────────────────
# Seed default drivers (runs once)
# ─────────────────────────────────────────────
def seed_drivers():
    db = SessionLocal()
    if db.query(Driver).count() == 0:
        default_drivers = [
            {"username": "salam",  "phone": "01711111111", "vehicle_type": "Bike", "experience_years": 3.0, "rides": 120, "rating": 4.8, "count": 10},
            {"username": "jamal",  "phone": "01722222222", "vehicle_type": "Bike", "experience_years": 1.5, "rides": 80,  "rating": 4.6, "count": 8},
            {"username": "ratan",  "phone": "01733333333", "vehicle_type": "CNG",  "experience_years": 5.0, "rides": 300, "rating": 4.9, "count": 20},
            {"username": "milon",  "phone": "01744444444", "vehicle_type": "CNG",  "experience_years": 2.0, "rides": 150, "rating": 4.7, "count": 12},
            {"username": "kabir",  "phone": "01755555555", "vehicle_type": "Car",  "experience_years": 4.0, "rides": 200, "rating": 4.5, "count": 15},
            {"username": "hasan",  "phone": "01766666666", "vehicle_type": "Car",  "experience_years": 6.0, "rides": 400, "rating": 4.9, "count": 25},
        ]
        for d in default_drivers:
            driver = Driver(
                username=d["username"],
                hashed_password=hash_password("driver123"),  # default password
                phone=d["phone"],
                vehicle_type=d["vehicle_type"],
                experience_years=d["experience_years"],
                number_of_rides=d["rides"],
                total_rating_points=d["rating"] * d["count"],
                rating_count=d["count"],
                documents=json.dumps({"license": "verified", "nid": "verified", "vehicle_reg": "verified"}),
            )
            db.add(driver)
        db.commit()
    db.close()

seed_drivers()

# ─────────────────────────────────────────────
# App
# ─────────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for now
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────
class LoginData(BaseModel):
    username: str
    password: str

class SignupData(BaseModel):
    username: str
    password: str
    confirm_password: str
    phone: str


class BookRideData(BaseModel):
    username:      str
    pickup:        str
    destination:   str
    vehicle_type:  str
    service_type:  str = "Ride"
    pickup_lat:    Optional[float] = None
    pickup_lng:    Optional[float] = None
    repair_issues: list[str] = []    # ← ADD
    repair_note:   str = ""          # ← ADD

class FamilyContactData(BaseModel):
    username: str
    name:     str
    phone:    str
    email:    str = ""   # ← ADD
    relation: str = ""

class RemoveContactData(BaseModel):
    username: str
    index:    int

# class RateDriverData(BaseModel):
#     driver_username: str
#     rating: float  # 1.0 to 5.0

class DriverSignupData(BaseModel):
    username: str
    password: str
    confirm_password: str
    phone: str
    vehicle_type: str
    experience_years: float

class UpdateDocumentsData(BaseModel):
    driver_username: str
    license: str
    nid: str
    vehicle_reg: str


driver_locations: dict = {}  # { trip_id: { lat, lng, updated_at } }

class UpdateLocationData(BaseModel):
    trip_id:        int
    driver_username: str
    lat:            float
    lng:            float

@app.post("/driver/update-location")
async def update_location(data: UpdateLocationData, db: Session = Depends(get_db)):
    trip = db.query(TripHistory).filter(TripHistory.id == data.trip_id).first()
    if not trip:
        return {"success": False, "message": "Trip not found"}
    driver_locations[data.trip_id] = {
        "lat":        data.lat,
        "lng":        data.lng,
        "updated_at": datetime.utcnow().isoformat(),
        "driver":     data.driver_username,
    }
    return {"success": True}

@app.get("/trip/driver-location/{trip_id}")
async def get_driver_location(trip_id: int):
    loc = driver_locations.get(trip_id)
    if not loc:
        return {"success": False, "message": "Location not available yet"}
    return {"success": True, **loc}


# ─────────────────────────────────────────────
# Passenger Endpoints
# ─────────────────────────────────────────────
@app.get("/")
async def root():
    return {"message": "TransApp server is running!"}


@app.get("/top-drivers")
async def top_drivers(limit: int = 6, db: Session = Depends(get_db)):
    drivers = db.query(Driver).filter(Driver.rating_count > 0).all()

    # Sort by average rating descending
    sorted_drivers = sorted(drivers, key=lambda d: d.average_rating, reverse=True)[:limit]

    return {
        "success": True,
        "drivers": [
            {
                "username":        d.username,
                "vehicle_type":    d.vehicle_type,
                "number_of_rides": d.number_of_rides,
                "rating":          d.average_rating,
                "experience_years": d.experience_years,
            }
            for d in sorted_drivers
        ]
    }

@app.post("/signup")
async def signup(data: SignupData, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        return {"success": False, "message": "Passwords do not match"}
    if len(data.password) < 6:
        return {"success": False, "message": "Password must be at least 6 characters"}
    if db.query(Passenger).filter(Passenger.username == data.username).first():
        return {"success": False, "message": "Username already taken"}

    passenger = Passenger(
        username=data.username,
        hashed_password=hash_password(data.password),
        phone = data.phone,
    )
    db.add(passenger)
    db.commit()
    return {"success": True, "message": f"Account created! Welcome {data.username}!"}


@app.post("/login")
async def login(data: LoginData, db: Session = Depends(get_db)):
    passenger = db.query(Passenger).filter(Passenger.username == data.username).first()
    if not passenger:
        return {"success": False, "message": "User not found"}
    if not verify_password(data.password, passenger.hashed_password):
        return {"success": False, "message": "Wrong password"}
    return {
        "success": True,
        "message": f"Welcome back, {data.username}!",
        "token": "fake-token-123",  # replace with JWT later
    }


GMAIL_USER     = os.getenv("GMAIL_USER")
GMAIL_PASSWORD = os.getenv("GMAIL_PASSWORD")
FRONTEND_URL   = "http://localhost:5173"  # change to your deployed URL later

def send_tracking_email(to_email, passenger_name, trip_id, pickup, destination):
    tracking_link = f"{FRONTEND_URL}/track?trip_id={trip_id}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"🚗 {passenger_name} started a trip — Track Live"
    msg["From"]    = GMAIL_USER
    msg["To"]      = to_email

    html = f"""
    <html>
    <body style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;">
    <div style="background:#4f46e5;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;">🚀 TransApp Live Tracking</h1>
    </div>
    <div style="background:#f9fafb;padding:24px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
        <p style="font-size:16px;color:#111;"><strong>{passenger_name}</strong> has started a trip and shared their location with you.</p>
        <div style="background:white;border-radius:10px;padding:16px;margin:16px 0;border:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280;">📍 <strong>Pickup:</strong> {pickup}</p>
        <p style="margin:0;font-size:14px;color:#6b7280;">🏁 <strong>Destination:</strong> {destination}</p>
        </div>
        <a href="{tracking_link}"
        style="display:block;background:#4f46e5;color:white;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;">
        📍 Track Live Location
        </a>
        <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:16px;">
        This link was sent by {passenger_name} via TransApp.
        </p>
    </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        print(f"✅ Tracking email sent to {to_email}")
    except Exception as e:
        print(f"❌ Email failed: {e}")


@app.post("/book-ride")
async def book_ride(data: BookRideData, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not data.pickup or not data.destination:
        return {"success": False, "message": "Please enter pickup and destination"}
    if data.pickup == data.destination:
        return {"success": False, "message": "Pickup and destination cannot be the same"}

    fares = {
        "Bike": random.randint(50, 80),
        "CNG":  random.randint(80, 120),
        "Car":  random.randint(150, 200)
    }
    fare = fares.get(data.vehicle_type, 100)

    trip = TripHistory(
        username      = data.username,
        pickup        = data.pickup,
        destination   = data.destination,
        vehicle_type  = data.vehicle_type,
        service_type  = data.service_type,
        driver_name   = None,
        fare          = fare,
        eta           = None,
        pickup_lat    = data.pickup_lat,
        pickup_lng    = data.pickup_lng,
        status        = "pending",
        repair_issues = json.dumps(data.repair_issues),
        repair_note   = data.repair_note,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)

    # ── Send emails in background — doesn't block response ──
    passenger = db.query(Passenger).filter(Passenger.username == data.username).first()
    if passenger and passenger.family_contacts:
        contacts = json.loads(passenger.family_contacts or "[]")
        for contact in contacts:
            if contact.get("email"):
                background_tasks.add_task(        # ← runs after response is sent
                    send_tracking_email,
                    to_email       = contact["email"],
                    passenger_name = data.username,
                    trip_id        = trip.id,
                    pickup         = data.pickup,
                    destination    = data.destination,
                )

    return {
        "success":     True,
        "message":     "Looking for a driver...",
        "trip_id":     trip.id,
        "fare":        fare,
        "pickup":      data.pickup,
        "destination": data.destination,
        "vehicle":     data.vehicle_type,
        "pickup_lat":  data.pickup_lat,
        "pickup_lng":  data.pickup_lng,
    }

@app.get("/track/{trip_id}")
async def get_tracking_data(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(TripHistory).filter(TripHistory.id == trip_id).first()
    if not trip:
        return {"success": False, "message": "Trip not found"}

    # get live driver location
    loc = driver_locations.get(trip_id)

    return {
        "success":       True,
        "passenger":     trip.username,
        "pickup":        trip.pickup,
        "destination":   trip.destination,
        "status":        trip.status,
        "driver":        trip.driver_name,
        "pickup_lat":    trip.pickup_lat,
        "pickup_lng":    trip.pickup_lng,
        "driver_lat":    loc["lat"] if loc else None,
        "driver_lng":    loc["lng"] if loc else None,
    }

@app.get("/trip-status/{trip_id}")
async def trip_status(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(TripHistory).filter(TripHistory.id == trip_id).first()
    if not trip:
        return {"success": False, "message": "Trip not found"}

    if trip.status == "pending":
        return {
            "success": True,
            "status":  "pending",
            "message": "Waiting for a driver to accept...",
        }

    # Driver accepted — get driver details
    driver = db.query(Driver).filter(Driver.username == trip.driver_name).first()
    return {
        "success": True,
        "status":  "accepted",
        "driver":  trip.driver_name,
        "phone":   driver.phone   if driver else "N/A",
        "rating":  driver.average_rating if driver else 0,
        "vehicle": trip.vehicle_type,
        "eta":     trip.eta,
        "fare":    trip.fare,
    }

@app.get("/history/{username}/{userType}")
async def get_history(
    username: str,
    userType: str,
    db: Session = Depends(get_db)
):
    if (userType != "driver"):
        trips = (
            db.query(TripHistory)
            .filter(TripHistory.username == username )
            .order_by(TripHistory.booked_at.desc())
            .all()
        )
    else:
        trips = (
            db.query(TripHistory)
            .filter(TripHistory.driver_name == username )
            .order_by(TripHistory.booked_at.desc())
            .all()
        )

    # Fetch all drivers in one query instead of per trip
    driver_map = {d.username: d for d in db.query(Driver).all()}
    user_map = {p.username: p for p in db.query(Passenger).all()}

    return {
        "success": True,
        "trips": [
            {
                "id":           t.id,
                "pickup":       t.pickup,
                "destination":  t.destination,
                "vehicle_type": t.vehicle_type,
                "user_name":    t.username,
                "driver_name":  t.driver_name,
                "fare":         t.fare,
                "eta":          t.eta,
                "booked_at":    t.booked_at.strftime("%Y-%m-%d %H:%M"),
                "driver_phone":        driver_map[t.driver_name].phone
                                if t.driver_name and t.driver_name in driver_map
                                else "N/A",
                "user_phone":      user_map[t.username].phone
                                if t.username and t.username in user_map
                                else "N/A",
            }
            for t in trips
        ],
    }


class RateDriverData(BaseModel):
    driver_username: str
    rating: float

@app.post("/rate-driver")
async def rate_driver(data: RateDriverData, db: Session = Depends(get_db)):
    if not (1.0 <= data.rating <= 5.0):
        return {"success": False, "message": "Rating must be between 1 and 5"}
    driver = db.query(Driver).filter(Driver.username == data.driver_username).first()
    if not driver:
        return {"success": False, "message": "Driver not found"}
    driver.total_rating_points += data.rating
    driver.rating_count += 1
    db.commit()
    return {"success": True, "message": "Rating submitted!", "new_rating": driver.average_rating}

@app.get("/passenger/family-contacts")
async def get_family_contacts(username: str, db: Session = Depends(get_db)):
    passenger = db.query(Passenger).filter(Passenger.username == username).first()
    if not passenger:
        return {"success": False, "message": "User not found", "contacts": []}
    contacts = json.loads(passenger.family_contacts or "[]")
    return {"success": True, "contacts": contacts}


@app.post("/passenger/family-contacts")
async def add_family_contact(data: FamilyContactData, db: Session = Depends(get_db)):
    passenger = db.query(Passenger).filter(Passenger.username == data.username).first()
    if not passenger:
        return {"success": False, "message": "User not found"}
    contacts = json.loads(passenger.family_contacts or "[]")
    if len(contacts) >= 5:
        return {"success": False, "message": "Maximum 5 contacts allowed"}
    contacts.append({
        "name":     data.name,
        "phone":    data.phone,
        "email":    data.email,   # ← ADD
        "relation": data.relation
    })
    passenger.family_contacts = json.dumps(contacts)
    db.commit()
    return {"success": True, "message": "Contact added!", "contacts": contacts}

@app.delete("/passenger/family-contacts")
async def remove_family_contact(data: RemoveContactData, db: Session = Depends(get_db)):
    passenger = db.query(Passenger).filter(Passenger.username == data.username).first()
    if not passenger:
        return {"success": False, "message": "User not found"}
    contacts = json.loads(passenger.family_contacts or "[]")
    if data.index < 0 or data.index >= len(contacts):
        return {"success": False, "message": "Invalid contact index"}
    contacts.pop(data.index)
    passenger.family_contacts = json.dumps(contacts)
    db.commit()
    return {"success": True, "message": "Contact removed!", "contacts": contacts}

def haversine(lat1, lng1, lat2, lng2):
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.asin(math.sqrt(a))

@app.get("/driver/nearby-requests")
async def nearby_requests(lat: float, lng: float, radius_km: float = 5, driver_username: str = "", db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.username == driver_username).first()
    pending = db.query(TripHistory).filter(TripHistory.status == "pending").all()

    nearby = []
    for trip in pending:
        if trip.pickup_lat is None or trip.pickup_lng is None or trip.vehicle_type != driver.vehicle_type:
            continue
        dist = haversine(lat, lng, trip.pickup_lat, trip.pickup_lng)
        if dist <= radius_km:
            nearby.append({
                "id":           trip.id,
                "username":     trip.username,
                "pickup":       trip.pickup,
                "destination":  trip.destination,
                "service_type": trip.service_type or "Ride",
                "vehicle_type": trip.vehicle_type,
                "fare":         trip.fare,
                "distance_km":  round(dist, 1),
                "repair_issues":       json.loads(trip.repair_issues) if trip.repair_issues else [],
                "repair_note":         trip.repair_note or "",
            })

    nearby.sort(key=lambda x: x["distance_km"])
    return {"success": True, "requests": nearby}



# ─────────────────────────────────────────────
# Driver Endpoints
# ─────────────────────────────────────────────
@app.post("/driver/signup")
async def driver_signup(data: DriverSignupData, db: Session = Depends(get_db)):
    if data.password != data.confirm_password:
        return {"success": False, "message": "Passwords do not match"}
    if len(data.password) < 6:
        return {"success": False, "message": "Password must be at least 6 characters"}
    if db.query(Driver).filter(Driver.username == data.username).first():
        return {"success": False, "message": "Username already taken"}

    driver = Driver(
        username=data.username,
        hashed_password=hash_password(data.password),
        phone=data.phone,
        vehicle_type=data.vehicle_type,
        experience_years=data.experience_years,
    )
    db.add(driver)
    db.commit()
    return {"success": True, "message": f"Driver account created! Welcome {data.username}!"}


@app.post("/driver/login")
async def driver_login(data: LoginData, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.username == data.username).first()
    if not driver:
        return {"success": False, "message": "Driver not found"}
    if not verify_password(data.password, driver.hashed_password):
        return {"success": False, "message": "Wrong password"}
    return {
        "success": True,
        "message": f"Welcome back, {data.username}!",
        "token": "fake-driver-token-123",
    }

@app.get("/driver/profile/{username}")
async def driver_profile(username: str, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.username == username).first()
    if not driver:
        return {"success": False, "message": "Driver not found"}

    # If driver is seeing their result for first time, mark as notified
    newly_notified = False
    if not driver.verification_notified:
        newly_notified = True
        driver.verification_notified = True
        db.commit()

    return {
        "success":              True,
        "username":             driver.username,
        "phone":                driver.phone,
        "vehicle_type":         driver.vehicle_type,
        "number_of_rides":      driver.number_of_rides,
        "rating":               driver.average_rating,
        "experience_years":     driver.experience_years,
        "documents":            json.loads(driver.documents),
        "member_since":         driver.created_at.strftime("%Y-%m-%d"),
        "verification_status":  driver.verification_status,
        "verification_reason":  driver.verification_reason,
        "newly_notified":       newly_notified,   # ← frontend shows banner if True
    }

# ── Schema ──
class VerifyDriverData(BaseModel):
    driver_username: str
    action:          str   # "approve" or "reject"
    reason:          str = ""

ADMIN_PASSWORD = "transapp_admin_2025"   # move to .env in production

# ── Endpoints ──
@app.get("/admin/pending-drivers")
async def pending_drivers(password: str, db: Session = Depends(get_db)):
    if password != ADMIN_PASSWORD:
        return {"success": False, "message": "Unauthorized"}
    drivers = db.query(Driver).filter(Driver.verification_status == "pending").all()
    result = []
    for d in drivers:
        docs = json.loads(d.documents or "{}")
        result.append({
            "username":     d.username,
            "phone":        d.phone,
            "vehicle_type": d.vehicle_type,
            "submitted_at": d.created_at.strftime("%Y-%m-%d %H:%M"),
            "documents":    docs,   # filenames — frontend builds preview URLs
        })
    return {"success": True, "drivers": result}


@app.post("/admin/verify-driver")
async def verify_driver(data: VerifyDriverData, password: str, db: Session = Depends(get_db)):
    if password != ADMIN_PASSWORD:
        return {"success": False, "message": "Unauthorized"}
    driver = db.query(Driver).filter(Driver.username == data.driver_username).first()
    if not driver:
        return {"success": False, "message": "Driver not found"}
    if data.action == "approve":
        driver.verification_status  = "verified"
        driver.verification_reason  = ""
    elif data.action == "reject":
        if not data.reason:
            return {"success": False, "message": "Please provide a rejection reason"}
        driver.verification_status  = "rejected"
        driver.verification_reason  = data.reason
    else:
        return {"success": False, "message": "Action must be 'approve' or 'reject'"}

    driver.verification_notified = False   # ← driver hasn't seen result yet
    db.commit()
    return {"success": True, "message": f"Driver {data.action}d successfully."}


# Serve uploaded files so frontend can preview them
from fastapi.staticfiles import StaticFiles
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/driver/update-documents")
async def update_documents(data: UpdateDocumentsData, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.username == data.driver_username).first()
    if not driver:
        return {"success": False, "message": "Driver not found"}
    driver.documents = json.dumps({
        "license": data.license,
        "nid": data.nid,
        "vehicle_reg": data.vehicle_reg,
    })
    db.commit()
    return {"success": True, "message": "Documents updated!"}

UPLOAD_DIR = "uploads/driver_docs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/driver/upload-docs")
async def upload_driver_docs(
    username:   str        = Form(...),
    citizenship: UploadFile = File(None),
    license:    UploadFile  = File(None),
    bluebook:   UploadFile  = File(None),
    selfie:     UploadFile  = File(None),   # ← NEW
    bike_front: UploadFile  = File(None),   # ← NEW
    bike_back:  UploadFile  = File(None),   # ← NEW
    db: Session = Depends(get_db)
):
    driver = db.query(Driver).filter(Driver.username == username).first()
    if not driver:
        return {"success": False, "message": "Driver not found"}

    allowed_types = {"image/jpeg", "image/png", "application/pdf"}
    docs = json.loads(driver.documents or "{}")

    for field_name, file in [
        ("citizenship", citizenship),
        ("license",     license),
        ("bluebook",    bluebook),
        ("selfie",      selfie),
        ("bike_front",  bike_front),
        ("bike_back",   bike_back),
    ]:
        if file is None:
            continue
        if file.content_type not in allowed_types:
            return {"success": False, "message": f"Invalid file type for {field_name}. Use JPG or PNG."}
        ext      = file.filename.rsplit(".", 1)[-1]
        filename = f"{username}_{field_name}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)
        with open(filepath, "wb") as f:
            shutil.copyfileobj(file.file, f)
        docs[field_name] = filename

    driver.documents            = json.dumps(docs)
    driver.verification_status  = "pending"
    driver.verification_notified = True   # they already know it's pending
    db.commit()

    return {
        "success": True,
        "message": "Documents submitted! Verification takes 24–48 hours.",
        "verification_status": "pending",
    }

class AcceptRequest(BaseModel):
    driver_username: str
    request_id:      int

@app.post("/driver/accept-request")
async def accept_request(data: AcceptRequest, db: Session = Depends(get_db)):
    trip = db.query(TripHistory).filter(TripHistory.id == data.request_id).first() 
    if not trip:
        return {"success": False, "message": "Request not found"}
    if trip.status != "pending":
        return {"success": False, "message": "Already accepted by another driver"}

    trip.status      = "accepted"
    trip.driver_name = data.driver_username      # ← assigned HERE when driver accepts
    trip.eta         = random.randint(2, 10)     # ← eta set HERE
    db.commit()

    return {
        "success": True,
        "message": "Request accepted! Head to the pickup location.",
        "trip_id": trip.id,
        "pickup":  trip.pickup,
        "destination": trip.destination,
        "pickup_lat": trip.pickup_lat,   # ← ADD
        "pickup_lng": trip.pickup_lng,   # ← ADD
    }


@app.post("//accept-request")
async def accept_request(data: AcceptRequest, db: Session = Depends(get_db)):
    trip = db.query(TripHistory).filter(TripHistory.id == data.request_id).first()
    if not trip:
        return {"success": False, "message": "Request not found"}
    if trip.status != "pending":
        return {"success": False, "message": "Already accepted by another driver"}

    trip.status      = "accepted"
    trip.driver_name = data.driver_username      # ← assigned HERE when driver accepts
    trip.eta         = random.randint(2, 10)     # ← eta set HERE
    db.commit()

    return {
        "success": True,
        "message": "Request accepted! Head to the pickup location.",
        "trip_id": trip.id,
        "pickup":  trip.pickup,
        "destination": trip.destination,
    }

