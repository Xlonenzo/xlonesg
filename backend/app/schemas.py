# schemas.py

from pydantic import BaseModel, constr, Field, EmailStr
from datetime import date
from typing import Optional, List


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
    status: str
    isfavorite: bool = False


class KPIEntryCreate(KPIEntryBase):
    pass


class KPIEntry(KPIEntryBase):
    id: int

    class Config:
        orm_mode = True


class KPIEntryWithTemplate(BaseModel):
    entry_id: int
    template_id: int
    template_name: Optional[str] = None
    cnpj: str
    actual_value: float
    target_value: float
    year: int
    month: int
    status: str
    isfavorite: bool
    unit: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    collection_method: Optional[str] = None
    kpicode: Optional[str] = None
    company_category: Optional[str] = None
    compliance: Optional[List[str]] = []
    genero: Optional[str] = None  # Novo campo
    raca: Optional[str] = None  # Novo campo
    state: Optional[str] = None  # Torna o campo opcional

    class Config:
        orm_mode = True


class CustomizationBase(BaseModel):
    sidebar_color: str
    button_color: str
    font_color: str
    logo_url: str


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

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    password: str

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[str] = None

    class Config:
        from_attributes = True


class User(UserBase):
    id: int

    class Config:
        from_attributes = True


class BondBase(BaseModel):
    name: str
    type: str
    value: float
    esg_percentage: float
    issue_date: date
    compliance_verified: bool
    regulator: str
    social_impact_type: str
    estimated_social_impact: str
    social_report_issued: bool
    project_description: str
    project_eligibility: str
    project_selection_date: date
    resource_allocation_approved: bool
    resource_manager: str
    separate_account: bool
    social_impact_achieved: str
    social_impact_measured_date: Optional[date]
    audit_completed: bool
    audit_result: Optional[str]
    report_frequency: Optional[str]
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
        from_attributes = True


class BondCreate(BondBase):
    class Config:
        from_attributes = True


class Bond(BondBase):
    id: int

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str

    class Config:
        from_attributes = True
