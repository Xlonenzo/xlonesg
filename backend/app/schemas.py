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

class KPICreate(KPIBase):
    pass

class KPI(KPIBase):
    id: int

    class Config:
        from_attributes = True