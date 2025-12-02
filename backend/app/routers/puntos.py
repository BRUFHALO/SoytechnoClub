from fastapi import APIRouter, HTTPException, Query
from app.database import get_database
from app.services import PuntosService
from app.models import ClientePuntosResponse, ClientesListosCanje

router = APIRouter(prefix="/api/puntos", tags=["Puntos"])


@router.get("/cliente/{cedula}", response_model=ClientePuntosResponse)
async def obtener_puntos_cliente(cedula: str):
    """
    Consulta de puntos por cliente individual.
    
    Retorna:
    - Cédula
    - Nombre
    - Nivel actual
    - Puntos totales acumulados
    - Puntos vigentes (dentro del año de suscripción)
    - Puntos listos para canjear (múltiplos de 500)
    - Equivalente en dólares ($)
    """
    db = get_database()
    service = PuntosService(db)
    
    cliente = await service.obtener_cliente_puntos(cedula)
    
    if not cliente:
        raise HTTPException(
            status_code=404,
            detail=f"Cliente con cédula {cedula} no encontrado"
        )
    
    return cliente


@router.get("/listos-canje", response_model=ClientesListosCanje)
async def obtener_clientes_listos_canje(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Registros por página"),
):
    """
    Consulta masiva de clientes listos para canje.
    
    Retorna lista de todos los clientes que han alcanzado el umbral 
    mínimo de 500 puntos para canje, incluyendo:
    - Cédula
    - Nombre
    - Nivel
    - Total de dólares disponibles para canje
    """
    db = get_database()
    service = PuntosService(db)
    
    clientes, total = await service.obtener_clientes_listos_canje(page, limit)
    
    return ClientesListosCanje(
        total=total,
        clientes=clientes
    )
