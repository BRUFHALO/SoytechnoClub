from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TransaccionBase(BaseModel):
    tienda: str
    marca: str
    fecha: datetime
    canal_venta: str
    cedula: str
    nombre_razon_social: str
    telefono: Optional[str] = None
    correo_electronico: Optional[str] = None
    articulo: str
    descripcion_articulo: str
    cantidad: int
    divisas_venta: float
    categoria: str
    numero: str


class TransaccionCreate(TransaccionBase):
    pass


class Transaccion(TransaccionBase):
    puntos_generados: int = 0
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
