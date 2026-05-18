import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER     = "crsameer64@gmail.com"      # ← your gmail
GMAIL_PASSWORD = "yvdh smlg ddnj gxqo"      # ← your 16 digit app password

def test():
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "TransApp Test Email"
        msg["From"]    = GMAIL_USER
        msg["To"]      = GMAIL_USER  # send to yourself

        msg.attach(MIMEText("<h1>Test works!</h1>", "html"))

        print("Connecting to Gmail...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            print("Logging in...")
            server.login(GMAIL_USER, GMAIL_PASSWORD)
            print("Sending...")
            server.sendmail(GMAIL_USER, GMAIL_USER, msg.as_string())
        print("✅ Email sent! Check your inbox.")

    except Exception as e:
        print(f"❌ Failed: {e}")

test()