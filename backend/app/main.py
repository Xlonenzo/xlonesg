from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from . import models, schemas
from .database import SessionLocal, engine
from typing import List, Optional
import re
from sqlalchemy.orm import joinedload
from sqlalchemy import func, String
from sqlalchemy.dialects import postgresql
from uuid import uuid4
import shutil
import os

app = FastAPI()

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração para servir arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Certifique-se de que o diretório para logos existe
os.makedirs("static/logos", exist_ok=True)

# Configuração da base URL
BASE_URL = "http://localhost:8000"  # Ajuste conforme necessário

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def validate_cnpj(cnpj: str) -> str:
    # Remove caracteres não numéricos
    cnpj = re.sub(r'\D', '', cnpj)
    
    # Verifica se tem 14 dígitos
    if len(cnpj) != 14:
        raise ValueError("CNPJ deve conter 14 dígitos")
    
    return cnpj

# Rotas para Planos de Aço
@app.post("/api/action-plans", response_model=schemas.ActionPlan)
def create_action_plan(action_plan: schemas.ActionPlanCreate, db: Session = Depends(get_db)):
    db_action_plan = models.ActionPlan(**action_plan.dict())
    db.add(db_action_plan)
    db.commit()
    db.refresh(db_action_plan)
    return db_action_plan

@app.get("/api/action-plans", response_model=List[schemas.ActionPlan])
def read_action_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ActionPlan).offset(skip).limit(limit).all()

# Nova rota para adicionar tarefa a um plano de ação
@app.post("/api/action-plans/{action_plan_id}/tasks", response_model=schemas.Task)
def add_task_to_action_plan(action_plan_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Verificar se o plano de ação existe
    db_action_plan = db.query(models.ActionPlan).filter(models.ActionPlan.id == action_plan_id).first()
    if db_action_plan is None:
        raise HTTPException(status_code=404, detail="Action plan not found")
    
    # Criar a nova tarefa
    db_task = models.Task(**task.dict(), action_plan_id=action_plan_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# Rota para obter todas as tarefas de um plano de ação
@app.get("/api/action-plans/{action_plan_id}/tasks", response_model=List[schemas.Task])
def read_tasks_for_action_plan(action_plan_id: int, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).filter(models.Task.action_plan_id == action_plan_id).all()
    return tasks

# Rotas para KPIs

@app.post("/api/kpis", response_model=schemas.KPI)
def create_kpi(kpi: schemas.KPICreate, db: Session = Depends(get_db)):
    db_kpi = models.KPI(**kpi.dict())
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

@app.get("/api/kpis", response_model=List[schemas.KPI])
def read_kpis(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = Query(None, description="Filter KPIs by category"),
    db: Session = Depends(get_db)
):
    print(f"Recebida solicitação para KPIs. Category: {category}, Skip: {skip}, Limit: {limit}")
    query = db.query(models.KPI)
    if category:
        query = query.filter(models.KPI.category == category)
    kpis = query.offset(skip).limit(limit).all()
    print(f"Retornando {len(kpis)} KPIs")
    return kpis

@app.get("/api/kpis/{kpi_id}", response_model=schemas.KPI)
def read_kpi(kpi_id: int, db: Session = Depends(get_db)):
    db_kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if db_kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    return db_kpi

@app.put("/api/kpis/{kpi_id}", response_model=schemas.KPI)
def update_kpi(kpi_id: int, kpi: schemas.KPICreate, db: Session = Depends(get_db)):
    db_kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if db_kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    for key, value in kpi.dict().items():
        setattr(db_kpi, key, value)
    db.commit()
    db.refresh(db_kpi)
    return db_kpi

@app.delete("/api/kpis/{kpi_id}", response_model=schemas.KPI)
def delete_kpi(kpi_id: int, db: Session = Depends(get_db)):
    db_kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if db_kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    db.delete(db_kpi)
    db.commit()
    return db_kpi

# Rota de teste
@app.get("/test")
def test_route():
    return {"message": "Test route working"}

# Atualizar um plano de ação
@app.put("/api/action-plans/{action_plan_id}", response_model=schemas.ActionPlan)
def update_action_plan(action_plan_id: int, action_plan: schemas.ActionPlanCreate, db: Session = Depends(get_db)):
    db_action_plan = db.query(models.ActionPlan).filter(models.ActionPlan.id == action_plan_id).first()
    if db_action_plan is None:
        raise HTTPException(status_code=404, detail="Action plan not found")
    for key, value in action_plan.dict().items():
        setattr(db_action_plan, key, value)
    db.commit()
    db.refresh(db_action_plan)
    return db_action_plan

# Remover um plano de ação
@app.delete("/api/action-plans/{action_plan_id}", response_model=schemas.ActionPlan)
def delete_action_plan(action_plan_id: int, db: Session = Depends(get_db)):
    db_action_plan = db.query(models.ActionPlan).filter(models.ActionPlan.id == action_plan_id).first()
    if db_action_plan is None:
        raise HTTPException(status_code=404, detail="Action plan not found")
    db.delete(db_action_plan)
    db.commit()
    return db_action_plan

# Atualizar uma tarefa
@app.put("/api/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, value in task.dict().items():
        setattr(db_task, key, value)
    db.commit()
    db.refresh(db_task)
    return db_task

# Remover uma tarefa
@app.delete("/api/tasks/{task_id}", response_model=schemas.Task)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return db_task

@app.post("/api/companies/hierarchy", response_model=schemas.Company)
def add_company_to_hierarchy(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    print(f"Dados recebidos no backend: {company.dict()}")  # Log dos dados recebidos
    
    try:
        validated_cnpj = validate_cnpj(company.cnpj)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    # Verifica se a empresa já existe
    existing_company = db.query(models.Company).filter(models.Company.cnpj == validated_cnpj).first()
    if existing_company:
        raise HTTPException(status_code=400, detail="Empresa com este CNPJ já existe")
    
    new_company = models.Company(
        cnpj=validated_cnpj,
        name=company.name,
        razao_social=company.razao_social,
        endereco=company.endereco,
        trade_name=company.trade_name,
        registration_date=company.registration_date,
        size=company.size,
        sector=company.sector,
        city=company.city,
        state=company.state,
        zip_code=company.zip_code,
        phone=company.phone,
        email=company.email,
        website=company.website,
        is_active=company.is_active
    )
    db.add(new_company)
    try:
        db.commit()
        db.refresh(new_company)
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Erro ao inserir empresa: {str(e)}")
        raise HTTPException(status_code=400, detail="Erro ao inserir empresa")
    return new_company

@app.get("/api/companies", response_model=List[schemas.Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    companies = db.query(models.Company).offset(skip).limit(limit).all()
    return companies

@app.get("/api/companies/{company_id}", response_model=schemas.Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    db_company = crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return db_company

@app.put("/api/companies/{company_id}", response_model=schemas.Company)
def update_company(company_id: int, company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    
    # Atualizar todos os campos
    for key, value in company.dict().items():
        setattr(db_company, key, value)
    
    try:
        db.commit()
        db.refresh(db_company)
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Erro ao atualizar empresa: {str(e)}")
        raise HTTPException(status_code=400, detail="Erro ao atualizar empresa")
    return db_company

@app.delete("/api/companies/{company_id}", response_model=schemas.Company)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    db.delete(db_company)
    db.commit()
    return db_company

@app.post("/api/companies", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    print(f"Dados recebidos no backend: {company.dict()}")  # Log dos dados recebidos
    
    try:
        validated_cnpj = validate_cnpj(company.cnpj)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    
    # Verifica se a empresa já existe
    existing_company = db.query(models.Company).filter(models.Company.cnpj == validated_cnpj).first()
    if existing_company:
        raise HTTPException(status_code=400, detail="Empresa com este CNPJ já existe")
    
    new_company = models.Company(
        cnpj=validated_cnpj,
        name=company.name,
        razao_social=company.razao_social,
        endereco=company.endereco,
        trade_name=company.trade_name,
        registration_date=company.registration_date,
        size=company.size,
        sector=company.sector,
        city=company.city,
        state=company.state,
        zip_code=company.zip_code,
        phone=company.phone,
        email=company.email,
        website=company.website,
        is_active=company.is_active
    )
    db.add(new_company)
    try:
        db.commit()
        db.refresh(new_company)
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Erro ao inserir empresa: {str(e)}")
        raise HTTPException(status_code=400, detail="Erro ao inserir empresa")
    return new_company

@app.post("/api/kpi-templates", response_model=schemas.KPITemplate)
def create_kpi_template(kpi_template: schemas.KPITemplateCreate, db: Session = Depends(get_db)):
    kpi_dict = kpi_template.dict()
    
    # Gerar um kpicode único se não for fornecido ou for vazio
    if not kpi_dict['kpicode']:
        kpi_dict['kpicode'] = f"KPI-{uuid4().hex[:8].upper()}"
    
    # Verificar se o kpicode já existe
    while db.query(models.KPITemplate).filter(models.KPITemplate.kpicode == kpi_dict['kpicode']).first():
        kpi_dict['kpicode'] = f"KPI-{uuid4().hex[:8].upper()}"
    
    kpi_dict['compliance'] = func.cast(kpi_dict['compliance'], postgresql.ARRAY(String))
    
    try:
        db_kpi_template = models.KPITemplate(**kpi_dict)
        db.add(db_kpi_template)
        db.commit()
        db.refresh(db_kpi_template)
        return db_kpi_template
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao criar template de KPI: {str(e)}")

@app.get("/api/kpi-templates", response_model=List[schemas.KPITemplate])
def read_kpi_templates(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    kpi_templates = db.query(models.KPITemplate).offset(skip).limit(limit).all()
    return kpi_templates

@app.get("/api/kpi-templates/{kpi_template_id}", response_model=schemas.KPITemplate)
def read_kpi_template(kpi_template_id: int, db: Session = Depends(get_db)):
    db_kpi_template = db.query(models.KPITemplate).filter(models.KPITemplate.id == kpi_template_id).first()
    if db_kpi_template is None:
        raise HTTPException(status_code=404, detail="KPI Template not found")
    return db_kpi_template

@app.put("/api/kpi-templates/{kpi_template_id}", response_model=schemas.KPITemplate)
def update_kpi_template(kpi_template_id: int, kpi_template: schemas.KPITemplateCreate, db: Session = Depends(get_db)):
    db_kpi_template = db.query(models.KPITemplate).filter(models.KPITemplate.id == kpi_template_id).first()
    if db_kpi_template is None:
        raise HTTPException(status_code=404, detail="KPI Template not found")
    for key, value in kpi_template.dict().items():
        setattr(db_kpi_template, key, value)
    db.commit()
    db.refresh(db_kpi_template)
    return db_kpi_template

@app.delete("/api/kpi-templates/{kpi_template_id}", response_model=schemas.KPITemplate)
def delete_kpi_template(kpi_template_id: int, db: Session = Depends(get_db)):
    db_kpi_template = db.query(models.KPITemplate).filter(models.KPITemplate.id == kpi_template_id).first()
    if db_kpi_template is None:
        raise HTTPException(status_code=404, detail="KPI Template not found")
    db.delete(db_kpi_template)
    db.commit()
    return db_kpi_template

@app.post("/api/kpi-entries", response_model=schemas.KPIEntry)
def create_kpi_entry(kpi_entry: schemas.KPIEntryCreate, db: Session = Depends(get_db)):
    try:
        db_kpi_entry = models.KPIEntry(**kpi_entry.dict())
        db.add(db_kpi_entry)
        db.commit()
        db.refresh(db_kpi_entry)
        return db_kpi_entry
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao criar entrada de KPI: {str(e)}")

@app.put("/api/kpi-entries/{kpi_entry_id}", response_model=schemas.KPIEntry)
def update_kpi_entry(kpi_entry_id: int, kpi_entry: schemas.KPIEntryCreate, db: Session = Depends(get_db)):
    try:
        db_kpi_entry = db.query(models.KPIEntry).filter(models.KPIEntry.id == kpi_entry_id).first()
        if db_kpi_entry is None:
            raise HTTPException(status_code=404, detail="KPI Entry not found")
        for key, value in kpi_entry.dict().items():
            setattr(db_kpi_entry, key, value)
        db.commit()
        db.refresh(db_kpi_entry)
        return db_kpi_entry
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar entrada de KPI: {str(e)}")

@app.delete("/api/kpi-entries/{kpi_entry_id}", response_model=schemas.KPIEntry)
def delete_kpi_entry(kpi_entry_id: int, db: Session = Depends(get_db)):
    try:
        db_kpi_entry = db.query(models.KPIEntry).filter(models.KPIEntry.id == kpi_entry_id).first()
        if db_kpi_entry is None:
            raise HTTPException(status_code=404, detail="KPI Entry not found")
        db.delete(db_kpi_entry)
        db.commit()
        return db_kpi_entry
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Erro ao excluir entrada de KPI: {str(e)}")

@app.get("/api/kpi-entries", response_model=List[schemas.KPIEntryWithTemplate])
def read_kpi_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    kpi_entries = db.query(models.KPIEntry).options(joinedload(models.KPIEntry.template)).offset(skip).limit(limit).all()
    return [schemas.KPIEntryWithTemplate(
        entry_id=entry.id,
        template_id=entry.template_id,
        template_name=entry.template.name if entry.template else None,
        cnpj=entry.cnpj,
        actual_value=entry.actual_value,
        target_value=entry.target_value,
        year=entry.year,
        month=entry.month,
        status=entry.status,
        isfavorite=entry.isfavorite,
        unit=entry.template.unit if entry.template else None,
        category=entry.template.category if entry.template else None,
        subcategory=entry.template.subcategory if entry.template else None,
        description=entry.template.description if entry.template else None,
        frequency=entry.template.frequency if entry.template else None,
        collection_method=entry.template.collection_method if entry.template else None,
        kpicode=entry.template.kpicode if entry.template else None,
        company_category=entry.template.company_category if entry.template else None,
        compliance=entry.template.compliance if entry.template else None
    ) for entry in kpi_entries]

@app.get("/api/kpi-entries/{kpi_entry_id}", response_model=schemas.KPIEntry)
def read_kpi_entry(kpi_entry_id: int, db: Session = Depends(get_db)):
    db_kpi_entry = db.query(models.KPIEntry).filter(models.KPIEntry.id == kpi_entry_id).first()
    if db_kpi_entry is None:
        raise HTTPException(status_code=404, detail="KPI Entry not found")
    return db_kpi_entry

@app.get("/api/kpi-entries-with-templates", response_model=List[schemas.KPIEntryWithTemplate])
def read_kpi_entries_with_templates(
    category: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 1000,  # Aumentado para 1000
    db: Session = Depends(get_db)
):
    query = db.query(models.KPIEntryWithTemplate)
    if category:
        query = query.filter(models.KPIEntryWithTemplate.category == category)
    entries = query.offset(skip).limit(limit).all()
    print(f"Total de KPIs retornados: {len(entries)}")
    return entries

@app.post("/api/customization", response_model=schemas.Customization)
def create_customization(customization: schemas.CustomizationCreate, db: Session = Depends(get_db)):
    print(f"Recebendo requisição POST para /api/customization: {customization.dict()}")
    try:
        db_customization = models.Customization(**customization.dict())
        db.add(db_customization)
        db.commit()
        db.refresh(db_customization)
        print(f"Customização criada com sucesso: {db_customization.id}")
        return db_customization
    except Exception as e:
        print(f"Erro ao criar customização: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customization", response_model=schemas.Customization)
def get_customization(db: Session = Depends(get_db)):
    customization = db.query(models.Customization).first()
    if not customization:
        raise HTTPException(status_code=404, detail="Customization not found")
    return customization

@app.put("/api/customization/{customization_id}", response_model=schemas.Customization)
def update_customization(customization_id: int, customization: schemas.CustomizationCreate, db: Session = Depends(get_db)):
    db_customization = db.query(models.Customization).filter(models.Customization.id == customization_id).first()
    if not db_customization:
        raise HTTPException(status_code=404, detail="Customization not found")
    for key, value in customization.dict().items():
        setattr(db_customization, key, value)
    db.commit()
    db.refresh(db_customization)
    return db_customization

# Nova rota para upload de logo
@app.post("/api/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    try:
        file_location = f"static/logos/{file.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        return {"logo_url": f"{BASE_URL}/static/logos/{file.filename}"}
    except Exception as e:
        print(f"Erro ao fazer upload da logo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload da logo: {str(e)}")

# Atualizar a rota de customização para incluir o upload de logo
@app.post("/api/customization", response_model=schemas.Customization)
async def create_customization(
    customization: schemas.CustomizationCreate = Depends(),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    print(f"Recebendo requisição POST para /api/customization: {customization.dict()}")
    try:
        if logo:
            file_location = f"static/logos/{logo.filename}"
            with open(file_location, "wb+") as file_object:
                shutil.copyfileobj(logo.file, file_object)
            customization.logo_url = f"{BASE_URL}/static/logos/{logo.filename}"

        db_customization = models.Customization(**customization.dict())
        db.add(db_customization)
        db.commit()
        db.refresh(db_customization)
        print(f"Customização criada com sucesso: {db_customization.id}")
        return db_customization
    except Exception as e:
        print(f"Erro ao criar customização: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customization/{customization_id}", response_model=schemas.Customization)
async def update_customization(
    customization_id: int,
    customization: schemas.CustomizationCreate = Depends(),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_customization = db.query(models.Customization).filter(models.Customization.id == customization_id).first()
    if not db_customization:
        raise HTTPException(status_code=404, detail="Customization not found")
    
    if logo:
        file_location = f"static/logos/{logo.filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(logo.file, file_object)
        customization.logo_url = f"{BASE_URL}/static/logos/{logo.filename}"

    for key, value in customization.dict().items():
        setattr(db_customization, key, value)
    
    db.commit()
    db.refresh(db_customization)
    return db_customization

if __name__ == "__main__":
    print("Iniciando a aplicação...")
    models.Base.metadata.create_all(bind=engine)
    print("Tabelas criadas (se não existirem)")
    print("Rotas definidas em main.py")