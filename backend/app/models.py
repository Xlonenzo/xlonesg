from sqlalchemy import Column, Integer, String, Float, Text, Boolean
from .database import Base

class KPI(Base):
    __tablename__ = "kpis"
    __table_args__ = {"schema": "xlonesg"}  # Especifica o schema

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    unit = Column(String)
    category = Column(String)
    subcategory = Column(String)
    description = Column(Text)
    target_value = Column(Float)
    actual_value = Column(Float)
    frequency = Column(String)
    collection_method = Column(String)
    status = Column(String)  # Adicionado o campo status
    year = Column(Integer)
    month = Column(Integer)  # Novo campo
    cnpj = Column(String)
    kpicode = Column(String, unique=True, index=True)
    company_category = Column(String)  # Novo campo adicionado
    isfavorite = Column(Boolean, default=False)  # Novo campo adicionado