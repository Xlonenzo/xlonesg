from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
import os
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = "uploads"  # Diretório para salvar os arquivos

@router.post("/generic-documents")
async def create_generic_document(
    file: UploadFile = File(...),
    entity_name: str = Form(...),
    entity_id: int = Form(...),
    description: Optional[str] = Form(None)
):
    # Criar diretório se não existir
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Gerar nome único para o arquivo
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{timestamp}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Salvar arquivo
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Inserir registro no banco
    query = """
    INSERT INTO xlonesg.generic_documents 
    (entity_name, entity_id, filename, original_filename, file_type, file_size, mime_type, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
    """
    
    values = (
        entity_name,
        entity_id,
        filename,
        file.filename,
        os.path.splitext(file.filename)[1],
        len(content),
        file.content_type,
        description
    )
    
    # Execute a query e retorne o resultado
    # Implemente a lógica de conexão com o banco aqui
    
    return {"message": "Documento enviado com sucesso", "filename": filename} 