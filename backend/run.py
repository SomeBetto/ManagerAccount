from app import create_app
import time
from sqlalchemy.exc import OperationalError
from app.extensions import db

app = create_app()

if __name__ == '__main__':
    # Initial connection retry logic (from old app.py)
    # Note: create_app already attempts db.create_all, but we might want to wait for DB service here if needed.
    # We can keep it simple for now as Docker depends_on handles startup order mostly, but connection readiness is separate.
    
    with app.app_context():
        retries = 5
        while retries > 0:
            try:
                db.create_all()
                print("Database connected and verified.")
                break
            except OperationalError:
                retries -= 1
                print(f"Database not ready, verifying... ({5 - retries}/5)")
                time.sleep(5)
                if retries == 0:
                    print("Could not connect to database after several attempts.")
                    
    app.run(host='0.0.0.0', port=5000, debug=True)
