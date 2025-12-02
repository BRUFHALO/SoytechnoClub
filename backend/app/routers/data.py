from fastapi import APIRouter, UploadFile, File, HTTPException
from app.database import get_database
from app.services import ExcelService
from app.models import UploadResponse

router = APIRouter(prefix="/api/data", tags=["Data"])


@router.post("/upload", response_model=UploadResponse)
async def upload_transacciones(
    file: UploadFile = File(..., description="Archivo Excel (.xlsx, .xls) o CSV")
):
    """
    Subir archivo Excel/CSV de transacciones.
    
    El archivo debe contener las siguientes columnas:
    - Tienda
    - Marca
    - Fecha
    - Canal de Venta
    - Cedula
    - Nombre o Razon Social
    - Telefono
    - Correo Electronico
    - Articulo
    - Descripcion Articulo
    - Cantidad
    - Divisas de Venta
    - Categoria
    - Numero
    
    El proceso:
    1. Lee y valida el archivo
    2. Inserta las transacciones en la base de datos
    3. Calcula puntos generados ($1 = 1 punto)
    4. Actualiza o crea clientes
    5. Recalcula niveles de fidelización
    """
    # Validar extensión
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nombre de archivo no proporcionado")
    
    extensiones_validas = [".csv", ".xlsx", ".xls"]
    extension = file.filename.lower()[file.filename.rfind("."):]
    
    if extension not in extensiones_validas:
        raise HTTPException(
            status_code=400,
            detail=f"Formato no válido. Extensiones permitidas: {', '.join(extensiones_validas)}"
        )
    
    # Leer contenido
    contenido = await file.read()
    
    if not contenido:
        raise HTTPException(status_code=400, detail="Archivo vacío")
    
    # Procesar
    db = get_database()
    service = ExcelService(db)
    
    registros, clientes, usuarios, errores = await service.procesar_archivo(
        contenido=contenido,
        nombre_archivo=file.filename
    )
    
    return UploadResponse(
        registros_procesados=registros,
        clientes_actualizados=clientes,
        usuarios_actualizados=usuarios,
        errores=errores
    )
