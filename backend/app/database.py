import os
import time
import logging
from sqlalchemy import create_engine, text, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, ProgrammingError

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:xlon1234@localhost/xlonesg")

if os.getenv("DOCKER_ENV"):
    DATABASE_URL = DATABASE_URL.replace("localhost", "db")

logger.debug(f"Usando DATABASE_URL: {DATABASE_URL}")

engine = create_engine(DATABASE_URL, echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    logger.debug(f"Executing: {statement}")
    logger.debug(f"Parameters: {parameters}")

def wait_for_db(max_retries=5, retry_interval=5):
    for i in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Conexão com o banco de dados estabelecida com sucesso")
            return
        except OperationalError as e:
            logger.error(f"Tentativa {i+1} de conexão com o banco de dados falhou: {str(e)}")
            logger.info(f"Tentando novamente em {retry_interval} segundos...")
            time.sleep(retry_interval)
    raise Exception("Falha ao conectar ao banco de dados após várias tentativas")

def init_db():
    from . import models  # Importe os modelos aqui para evitar importações circulares
    
    logger.info("Iniciando inicialização do banco de dados")
    
    try:
        with engine.connect() as conn:
            conn.execute(text("CREATE SCHEMA IF NOT EXISTS xlonesg"))
            conn.commit()
        logger.debug("Schema xlonesg criado ou já existente")
    except Exception as e:
        logger.error(f"Erro ao criar schema xlonesg: {str(e)}")
    
    try:
        Base.metadata.schema = "xlonesg"
        Base.metadata.create_all(bind=engine)
        logger.info("Tabelas criadas com sucesso")
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {str(e)}")
    
    logger.info("Banco de dados inicializado com sucesso")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    wait_for_db()
    init_db()
