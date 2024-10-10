from sqlalchemy import Column, Integer, String, Float, Text, Boolean, Date, ForeignKey
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

class ActionPlan(Base):
    __tablename__ = "actionplans"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    objective = Column(String, index=True)
    start_date = Column(Date)
    end_date = Column(Date)
    tasks = relationship("Task", back_populates="action_plan")

class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    status = Column(String)
    action_plan_id = Column(Integer, ForeignKey("xlonesg.actionplans.id"))
    action_plan = relationship("ActionPlan", back_populates="tasks")