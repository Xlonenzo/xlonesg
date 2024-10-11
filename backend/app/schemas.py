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

class CompanyCreate(BaseModel):
    cnpj: str
    name: str
    razao_social: Optional[str] = None
    endereco: Optional[str] = None
    parent_cnpj: Optional[str] = None

class Company(CompanyCreate):
    id: int
    parent_id: Optional[int] = None

    class Config:
        from_attributes = True

class CompanyWithChildren(Company):
    children: List['CompanyWithChildren'] = []

CompanyWithChildren.update_forward_refs()