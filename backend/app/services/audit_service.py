import datetime
from sqlalchemy.orm import Session
from .. import models

def log_action(db: Session, user_id: int, action: str):
    try:
        log_entry = models.AuditLog(
            user_id=user_id,
            action=action,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error logging action: {e}")
