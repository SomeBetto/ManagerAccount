from app.extensions import db

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    pin = db.Column(db.String(20))

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'password': self.password,
            'pin': self.pin
        }
