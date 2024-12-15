from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import InfoLibraryDocument
from ..schemas import InfoLibraryDocumentCreate, InfoLibraryDocumentResponse
import os
import shutil

router = APIRouter()

UPLOAD_DIR = "uploads/infolibrary"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/infolibrary-documents/upload", response_model=InfoLibraryDocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    document_type: str = Form(...),
    reference_date: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # Criar nome único para o arquivo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{timestamp}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # Salvar arquivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Determinar o MIME type do arquivo
        mime_type = file.content_type

        # Criar registro no banco
        db_document = InfoLibraryDocument(
            title=title,
            document_type=document_type,
            reference_date=reference_date,
            description=description,
            file_path=file_path,
            original_filename=file.filename,
            file_size=os.path.getsize(file_path),
            mime_type=mime_type,
            uploaded_by="system"  # Pode ser alterado para pegar o usuário atual
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        return db_document

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/infolibrary-documents", response_model=List[InfoLibraryDocumentResponse])
def get_documents(db: Session = Depends(get_db)):
    return db.query(InfoLibraryDocument).all()

@router.get("/infolibrary-documents/download/{document_id}")
async def download_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(InfoLibraryDocument).filter(InfoLibraryDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    if not os.path.exists(document.file_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado")

    return FileResponse(
        document.file_path,
        filename=document.original_filename,
        media_type='application/octet-stream'
    )

@router.delete("/infolibrary-documents/{document_id}")
async def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(InfoLibraryDocument).filter(InfoLibraryDocument.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")

    # Remover arquivo físico
    if os.path.exists(document.file_path):
        os.remove(document.file_path)

    # Remover registro do banco
    db.delete(document)
    db.commit()

    return {"message": "Documento excluído com sucesso"} 