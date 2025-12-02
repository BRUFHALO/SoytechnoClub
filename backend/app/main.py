from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routers import puntos_router, data_router, users_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación."""
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()


app = FastAPI(
    title="Club Soytechno API",
    description="""
    API para el programa de fidelización Club Soytechno.
    
    ## Funcionalidades
    
    * **Carga de datos**: Subir archivos Excel/CSV con transacciones
    * **Consulta de puntos**: Individual por cédula o masiva
    * **Gestión de niveles**: Cálculo automático de niveles de fidelización
    
    ## Sistema de Puntos (TechnoBits)
    
    * $1 gastado = 1 punto
    * 50 puntos = $1 canjeable
    * Mínimo 500 puntos para canje ($10)
    * Vigencia: 1 año desde suscripción
    
    ## Niveles de Fidelización
    
    1. **Kilobytes** (Básico): Sin historial de compra
    2. **MegaBytes** (Intermedio): ≥3 compras o ≥$500 gastado
    3. **GigaBytes** (Avanzado): ≥8 compras o ≥$1500 gastado
    4. **TeraBytes** (Pro): ≥13 compras o ≥$3000 gastado
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# Configurar CORS
origins = [
    settings.frontend_url,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
# Filtrar valores vacíos o None
origins = [o for o in origins if o]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar routers
app.include_router(puntos_router)
app.include_router(data_router)
app.include_router(users_router)


@app.get("/", tags=["Root"])
async def root():
    """Endpoint raíz con información de la API."""
    return {
        "nombre": "Club Soytechno API",
        "version": "1.0.0",
        "documentacion": "/docs",
        "endpoints": {
            "puntos_cliente": "GET /api/puntos/cliente/{cedula}",
            "listos_canje": "GET /api/puntos/listos-canje",
            "upload": "POST /api/data/upload",
            "user_puntos": "GET /api/users/puntos/{cedula}",
            "user_completo": "GET /api/users/{cedula}",
            "users_listos_canje": "GET /api/users/listos-canje/",
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Verificar estado de la API."""
    return {"status": "healthy"}
