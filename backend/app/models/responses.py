from pydantic import BaseModel
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.cliente import ClientePuntosResponse
    from app.models.user import UserPuntosResponse


class UploadResponse(BaseModel):
    """Respuesta al subir archivo de transacciones."""
    registros_procesados: int
    clientes_actualizados: int
    usuarios_actualizados: int = 0
    errores: List[str] = []


class ClientesListosCanje(BaseModel):
    """Respuesta para lista de clientes listos para canje."""
    total: int
    clientes: List["ClientePuntosResponse"]


class UsersListosCanje(BaseModel):
    """Respuesta para lista de usuarios listos para canje."""
    total: int
    users: List["UserPuntosResponse"]


# Resolver referencias forward
from app.models.cliente import ClientePuntosResponse
from app.models.user import UserPuntosResponse
ClientesListosCanje.model_rebuild()
UsersListosCanje.model_rebuild()
