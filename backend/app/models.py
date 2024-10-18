from sqlalchemy import Column, Integer, String, Float, Text, Boolean, Date, ForeignKey, ARRAY, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.dialects import postgresql

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
    action_plans = relationship("ActionPlan", back_populates="kpi")

class ActionPlan(Base):
    __tablename__ = "actionplans"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    objective = Column(String, index=True)
    start_date = Column(String)
    end_date = Column(String)
    kpi_id = Column(Integer, ForeignKey("kpis.id"))

    tasks = relationship("Task", back_populates="action_plan")
    kpi = relationship("KPI", back_populates="action_plans")

class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    status = Column(String)
    impact = Column(String)
    probability = Column(String)
    action_plan_id = Column(Integer, ForeignKey("actionplans.id"))  # Certifique-se de que o nome da tabela está correto

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
    __table_args__ = (
        UniqueConstraint('kpicode', name='uq_kpi_templates_kpicode'),
        {"schema": "xlonesg"}
    )

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    unit = Column(String)
    category = Column(String)
    subcategory = Column(String)
    description = Column(Text)
    frequency = Column(String)
    collection_method = Column(String)
    kpicode = Column(String, nullable=True, unique=True, server_default='')  # Use uma string vazia como padrão
    company_category = Column(String)
    compliance = Column(postgresql.ARRAY(String))  # Defina como um array de strings
    genero = Column(String)  # Novo campo
    raca = Column(String)  # Novo campo

class KPIEntry(Base):
    __tablename__ = "kpi_entries"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey('xlonesg.kpi_templates.id'))
    cnpj = Column(String(14), ForeignKey('xlonesg.companies.cnpj'))
    actual_value = Column(Float)
    target_value = Column(Float)
    year = Column(Integer)
    month = Column(Integer)
    status = Column(String)
    isfavorite = Column(Boolean, default=False)

    template = relationship("KPITemplate")
    company = relationship("Company")

class KPIEntryWithTemplate(Base):
    __tablename__ = 'kpi_entries_with_templates'
    __table_args__ = {"schema": "xlonesg"}

    entry_id = Column(Integer, primary_key=True)
    actual_value = Column(Float)
    target_value = Column(Float)
    year = Column(Integer)
    month = Column(Integer)
    status = Column(String)
    cnpj = Column(String)
    isfavorite = Column(Boolean)
    template_id = Column(Integer)
    template_name = Column(String)
    unit = Column(String)
    category = Column(String)
    subcategory = Column(String)
    description = Column(Text)
    frequency = Column(String)
    collection_method = Column(String)
    kpicode = Column(String)
    company_category = Column(String)
    compliance = Column(ARRAY(String))
    genero = Column(String)  # Novo campo
    raca = Column(String)  # Novo campo
    state = Column(String, nullable=True)  # Permite que o campo seja nulo

class Customization(Base):
    __tablename__ = "customizations"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    sidebar_color = Column(String)
    button_color = Column(String)
    font_color = Column(String)
    logo_url = Column(String)

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
