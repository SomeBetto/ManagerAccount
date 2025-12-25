from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    pin = db.Column(db.String(10))
    characters = db.relationship('Character', backref='account', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'password': self.password,
            'pin': self.pin
        }

class Character(db.Model):
    __tablename__ = 'characters'
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255))
    level = db.Column(db.Integer)
    class_name = db.Column(db.String(100))
    char_type = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'account_id': self.account_id,
            'name': self.name,
            'password': self.password or (self.account.password if self.account else None),
            'level': self.level,
            'class_name': self.class_name,
            'char_type': self.char_type
        }
