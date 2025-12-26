from app.extensions import db

class DailyEvent(db.Model):
    __tablename__ = 'daily_events'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    participants = db.relationship('DailyEventParticipant', backref='event', cascade="all, delete-orphan", lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'participants_count': len(self.participants)
        }

class DailyEventParticipant(db.Model):
    __tablename__ = 'daily_event_participants'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('daily_events.id'), nullable=False)
    character_id = db.Column(db.Integer, db.ForeignKey('characters.id'), nullable=False)

    character = db.relationship('Character', backref='event_participations')
    progress = db.relationship('DailyEventProgress', backref='participant', cascade="all, delete-orphan", lazy=True)

    __table_args__ = (db.UniqueConstraint('event_id', 'character_id', name='_event_character_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'character_id': self.character_id,
            'character_name': self.character.name,
            'character_class': self.character.class_name,
            'account_email': self.character.account.email,
            'progress': [p.to_dict() for p in self.progress]
        }

class DailyEventProgress(db.Model):
    __tablename__ = 'daily_event_progress'
    id = db.Column(db.Integer, primary_key=True)
    participant_id = db.Column(db.Integer, db.ForeignKey('daily_event_participants.id'), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    is_completed = db.Column(db.Boolean, default=False)

    __table_args__ = (db.UniqueConstraint('participant_id', 'event_date', name='_participant_date_uc'),)

    def to_dict(self):
        return {
            'id': self.id,
            'participant_id': self.participant_id,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'is_completed': self.is_completed
        }
