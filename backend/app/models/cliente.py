from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

NivelFidelizacion = Literal["Kilobytes", "MegaBytes", "GigaBytes", "TeraBytes"]


class ClienteBase(BaseModel):
    cedula: str
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class Cliente(ClienteBase):
    fecha_suscripcion: datetime = Field(default_factory=datetime.now)
    nivel: NivelFidelizacion = "Kilobytes"
    total_gastado: float = 0.0
    compras_totales: int = 0
    puntos_totales: int = 0
    puntos_vigentes: int = 0
    puntos_listos_canje: int = 0
    dolares_canjeables: float = 0.0
    ultima_actualizacion: datetime = Field(default_factory=datetime.now)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ClienteResponse(BaseModel):
    cedula: str
    nombre: str
    telefono: Optional[str] = None
    correo: Optional[str] = None
    fecha_suscripcion: datetime
    nivel: NivelFidelizacion
    total_gastado: float
    compras_totales: int
    puntos_totales: int
    puntos_vigentes: int
    puntos_listos_canje: int
    dolares_canjeables: float


class ClientePuntosResponse(BaseModel):
    """Respuesta para consulta de puntos de un cliente."""
    cedula: str
    nombre: str
    nivel: NivelFidelizacion
    puntos_totales: int
    puntos_vigentes: int
    puntos_listos_canje: int
    dolares_canjeables: float
