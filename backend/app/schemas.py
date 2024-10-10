from pydantic import BaseModel

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

class ActionPlanBase(BaseModel):
    objective: str

class ActionPlanCreate(ActionPlanBase):
    pass

class ActionPlan(ActionPlanBase):
    id: int

    class Config:
        from_attributes = True