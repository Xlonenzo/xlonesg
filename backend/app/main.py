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
from datetime import date, datetime, timezone
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
from sqlalchemy import func
from sqlalchemy import text
from decimal import Decimal

from . import models, schemas  # Certifique-se de que o caminho está correto
from .database import SessionLocal, engine

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

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
                logger.error(f"Erro durante a atualizao: {str(e)}")
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
        # Validar project_id se fornecido
        if kpi_entry.project_id:
            project = db.query(models.ProjectTracking)\
                .filter(models.ProjectTracking.id == kpi_entry.project_id)\
                .first()
            if not project:
                raise HTTPException(
                    status_code=404,
                    detail="Projeto não encontrado"
                )  # Fechando o parêntese aqui

        db_kpi_entry = models.KPIEntry(**kpi_entry.dict())
        db.add(db_kpi_entry)
        db.commit()
        db.refresh(db_kpi_entry)
        return db_kpi_entry

    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Erro ao criar entrada de KPI: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao criar entrada de KPI: {str(e)}"
        )  # Fechando o parêntese aqui

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
        # First fetch the entry
        db_kpi_entry = db.query(models.KPIEntry).filter(models.KPIEntry.id == kpi_entry_id).first()
        if db_kpi_entry is None:
            raise HTTPException(status_code=404, detail="KPI Entry not found")
            
        # Store the entry data before deletion
        entry_data = schemas.KPIEntry(
            id=db_kpi_entry.id,
            template_id=db_kpi_entry.template_id,
            cnpj=db_kpi_entry.cnpj,
            actual_value=db_kpi_entry.actual_value,
            target_value=db_kpi_entry.target_value,
            year=db_kpi_entry.year,
            month=db_kpi_entry.month,
            isfavorite=db_kpi_entry.isfavorite,
            project_id=db_kpi_entry.project_id
        )
        
        # Delete the entry
        db.delete(db_kpi_entry)
        db.commit()
        
        return entry_data
        
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Erro ao excluir entrada de KPI: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Erro ao excluir entrada de KPI: {str(e)}")

@app.get("/api/kpi-entries", response_model=List[schemas.KPIEntryWithTemplate])
def read_kpi_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    kpi_entries = db.query(models.KPIEntry)\
        .options(
            joinedload(models.KPIEntry.template),
            joinedload(models.KPIEntry.project)
        )\
        .offset(skip)\
        .limit(limit)\
        .all()
    
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
            project_id=entry.project_id,
            project_name=entry.project.name if entry.project else None,
            project_status=entry.project.status if entry.project else None,
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
            raise HTTPException(status_code=404, detail="Usurio não encontrado")

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
    file_path = None
    try:
        # Verificar extensão do arquivo
        file_ext = os.path.splitext(file.filename)[1]
        file_type = file_ext.replace('.', '') if file_ext else ''
        
        if file_type.lower() not in ['pdf', 'txt', 'docx']:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo não suportado: {file_type}"
            )  # <-- Adicionado o parêntese de fechamento
            
        # Gerar nome único para o arquivo
        unique_filename = f"{uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Salvar arquivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Processar documento e gerar embeddings
        if file_type.lower() in ['pdf', 'txt', 'docx']:
            # Processamento específico para cada tipo de arquivo
            # ... resto do código de processamento ...
            
            return {
                "message": "Documento processado com sucesso",
                "document_id": document.id
            }
        else:
            raise ValueError(f"Tipo de arquivo não suportado: {file_type}")
            
    except Exception as e:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        logger.error(f"Erro no upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro no processamento do documento: {str(e)}"  # <-- Adicionado o parêntese de fechamento
        )
    except SQLAlchemyError as e:
        logger.error(f"Erro de banco de dados: {str(e)}")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail="Erro ao salvar documento no banco de dados"
        )
        
    except IOError as e:
        logger.error(f"Erro de I/O: {str(e)}")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail="Erro ao processar arquivo"
        )
        
    except Exception as e:
        logger.error(f"Erro inesperado: {str(e)}")
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor"
        )

@app.get("/api/documents/search")
def search_documents_advanced(
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
            detail="Erro ao realizar a busca"
        )

@app.get("/api/search")
def search_documents(
    query: str = Query(..., description="Termo de busca"),
    n_results: int = Query(default=5, description="Número de resultados a retornar")
):
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results
    except Exception as e:
        logger.error(f"Erro na busca: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

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

# Rotas para Projetos ESG
@app.post("/api/esg-projects", response_model=schemas.ESGProject)
async def create_esg_project(
    project: schemas.ESGProjectCreate,
    db: Session = Depends(get_db)
):
    try:
        # Verificar se a empresa existe
        company = db.query(models.Company).filter(models.Company.id == project.company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Empresa não encontrada")

        db_project = models.ESGProject(**project.dict())
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        return db_project
    except Exception as e:
        logger.error(f"Erro ao criar projeto ESG: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/esg-projects", response_model=List[schemas.ESGProject])
async def list_esg_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    try:
        projects = db.query(models.ESGProject).offset(skip).limit(limit).all()
        return projects
    except Exception as e:
        logger.error(f"Erro ao listar projetos ESG: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/esg-projects/{project_id}", response_model=schemas.ESGProject)
async def get_esg_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    try:
        project = db.query(models.ESGProject).filter(models.ESGProject.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        return project
    except Exception as e:
        logger.error(f"Erro ao buscar projeto ESG: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/esg-projects/{project_id}", response_model=schemas.ESGProject)
async def update_esg_project(
    project_id: int,
    project: schemas.ESGProjectCreate,
    db: Session = Depends(get_db)
):
    try:
        db_project = db.query(models.ESGProject).filter(models.ESGProject.id == project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")

        for key, value in project.dict().items():
            setattr(db_project, key, value)

        db.commit()
        db.refresh(db_project)
        return db_project
    except Exception as e:
        logger.error(f"Erro ao atualizar projeto ESG: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/esg-projects/{project_id}")
async def delete_esg_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    try:
        db_project = db.query(models.ESGProject).filter(models.ESGProject.id == project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")

        db.delete(db_project)
        db.commit()
        return {"message": "Projeto excluído com sucesso"}
    except Exception as e:
        logger.error(f"Erro ao excluir projeto ESG: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Project Tracking
@app.post("/api/project-tracking", response_model=schemas.ProjectTracking)
def create_project(project: schemas.ProjectTrackingCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Criando novo projeto: {project.dict()}")
        
        # Criar projeto com todos os campos, incluindo ODS
        db_project = models.ProjectTracking(**project.dict())
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        # Log dos valores ODS após criação
        ods_values = {f"ods{i}": getattr(db_project, f"ods{i}", 0) for i in range(1, 18)}
        logger.info(f"Valores ODS salvos: {ods_values}")
        
        return db_project
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar projeto: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/project-tracking/{project_id}", response_model=schemas.ProjectTracking)
def update_project(project_id: int, project: schemas.ProjectTrackingCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Atualizando projeto {project_id}")
        logger.info(f"Dados recebidos: {project.dict()}")
        
        db_project = db.query(models.ProjectTracking).filter(models.ProjectTracking.id == project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        
        # Log dos valores ODS antes da atualização
        old_ods = {f"ods{i}": getattr(db_project, f"ods{i}", 0) for i in range(1, 18)}
        logger.info(f"Valores ODS antes: {old_ods}")
        
        # Atualizar todos os campos, incluindo ODS
        for key, value in project.dict().items():
            setattr(db_project, key, value)
        
        db.commit()
        db.refresh(db_project)
        
        # Log dos valores ODS após atualização
        new_ods = {f"ods{i}": getattr(db_project, f"ods{i}", 0) for i in range(1, 18)}
        logger.info(f"Valores ODS depois: {new_ods}")
        
        return db_project
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar projeto: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/project-tracking", response_model=List[schemas.ProjectTracking])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        logger.info("Iniciando busca de projetos...")
        
        # Verificar se há projetos no banco
        total_projects = db.query(models.ProjectTracking).count()
        logger.info(f"Total de projetos no banco: {total_projects}")
        
        # Buscar projetos com relacionamentos (apenas company)
        projects = db.query(models.ProjectTracking)\
            .options(
                joinedload(models.ProjectTracking.company)  # Removido o joinedload de bonds
            )\
            .offset(skip)\
            .limit(limit)\
            .all()
        
        logger.info(f"Projetos encontrados: {len(projects)}")
        
        # Log detalhado de cada projeto
        for project in projects:
            logger.info(f"""
                Projeto encontrado:
                ID: {project.id}
                Nome: {project.name}
                Empresa: {project.company_id}
                Tipo: {project.project_type}
                Status: {project.status}
                Orçamento: {project.budget_allocated}
            """)
        
        return projects
        
    except Exception as e:
        logger.error(f"Erro ao buscar projetos: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Erro interno ao buscar projetos: {str(e)}"
        )

@app.get("/api/project-tracking/{project_id}", response_model=schemas.ProjectTracking)
def read_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.ProjectTracking)\
        .options(joinedload(models.ProjectTracking.company))\
        .filter(models.ProjectTracking.id == project_id)\
        .first()
    if project is None:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return project

@app.delete("/api/project-tracking/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    try:
        project = db.query(models.ProjectTracking).filter(models.ProjectTracking.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Projeto não encontrado")
        
        db.delete(project)
        db.commit()
        return {"message": "Projeto deletado com sucesso"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar projeto: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Dados de Emissão
@app.post("/api/emissions", response_model=schemas.EmissionData)
def create_emission(emission: schemas.EmissionDataCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Criando nova emissão: {emission.dict()}")
        
        # Criar o objeto com apenas os campos necessários
        emission_dict = {
            'company_id': emission.company_id,
            'scope': emission.scope,
            'emission_type': emission.emission_type,
            'value': emission.value,
            'unit': emission.unit,
            'source': emission.source,
            'calculation_method': emission.calculation_method,
            'uncertainty_level': emission.uncertainty_level,
            'timestamp': emission.timestamp,
            'calculated_emission': emission.calculated_emission,
            'reporting_standard': emission.reporting_standard
        }
        
        db_emission = models.EmissionData(**emission_dict)
        
        db.add(db_emission)
        db.commit()
        db.refresh(db_emission)
        
        logger.info(f"Emissão criada com sucesso: ID {db_emission.id}")
        return db_emission
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar emissão: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/emissions", response_model=List[schemas.EmissionData])
def read_emissions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        emissions = db.query(models.EmissionData)\
            .options(joinedload(models.EmissionData.company))\
            .offset(skip)\
            .limit(limit)\
            .all()
        return emissions
    except Exception as e:
        logger.error(f"Erro ao buscar emissões: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/emissions/{emission_id}", response_model=schemas.EmissionData)
def read_emission(emission_id: int, db: Session = Depends(get_db)):
    try:
        db_emission = db.query(models.EmissionData).filter(models.EmissionData.id == emission_id).first()
        if db_emission is None:
            raise HTTPException(status_code=404, detail="Registro de emissão não encontrado")
        return db_emission
    except Exception as e:
        logger.error(f"Erro ao buscar emissão: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/emissions/{emission_id}", response_model=schemas.EmissionData)
def update_emission(emission_id: int, emission: schemas.EmissionDataCreate, db: Session = Depends(get_db)):
    try:
        db_emission = db.query(models.EmissionData).filter(models.EmissionData.id == emission_id).first()
        if db_emission is None:
            raise HTTPException(status_code=404, detail="Registro de emissão não encontrado")
        
        # Atualiza os campos
        for key, value in emission.dict(exclude_unset=True).items():
            if hasattr(db_emission, key):
                setattr(db_emission, key, value)
        
        # O updated_at será atualizado automaticamente pelo onupdate
        db.commit()
        db.refresh(db_emission)
        return db_emission
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar emissão: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/emissions/{emission_id}", response_model=schemas.EmissionData)
def delete_emission(emission_id: int, db: Session = Depends(get_db)):
    try:
        db_emission = db.query(models.EmissionData).filter(models.EmissionData.id == emission_id).first()
        if db_emission is None:
            raise HTTPException(status_code=404, detail="Registro de emissão não encontrado")
        
        db.delete(db_emission)
        db.commit()
        return db_emission
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar emissão: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

# Rotas para Fornecedores

@app.post("/api/suppliers", response_model=schemas.Supplier)
async def create_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    logger.info("Iniciando criaço de fornecedor")
    logger.info(f"Dados recebidos: {supplier.dict()}")
    
    try:
        # Verifica se a empresa existe
        company = db.query(models.Company).filter(models.Company.id == supplier.company_id).first()
        if not company:
            logger.error(f"Empresa {supplier.company_id} não encontrada")
            raise HTTPException(status_code=404, detail="Empresa não encontrada")

        db_supplier = models.Supplier(**supplier.dict())
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        
        logger.info(f"Fornecedor criado com sucesso: ID {db_supplier.id}")
        return db_supplier
        
    except SQLAlchemyError as e:
        logger.error(f"Erro SQL ao criar fornecedor: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erro ao criar fornecedor: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suppliers", response_model=List[schemas.Supplier])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        suppliers = db.query(models.Supplier).offset(skip).limit(limit).all()
        return suppliers
    except Exception as e:
        logger.error(f"Erro ao buscar fornecedores: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/suppliers/{supplier_id}", response_model=schemas.Supplier)
def read_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    return schemas.Supplier.from_orm(db_supplier)

@app.put("/api/suppliers/{supplier_id}", response_model=schemas.Supplier)
def update_supplier(supplier_id: int, supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    
    supplier_data = supplier.dict(exclude_unset=True)
    for key, value in supplier_data.items():
        setattr(db_supplier, key, value)
    
    try:
        db.commit()
        db.refresh(db_supplier)
        logger.info(f"Fornecedor atualizado com sucesso: {db_supplier.id}")
        return schemas.Supplier.from_orm(db_supplier)
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar fornecedor: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Erro ao atualizar fornecedor: {str(e)}"
        )

@app.delete("/api/suppliers/{supplier_id}", response_model=schemas.Supplier)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    db_supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if db_supplier is None:
        raise HTTPException(status_code=404, detail="Fornecedor não encontrado")
    try:
        db.delete(db_supplier)
        db.commit()
        logger.info(f"Fornecedor deletado com sucesso: {supplier_id}")
        return schemas.Supplier.from_orm(db_supplier)
    except SQLAlchemyError as e:
        logger.error(f"Erro ao deletar fornecedor: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Falha ao deletar fornecedor: {str(e)}")

@app.get("/")
async def root():
    return {"message": "API is running"}

@app.get("/api/suppliers/test")
async def test_suppliers():
    return {"message": "Suppliers endpoint is working"}

@app.post("/api/suppliers", response_model=schemas.Supplier)
async def create_supplier(
    supplier: schemas.SupplierCreate, 
    db: Session = Depends(get_db)
):
    logger.info(f"Recebendo requisição POST /api/suppliers: {supplier.dict()}")
    try:
        company = db.query(models.Company).filter(models.Company.id == supplier.company_id).first()
        if not company:
            logger.error(f"Empresa {supplier.company_id} não encontrada")
            raise HTTPException(status_code=404, detail="Empresa não encontrada")

        db_supplier = models.Supplier(**supplier.dict())
        db.add(db_supplier)
        db.commit()
        db.refresh(db_supplier)
        
        logger.info(f"Fornecedor criado com sucesso: ID {db_supplier.id}")
        return db_supplier
        
    except Exception as e:
        logger.error(f"Erro ao criar fornecedor: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Avaliação de Materialidade
@app.post("/api/materiality", response_model=schemas.MaterialityAssessment)
def create_materiality(materiality: schemas.MaterialityAssessmentCreate, db: Session = Depends(get_db)):
    try:
        logger.info(f"Criando nova avaliação de materialidade: {materiality.dict()}")
        
        db_materiality = models.MaterialityAssessment(**materiality.dict())
        db_materiality.last_updated = datetime.now(timezone.utc)  # Definir timezone
        
        db.add(db_materiality)
        db.commit()
        db.refresh(db_materiality)
        
        logger.info(f"Avaliação de materialidade criada com sucesso: ID {db_materiality.id}")
        return db_materiality
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar avaliação de materialidade: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/materiality", response_model=List[schemas.MaterialityAssessment])
def read_materiality(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        materiality_list = db.query(models.MaterialityAssessment)\
            .options(joinedload(models.MaterialityAssessment.company))\
            .offset(skip)\
            .limit(limit)\
            .all()
        return materiality_list
    except Exception as e:
        logger.error(f"Erro ao buscar avaliações de materialidade: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/materiality/{materiality_id}", response_model=schemas.MaterialityAssessment)
def read_materiality_by_id(materiality_id: int, db: Session = Depends(get_db)):
    db_materiality = db.query(models.MaterialityAssessment)\
        .options(joinedload(models.MaterialityAssessment.company))\
        .filter(models.MaterialityAssessment.id == materiality_id)\
        .first()
    
    if db_materiality is None:
        raise HTTPException(status_code=404, detail="Avaliação de materialidade não encontrada")
    return db_materiality

@app.put("/api/materiality/{materiality_id}", response_model=schemas.MaterialityAssessment)
def update_materiality(
    materiality_id: int, 
    materiality: schemas.MaterialityAssessmentUpdate, 
    db: Session = Depends(get_db)
):
    db_materiality = db.query(models.MaterialityAssessment).filter(
        models.MaterialityAssessment.id == materiality_id
    ).first()
    
    if db_materiality is None:
        raise HTTPException(status_code=404, detail="Avaliação de materialidade não encontrada")
    
    try:
        for key, value in materiality.dict(exclude_unset=True).items():
            setattr(db_materiality, key, value)
        
        db_materiality.updated_at = func.now()
        db.commit()
        db.refresh(db_materiality)
        return db_materiality
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar avaliação de materialidade: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/materiality/{materiality_id}")
def delete_materiality(materiality_id: int, db: Session = Depends(get_db)):
    try:
        # Primeiro, verificamos se o registro existe
        db_materiality = db.query(models.MaterialityAssessment).filter(
            models.MaterialityAssessment.id == materiality_id
        ).first()
        
        if db_materiality is None:
            logger.error(f"Avaliação de materialidade não encontrada: ID {materiality_id}")
            raise HTTPException(
                status_code=404, 
                detail=f"Avaliação de materialidade com ID {materiality_id} não encontrada"
            )
        
        # Se existe, deletamos
        try:
            db.delete(db_materiality)
            db.commit()
            logger.info(f"Avaliação de materialidade deletada com sucesso: ID {materiality_id}")
            return {"message": f"Avaliação de materialidade {materiality_id} deletada com sucesso"}
            
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao deletar avaliação de materialidade: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erro inesperado ao deletar avaliação de materialidade: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rotas para Investimentos
@app.post("/api/investments", response_model=schemas.Investment)
async def create_investment(investment: schemas.InvestmentCreate, db: Session = Depends(get_db)):
    logger.info("=== Criando novo investimento ===")
    logger.info(f"Dados recebidos: {investment.dict()}")
    
    try:
        # Verificar se a empresa existe
        company = db.query(models.Company).filter(models.Company.id == investment.company_id).first()
        if not company:
            logger.error(f"Empresa {investment.company_id} não encontrada")
            raise HTTPException(status_code=404, detail="Empresa não encontrada")
        
        db_investment = models.Investment(**investment.dict())
        db.add(db_investment)
        db.commit()
        db.refresh(db_investment)
        
        logger.info(f"Investimento criado com sucesso: ID {db_investment.id}")
        return db_investment
        
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar investimento: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/investments", response_model=List[schemas.Investment])
async def read_investments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        investments = db.query(models.Investment)\
            .options(joinedload(models.Investment.company))\
            .offset(skip)\
            .limit(limit)\
            .all()
        return investments
    except Exception as e:
        logger.error(f"Erro ao buscar investimentos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/investments/{investment_id}", response_model=schemas.Investment)
async def read_investment(investment_id: int, db: Session = Depends(get_db)):
    try:
        investment = db.query(models.Investment)\
            .options(joinedload(models.Investment.company))\
            .filter(models.Investment.id == investment_id)\
            .first()
        if not investment:
            raise HTTPException(status_code=404, detail="Investimento não encontrado")
        return investment
    except Exception as e:
        logger.error(f"Erro ao buscar investimento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/investments/{investment_id}", response_model=schemas.Investment)
async def update_investment(investment_id: int, investment: schemas.InvestmentCreate, db: Session = Depends(get_db)):
    try:
        db_investment = db.query(models.Investment).filter(models.Investment.id == investment_id).first()
        if not db_investment:
            raise HTTPException(status_code=404, detail="Investimento não encontrado")
            
        for key, value in investment.dict().items():
            setattr(db_investment, key, value)
            
        db.commit()
        db.refresh(db_investment)
        return db_investment
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar investimento: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/investments/{investment_id}")
async def delete_investment(investment_id: int, db: Session = Depends(get_db)):
    try:
        db_investment = db.query(models.Investment).filter(models.Investment.id == investment_id).first()
        if not db_investment:
            raise HTTPException(status_code=404, detail="Investimento não encontrado")
            
        db.delete(db_investment)
        db.commit()
        return {"message": f"Investimento {investment_id} deletado com sucesso"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar investimento: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test")
async def test_endpoint():
    logger.info("Teste endpoint chamado")
    return {"message": "API está funcionando"}

# Rotas para Compliance Audit
@app.post("/api/compliance", response_model=schemas.ComplianceAudit)
def create_compliance_audit(
    compliance: schemas.ComplianceAuditCreate,
    db: Session = Depends(get_db)
):
    logger.info("=== Criando nova auditoria de compliance ===")
    
    try:
        # Verificar se a empresa existe
        company = db.query(models.Company).filter(models.Company.id == compliance.company_id).first()
        if not company:
            logger.error(f"Empresa {compliance.company_id} não encontrada")
            raise HTTPException(status_code=404, detail="Empresa não encontrada")
        
        # Criar SQL direto usando a sequência correta
        sql = text("""
            INSERT INTO xlonesg.compliance_audit
            (id, company_id, entity_type, audit_date, auditor_name, compliance_status,
             findings, corrective_action_plan, follow_up_date, created_at, updated_at)
            VALUES
            (nextval('xlonesg.compliance_audit_id_seq'), :company_id, :entity_type, :audit_date, 
             :auditor_name, :compliance_status, :findings, :corrective_action_plan, 
             :follow_up_date, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, created_at, updated_at
        """)
        
        result = db.execute(
            sql,
            {
                "company_id": compliance.company_id,
                "entity_type": compliance.entity_type,
                "audit_date": compliance.audit_date,
                "auditor_name": compliance.auditor_name,
                "compliance_status": compliance.compliance_status,
                "findings": compliance.findings,
                "corrective_action_plan": compliance.corrective_action_plan,
                "follow_up_date": compliance.follow_up_date
            }
        )
        
        db.commit()
        
        # Buscar o registro criado
        row = result.fetchone()
        if row:
            return {
                "id": row[0],
                "company_id": compliance.company_id,
                "entity_type": compliance.entity_type,
                "audit_date": compliance.audit_date,
                "auditor_name": compliance.auditor_name,
                "compliance_status": compliance.compliance_status,
                "findings": compliance.findings,
                "corrective_action_plan": compliance.corrective_action_plan,
                "follow_up_date": compliance.follow_up_date,
                "created_at": row[1],
                "updated_at": row[2]
            }
            
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao criar auditoria de compliance: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/compliance", response_model=List[schemas.ComplianceAudit])
def read_compliance_audits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        compliance_audits = db.query(models.ComplianceAudit)\
            .options(joinedload(models.ComplianceAudit.company))\
            .offset(skip)\
            .limit(limit)\
            .all()
        return compliance_audits
    except Exception as e:
        logger.error(f"Erro ao buscar auditorias de compliance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/compliance/{compliance_id}", response_model=schemas.ComplianceAudit)
def read_compliance_audit(compliance_id: int, db: Session = Depends(get_db)):
    try:
        compliance = db.query(models.ComplianceAudit)\
            .options(joinedload(models.ComplianceAudit.company))\
            .filter(models.ComplianceAudit.id == compliance_id)\
            .first()
        if not compliance:
            raise HTTPException(status_code=404, detail="Auditoria de compliance não encontrada")
        return compliance
    except Exception as e:
        logger.error(f"Erro ao buscar auditoria de compliance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/compliance/{compliance_id}", response_model=schemas.ComplianceAudit)
def update_compliance_audit(
    compliance_id: int,
    compliance: schemas.ComplianceAuditCreate,
    db: Session = Depends(get_db)
):
    try:
        db_compliance = db.query(models.ComplianceAudit)\
            .filter(models.ComplianceAudit.id == compliance_id)\
            .first()
        if not db_compliance:
            raise HTTPException(status_code=404, detail="Auditoria de compliance não encontrada")
            
        for key, value in compliance.dict().items():
            setattr(db_compliance, key, value)
            
        db.commit()
        db.refresh(db_compliance)
        return db_compliance
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao atualizar auditoria de compliance: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/compliance/{compliance_id}")
def delete_compliance_audit(compliance_id: int, db: Session = Depends(get_db)):
    try:
        db_compliance = db.query(models.ComplianceAudit)\
            .filter(models.ComplianceAudit.id == compliance_id)\
            .first()
        if not db_compliance:
            raise HTTPException(status_code=404, detail="Auditoria de compliance não encontrada")
            
        db.delete(db_compliance)
        db.commit()
        return {"message": f"Auditoria de compliance {compliance_id} deletada com sucesso"}
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao deletar auditoria de compliance: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Obter extensão do arquivo
        file_ext = os.path.splitext(file.filename)[1]
        
        # Corrigir esta linha (estava causando o erro)
        file_type = file_ext.replace('.', '') if file_ext else ''
        
        # Resto do código...
        
    except Exception as e:
        logger.error(f"Erro no upload: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/bonds/{bond_id}/projects")
def get_bond_projects(bond_id: int, db: Session = Depends(get_db)):
    try:
        # Buscar o título com seus projetos relacionados
        bond = db.query(models.Bond)\
            .options(joinedload(models.Bond.projects))\
            .filter(models.Bond.id == bond_id)\
            .first()
            
        if not bond:
            raise HTTPException(status_code=404, detail="Título não encontrado")
            
        return bond.projects
        
    except Exception as e:
        logger.error(f"Erro ao buscar projetos do título: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bonds/{bond_id}/projects")
def relate_bond_projects(bond_id: int, data: dict, db: Session = Depends(get_db)):
    try:
        # Verificar se o título existe
        bond = db.query(models.Bond).filter(models.Bond.id == bond_id).first()
        if not bond:
            raise HTTPException(status_code=404, detail="Título não encontrado")
        
        project_ids = data.get('project_ids', [])
        
        # Verificar se todos os projetos existem
        projects = db.query(models.ProjectTracking)\
            .filter(models.ProjectTracking.id.in_(project_ids))\
            .all()
        if len(projects) != len(project_ids):
            raise HTTPException(status_code=404, detail="Um ou mais projetos não encontrados")
        
        # Remover relações existentes
        db.query(models.BondProjectRelation)\
            .filter(models.BondProjectRelation.bond_id == bond_id)\
            .delete()
        
        # Criar novas relações
        for project_id in project_ids:
            relation = models.BondProjectRelation(
                bond_id=bond_id,
                project_id=project_id,
                created_by="system"
            )
            db.add(relation)
        
        db.commit()
        return {"message": "Relações atualizadas com sucesso"}
    
    except Exception as e:
        db.rollback()
        logger.error(f"Erro ao relacionar projetos ao título: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bonds/relationships")
def get_all_relationships(db: Session = Depends(get_db)):
    try:
        # Buscar todas as relações com informações dos títulos e projetos
        relations = db.query(models.BondProjectRelation)\
            .options(
                joinedload(models.BondProjectRelation.bond),
                joinedload(models.BondProjectRelation.project)
            )\
            .all()
            
        relationships = {}
        for relation in relations:
            if relation.bond_id not in relationships:
                relationships[relation.bond_id] = []
            relationships[relation.bond_id].append({
                "project_id": relation.project_id,
                "created_at": relation.created_at,
                "created_by": relation.created_by
            })
            
        return relationships
        
    except Exception as e:
        logger.error(f"Erro ao buscar relacionamentos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


