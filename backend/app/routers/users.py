from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from app.database import get_database
from app.services import UserService
from app.models.user import UserPuntosResponse, UserResponse
from app.models.responses import UsersListosCanje

router = APIRouter(prefix="/api/users", tags=["Users"])


def format_datetime(dt) -> str:
    """Formatea datetime a dd/mm/yy H:M:S"""
    if isinstance(dt, datetime):
        return dt.strftime("%d/%m/%y %H:%M:%S")
    if isinstance(dt, str):
        try:
            parsed = datetime.fromisoformat(dt.replace("Z", "+00:00"))
            return parsed.strftime("%d/%m/%y %H:%M:%S")
        except:
            return dt
    return str(dt)


def format_user_dates(user: dict) -> dict:
    """Formatea todas las fechas de un usuario."""
    date_fields = ["fecha_registro", "fecha_suscripcion", "ultima_actualizacion"]
    
    for field in date_fields:
        if field in user and user[field]:
            user[field] = format_datetime(user[field])
    
    # Formatear fechas en transacciones
    if "transacciones" in user:
        for tx in user["transacciones"]:
            if "fecha" in tx and tx["fecha"]:
                tx["fecha"] = format_datetime(tx["fecha"])
    
    return user


@router.get("/puntos/{cedula}", response_model=UserPuntosResponse)
async def obtener_puntos_usuario(cedula: str):
    """
    Consulta de puntos por usuario individual.
    
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
    service = UserService(db)
    
    user = await service.obtener_user_puntos(cedula)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Usuario con cédula {cedula} no encontrado"
        )
    
    return user


@router.get("/{cedula}", response_model=dict)
async def obtener_usuario_completo(cedula: str):
    """
    Obtiene información completa de un usuario incluyendo todas sus transacciones.
    """
    db = get_database()
    service = UserService(db)
    
    user = await service.obtener_user_completo(cedula)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Usuario con cédula {cedula} no encontrado"
        )
    
    # Convertir ObjectId a string
    user["_id"] = str(user["_id"])
    
    # Formatear fechas a dd/mm/yy H:M:S
    user = format_user_dates(user)
    
    return user


@router.get("/listos-canje/", response_model=UsersListosCanje)
async def obtener_usuarios_listos_canje(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Registros por página"),
):
    """
    Consulta masiva de usuarios listos para canje.
    
    Retorna lista de todos los usuarios que han alcanzado el umbral 
    mínimo de 500 puntos para canje, incluyendo:
    - Cédula
    - Nombre
    - Nivel
    - Total de dólares disponibles para canje
    """
    db = get_database()
    service = UserService(db)
    
    users, total = await service.obtener_users_listos_canje(page, limit)
    
    return UsersListosCanje(
        total=total,
        users=users
    )
