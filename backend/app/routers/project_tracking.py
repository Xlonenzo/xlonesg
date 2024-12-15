from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import ProjectTracking
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/project-tracking/ods-average")
async def get_ods_average(db: Session = Depends(get_db)):
    try:
        logger.info("Iniciando busca de médias ODS")
        
        # Buscar dados
        result = db.query(
            func.avg(ProjectTracking.ods1).label('ods1'),
            func.avg(ProjectTracking.ods2).label('ods2'),
            func.avg(ProjectTracking.ods3).label('ods3'),
            func.avg(ProjectTracking.ods4).label('ods4'),
            func.avg(ProjectTracking.ods5).label('ods5'),
            func.avg(ProjectTracking.ods6).label('ods6'),
            func.avg(ProjectTracking.ods7).label('ods7'),
            func.avg(ProjectTracking.ods8).label('ods8'),
            func.avg(ProjectTracking.ods9).label('ods9'),
            func.avg(ProjectTracking.ods10).label('ods10'),
            func.avg(ProjectTracking.ods11).label('ods11'),
            func.avg(ProjectTracking.ods12).label('ods12'),
            func.avg(ProjectTracking.ods13).label('ods13'),
            func.avg(ProjectTracking.ods14).label('ods14'),
            func.avg(ProjectTracking.ods15).label('ods15'),
            func.avg(ProjectTracking.ods16).label('ods16'),
            func.avg(ProjectTracking.ods17).label('ods17'),
        ).first()

        logger.info("Dados encontrados no banco")

        # Verificar se há resultados
        if not result:
            logger.warning("Nenhum dado ODS encontrado")
            return {f"ods{i}": 0 for i in range(1, 18)}

        # Converter para dicionário
        response_data = {
            'ods1': float(result.ods1 or 0),
            'ods2': float(result.ods2 or 0),
            'ods3': float(result.ods3 or 0),
            'ods4': float(result.ods4 or 0),
            'ods5': float(result.ods5 or 0),
            'ods6': float(result.ods6 or 0),
            'ods7': float(result.ods7 or 0),
            'ods8': float(result.ods8 or 0),
            'ods9': float(result.ods9 or 0),
            'ods10': float(result.ods10 or 0),
            'ods11': float(result.ods11 or 0),
            'ods12': float(result.ods12 or 0),
            'ods13': float(result.ods13 or 0),
            'ods14': float(result.ods14 or 0),
            'ods15': float(result.ods15 or 0),
            'ods16': float(result.ods16 or 0),
            'ods17': float(result.ods17 or 0),
        }

        logger.info(f"Retornando dados: {response_data}")
        return response_data

    except Exception as e:
        logger.error(f"Erro ao buscar médias ODS: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Rota para listar todos os projetos
@router.get("/project-tracking")
async def get_all_projects(db: Session = Depends(get_db)):
    try:
        projects = db.query(ProjectTracking).all()
        return projects
    except Exception as e:
        logger.error(f"Erro ao buscar projetos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 