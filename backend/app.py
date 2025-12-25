from flask import Flask, send_from_directory
from flask_cors import CORS
from models import db
from routes import api_bp
import os

app = Flask(__name__, static_folder='/frontend', template_folder='/frontend')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/managerdb')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)

app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/')
def index():
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    import time
    from sqlalchemy.exc import OperationalError

    with app.app_context():
        retries = 5
        while retries > 0:
            try:
                # Ideally this is done via migration tools, but for simplicity:
                db.create_all()
                print("Database connected and initialized.")
                break
            except OperationalError as e:
                retries -= 1
                print(f"Database not ready, verifying... ({5 - retries}/5)")
                time.sleep(5)
                if retries == 0:
                    print("Could not connect to database after several attempts.")
                    raise e
                    
    app.run(host='0.0.0.0', port=5000, debug=True)
