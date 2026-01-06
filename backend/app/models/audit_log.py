"""
Modèle AuditLog - Table de traçabilité des actions
Conformité réglementaire AMF/ACPR pour l'audit trail
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from typing import Optional, Dict, Any
import enum

from app.database import Base


class AuditAction(str, enum.Enum):
    """Actions auditées dans le système"""
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    EXPORT = "EXPORT"
    GENERATE_DOC = "GENERATE_DOC"


class AuditLog(Base):
    """
    Modèle AuditLog - Trace toutes les actions importantes
    Obligatoire pour conformité réglementaire
    """
    __tablename__ = "audit_logs"
    
    # ==========================================
    # COLONNES
    # ==========================================
    
    # Identifiant unique
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        index=True
    )
    
    # Utilisateur ayant effectué l'action
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey('users.id'),
        index=True
    )
    
    # Action effectuée
    action = Column(
        String(100),
        nullable=False,
        index=True
    )
    
    # Entité concernée
    entity_type = Column(
        String(50),
        nullable=False,
        index=True
    )
    
    entity_id = Column(
        UUID(as_uuid=True),
        index=True
    )
    
    # Valeurs avant/après pour UPDATE
    old_values = Column(JSONB)
    new_values = Column(JSONB)
    
    # Informations de connexion
    ip_address = Column(INET)
    user_agent = Column(Text)
    
    # Timestamp
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    
    # ==========================================
    # RELATIONS
    # ==========================================
    
    # Relation avec l'utilisateur
    user = relationship("User", back_populates="audit_logs")
    
    # ==========================================
    # MÉTHODES
    # ==========================================
    
    def __repr__(self) -> str:
        """Représentation string"""
        return f"<AuditLog {self.action} on {self.entity_type} by {self.user_id}>"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convertit l'objet en dictionnaire"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id) if self.user_id else None,
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": str(self.entity_id) if self.entity_id else None,
            "old_values": self.old_values,
            "new_values": self.new_values,
            "ip_address": str(self.ip_address) if self.ip_address else None,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
    @property
    def is_create(self) -> bool:
        """Vérifie si c'est une création"""
        return self.action == AuditAction.CREATE.value
    
    @property
    def is_update(self) -> bool:
        """Vérifie si c'est une modification"""
        return self.action == AuditAction.UPDATE.value
    
    @property
    def is_delete(self) -> bool:
        """Vérifie si c'est une suppression"""
        return self.action == AuditAction.DELETE.value
    
    @classmethod
    async def log_action(cls, session, user_id: uuid.UUID, action: str,
                   entity_type: str, entity_id: uuid.UUID = None,
                   old_values: Dict = None, new_values: Dict = None,
                   ip_address: str = None, user_agent: str = None):
        """
        Helper pour créer rapidement un log d'audit
        """
        audit = cls(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent
        )
        session.add(audit)
        return audit