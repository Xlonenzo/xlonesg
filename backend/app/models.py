from sqlalchemy import Column, Integer, String, Float, Text, Boolean, Date, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from .database import Base

class KPI(Base):
    __tablename__ = "kpis"
    __table_args__ = {"schema": "xlonesg"}

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
    status = Column(String)
    year = Column(Integer)
    month = Column(Integer)
    cnpj = Column(String)
    kpicode = Column(String, unique=True, index=True)
    company_category = Column(String)
    isfavorite = Column(Boolean, default=False)
    compliance = Column(ARRAY(String))  # Novo campo

class ActionPlan(Base):
    __tablename__ = "actionplans"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    objective = Column(String, index=True)
    start_date = Column(Date)
    end_date = Column(Date)
    kpi_id = Column(Integer, ForeignKey("xlonesg.kpis.id"))  # Adicionado este campo
    tasks = relationship("Task", back_populates="action_plan")
    kpi = relationship("KPI")  # Adicionado esta relação

class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    status = Column(String)
    action_plan_id = Column(Integer, ForeignKey("xlonesg.actionplans.id"))
    action_plan = relationship("ActionPlan", back_populates="tasks")

class Company(Base):
    __tablename__ = "companies"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    cnpj = Column(String(14), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    razao_social = Column(String(255))
    endereco = Column(Text)
    trade_name = Column(String(100))
    registration_date = Column(Date)
    size = Column(String(20))
    sector = Column(String(20))
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(8))
    phone = Column(String(20))
    email = Column(String(100))
    website = Column(String(100))
    is_active = Column(Boolean, default=True)

class KPITemplate(Base):
    __tablename__ = "kpi_templates"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    unit = Column(String)
    category = Column(String)
    subcategory = Column(String)
    description = Column(Text)
    frequency = Column(String)
    collection_method = Column(String)
    status = Column(String)
    year = Column(Integer)
    month = Column(Integer)
    kpicode = Column(String, unique=True, index=True)
    company_category = Column(String)
    isfavorite = Column(Boolean, default=False)
    compliance = Column(ARRAY(String))
