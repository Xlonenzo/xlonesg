# models.py
from sqlalchemy import (
    Column, Integer, String, Float, Text, Boolean, Date, 
    ForeignKey, ARRAY, Enum, UniqueConstraint, DateTime as SQLDateTime, Table, PrimaryKeyConstraint, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.dialects import postgresql
from sqlalchemy.types import DateTime
from datetime import datetime, timezone
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
    isfavorite = Column(Boolean, default=False)  # Novo campo
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
    razao_social = Column(Text)
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
    website = Column(String(200))
    is_active = Column(Boolean, default=True)

    # Adicionar relacionamento bidirecional
    kpi_entries = relationship("KPIEntry", back_populates="company", cascade="all, delete-orphan")
    project_tracking = relationship("ProjectTracking", back_populates="company", cascade="all, delete-orphan")
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

    # Adicione esta linha
    project_relations = relationship("BondProjectRelation", back_populates="bond")

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
    project_type = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    budget_allocated = Column(Float, nullable=False)
    currency = Column(String, default="BRL")
    status = Column(String, nullable=False)
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
    bond_relations = relationship("BondProjectRelation", back_populates="project")
    emissions = relationship("EmissionData", back_populates="project")
    suppliers = relationship("Supplier", back_populates="project", cascade="all, delete-orphan")
    materiality_assessments = relationship("MaterialityAssessment", back_populates="project", cascade="all, delete-orphan")

class EmissionData(Base):
    __tablename__ = "emission_data"
    __table_args__ = (
        CheckConstraint('value >= 0', name='emission_data_value_check'),
        {'schema': 'xlonesg'}
    )

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("xlonesg.project_tracking.id", ondelete="CASCADE"), nullable=False)
    scope = Column(String(255), nullable=False)
    emission_type = Column(String(255), nullable=False)
    value = Column(Numeric(20, 6), nullable=False)
    unit = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    calculation_method = Column(String(255), nullable=False)
    uncertainty_level = Column(Numeric(5, 2), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    calculated_emission = Column(Boolean, default=False)
    reporting_standard = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamento com o projeto
    project = relationship("ProjectTracking", back_populates="emissions")

class Supplier(Base):
    __tablename__ = "supplier"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("xlonesg.project_tracking.id"), nullable=False)
    name = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    esg_score = Column(Float, nullable=False)
    location = Column(String, nullable=False)
    compliance_status = Column(String, nullable=False)
    esg_reporting = Column(Boolean, default=False)
    impact_assessment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamento apenas com o projeto
    project = relationship("ProjectTracking", back_populates="suppliers")

class MaterialityAssessment(Base):
    __tablename__ = "materiality_assessment"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("xlonesg.project_tracking.id"), nullable=False)
    topic = Column(String, nullable=False)
    business_impact = Column(Float, nullable=False)
    external_impact = Column(Float, nullable=False)
    stakeholder_importance = Column(Float, nullable=False)
    priority_level = Column(String, nullable=False)
    regulatory_alignment = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Update relationship to point to ProjectTracking instead of Company
    project = relationship("ProjectTracking", back_populates="materiality_assessments")

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
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    bond_id = Column(Integer, ForeignKey("xlonesg.bonds.id"))
    project_id = Column(Integer, ForeignKey("xlonesg.project_tracking.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    bond = relationship("Bond", back_populates="project_relations")
    project = relationship("ProjectTracking", back_populates="bond_relations")

class GenericDocument(Base):
    __tablename__ = "generic_documents"
    __table_args__ = {'schema': 'xlonesg'}

    id = Column(Integer, primary_key=True, index=True)
    entity_name = Column(String)
    entity_id = Column(Integer)
    filename = Column(String)
    original_filename = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    mime_type = Column(String)
    description = Column(String, nullable=True)
    document_type = Column(String, nullable=True)
    reference_date = Column(Date, nullable=True)
    uploaded_by = Column(String(255), nullable=False, server_default='sistema')
    upload_date = Column(DateTime(timezone=True), default=datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=True)

class EnvironmentalDocument(Base):
    __tablename__ = "environmental_document"
    __table_args__ = {'schema': 'xlonesg'}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(String(55), nullable=True, name="documenttype")
    document_subtype = Column(String(55), nullable=True, name="documentsubtype")
    thematic_area = Column(String(55), nullable=True, name="thematicarea")
    document_status = Column(String(55), nullable=True, name="documentstatus")
    validity_period = Column(String(55), nullable=True, name="validityperiod")
    language = Column(String(55), nullable=True)
    document_format = Column(String(55), nullable=True, name="documentformat")
    creation_date = Column(Date, nullable=True, name="creationdate")
    last_modification_date = Column(Date, nullable=True, name="lastmodificationdate")
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)
    accessibility = Column(String(55), nullable=True)
    executive_summary = Column(Text, nullable=True, name="executivesummary")
    notes = Column(Text, nullable=True)
    signature_authentication = Column(String(55), nullable=True, name="signatureauthentication")
    legal_notice = Column(String(55), nullable=True, name="legalnotice")

    # Adicionar esta linha
    impact_studies = relationship("EnvironmentalImpactStudy", back_populates="environmental_document")

    class Config:
        orm_mode = True

class EnvironmentalImpactStudy(Base):
    __tablename__ = "environmental_impact_study"
    __table_args__ = (
        Index('idx_eia_env_doc_id', 'environmental_documentid'),
        Index('idx_eia_project_location', 'projectlocation'),
        {'schema': 'xlonesg'}
    )

    id = Column(Integer, primary_key=True, index=True)
    environmental_documentid = Column(
        Integer, 
        ForeignKey("xlonesg.environmental_document.id"),
        unique=True
    )
    enterprisename = Column(String(255))
    projectlocation = Column(String(255))
    activitydescription = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True))

    # Relacionamento com o documento ambiental
    environmental_document = relationship(
        "EnvironmentalDocument",
        foreign_keys=[environmental_documentid]
    )

class InfoLibraryDocument(Base):
    __tablename__ = "infolibrary_documents"
    __table_args__ = {"schema": "xlonesg"}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)
    reference_date = Column(String(10), nullable=True)
    description = Column(Text, nullable=True)
    file_path = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=True)
    uploaded_by = Column(String(100), nullable=False, server_default='system')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)

