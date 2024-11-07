# main.py

from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
import re
import shutil
import os
from uuid import uuid4
from passlib.context import CryptContext
from pydantic import BaseModel
import logging
from datetime import date, datetime
import traceback
from fastapi.responses import JSONResponse
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
import chromadb
from dotenv import load_dotenv
from chromadb.config import Settings
import schedule
import time
import threading
from pathlib import Path
from chromadb.api import EmbeddingFunction
import psutil

from . import models, schemas  # Certifique-se de que o caminho está correto
from .database import SessionLocal, engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configuração do CORS - deve vir ANTES de todas as rotas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração para servir arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configurar diretórios
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs("static/logos", exist_ok=True)

# Configuração da base URL  
BASE_URL = ""  # Substitua pela URL pública do seu backend

# Configuração do Chroma DB
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "chroma_db")
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

# Inicializar cliente Chroma com persistência
chroma_client = chromadb.PersistentClient(
    path=CHROMA_PERSIST_DIR,
    settings=Settings(
        allow_reset=True,
        is_persistent=True
    )
)

# Criar ou obter a collection
try:
    collection = chroma_client.get_collection("documents")
except:
    collection = chroma_client.create_collection(
        name="documents",
        metadata={"hnsw:space": "cosine"}
    )

# Configuração do OpenAI Embeddings
# Carrega o .env do diretório backend
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / '.env'
load_dotenv(env_path)

# Pega a chave e verifica se está disponível
api_key = os.getenv('OPENAI_API_KEY')
if not api_key:
    raise ValueError("OPENAI_API_KEY não encontrada no arquivo .env")

# Usa a chave explicitamente
embeddings = OpenAIEmbeddings(openai_api_key=api_key)

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

# Rotas para Planos de Ação
@app.post("/api/action-plans", response_model=schemas.ActionPlan)
def create_action_plan(action_plan: schemas.ActionPlanCreate, db: Session = Depends(get_db)):
    db_action_plan = models.ActionPlan(**action_plan.dict())
    db.add(db_action_plan)
    db.commit()
    db.refresh(db_action_plan)
    return schemas.ActionPlan.from_orm(db_action_plan)

@app.get("/api/action-plans", response_model=List[schemas.ActionPlan])
def read_action_plans(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        logger.info("Buscando planos de ação")
        query = db.query(models.ActionPlan)
        action_plans = query.offset(skip).limit(limit).all()
        logger.info(f"Encontrados {len(action_plans)} planos de ação")
        return action_plans
    except Exception as e:
        logger.error(f"Erro ao buscar planos de ação: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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
    return schemas.Task.from_orm(db_task)

# Rota para obter todas as tarefas de um plano de ação
@app.get("/api/action-plans/{action_plan_id}/tasks", response_model=List[schemas.Task])
def read_tasks_for_action_plan(action_plan_id: int, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).filter(models.Task.action_plan_id == action_plan_id).all()
    return [schemas.Task.from_orm(task) for task in tasks]

# Rotas para KPIs

@app.post("/api/kpis", response_model=schemas.KPI)
def create_kpi(kpi: schemas.KPICreate, db: Session = Depends(get_db)):
    db_kpi = models.KPI(**kpi.dict())
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    return schemas.KPI.from_orm(db_kpi)

@app.get("/api/kpis", response_model=List[schemas.KPI])
def read_kpis(
    skip: int = 0, 
    limit: int = 100, 
    category: Optional[str] = Query(None, description="Filter KPIs by category"),
    db: Session = Depends(get_db)
):
    logger.info(f"Recebida solicitação para KPIs. Category: {category}, Skip: {skip}, Limit: {limit}")
    query = db.query(models.KPI)
    if category:
        query = query.filter(models.KPI.category == category)
    kpis = query.offset(skip).limit(limit).all()
    logger.info(f"Retornando {len(kpis)} KPIs")
    return [schemas.KPI.from_orm(kpi) for kpi in kpis]

@app.get("/api/kpis/{kpi_id}", response_model=schemas.KPI)
def read_kpi(kpi_id: int, db: Session = Depends(get_db)):
    db_kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if db_kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    return schemas.KPI.from_orm(db_kpi)

@app.put("/api/kpis/{kpi_id}", response_model=schemas.KPI)
def update_kpi(kpi_id: int, kpi: schemas.KPICreate, db: Session = Depends(get_db)):
    db_kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if db_kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    for key, value in kpi.dict().items():
        setattr(db_kpi, key, value)
    db.commit()
    db.refresh(db_kpi)
    return schemas.KPI.from_orm(db_kpi)

@app.delete("/api/kpis/{kpi_id}", response_model=schemas.KPI)
def delete_kpi(kpi_id: int, db: Session = Depends(get_db)):
    db_kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if db_kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    db.delete(db_kpi)
    db.commit()
    return schemas.KPI.from_orm(db_kpi)

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
    return schemas.ActionPlan.from_orm(db_action_plan)

# Remover um plano de ação
@app.delete("/api/action-plans/{action_plan_id}", response_model=schemas.ActionPlan)
def delete_action_plan(action_plan_id: int, db: Session = Depends(get_db)):
    db_action_plan = db.query(models.ActionPlan).filter(models.ActionPlan.id == action_plan_id).first()
    if db_action_plan is None:
        raise HTTPException(status_code=404, detail=f"Action plan with id {action_plan_id} not found")
    
    # Remova as tarefas associadas
    db.query(models.Task).filter(models.Task.action_plan_id == action_plan_id).delete()
    
    # Agora delete o plano de ação
    db.delete(db_action_plan)
    db.commit()
    
    # Crie um objeto ActionPlan sem tarefas para retornar
    return schemas.ActionPlan(
        id=db_action_plan.id,
        objective=db_action_plan.objective,
        start_date=db_action_plan.start_date.isoformat() if isinstance(db_action_plan.start_date, date) else db_action_plan.start_date,
        end_date=db_action_plan.end_date.isoformat() if isinstance(db_action_plan.end_date, date) else db_action_plan.end_date,
        entry_id=db_action_plan.entry_id,
        tasks=[]
    )

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
    return schemas.Task.from_orm(db_task)

# Remover uma tarefa
@app.delete("/api/tasks/{task_id}", response_model=schemas.Task)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return schemas.Task.from_orm(db_task)

# Rotas para Empresas

@app.post("/api/companies/hierarchy", response_model=schemas.Company)
def add_company_to_hierarchy(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    logger.info(f"Dados recebidos no backend: {company.dict()}")  # Log dos dados recebidos
    
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
        logger.error(f"Erro ao inserir empresa: {str(e)}")
        raise HTTPException(status_code=400, detail="Erro ao inserir empresa")
    return schemas.Company.from_orm(new_company)

@app.get("/api/companies", response_model=List[schemas.Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        companies = db.query(models.Company).offset(skip).limit(limit).all()
        return companies
    except Exception as e:
        logger.error(f"Erro ao buscar empresas: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/companies/{company_id}", response_model=schemas.Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return schemas.Company.from_orm(db_company)

@app.put("/api/companies/{company_id}", response_model=schemas.Company)
def update_company(company_id: int, company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Tentando atualizar empresa ID {company_id}")
        logger.info(f"Dados recebidos: {company.dict()}")
        
        # Inicia uma transação
        db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
        if db_company is None:
            raise HTTPException(status_code=404, detail="Empresa não encontrada")
        
        old_cnpj = db_company.cnpj
        new_cnpj = company.cnpj
        
        logger.info(f"CNPJ antigo: {old_cnpj}")
        logger.info(f"CNPJ novo: {new_cnpj}")
        
        if old_cnpj != new_cnpj:
            # Verifica se o novo CNPJ já existe
            existing = db.query(models.Company).filter(
                models.Company.cnpj == new_cnpj,
                models.Company.id != company_id
            ).first()
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="CNPJ já está em uso por outra empresa"
                )
            
            try:
                # 1. Primeiro, busca todos os registros relacionados
                kpi_entries = db.query(models.KPIEntry).filter(
                    models.KPIEntry.cnpj == old_cnpj
                ).all()
                
                action_plans = db.query(models.ActionPlan).filter(
                    models.ActionPlan.cnpj == old_cnpj
                ).all()
                
                logger.info(f"Encontrados {len(kpi_entries)} registros KPI")
                logger.info(f"Encontrados {len(action_plans)} planos de ação")
                
                # 2. Atualiza cada registro individualmente
                for entry in kpi_entries:
                    entry.cnpj = new_cnpj
                    logger.info(f"Atualizando KPI Entry ID {entry.id}")
                
                for plan in action_plans:
                    plan.cnpj = new_cnpj
                    logger.info(f"Atualizando Action Plan ID {plan.id}")
                
                # 3. Atualiza a empresa
                for key, value in company.dict(exclude_unset=True).items():
                    setattr(db_company, key, value)
                
                # 4. Commit de todas as alterações
                db.commit()
                logger.info("Commit realizado com sucesso")
                
                # 5. Refresh nos objetos
                db.refresh(db_company)
                for entry in kpi_entries:
                    db.refresh(entry)
                for plan in action_plans:
                    db.refresh(plan)
                
                logger.info("Todos os registros atualizados com sucesso")
                return schemas.Company.from_orm(db_company)
                
            except Exception as e:
                db.rollback()
                logger.error(f"Erro durante a atualização: {str(e)}")
                logger.error(f"Traceback completo: {traceback.format_exc()}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Erro ao atualizar registros: {str(e)}"
                )
        else:
            # Se o CNPJ não mudou, apenas atualiza os outros campos
            for key, value in company.dict(exclude_unset=True).items():
                setattr(db_company, key, value)
            
            try:
                db.commit()
                db.refresh(db_company)
                logger.info("Empresa atualizada com sucesso (sem mudança de CNPJ)")
                return schemas.Company.from_orm(db_company)
            except Exception as e:
                db.rollback()
                logger.error(f"Erro ao atualizar empresa: {str(e)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Erro ao atualizar empresa: {str(e)}"
                )
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        logger.error(f"Traceback completo: {traceback.format_exc()}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno do servidor: {str(e)}"
        )

@app.delete("/api/companies/{company_id}", response_model=schemas.Company)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    db_company = db.query(models.Company).filter(models.Company.id == company_id).first()
    if db_company is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    db.delete(db_company)
    db.commit()
    return schemas.Company.from_orm(db_company)

@app.post("/api/companies", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    logger.info(f"Dados recebidos no backend: {company.dict()}")  # Log dos dados recebidos
    
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
        logger.error(f"Erro ao inserir empresa: {str(e)}")
        raise HTTPException(status_code=400, detail="Erro ao inserir empresa")
    return schemas.Company.from_orm(new_company)

# Rotas para Templates de KPI

@app.post("/api/kpi-templates", response_model=schemas.KPITemplate)
def create_kpi_template(kpi_template: schemas.KPITemplateCreate, db: Session = Depends(get_db)):
    kpi_dict = kpi_template.dict()
    
    # Gerar um kpicode único se não for fornecido ou for vazio
    if not kpi_dict['kpicode']:
        kpi_dict['kpicode'] = f"KPI-{uuid4().hex[:8].upper()}"
    
    # Verificar se o kpicode já existe
    while db.query(models.KPITemplate).filter(models.KPITemplate.kpicode == kpi_dict['kpicode']).first():
        kpi_dict['kpicode'] = f"KPI-{uuid4().hex[:8].upper()}"
    
    try:
        db_kpi_template = models.KPITemplate(**kpi_dict)
        db.add(db_kpi_template)
        db.commit()
        db.refresh(db_kpi_template)
        return schemas.KPITemplate.from_orm(db_kpi_template)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Erro ao criar template de KPI: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao criar template de KPI: {str(e)}")

@app.get("/api/kpi-templates", response_model=List[schemas.KPITemplate])
def read_kpi_templates(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    templates = db.query(models.KPITemplate).offset(skip).limit(limit).all()
    return [schemas.KPITemplate.from_orm(template) for template in templates]

@app.get("/api/kpi-templates/{kpi_template_id}", response_model=schemas.KPITemplate)
def read_kpi_template(kpi_template_id: int, db: Session = Depends(get_db)):
    db_kpi_template = db.query(models.KPITemplate).filter(models.KPITemplate.id == kpi_template_id).first()
    if db_kpi_template is None:
        raise HTTPException(status_code=404, detail="KPI Template not found")
    return schemas.KPITemplate.from_orm(db_kpi_template)

@app.put("/api/kpi-templates/{kpi_template_id}", response_model=schemas.KPITemplate)
def update_kpi_template(kpi_template_id: int, kpi_template: schemas.KPITemplateCreate, db: Session = Depends(get_db)):
    db_kpi_template = db.query(models.KPITemplate).filter(models.KPITemplate.id == kpi_template_id).first()
    if db_kpi_template is None:
        raise HTTPException(status_code=404, detail="KPI Template not found")
    for key, value in kpi_template.dict().items():
        setattr(db_kpi_template, key, value)
    db.commit()
    db.refresh(db_kpi_template)
    return schemas.KPITemplate.from_orm(db_kpi_template)

@app.delete("/api/kpi-templates/{kpi_template_id}", response_model=schemas.KPITemplate)
def delete_kpi_template(kpi_template_id: int, db: Session = Depends(get_db)):
    db_kpi_template = db.query(models.KPITemplate).filter(models.KPITemplate.id == kpi_template_id).first()
    if db_kpi_template is None:
        raise HTTPException(status_code=404, detail="KPI Template not found")
    db.delete(db_kpi_template)
    db.commit()
    return schemas.KPITemplate.from_orm(db_kpi_template)

# Rotas para Entradas de KPI

@app.post("/api/kpi-entries", response_model=schemas.KPIEntry)
def create_kpi_entry(kpi_entry: schemas.KPIEntryCreate, db: Session = Depends(get_db)):
    try:
        db_kpi_entry = models.KPIEntry(**kpi_entry.dict())
        db.add(db_kpi_entry)
        db.commit()
        db.refresh(db_kpi_entry)
        return schemas.KPIEntry.from_orm(db_kpi_entry)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Erro ao criar entrada de KPI: {str(e)}")
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
        return schemas.KPIEntry.from_orm(db_kpi_entry)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Erro ao atualizar entrada de KPI: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao atualizar entrada de KPI: {str(e)}")

@app.delete("/api/kpi-entries/{kpi_entry_id}", response_model=schemas.KPIEntry)
def delete_kpi_entry(kpi_entry_id: int, db: Session = Depends(get_db)):
    try:
        db_kpi_entry = db.query(models.KPIEntry).filter(models.KPIEntry.id == kpi_entry_id).first()
        if db_kpi_entry is None:
            raise HTTPException(status_code=404, detail="KPI Entry not found")
        db.delete(db_kpi_entry)
        db.commit()
        return schemas.KPIEntry.from_orm(db_kpi_entry)
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Erro ao excluir entrada de KPI: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao excluir entrada de KPI: {str(e)}")

@app.get("/api/kpi-entries", response_model=List[schemas.KPIEntryWithTemplate])
def read_kpi_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    kpi_entries = db.query(models.KPIEntry).options(joinedload(models.KPIEntry.template)).offset(skip).limit(limit).all()
    # Aqui, garantimos que cada entrada está no formato correto
    return [
        schemas.KPIEntryWithTemplate(
            entry_id=entry.id,
            template_id=entry.template_id,
            template_name=entry.template.name if entry.template else None,
            cnpj=entry.cnpj,
            actual_value=entry.actual_value,
            target_value=entry.target_value,
            year=entry.year,
            month=entry.month,
            isfavorite=entry.isfavorite,
            unit=entry.template.unit if entry.template else None,
            category=entry.template.category if entry.template else None,
            subcategory=entry.template.subcategory if entry.template else None,
            description=entry.template.description if entry.template else None,
            frequency=entry.template.frequency if entry.template else None,
            collection_method=entry.template.collection_method if entry.template else None,
            kpicode=entry.template.kpicode if entry.template else None,
            company_category=entry.template.company_category if entry.template else None,
            compliance=entry.template.compliance if entry.template else [],
            genero=entry.template.genero if entry.template else None,
            raca=entry.template.raca if entry.template else None,
            state=entry.company.state if entry.company else None  # Assume que a empresa está relacionada
        )
        for entry in kpi_entries
    ]

@app.get("/api/kpi-entries/{kpi_entry_id}", response_model=schemas.KPIEntry)
def read_kpi_entry(kpi_entry_id: int, db: Session = Depends(get_db)):
    db_kpi_entry = db.query(models.KPIEntry).filter(models.KPIEntry.id == kpi_entry_id).first()
    if db_kpi_entry is None:
        raise HTTPException(status_code=404, detail="KPI Entry not found")
    return schemas.KPIEntry.from_orm(db_kpi_entry)

@app.get("/api/kpi-entries-with-templates", response_model=List[schemas.KPIEntryWithTemplate])
def read_kpi_entries_with_templates(
    category: Optional[str] = Query(None),
    company_id: Optional[int] = Query(None),
    skip: int = 0,
    limit: int = 1000,
    db: Session = Depends(get_db)
):
    query = db.query(models.KPIEntry)
    
    if category:
        query = query.filter(models.KPIEntry.template.has(category=category))
    
    if company_id:
        query = query.filter(models.KPIEntry.company_id == company_id)
    
    entries = query.offset(skip).limit(limit).all()
    
    return [
        schemas.KPIEntryWithTemplate(
            entry_id=entry.id,
            template_id=entry.template_id,
            template_name=entry.template.name if entry.template else None,
            cnpj=entry.cnpj,
            actual_value=entry.actual_value,
            target_value=entry.target_value,
            year=entry.year,
            month=entry.month,
            isfavorite=entry.isfavorite,
            unit=entry.template.unit if entry.template else None,
            category=entry.template.category if entry.template else None,
            subcategory=entry.template.subcategory if entry.template else None,
            description=entry.template.description if entry.template else None,
            frequency=entry.template.frequency if entry.template else None,
            collection_method=entry.template.collection_method if entry.template else None,
            kpicode=entry.template.kpicode if entry.template else None,
            company_category=entry.template.company_category if entry.template else None,
            compliance=entry.template.compliance if entry.template else [],
            genero=entry.template.genero if entry.template else None,
            raca=entry.template.raca if entry.template else None,
            state=entry.company.state if entry.company else None
        )
        for entry in entries
    ]

# Rotas para Customização

@app.post("/api/customization", response_model=schemas.Customization)
async def create_customization(
    customization: schemas.CustomizationCreate,
    db: Session = Depends(get_db)
):
    try:
        db_customization = models.Customization(**customization.dict())
        db.add(db_customization)
        db.commit()
        db.refresh(db_customization)
        return db_customization
    except Exception as e:
        logger.error(f"Erro ao criar customização: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customization")
def get_customization(db: Session = Depends(get_db)):
    try:
        customization = db.query(models.Customization).first()
        if not customization:
            customization = models.Customization(
                sidebar_color="#1a73e8",
                button_color="#1a73e8",
                font_color="#000000"
            )
            db.add(customization)
            db.commit()
            db.refresh(customization)
        return customization
    except Exception as e:
        logger.error(f"Erro ao buscar customização: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/customization", response_model=schemas.Customization)
async def update_customization(
    customization: schemas.CustomizationCreate,
    db: Session = Depends(get_db)
):
    try:
        # Busca a primeira customização ou cria uma nova
        db_customization = db.query(models.Customization).first()
        if not db_customization:
            db_customization = models.Customization(
                sidebar_color="#1a73e8",
                button_color="#1a73e8",
                font_color="#000000"
            )
            db.add(db_customization)
        
        # Atualiza os campos
        for key, value in customization.dict(exclude_unset=True).items():
            setattr(db_customization, key, value)

        db.commit()
        db.refresh(db_customization)
        
        logger.info("Customização atualizada com sucesso")
        return db_customization

    except SQLAlchemyError as e:
        logger.error(f"Erro ao atualizar customização: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# Rotas para Upload de Logo

@app.post("/api/upload-logo")
async def upload_logo(file: UploadFile = File(...)):
    try:
        unique_filename = f"{uuid4().hex}_{file.filename}"
        file_location = f"static/logos/{unique_filename}"
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
        return {"logo_url": f"{BASE_URL}/static/logos/{unique_filename}"}
    except Exception as e:
        logger.error(f"Erro ao fazer upload da logo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao fazer upload da logo: {str(e)}")

# Autenticação e Usuários

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

class LoginData(BaseModel):
    username: str
    password: str

@app.post("/api/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    logger.info(f"Tentativa de login para o usuário: {user.username}")
    
    try:
        # Buscar usuário
        db_user = db.query(models.User).filter(models.User.username == user.username).first()
        
        # Verificar se usuário existe e senha está correta
        if not db_user:
            logger.warning(f"Usuário não encontrado: {user.username}")
            raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
            
        if not verify_password(user.password, db_user.hashed_password):
            logger.warning(f"Senha incorreta para usuário: {user.username}")
            raise HTTPException(status_code=401, detail="Usuário ou senha incorretos")
            
        # Verificar se usuário está ativo
        if not db_user.is_active:
            logger.warning(f"Tentativa de login de usuário inativo: {user.username}")
            raise HTTPException(status_code=401, detail="Usuário inativo")

        logger.info(f"Login bem sucedido para usuário: {user.username}")
        
        return {
            "message": "Login successful",
            "username": db_user.username,
            "role": db_user.role,
            "id": db_user.id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no login: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno no servidor")

# Rotas para Usuários

@app.post("/api/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return schemas.User.from_orm(db_user)

@app.get("/api/users/", response_model=List[schemas.User])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.info("Iniciando busca de usuários")
        users = db.query(models.User).offset(skip).limit(limit).all()
        logger.info(f"Encontrados {len(users)} usuários")
        
        # Converter para dicionário para debug
        users_dict = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "full_name": user.full_name
            } for user in users
        ]
        logger.info(f"Usuários encontrados: {users_dict}")
        
        return users
        
    except Exception as e:
        logger.error(f"Erro ao listar usuários: {str(e)}")
        logger.error(traceback.format_exc())  # Log do stack trace completo
        raise HTTPException(
            status_code=500, 
            detail=f"Erro interno ao buscar usuários: {str(e)}"
        )

@app.get("/api/users/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
            
        return user
        
    except Exception as e:
        logger.error(f"Erro ao buscar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Atualizando usuário {user_id}")
        logger.info(f"Dados recebidos: {user_update.dict(exclude_unset=True)}")
        
        db_user = db.query(models.User).filter(models.User.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")

        update_data = user_update.dict(exclude_unset=True)
        
        # Se houver nova senha, fazer hash
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        # Atualizar campos
        for field, value in update_data.items():
            if field != "password":  # Ignorar password pois já tratamos acima
                setattr(db_user, field, value)
        
        # Atualizar timestamp
        db_user.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(db_user)
        
        return db_user
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar usuário: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/users/{user_id}", response_model=schemas.User)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return schemas.User.from_orm(db_user)

# Rotas para Bonds (Títulos)

@app.post("/api/bonds", response_model=schemas.Bond)
def create_bond(bond: schemas.BondCreate, db: Session = Depends(get_db)):
    logger.info(f"Recebendo requisição para criar novo título: {bond.dict()}")
    try:
        db_bond = models.Bond(**bond.dict())
        db.add(db_bond)
        db.commit()
        db.refresh(db_bond)
        logger.info(f"Título criado com sucesso: {db_bond.id}")
        return schemas.Bond.from_orm(db_bond)
    except SQLAlchemyError as e:
        logger.error(f"Erro ao criar título: {str(e)}")
        logger.error(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Falha ao criar título: {str(e)}")

@app.get("/api/bonds", response_model=List[schemas.Bond])
def read_bonds(
    skip: int = 0, 
    limit: int = 100, 
    type: Optional[str] = Query(None, description="Filtrar por tipo de título"),
    db: Session = Depends(get_db)
):
    try:
        query = db.query(models.Bond)
        if type:
            query = query.filter(models.Bond.type == type)
        bonds = query.offset(skip).limit(limit).all()
        return [schemas.Bond.model_validate(bond) for bond in bonds]
    except Exception as e:
        logger.error(f"Erro ao buscar títulos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bonds/{bond_id}", response_model=schemas.Bond)
def read_bond(bond_id: int, db: Session = Depends(get_db)):
    db_bond = db.query(models.Bond).filter(models.Bond.id == bond_id).first()
    if db_bond is None:
        raise HTTPException(status_code=404, detail="Título não encontrado")
    return schemas.Bond.from_orm(db_bond)

@app.put("/api/bonds/{bond_id}", response_model=schemas.Bond)
def update_bond(bond_id: int, bond: schemas.BondCreate, db: Session = Depends(get_db)):
    db_bond = db.query(models.Bond).filter(models.Bond.id == bond_id).first()
    if db_bond is None:
        raise HTTPException(status_code=404, detail="Título não encontrado")
    
    bond_data = bond.dict(exclude_unset=True)
    for key, value in bond_data.items():
        setattr(db_bond, key, value)
    
    try:
        db.commit()
        db.refresh(db_bond)
        logger.info(f"Título atualizado com sucesso: {db_bond.id}")
        return schemas.Bond.from_orm(db_bond)
    except SQLAlchemyError as e:
        logger.error(f"Erro ao atualizar título: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Falha ao atualizar título: {str(e)}")

@app.delete("/api/bonds/{bond_id}", response_model=schemas.Bond)
def delete_bond(bond_id: int, db: Session = Depends(get_db)):
    db_bond = db.query(models.Bond).filter(models.Bond.id == bond_id).first()
    if db_bond is None:
        raise HTTPException(status_code=404, detail="Título não encontrado")
    try:
        db.delete(db_bond)
        db.commit()
        logger.info(f"Título deletado com sucesso: {bond_id}")
        return schemas.Bond.from_orm(db_bond)
    except SQLAlchemyError as e:
        logger.error(f"Erro ao deletar título: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Falha ao deletar título: {str(e)}")

@app.post("/api/bonds/minimal", response_model=schemas.Bond)
def create_minimal_bond(bond: schemas.BondCreate, db: Session = Depends(get_db)):
    try:
        minimal_bond_dict = {
            "name": bond.name,
            "type": bond.type,
            "value": bond.value,
            "esg_percentage": bond.esg_percentage,
            "issue_date": bond.issue_date
        }
        db_bond = models.Bond(**minimal_bond_dict)
        db.add(db_bond)
        db.commit()
        db.refresh(db_bond)
        return schemas.Bond.from_orm(db_bond)
    except Exception as e:
        logger.error(f"Erro ao criar título mínimo: {str(e)}")
        logger.error(traceback.format_exc())
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Falha ao criar título mínimo: {str(e)}")

# Inicialização da aplicação

if __name__ == "__main__":
    logger.info("Iniciando a aplicação...")
    models.Base.metadata.create_all(bind=engine)
    logger.info("Tabelas criadas (se não existirem)")
    logger.info("Rotas definidas em main.py")

@app.get("/api/kpis/company/{company_id}", response_model=List[schemas.KPI])
def read_kpis_by_company(company_id: int, db: Session = Depends(get_db)):
    try:
        kpis = db.query(models.KPI).filter(models.KPI.company_id == company_id).all()
        return kpis
    except Exception as e:
        logger.error(f"Erro ao buscar KPIs da empresa: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rota de teste para verificar CORS
@app.get("/api/test-cors")
async def test_cors():
    return {"message": "CORS está funcionando!"}

# Função para verificar headers
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"=== Nova requisição ===")
    logger.info(f"Método: {request.method}")
    logger.info(f"URL: {request.url}")
    logger.info(f"Headers: {request.headers}")
    
    response = await call_next(request)
    
    logger.info(f"=== Resposta ===")
    logger.info(f"Status: {response.status_code}")
    return response

@app.get("/api/users", response_model=List[schemas.User])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        users = db.query(models.User).offset(skip).limit(limit).all()
        return users
        
    except Exception as e:
        logger.error(f"Erro ao listar usuários: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Configurar Chroma e OpenAI Embeddings
client = chromadb.Client()
collection = client.create_collection("documents")
embeddings = OpenAIEmbeddings(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    model="text-embedding-ada-002"  # Especificar o modelo
)

# Rota para upload de documentos com processamento
@app.post("/api/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    db: Session = Depends(get_db)
):
    try:
        logger.info(f"Iniciando upload do arquivo: {file.filename}")
        
        # Validar arquivo
        validate_file(file)
        
        # Gerar nome único para o arquivo
        file_ext = os.path.splitext(file.filename)[1].lower()
        safe_filename = f"{uuid4().hex}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)
        
        # Salvar arquivo
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"Arquivo salvo em: {file_path}")
        
        try:
            # Carregar documento baseado na extensão
            if file_ext == '.pdf':
                loader = PyPDFLoader(file_path)
            elif file_ext == '.docx':
                loader = Docx2txtLoader(file_path)
            else:
                loader = TextLoader(file_path)

            documents = loader.load()
            
            # Dividir texto em chunks
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200
            )
            texts = text_splitter.split_documents(documents)

            # Gerar embeddings e adicionar ao Chroma
            for i, text in enumerate(texts):
                embedding = embeddings.embed_query(text.page_content)
                collection.add(
                    embeddings=[embedding],
                    documents=[text.page_content],
                    metadatas=[{
                        "source": file.filename,
                        "chunk": i,
                        "title": title
                    }],
                    ids=[f"{safe_filename}-{i}"]
                )

            # Salvar metadados no banco
            db_document = models.Document(
                title=title,
                file_path=file_path,
                original_filename=file.filename,
                file_type=file_ext.replace('.', '')
            )
            db.add(db_document)
            db.commit()
            db.refresh(db_document)

            logger.info("Documento processado com sucesso")
            return {
                "id": db_document.id,
                "title": db_document.title,
                "filename": db_document.original_filename,
                "created_at": db_document.created_at
            }

        except Exception as e:
            logger.error(f"Erro no processamento: {str(e)}")
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=500,
                detail=f"Erro no processamento do documento: {str(e)}"
            )

    except Exception as e:
        logger.error(f"Erro no upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro no upload: {str(e)}"
        )

@app.get("/api/documents/search")
async def search_documents(
    query: str,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    try:
        # Gerar embedding para a busca
        query_embedding = embeddings.embed_query(query)
        
        # Buscar no Chroma
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit,
            include=["documents", "metadatas", "distances"]
        )

        # Formatar resultados
        formatted_results = []
        if results and results['ids']:
            for i in range(len(results['ids'][0])):
                doc = results['documents'][0][i]
                metadata = results['metadatas'][0][i]
                distance = results['distances'][0][i]

                # Buscar informações do documento no banco
            doc_info = db.query(models.Document).filter(
                    models.Document.title == metadata.get('title')
            ).first()

            formatted_results.append({
                "content": doc,
                    "title": metadata.get('title', 'Sem título'),
                    "source": metadata.get('source', 'Fonte desconhecida'),
                "similarity": round((1 - distance) * 100, 2),
                    "created_at": doc_info.created_at.isoformat() if doc_info else None,
                    "document_id": doc_info.id if doc_info else None
            })

        return formatted_results

    except Exception as e:
        logger.error(f"Erro na busca: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao realizar a busca: {str(e)}"
        )

# Rota para listar documentos
@app.get("/api/documents")
async def list_documents(db: Session = Depends(get_db)):
    documents = db.query(models.Document).all()
    return documents

# Rota para download de documentos
@app.get("/api/documents/{document_id}/download")
async def download_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return FileResponse(document.file_path)

def validate_file(file: UploadFile) -> bool:
    # Lista de extensões permitidas
    ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.txt'}
    
    # Verificar extensão
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Tipo de arquivo não permitido"
        )
    
    # Verificar tamanho (exemplo: máximo 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB em bytes
    file_size = len(file.file.read())
    file.file.seek(0)  # Resetar o ponteiro do arquivo
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Arquivo muito grande (máximo 10MB)"
        )
    
    return True

def get_chunk_params(file_type: str) -> dict:
    """Retorna parâmetros otimizados de chunk baseado no tipo de arquivo"""
    params = {
        'pdf': {
            'chunk_size': 1000,
            'chunk_overlap': 200,
            'separators': ["\n\n", "\n", " ", ""]
        },
        'docx': {
            'chunk_size': 800,
            'chunk_overlap': 150,
            'separators': ["\n\n", "\n", ". ", " ", ""]
        },
        'txt': {
            'chunk_size': 500,
            'chunk_overlap': 100,
            'separators': ["\n\n", "\n", ". ", " "]
        }
    }
    return params.get(file_type, params['txt'])

def process_document(file_path: str, file_ext: str):
    """Processa documento com parâmetros otimizados"""
    # Determinar tipo de arquivo
    file_type = file_ext.replace('.', '')
    chunk_params = get_chunk_params(file_type)
    
    # Carregar documento
    if file_ext == '.pdf':
        loader = PyPDFLoader(file_path)
    elif file_ext == '.docx':
        loader = Docx2txtLoader(file_path)
    else:
        loader = TextLoader(file_path)

    documents = loader.load()
    
    # Dividir texto com parâmetros otimizados
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_params['chunk_size'],
        chunk_overlap=chunk_params['chunk_overlap'],
        separators=chunk_params['separators']
    )
    
    return text_splitter.split_documents(documents)

# Criar um wrapper para a função de embedding
class OpenAIEmbeddingFunction(EmbeddingFunction):
    def __init__(self, openai_embeddings: OpenAIEmbeddings):
        self.openai_embeddings = openai_embeddings

    def __call__(self, input: List[str]) -> List[List[float]]:
        embeddings = self.openai_embeddings.embed_documents(input)
        return embeddings

def safe_remove_db(db_path: str, max_attempts: int = 5, wait_time: int = 1):
    """Tenta remover o diretório do banco de dados de forma segura"""
    for attempt in range(max_attempts):
        try:
            if os.path.exists(db_path):
                # Tenta fechar todas as conexões com o arquivo sqlite
                db_file = os.path.join(db_path, "chroma.sqlite3")
                if os.path.exists(db_file):
                    for proc in psutil.process_iter(['pid', 'name', 'open_files']):
                        try:
                            for file in proc.open_files():
                                if db_file in file.path:
                                    proc.terminate()
                                    time.sleep(wait_time)
                        except (psutil.NoSuchProcess, psutil.AccessDenied):
                            continue
                
                shutil.rmtree(db_path)
                print(f"Diretório {db_path} removido com sucesso")
                return True
            return True
        except PermissionError:
            print(f"Tentativa {attempt + 1} de {max_attempts} falhou. Aguardando {wait_time} segundos...")
            time.sleep(wait_time)
    return False

def init_chroma():
    # Configurações simplificadas
    settings = Settings(
        anonymized_telemetry=False,  # Apenas esta configuração para telemetria
        allow_reset=True,
        is_persistent=True
    )
    
    # Usar um diretório com timestamp
    db_path = f"chroma_db_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    try:
        # Inicializar OpenAI Embeddings
        openai_embeddings = OpenAIEmbeddings(openai_api_key=os.getenv('OPENAI_API_KEY'))
        
        # Criar a função de embedding
        embedding_function = OpenAIEmbeddingFunction(openai_embeddings)
        
        # Inicializar Chroma
        chroma_client = chromadb.PersistentClient(path=db_path)
        
        collection = chroma_client.get_or_create_collection(
            name="documents",
            embedding_function=embedding_function
        )
        
        return chroma_client, collection
        
    except Exception as e:
        print(f"Erro ao inicializar Chroma: {e}")
        raise

# Você também pode adicionar estas variáveis de ambiente antes de importar o chromadb
os.environ['ANONYMIZED_TELEMETRY'] = 'False'
os.environ['TELEMETRY_ENABLED'] = 'False'

# Inicializar Chroma
chroma_client, collection = init_chroma()

def backup_chroma():
    """Realiza backup do Chroma DB"""
    try:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"backups/chroma/backup_{timestamp}"
        
        # Criar diretório de backup
        os.makedirs(backup_path, exist_ok=True)
        
        # Copiar arquivos do Chroma
        shutil.copytree(
            "chroma_db",
            f"{backup_path}/chroma_db",
            dirs_exist_ok=True
        )
        
        # Limpar backups antigos (manter últimos 5)
        backups = sorted(os.listdir("backups/chroma"))
        if len(backups) > 5:
            for old_backup in backups[:-5]:
                shutil.rmtree(f"backups/chroma/{old_backup}")
                
        logger.info(f"Backup do Chroma DB realizado: {backup_path}")
    except Exception as e:
        logger.error(f"Erro ao realizar backup: {str(e)}")

# Agendar backup diário
schedule.every().day.at("00:00").do(backup_chroma)

def run_schedule():
    while True:
        schedule.run_pending()
        time.sleep(60)

# Iniciar agendador em thread separada
threading.Thread(target=run_schedule, daemon=True).start()

def monitor_chroma_metrics():
    """Monitora métricas do Chroma DB"""
    try:
        # Tamanho do diretório
        total_size = 0
        for dirpath, dirnames, filenames in os.walk("chroma_db"):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                total_size += os.path.getsize(fp)
        
        # Métricas da collection
        collection_stats = {
            "count": collection.count(),
            "size_mb": total_size / (1024 * 1024),
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"Métricas Chroma DB: {collection_stats}")
        return collection_stats
    except Exception as e:
        logger.error(f"Erro ao monitorar métricas: {str(e)}")
        return None

@app.get("/api/admin/chroma-metrics")
async def get_chroma_metrics(db: Session = Depends(get_db)):
    """Endpoint para verificar métricas do Chroma"""
    return monitor_chroma_metrics()


