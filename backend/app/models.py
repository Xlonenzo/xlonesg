# models.py
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, Date, 
    ForeignKey, ARRAY, Enum, UniqueConstraint, DateTime as SQLDateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.dialects import postgresql

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
    month = Column(Integer)  # Novo campo
    cnpj = Column(String)
    kpicode = Column(String, unique=True, index=True)
    company_category = Column(String)  # Novo campo adicionado
    isfavorite = Column(Boolean, default=False)  # Novo campo adicionado
    compliance = Column(ARRAY(String))  # Novo campo


class ActionPlan(Base):
    __tablename__ = "actionplans"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    objective = Column(String, index=True)
    start_date = Column(String)
    end_date = Column(String)
    entry_id = Column(Integer, index=True)
    cnpj = Column(String(14), index=True)

    tasks = relationship("Task", back_populates="action_plan")

    # Relacionamento com a view KPIEntryWithTemplate
    kpi_entry = relationship(
        "KPIEntryWithTemplate",
        foreign_keys=[entry_id],
        primaryjoin="ActionPlan.entry_id == KPIEntryWithTemplate.entry_id"
    )


class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    status = Column(String)
    impact = Column(String)
    probability = Column(String)
    action_plan_id = Column(Integer, ForeignKey("xlonesg.actionplans.id", ondelete="CASCADE"))

    action_plan = relationship("ActionPlan", back_populates="tasks")


class Company(Base):
    __tablename__ = "companies"
    __table_args__ = (
        {"schema": "xlonesg"}
    )

    id = Column(Integer, primary_key=True, index=True)
    cnpj = Column(String(14), unique=True, nullable=False, index=True)
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

    # Adicionar relacionamento bidirecional
    kpi_entries = relationship("KPIEntry", back_populates="company", cascade="all, delete-orphan")


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
    cnpj = Column(String(14), ForeignKey('xlonesg.companies.cnpj', onupdate="CASCADE"), index=True)
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


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(100), nullable=False)
    role = Column(String(20), nullable=False)
    full_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(SQLDateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(SQLDateTime(timezone=True), server_default=func.now(), nullable=False)

def __repr__(self):
        return f"User(id={self.id}, username={self.username}, email={self.email})"
class Bond(Base):
    __tablename__ = "bonds"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    esg_percentage = Column(Float, nullable=False)
    issue_date = Column(Date, nullable=False)
    compliance_verified = Column(Boolean, default=False)
    regulator = Column(String, nullable=False)
    social_impact_type = Column(String, nullable=False)
    estimated_social_impact = Column(String, nullable=False)
    social_report_issued = Column(Boolean, default=False)
    project_description = Column(String, nullable=False)
    project_eligibility = Column(String, nullable=False)  # Alterado de bool para str
    project_selection_date = Column(Date, nullable=False)
    resource_allocation_approved = Column(Boolean, default=False)
    resource_manager = Column(String, nullable=False)
    separate_account = Column(Boolean, default=False)
    social_impact_achieved = Column(String, nullable=False)
    social_impact_measured_date = Column(Date, nullable=True)
    audit_completed = Column(Boolean, default=False)
    audit_result = Column(String, nullable=True)
    report_frequency = Column(String, nullable=True)
    interest_rate = Column(Float, nullable=False)
    guarantee_value = Column(Float, nullable=False)
    issuer_name = Column(String, nullable=False)
    issuer_cnpj = Column(String, nullable=False)
    issuer_address = Column(String, nullable=False)
    issuer_contact = Column(String, nullable=False)
    intermediary_name = Column(String, nullable=False)
    intermediary_cnpj = Column(String, nullable=False)
    intermediary_contact = Column(String, nullable=False)
    financial_institution_name = Column(String, nullable=False)
    financial_institution_cnpj = Column(String, nullable=False)
    financial_institution_contact = Column(String, nullable=False)
