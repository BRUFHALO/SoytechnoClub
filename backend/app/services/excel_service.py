import pandas as pd
from io import BytesIO
from datetime import datetime
from typing import List, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.services.puntos_service import PuntosService
from app.services.user_service import UserService


class ExcelService:
    """Servicio para procesar archivos Excel/CSV de transacciones."""
    
    # Mapeo de columnas esperadas
    COLUMNAS_ESPERADAS = [
        "Tienda",
        "Marca", 
        "Fecha",
        "Canal de Venta",
        "Cedula",
        "Nombre o Razon Social",
        "Telefono",
        "Correo Electronico",
        "Articulo",
        "Descripcion Articulo",
        "Cantidad",
        "Divisas de Venta",
        "Categoria",
        "Numero",
    ]
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.puntos_service = PuntosService(db)
        self.user_service = UserService(db)
    
    def _normalizar_columnas(self, df: pd.DataFrame) -> pd.DataFrame:
        """Normaliza los nombres de columnas del DataFrame."""
        # Crear mapeo de nombres normalizados
        mapeo = {}
        for col in df.columns:
            col_normalizado = col.strip().lower()
            
            if "tienda" in col_normalizado:
                mapeo[col] = "tienda"
            elif "marca" in col_normalizado:
                mapeo[col] = "marca"
            elif "fecha" in col_normalizado:
                mapeo[col] = "fecha"
            elif "canal" in col_normalizado:
                mapeo[col] = "canal_venta"
            elif "cedula" in col_normalizado or "cédula" in col_normalizado:
                mapeo[col] = "cedula"
            elif "nombre" in col_normalizado or "razon" in col_normalizado:
                mapeo[col] = "nombre_razon_social"
            elif "telefono" in col_normalizado or "teléfono" in col_normalizado:
                mapeo[col] = "telefono"
            elif "correo" in col_normalizado or "email" in col_normalizado:
                mapeo[col] = "correo_electronico"
            elif "articulo" in col_normalizado and "descripcion" not in col_normalizado:
                mapeo[col] = "articulo"
            elif "descripcion" in col_normalizado:
                mapeo[col] = "descripcion_articulo"
            elif "cantidad" in col_normalizado:
                mapeo[col] = "cantidad"
            elif "divisa" in col_normalizado or "venta" in col_normalizado:
                mapeo[col] = "divisas_venta"
            elif "categoria" in col_normalizado or "categoría" in col_normalizado:
                mapeo[col] = "categoria"
            elif "numero" in col_normalizado or "número" in col_normalizado:
                mapeo[col] = "numero"
        
        return df.rename(columns=mapeo)
    
    def _limpiar_cedula(self, cedula) -> str:
        """Limpia y normaliza el formato de cédula."""
        if pd.isna(cedula):
            return ""
        
        cedula_str = str(cedula).strip()
        # Remover caracteres no deseados pero mantener V-, E-, J-, etc.
        cedula_str = cedula_str.replace(" ", "").replace(".", "")
        
        return cedula_str
    
    def _parsear_fecha(self, fecha) -> datetime:
        """Parsea diferentes formatos de fecha."""
        if pd.isna(fecha):
            return datetime.now()
        
        if isinstance(fecha, datetime):
            return fecha
        
        if isinstance(fecha, pd.Timestamp):
            return fecha.to_pydatetime()
        
        # Intentar parsear string
        fecha_str = str(fecha).strip()
        formatos = [
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y/%m/%d",
            "%d/%m/%y",
            "%m/%d/%Y",
        ]
        
        for fmt in formatos:
            try:
                return datetime.strptime(fecha_str, fmt)
            except ValueError:
                continue
        
        return datetime.now()
    
    async def procesar_archivo(
        self,
        contenido: bytes,
        nombre_archivo: str
    ) -> Tuple[int, int, int, List[str]]:
        """
        Procesa un archivo Excel o CSV de transacciones.
        
        Args:
            contenido: Bytes del archivo
            nombre_archivo: Nombre del archivo para detectar formato
            
        Returns:
            Tuple[registros_procesados, clientes_actualizados, usuarios_actualizados, errores]
        """
        errores = []
        registros_procesados = 0
        clientes_actualizados = set()
        usuarios_actualizados = set()
        
        try:
            # Leer archivo según extensión
            if nombre_archivo.lower().endswith(".csv"):
                df = pd.read_csv(BytesIO(contenido), encoding="utf-8")
            else:
                df = pd.read_excel(BytesIO(contenido))
            
            # Normalizar columnas
            df = self._normalizar_columnas(df)
            
            # Verificar columnas requeridas
            columnas_requeridas = ["cedula", "nombre_razon_social", "divisas_venta", "fecha"]
            columnas_faltantes = [col for col in columnas_requeridas if col not in df.columns]
            
            if columnas_faltantes:
                errores.append(f"Columnas faltantes: {', '.join(columnas_faltantes)}")
                return 0, 0, 0, errores
            
            # Procesar cada fila
            for idx, row in df.iterrows():
                try:
                    cedula = self._limpiar_cedula(row.get("cedula"))
                    
                    if not cedula:
                        errores.append(f"Fila {idx + 2}: Cédula vacía o inválida")
                        continue
                    
                    # Parsear valores
                    divisas_venta = float(row.get("divisas_venta", 0) or 0)
                    cantidad = int(row.get("cantidad", 1) or 1)
                    fecha = self._parsear_fecha(row.get("fecha"))
                    
                    # Calcular puntos: $1 = 1 punto
                    puntos_generados = int(divisas_venta)
                    
                    nombre = str(row.get("nombre_razon_social", "") or "")
                    telefono = str(row.get("telefono", "") or "") if pd.notna(row.get("telefono")) else None
                    correo = str(row.get("correo_electronico", "") or "") if pd.notna(row.get("correo_electronico")) else None
                    tienda = str(row.get("tienda", "") or "")
                    articulo = str(row.get("articulo", "") or "")
                    
                    # Crear documento de transacción
                    transaccion = {
                        "tienda": tienda,
                        "marca": str(row.get("marca", "") or ""),
                        "fecha": fecha,
                        "canal_venta": str(row.get("canal_venta", "") or ""),
                        "cedula": cedula,
                        "nombre_razon_social": nombre,
                        "telefono": telefono,
                        "correo_electronico": correo,
                        "articulo": articulo,
                        "descripcion_articulo": str(row.get("descripcion_articulo", "") or ""),
                        "cantidad": cantidad,
                        "divisas_venta": divisas_venta,
                        "categoria": str(row.get("categoria", "") or ""),
                        "numero": str(row.get("numero", "") or ""),
                        "puntos_generados": puntos_generados,
                    }
                    
                    # Insertar transacción y obtener ID
                    result = await self.db.transacciones.insert_one(transaccion)
                    transaccion_id = str(result.inserted_id)
                    registros_procesados += 1
                    
                    # Actualizar usuario con la transacción
                    try:
                        await self.user_service.agregar_transaccion_a_usuario(
                            cedula=cedula,
                            nombre=nombre,
                            telefono=telefono,
                            correo=correo,
                            transaccion_id=transaccion_id,
                            fecha=fecha,
                            tienda=tienda,
                            articulo=articulo,
                            cantidad=cantidad,
                            monto=divisas_venta,
                            puntos_generados=puntos_generados
                        )
                        usuarios_actualizados.add(cedula)
                    except Exception as e:
                        errores.append(f"Error actualizando usuario {cedula}: {str(e)}")
                    
                    # Marcar cliente para actualizar (compatibilidad)
                    clientes_actualizados.add((cedula, nombre, telefono, correo))
                    
                except Exception as e:
                    errores.append(f"Fila {idx + 2}: {str(e)}")
            
            # Actualizar clientes (colección legacy)
            for cedula, nombre, telefono, correo in clientes_actualizados:
                try:
                    await self.puntos_service.actualizar_cliente(
                        cedula=cedula,
                        nombre=nombre,
                        telefono=telefono,
                        correo=correo,
                    )
                except Exception as e:
                    errores.append(f"Error actualizando cliente {cedula}: {str(e)}")
            
        except Exception as e:
            errores.append(f"Error procesando archivo: {str(e)}")
        
        return registros_procesados, len(clientes_actualizados), len(usuarios_actualizados), errores
