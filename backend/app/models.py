# models.py
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, Date, 
    ForeignKey, ARRAY, Enum, UniqueConstraint, DateTime as SQLDateTime, Table
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.dialects import postgresql
from sqlalchemy.types import DateTime
from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey, CheckConstraint

from sqlalchemy import Column, Integer, String, Float, Text, Boolean, Date, ForeignKey, ARRAY, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy.dialects import postgresql

# Definir a tabela de 

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
    esg_projects = relationship("ESGProject", back_populates="company")
    project_tracking = relationship("ProjectTracking", back_populates="company", cascade="all, delete-orphan")
    emission_data = relationship("EmissionData", back_populates="company")
    suppliers = relationship("Supplier", back_populates="company", cascade="all, delete-orphan")
    materiality_assessments = relationship("MaterialityAssessment", back_populates="company", cascade="all, delete-orphan")  # Novo relacionamento
    investments = relationship("Investment", back_populates="company", cascade="all, delete-orphan")
    compliance_audits = relationship("ComplianceAudit", back_populates="company", cascade="all, delete-orphan")


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
    isfavorite = Column(Boolean, default=False)
    project_id = Column(Integer, ForeignKey('xlonesg.project_tracking.id'), nullable=True)  # Nova coluna

    template = relationship("KPITemplate")
    company = relationship("Company")
    project = relationship("ProjectTracking")  # Novo relacionamento


class KPIEntryWithTemplate(Base):
    __tablename__ = 'kpi_entries_with_templates'
    __table_args__ = {"schema": "xlonesg"}

    entry_id = Column(Integer, primary_key=True)
    actual_value = Column(Float)
    target_value = Column(Float)
    year = Column(Integer)
    month = Column(Integer)
    cnpj = Column(String)
    isfavorite = Column(Boolean)
    template_id = Column(Integer)
    project_id = Column(Integer)  # Nova coluna
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
    genero = Column(String)
    raca = Column(String)
    state = Column(String, nullable=True)


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
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    esg_percentage = Column(Float, nullable=False)
    issue_date = Column(Date, nullable=False)
    compliance_verified = Column(Boolean)
    regulator = Column(String, nullable=False)
    social_impact_type = Column(String, nullable=False)
    estimated_social_impact = Column(String, nullable=False)
    social_report_issued = Column(Boolean)
    project_description = Column(String, nullable=False)
    project_eligibility = Column(String, nullable=False)
    project_selection_date = Column(Date, nullable=False)
    resource_allocation_approved = Column(Boolean)
    resource_manager = Column(String, nullable=False)
    separate_account = Column(Boolean)
    social_impact_achieved = Column(String, nullable=False)
    social_impact_measured_date = Column(Date)
    audit_completed = Column(Boolean)
    audit_result = Column(String)
    report_frequency = Column(String)
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

    # Relacionamentos
    project_relations = relationship("BondProjectRelation", back_populates="bond", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Bond {self.name} ({self.type})>"

class Document(Base):
    __tablename__ = "documents"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class ESGProject(Base):
    __tablename__ = "esg_projects"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company_id = Column(Integer, ForeignKey("xlonesg.companies.id"), nullable=False)
    project_type = Column(String, nullable=False)  # Environmental, Social ou Governance
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget_allocated = Column(Float, nullable=False)
    currency = Column(String, default="BRL")
    status = Column(String, nullable=False)  # Em andamento, Concluído, Cancelado, etc
    progress_percentage = Column(Float, default=0)
    expected_impact = Column(Text)
    actual_impact = Column(Text)
    last_audit_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    ods_contributions = Column(postgresql.JSONB, default={
        'ods1': 0, 'ods2': 0, 'ods3': 0, 'ods4': 0, 'ods5': 0,
        'ods6': 0, 'ods7': 0, 'ods8': 0, 'ods9': 0, 'ods10': 0,
        'ods11': 0, 'ods12': 0, 'ods13': 0, 'ods14': 0, 'ods15': 0,
        'ods16': 0, 'ods17': 0
    })

    # Relacionamentos
    company = relationship("Company", back_populates="esg_projects")

class ProjectTracking(Base):
    __tablename__ = "project_tracking"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    company_id = Column(Integer, ForeignKey("xlonesg.companies.id"), nullable=False)
    project_type = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    budget_allocated = Column(Numeric(20, 2), nullable=False)
    currency = Column(String(3), nullable=False)
    status = Column(String(100), nullable=False)
    progress_percentage = Column(Numeric(5, 2))
    expected_impact = Column(String(200), nullable=False)
    actual_impact = Column(String(200), nullable=False)
    last_audit_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), server_default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    # Campos ODS com tipo numeric(5,2)
    ods1 = Column(Numeric(5, 2), default=0)
    ods2 = Column(Numeric(5, 2), default=0)
    ods3 = Column(Numeric(5, 2), default=0)
    ods4 = Column(Numeric(5, 2), default=0)
    ods5 = Column(Numeric(5, 2), default=0)
    ods6 = Column(Numeric(5, 2), default=0)
    ods7 = Column(Numeric(5, 2), default=0)
    ods8 = Column(Numeric(5, 2), default=0)
    ods9 = Column(Numeric(5, 2), default=0)
    ods10 = Column(Numeric(5, 2), default=0)
    ods11 = Column(Numeric(5, 2), default=0)
    ods12 = Column(Numeric(5, 2), default=0)
    ods13 = Column(Numeric(5, 2), default=0)
    ods14 = Column(Numeric(5, 2), default=0)
    ods15 = Column(Numeric(5, 2), default=0)
    ods16 = Column(Numeric(5, 2), default=0)
    ods17 = Column(Numeric(5, 2), default=0)

    company = relationship("Company", back_populates="project_tracking")

    # Relacionamento direto com BondProjectRelation
    bond_relations = relationship("BondProjectRelation", back_populates="project")

class EmissionData(Base):
    __tablename__ = "emission_data"
    __table_args__ = (
        CheckConstraint('value >= 0', name='emission_data_value_check'),
        {'schema': 'xlonesg'}
    )

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("xlonesg.companies.id"), nullable=False)
    scope = Column(String(20), nullable=False, index=True)
    emission_type = Column(String(50), nullable=False)
    value = Column(Numeric(20, 6), nullable=False)
    unit = Column(String(20), nullable=False)
    source = Column(String(200), nullable=False)
    calculation_method = Column(String(200), nullable=False)
    uncertainty_level = Column(Numeric(5, 2), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    calculated_emission = Column(Boolean, default=False, nullable=True)
    reporting_standard = Column(String(20), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp(), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.current_timestamp(), nullable=True)

    # Relacionamento
    company = relationship("Company", back_populates="emission_data")

class Supplier(Base):
    __tablename__ = "supplier"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("xlonesg.companies.id"), nullable=False)
    name = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    esg_score = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    compliance_status = Column(String, nullable=False)
    esg_reporting = Column(Boolean, default=False)
    impact_assessment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="suppliers")

class MaterialityAssessment(Base):
    __tablename__ = "materiality_assessment"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("xlonesg.companies.id"), nullable=False)
    topic = Column(String, nullable=False)
    business_impact = Column(Float, nullable=False)
    external_impact = Column(Float, nullable=False)
    stakeholder_importance = Column(Float, nullable=False)
    priority_level = Column(String, nullable=False)  # Alto, Médio, Baixo
    regulatory_alignment = Column(Boolean, default=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="materiality_assessments")

class Investment(Base):
    __tablename__ = "investment"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("xlonesg.companies.id"), nullable=False)
    investment_type = Column(String, nullable=False)
    amount_invested = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    investment_date = Column(Date, nullable=False)
    expected_roi = Column(Float)
    actual_roi = Column(Float)
    impact_measured = Column(Text)
    last_assessment_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    company = relationship("Company", back_populates="investments")

class ComplianceAudit(Base):
    __tablename__ = "compliance_audit"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("xlonesg.companies.id"))
    entity_type = Column(String)
    audit_date = Column(Date)
    auditor_name = Column(String)
    compliance_status = Column(String)
    findings = Column(Text)
    corrective_action_plan = Column(Text)
    follow_up_date = Column(Date)
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True))

    company = relationship("Company", back_populates="compliance_audits")

class BondProjectRelation(Base):
    __tablename__ = "bond_project_relations"
    __table_args__ = (
        UniqueConstraint('bond_id', 'project_id', name='uq_bond_project_relation'),
        {"schema": "xlonesg"}
    )

    id = Column(Integer, primary_key=True, index=True)
    bond_id = Column(Integer, ForeignKey("xlonesg.bonds.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(Integer, ForeignKey("xlonesg.project_tracking.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.current_timestamp())
    updated_at = Column(DateTime(timezone=True), onupdate=func.current_timestamp())
    created_by = Column(String(100))
    updated_by = Column(String(100))

    # Relacionamentos diretos
    bond = relationship("Bond", back_populates="project_relations")
    project = relationship("ProjectTracking", back_populates="bond_relations")
