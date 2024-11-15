from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import chromadb
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
import os
from datetime import datetime
from ..database import get_db
from sqlalchemy.orm import Session
from .. import models, schemas

router = APIRouter()
    
# Configurar Chroma
client = chromadb.Client()
collection = client.create_collection("documents")

# Configurar OpenAI Embeddings
embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = None,
    db: Session = Depends(get_db)
):
    # Salvar arquivo
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Carregar documento baseado na extensão
    if file.filename.endswith('.pdf'):
        loader = PyPDFLoader(file_path)
    elif file.filename.endswith('.docx'):
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
            metadatas=[{"source": file.filename, "chunk": i}],
            ids=[f"{file.filename}-{i}"]
        )

    # Salvar metadados no banco de dados
    db_document = models.Document(
        title=title or file.filename,
        file_path=file_path,
        created_at=datetime.now()
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return db_document

@router.get("/search")
async def search_documents(query: str):
    # Gerar embedding para a query
    query_embedding = embeddings.embed_query(query)
    
    # Buscar documentos similares
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=5
    )

    # Formatar resultados
    formatted_results = []
    for i, (doc, metadata, distance) in enumerate(zip(
        results['documents'][0],
        results['metadatas'][0],
        results['distances'][0]
    )):
        formatted_results.append({
            "content": doc,
            "source": metadata['source'],
            "similarity": 1 - distance,
            "chunk": metadata['chunk']
        })

    return formatted_results

@router.get("/{document_id}/download")
async def download_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(models.Document).filter(models.Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return FileResponse(document.file_path) 