from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import engine, get_db
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

@app.post("/api/kpis", response_model=schemas.KPI)
def create_kpi(kpi: schemas.KPICreate, db: Session = Depends(get_db)):
    print("Dados recebidos na API:", kpi.dict())
    db_kpi = models.KPI(**kpi.dict())
    db.add(db_kpi)
    db.commit()
    db.refresh(db_kpi)
    print("KPI criado:", db_kpi.__dict__)
    return db_kpi

@app.get("/api/kpis", response_model=list[schemas.KPI])
def read_kpis(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    kpis = db.query(models.KPI).offset(skip).limit(limit).all()
    return kpis

@app.get("/api/kpis/{kpi_id}", response_model=schemas.KPI)
def read_kpi(kpi_id: int, db: Session = Depends(get_db)):
    kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    return kpi

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
    kpi = db.query(models.KPI).filter(models.KPI.id == kpi_id).first()
    if kpi is None:
        raise HTTPException(status_code=404, detail="KPI not found")
    db.delete(kpi)
    db.commit()
    return kpi