from pydantic import BaseModel, constr
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

class KPICreate(KPIBase):
    pass

class KPI(KPIBase):
    id: int

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    description: str
    status: str

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    action_plan_id: int

    class Config:
        from_attributes = True

class ActionPlanBase(BaseModel):
    objective: str
    start_date: date
    end_date: date
    kpi_id: Optional[int] = None  # Adicionado este campo

class ActionPlanCreate(ActionPlanBase):
    pass

class ActionPlan(ActionPlanBase):
    id: int
    tasks: List[Task] = []
    kpi: Optional[KPI] = None  # Adicionado este campo para retornar o KPI associado

    class Config:
        from_attributes = True

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

class CompanyCreate(CompanyBase):
    pass

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
    kpicode: str
    company_category: str
    compliance: Optional[List[str]] = []

class KPITemplateCreate(KPITemplateBase):
    pass

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
        from_attributes = True

class KPIEntryWithTemplateBase(BaseModel):
    entry_id: int
    actual_value: float
    target_value: float
    year: int
    month: int
    status: str
    cnpj: str
    isfavorite: bool  # Adicionado o campo isfavorite
    template_id: int
    template_name: str
    unit: str
    category: str
    subcategory: str
    description: str
    frequency: str
    collection_method: str
    kpicode: str
    company_category: str
    compliance: Optional[List[str]] = []

class KPIEntryWithTemplate(KPIEntryWithTemplateBase):
    class Config:
        from_attributes = True
