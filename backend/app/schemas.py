# schemas.py

from pydantic import BaseModel, constr, Field, EmailStr, validator, condecimal, field_validator, model_validator
from datetime import date, datetime
from typing import Optional, List, Dict, Any, Union
from decimal import Decimal
from enum import Enum
import re


class KPIBase(BaseModel):
    name: str
    unit: str
    category: str
    subcategory: str
    description: str
    target_value: float
    actual_value: float
    frequency: str
    collection_method: str
    status: str
    year: int
    month: int  # Novo campo
    cnpj: str
    kpicode: str
    company_category: str  # Novo campo adicionado
    isfavorite: bool  # Novo campo adicionado
    compliance: Optional[List[str]] = []  # Novo campo

    class Config:
        from_attributes = True


class KPICreate(KPIBase):
    class Config:
        from_attributes = True


class KPI(KPIBase):
    id: int

    class Config:
        from_attributes = True


class TaskBase(BaseModel):
    description: str
    status: str
    impact: str
    probability: str

    class Config:
        from_attributes = True


class TaskCreate(TaskBase):
    class Config:
        from_attributes = True


class Task(TaskBase):
    id: int
    action_plan_id: Optional[int] = None

    class Config:
        from_attributes = True


class ActionPlanBase(BaseModel):
    objective: str
    start_date: str
    end_date: str
    entry_id: Optional[int] = None
    cnpj: Optional[str] = None

    class Config:
        from_attributes = True


class ActionPlanCreate(ActionPlanBase):
    pass


class ActionPlan(ActionPlanBase):
    id: int
    tasks: List[Task] = []

    class Config:
        orm_mode = True

    @classmethod
    def from_orm(cls, obj):
        data = {
            "id": obj.id,
            "objective": obj.objective,
            "start_date": obj.start_date.isoformat() if isinstance(obj.start_date, date) else obj.start_date,
            "end_date": obj.end_date.isoformat() if isinstance(obj.end_date, date) else obj.end_date,
            "entry_id": obj.entry_id,
            "tasks": [Task.from_orm(task) for task in obj.tasks]
        }
        return cls(**data)


class CompanyBase(BaseModel):
    cnpj: str
    name: str
    razao_social: Optional[str] = None
    endereco: Optional[str] = None
    trade_name: Optional[str] = None
    registration_date: Optional[date] = None
    size: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = True

    @validator('cnpj')
    def validate_cnpj(cls, v):
        if not v:
            raise ValueError("CNPJ é obrigatório")
        # Remove caracteres não numéricos
        v = re.sub(r'\D', '', v)
        if len(v) != 14:
            raise ValueError("CNPJ deve conter 14 dígitos")
        return v

    @validator('name')
    def validate_name(cls, v):
        if not v:
            raise ValueError("Nome é obrigatório")
        if len(v.strip()) < 2:
            raise ValueError("Nome deve ter pelo menos 2 caracteres")
        return v.strip()

    @validator('registration_date')
    def validate_date(cls, v):
        if v is not None:
            if isinstance(v, str):
                try:
                    return datetime.strptime(v, '%Y-%m-%d').date()
                except ValueError:
                    raise ValueError("Data inválida. Use o formato YYYY-MM-DD")
        return v

    class Config:
        from_attributes = True


class CompanyCreate(CompanyBase):
    class Config:
        from_attributes = True


class Company(CompanyBase):
    id: int

    class Config:
        from_attributes = True


class KPITemplateBase(BaseModel):
    name: str
    unit: str
    category: str
    subcategory: str
    description: str
    frequency: str
    collection_method: str
    kpicode: Optional[str] = None
    company_category: str
    compliance: List[str]
    genero: Optional[str] = None
    raca: Optional[str] = None

    class Config:
        from_attributes = True


class KPITemplateCreate(KPITemplateBase):
    class Config:
        from_attributes = True


class KPITemplate(KPITemplateBase):
    id: int

    class Config:
        from_attributes = True


class KPIEntryBase(BaseModel):
    template_id: int
    cnpj: str
    actual_value: float
    target_value: float
    year: int
    month: int
    isfavorite: bool = False
    project_id: Optional[int] = None  # Novo campo

    @validator('project_id')
    def validate_project_id(cls, v):
        if v is not None and v <= 0:
            raise ValueError("project_id deve ser um número positivo")
        return v


class KPIEntryCreate(KPIEntryBase):
    pass


class KPIEntry(KPIEntryBase):
    id: int

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True


class KPIEntryWithTemplate(BaseModel):
    entry_id: int
    template_id: int
    template_name: Optional[str] = None
    cnpj: str
    actual_value: float
    target_value: float
    year: int
    month: int
    isfavorite: bool
    project_id: Optional[int] = None
    project_name: Optional[str] = None  # Nome do projeto associado
    project_status: Optional[str] = None  # Status do projeto associado
    unit: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    collection_method: Optional[str] = None
    kpicode: Optional[str] = None
    company_category: Optional[str] = None
    compliance: Optional[List[str]] = []
    genero: Optional[str] = None
    raca: Optional[str] = None
    state: Optional[str] = None

    class Config:
        orm_mode = True


class CustomizationBase(BaseModel):
    sidebar_color: str
    button_color: str
    font_color: str


class CustomizationCreate(CustomizationBase):
    pass


class Customization(CustomizationBase):
    id: int

    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    password: str
    full_name: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None

    class Config:
        from_attributes = True


class User(UserBase):
    id: int
    username: str
    email: str
    role: str
    is_active: bool = True
    full_name: str

    class Config:
        from_attributes = True


class BondBase(BaseModel):
    name: str
    type: str
    value: float
    esg_percentage: float
    issue_date: date
    compliance_verified: Optional[bool] = None
    regulator: str
    social_impact_type: str
    estimated_social_impact: str
    social_report_issued: Optional[bool] = None
    project_description: str
    project_eligibility: str
    project_selection_date: date
    resource_allocation_approved: Optional[bool] = None
    resource_manager: str
    separate_account: Optional[bool] = None
    social_impact_achieved: str
    social_impact_measured_date: Optional[date] = None
    audit_completed: Optional[bool] = None
    audit_result: Optional[str] = None
    report_frequency: Optional[str] = None
    interest_rate: float
    guarantee_value: float
    issuer_name: str
    issuer_cnpj: str
    issuer_address: str
    issuer_contact: str
    intermediary_name: str
    intermediary_cnpj: str
    intermediary_contact: str
    financial_institution_name: str
    financial_institution_cnpj: str
    financial_institution_contact: str

    class Config:
        orm_mode = True


class BondCreate(BondBase):
    pass


class Bond(BondBase):
    id: int

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str

    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    title: str
    original_filename: str
    file_type: str


class DocumentCreate(DocumentBase):
    file_path: str


class Document(DocumentBase):
    id: int
    file_path: str
    created_at: datetime

    class Config:
        from_attributes = True


class ESGProjectBase(BaseModel):
    name: str
    company_id: int
    project_type: str
    start_date: date
    end_date: date
    budget_allocated: float
    currency: str = "BRL"
    status: str
    progress_percentage: float = 0
    expected_impact: Optional[str] = None
    actual_impact: Optional[str] = None
    last_audit_date: Optional[date] = None
    ods_contributions: dict = Field(
        default_factory=lambda: {
            'ods1': 0, 'ods2': 0, 'ods3': 0, 'ods4': 0, 'ods5': 0,
            'ods6': 0, 'ods7': 0, 'ods8': 0, 'ods9': 0, 'ods10': 0,
            'ods11': 0, 'ods12': 0, 'ods13': 0, 'ods14': 0, 'ods15': 0,
            'ods16': 0, 'ods17': 0
        }
    )

    @validator('ods_contributions')
    def validate_ods_values(cls, v):
        for key, value in v.items():
            if not isinstance(value, (int, float)) or value < 0 or value > 2:
                raise ValueError(f"ODS values must be between 0 and 2 for {key}")
        return v

    class Config:
        from_attributes = True


class ESGProjectCreate(ESGProjectBase):
    pass


class ESGProject(ESGProjectBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectStatus(str, Enum):
    EM_ANDAMENTO = "Em andamento"
    CONCLUIDO = "Concluído"
    CANCELADO = "Cancelado"
    PLANEJADO = "Planejado"

class ProjectTrackingBase(BaseModel):
    name: str
    company_id: int
    project_type: str
    start_date: date
    end_date: date
    budget_allocated: float
    currency: str = "BRL"
    status: ProjectStatus
    progress_percentage: float = 0
    expected_impact: Optional[str] = None
    actual_impact: Optional[str] = None
    last_audit_date: Optional[date] = None
    ods1: float = 0
    ods2: float = 0
    ods3: float = 0
    ods4: float = 0
    ods5: float = 0
    ods6: float = 0
    ods7: float = 0
    ods8: float = 0
    ods9: float = 0
    ods10: float = 0
    ods11: float = 0
    ods12: float = 0
    ods13: float = 0
    ods14: float = 0
    ods15: float = 0
    ods16: float = 0
    ods17: float = 0

    @field_validator('ods1', 'ods2', 'ods3', 'ods4', 'ods5', 'ods6', 'ods7', 'ods8', 
                    'ods9', 'ods10', 'ods11', 'ods12', 'ods13', 'ods14', 'ods15', 
                    'ods16', 'ods17')
    def validate_ods_value(cls, v: float) -> float:
        if not 0 <= v <= 2:
            raise ValueError("O valor ODS deve estar entre 0 e 2")
        return v

    @field_validator('status')
    def validate_status(cls, v: str) -> str:
        valid_status = ["Em andamento", "Concluído", "Cancelado", "Planejado"]
        if v not in valid_status:
            raise ValueError(f"Status deve ser um dos seguintes: {', '.join(valid_status)}")
        return v

    @field_validator('project_type')
    def validate_project_type(cls, v: str) -> str:
        valid_types = ["Ambiental", "Social", "Governança"]
        if v not in valid_types:
            raise ValueError(f"Tipo de projeto deve ser um dos seguintes: {', '.join(valid_types)}")
        return v

    @model_validator(mode='after')
    def validate_dates(cls, values: Any) -> Any:
        start_date = values.start_date
        end_date = values.end_date
        
        if start_date and end_date and start_date > end_date:
            raise ValueError("A data de início deve ser anterior à data de término")
        
        return values

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "name": "Projeto ESG Exemplo",
                "company_id": 1,
                "project_type": "Ambiental",
                "start_date": "2024-01-01",
                "end_date": "2024-12-31",
                "budget_allocated": 100000.0,
                "currency": "BRL",
                "status": "Em andamento",
                "progress_percentage": 0,
                "expected_impact": "Redução de 30% nas emissões de CO2",
                "ods1": 0.5,
                "ods2": 1.0,
                "ods3": 0.0
                # ... outros campos ODS
            }
        }
    }


class ProjectTrackingCreate(ProjectTrackingBase):
    pass


class ProjectTracking(ProjectTrackingBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    company: Optional[CompanyBase] = None

    class Config:
        from_attributes = True


class EmissionDataBase(BaseModel):
    project_id: int
    scope: str = Field(..., max_length=255)
    emission_type: str = Field(..., max_length=255)
    value: condecimal(max_digits=20, decimal_places=6, ge=0)
    unit: str = Field(..., max_length=255)
    source: str = Field(..., max_length=255)
    calculation_method: str = Field(..., max_length=255)
    uncertainty_level: Optional[condecimal(max_digits=5, decimal_places=2)] = None
    timestamp: datetime
    calculated_emission: bool = False
    reporting_standard: str = Field(..., max_length=255)

    class Config:
        from_attributes = True


class EmissionDataCreate(EmissionDataBase):
    pass


class EmissionData(EmissionDataBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmissionDataResponse(EmissionData):
    project: Optional['ProjectTracking'] = None

    class Config:
        from_attributes = True


class SupplierBase(BaseModel):
    project_id: int
    name: str
    risk_level: str
    esg_score: float
    location: str
    compliance_status: str
    esg_reporting: bool
    impact_assessment: str

    class Config:
        from_attributes = True


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(SupplierBase):
    class Config:
        from_attributes = True


class Supplier(SupplierBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MaterialityAssessmentBase(BaseModel):
    project_id: int
    topic: str
    business_impact: float
    external_impact: float
    stakeholder_importance: float
    priority_level: str
    regulatory_alignment: bool

    class Config:
        from_attributes = True


class MaterialityAssessmentCreate(MaterialityAssessmentBase):
    pass


class MaterialityAssessmentUpdate(BaseModel):
    project_id: Optional[int] = None
    topic: Optional[str] = None
    business_impact: Optional[float] = None
    external_impact: Optional[float] = None
    stakeholder_importance: Optional[float] = None
    priority_level: Optional[str] = None
    regulatory_alignment: Optional[bool] = None

    class Config:
        from_attributes = True


class MaterialityAssessment(MaterialityAssessmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    project: Optional['ProjectTracking'] = None

    class Config:
        from_attributes = True


class InvestmentBase(BaseModel):
    company_id: int
    investment_type: str
    amount_invested: float
    currency: str
    investment_date: date
    expected_roi: Optional[float] = None
    actual_roi: Optional[float] = None
    impact_measured: Optional[str] = None
    last_assessment_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvestmentCreate(InvestmentBase):
    pass


class Investment(InvestmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    company: Optional[CompanyBase] = None

    class Config:
        from_attributes = True


class ComplianceAuditBase(BaseModel):
    company_id: int
    entity_type: str
    audit_date: date
    auditor_name: str
    compliance_status: str
    findings: Optional[str] = None
    corrective_action_plan: Optional[str] = None
    follow_up_date: Optional[date] = None

    @field_validator('compliance_status')
    def validate_status(cls, v: str) -> str:
        valid_status = ["Conforme", "Não Conforme", "Parcialmente Conforme"]
        if v not in valid_status:
            raise ValueError(f"Status inválido. Deve ser um dos seguintes: {', '.join(valid_status)}")
        return v

    @field_validator('entity_type')
    def validate_entity_type(cls, v: str) -> str:
        valid_types = ["Projeto", "Investimento", "Emissão"]
        if v not in valid_types:
            raise ValueError(f"Tipo de entidade inválido. Deve ser um dos seguintes: {', '.join(valid_types)}")
        return v

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "company_id": 1,
                "entity_type": "Projeto",
                "audit_date": "2024-01-01",
                "auditor_name": "João Silva",
                "compliance_status": "Conforme",
                "findings": "Nenhuma não conformidade encontrada",
                "corrective_action_plan": None,
                "follow_up_date": None
            }
        }
    }


class ComplianceAuditCreate(ComplianceAuditBase):
    pass


class ComplianceAudit(ComplianceAuditBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    company: Optional['CompanyBase'] = None

    model_config = {
        "from_attributes": True
    }


class BondProjectRelationBase(BaseModel):
    bond_id: int
    project_id: int

    class Config:
        from_attributes = True


class BondProjectRelationCreate(BondProjectRelationBase):
    pass


class BondProjectRelation(BondProjectRelationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    bond: Optional[Bond] = None
    project: Optional[ProjectTracking] = None

    class Config:
        from_attributes = True


class ReportRequest(BaseModel):
    bond_id: int
    class Config:
        from_attributes = True


class BaseResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None


class GenericDocumentResponse(BaseModel):
    id: int
    entity_name: str
    entity_id: int
    filename: str
    original_filename: str
    file_type: str
    file_size: int
    mime_type: Optional[str]
    description: Optional[str]
    document_type: Optional[str]
    reference_date: Optional[date]
    upload_date: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class EnvironmentalDocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    document_type: Optional[str] = None
    document_subtype: Optional[str] = None
    thematic_area: Optional[str] = None
    document_status: Optional[str] = None
    validity_period: Optional[str] = None
    language: Optional[str] = None
    document_format: Optional[str] = None
    creation_date: Optional[date] = None
    last_modification_date: Optional[date] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    accessibility: Optional[str] = None
    executive_summary: Optional[str] = None
    notes: Optional[str] = None
    signature_authentication: Optional[str] = None
    legal_notice: Optional[str] = None


class EnvironmentalDocumentCreate(EnvironmentalDocumentBase):
    pass


class EnvironmentalDocument(EnvironmentalDocumentBase):
    id: int

    class Config:
        orm_mode = True


# Schema para criação de Estudo de Impacto Ambiental
class EnvironmentalImpactStudyBase(BaseModel):
    environmental_documentid: int
    enterprisename: str
    projectlocation: str
    activitydescription: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EnvironmentalImpactStudyCreate(EnvironmentalImpactStudyBase):
    pass


class EnvironmentalImpactStudy(EnvironmentalImpactStudyBase):
    id: int
    
    class Config:
        from_attributes = True


# Schema para resposta incluindo detalhes do documento relacionado
class EnvironmentalImpactStudyWithDocument(EnvironmentalImpactStudy):
    environmental_document: Optional['EnvironmentalDocument'] = None

    class Config:
        from_attributes = True


class InfoLibraryDocumentBase(BaseModel):
    title: str
    document_type: str
    reference_date: Optional[str] = None
    description: Optional[str] = None


class InfoLibraryDocumentCreate(InfoLibraryDocumentBase):
    pass


class InfoLibraryDocumentResponse(InfoLibraryDocumentBase):
    id: int
    original_filename: str
    file_size: int
    mime_type: Optional[str] = None
    uploaded_by: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

