from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

NivelFidelizacion = Literal["Kilobytes", "MegaBytes", "GigaBytes", "TeraBytes"]


def format_datetime(dt: datetime) -> str:
    """Formatea datetime a dd/mm/yy h:m:s"""
    return dt.strftime("%d/%m/%y %H:%M:%S")


class TransaccionResumen(BaseModel):
    """Resumen de una transacción para almacenar en el usuario."""
    transaccion_id: str  # ID de la transacción en la colección transacciones
    fecha: datetime
    tienda: str
    articulo: str
    cantidad: int
    monto: float  # divisas_venta
    puntos_generados: int


class UserBase(BaseModel):
    cedula: str
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[str] = None


class UserCreate(UserBase):
    pass


class User(UserBase):
    """Modelo de usuario con puntos, nivel y transacciones."""
    fecha_registro: datetime = Field(default_factory=datetime.now)
    fecha_suscripcion: datetime = Field(default_factory=datetime.now)
    
    # Sistema de puntos
    puntos_totales: int = 0          # Puntos acumulados históricos
    puntos_vigentes: int = 0         # Puntos dentro del año vigente
    puntos_listos_canje: int = 0     # Múltiplos de 500 disponibles
    dolares_canjeables: float = 0.0  # puntos_listos_canje / 50
    
    # Nivel de fidelización
    nivel: NivelFidelizacion = "Kilobytes"
    
    # Historial de transacciones (resumen)
    transacciones: List[TransaccionResumen] = []
    
    # Estadísticas
    total_gastado: float = 0.0
    compras_totales: int = 0
    
    ultima_actualizacion: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.strftime("%d/%m/%y %H:%M:%S")
        }


class UserResponse(BaseModel):
    """Respuesta de usuario para API."""
    cedula: str
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[str] = None
    nivel: NivelFidelizacion
    puntos_totales: int
    puntos_vigentes: int
    puntos_listos_canje: int
    dolares_canjeables: float
    total_gastado: float
    compras_totales: int
    transacciones: List[TransaccionResumen] = []


class UserPuntosResponse(BaseModel):
    """Respuesta para consulta de puntos de un usuario."""
    cedula: str
    nombre: str
    nivel: NivelFidelizacion
    puntos_totales: int
    puntos_vigentes: int
    puntos_listos_canje: int
    dolares_canjeables: float
