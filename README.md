# 🚀 TransApp — Ride Hailing Platform for Nepal

A full-stack ride-hailing web application built for Kathmandu,
similar to Pathao and inDrive.

## 🌐 Live Demo
- Frontend: https://transapp.vercel.app
- Backend:  https://transapp.onrender.com

## Demo Accounts
- Passenger: username: `demo` password: `demo123`
- Driver:    username: `demoliver` password: `demo123`

## Features
- 🗺️ Real-time GPS tracking with live map
- 🚗 Driver-passenger matching by location (5km radius)
- 📍 Live route drawing with OSRM routing
- 📧 Automatic tracking email to family contacts
- 📄 Driver document verification system
- 🔧 Multiple services: Ride, Delivery, Repair, Towing
- ⭐ Driver rating system
- 📱 Trip history for passengers and drivers
- 🛡️ Admin panel for document verification

## Tech Stack

### Frontend
- React + Vite
- Leaflet (maps)
- Axios
- OpenStreetMap + Nominatim (free geocoding)
- OSRM (free routing)

### Backend
- FastAPI (Python)
- SQLAlchemy + SQLite
- Gmail SMTP (email notifications)
- Haversine formula (distance calculation)
- bcrypt (password hashing)

## Architecture
- Passenger books ride → stored in DB as pending
- Driver polls nearby requests every 10s
- Driver accepts → trip status updates
- Both sides track live via GPS polling
- Family contacts notified via email with tracking link

## Local Setup

### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd frontend
npm install
npm run dev

## Environment Variables
Create a .env file inside backend folder and add these 
->GMAIL_USER=your@gmail.com
->GMAIL_PASSWORD=your_app_password
