from app.extensions import db

class Character(db.Model):
    __tablename__ = 'characters'
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.Integer)
    class_name = db.Column(db.String(50))
    char_type = db.Column(db.String(50))

    account = db.relationship('Account', backref=db.backref('characters', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'account_id': self.account_id,
            'name': self.name,
            'level': self.level,
            'class_name': self.class_name,
            'char_type': self.char_type
        }

class LevelEntry(db.Model):
    __tablename__ = 'level_entries'
    id = db.Column(db.Integer, primary_key=True)
    character_id = db.Column(db.Integer, db.ForeignKey('characters.id'), nullable=False)
    priority = db.Column(db.Integer, default=0)
    note = db.Column(db.String(500))

    character = db.relationship('Character', backref=db.backref('level_entry', uselist=False))

    def to_dict(self):
        return {
            'id': self.id,
            'character_id': self.character_id,
            'character_name': self.character.name,
            'account_email': self.character.account.email,
            'priority': self.priority,
            'note': self.note
        }
