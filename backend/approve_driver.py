from main import SessionLocal, Driver

db = SessionLocal()

username = "samir1"  # ← change this to the driver's username

driver = db.query(Driver).filter(Driver.username == username).first()
if driver:
    driver.verification_status   = "verified"
    driver.verification_reason   = ""
    driver.verification_notified = False  # so driver sees the ✅ banner on next login
    db.commit()
    print(f"✅ {username} is now verified!")
else:
    print("❌ Driver not found")

db.close()