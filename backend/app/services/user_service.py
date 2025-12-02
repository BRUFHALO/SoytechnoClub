from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.models.user import User, UserPuntosResponse, TransaccionResumen, NivelFidelizacion


class UserService:
    """Servicio para gestión de usuarios y sus puntos."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    @staticmethod
    def calcular_nivel(compras_totales: int, total_gastado: float) -> NivelFidelizacion:
        """
        Calcula el nivel de fidelización según las reglas:
        - Kilobytes: Sin historial de compra
        - MegaBytes: ≥3 compras o ≥$500 gastado
        - GigaBytes: ≥8 compras o ≥$1500 gastado
        - TeraBytes: ≥13 compras o ≥$3000 gastado
        """
        if compras_totales == 0 and total_gastado == 0:
            return "Kilobytes"
        
        if total_gastado >= 3000 or compras_totales >= 13:
            return "TeraBytes"
        elif total_gastado >= 1500 or compras_totales >= 8:
            return "GigaBytes"
        elif total_gastado >= 500 or compras_totales >= 3:
            return "MegaBytes"
        
        return "Kilobytes"
    
    @staticmethod
    def calcular_puntos_vigentes(
        transacciones: List[TransaccionResumen],
        fecha_suscripcion: datetime
    ) -> int:
        """
        Calcula los puntos vigentes (dentro del año de suscripción).
        Los puntos tienen vigencia de 1 año desde la fecha de suscripción.
        """
        ahora = datetime.now()
        
        # Calcular el inicio del período vigente actual
        años_transcurridos = (ahora - fecha_suscripcion).days // 365
        inicio_periodo = fecha_suscripcion + timedelta(days=365 * años_transcurridos)
        fin_periodo = inicio_periodo + timedelta(days=365)
        
        # Si ya pasó el período, reiniciar
        if ahora > fin_periodo:
            return 0
        
        # Sumar puntos de transacciones dentro del período vigente
        puntos = 0
        for tx in transacciones:
            if inicio_periodo <= tx.fecha < fin_periodo:
                puntos += tx.puntos_generados
        
        return puntos
    
    @staticmethod
    def calcular_puntos_canje(puntos_vigentes: int) -> Tuple[int, float]:
        """
        Calcula puntos listos para canje y su equivalente en dólares.
        - Mínimo 500 puntos para canjear
        - 50 puntos = $1
        
        Returns:
            Tuple[puntos_listos_canje, dolares_canjeables]
        """
        if puntos_vigentes < 500:
            return 0, 0.0
        
        puntos_listos = (puntos_vigentes // 500) * 500
        dolares = puntos_listos / 50
        
        return puntos_listos, dolares
    
    async def agregar_transaccion_a_usuario(
        self,
        cedula: str,
        nombre: str,
        telefono: Optional[str],
        correo: Optional[str],
        transaccion_id: str,
        fecha: datetime,
        tienda: str,
        articulo: str,
        cantidad: int,
        monto: float,
        puntos_generados: int
    ) -> dict:
        """
        Agrega una transacción a un usuario existente o crea uno nuevo.
        Recalcula puntos y nivel automáticamente.
        """
        # Buscar usuario existente
        user = await self.db.users.find_one({"cedula": cedula})
        
        # Crear resumen de transacción
        tx_resumen = {
            "transaccion_id": transaccion_id,
            "fecha": fecha,
            "tienda": tienda,
            "articulo": articulo,
            "cantidad": cantidad,
            "monto": monto,
            "puntos_generados": puntos_generados
        }
        
        if user:
            # Usuario existe - agregar transacción y actualizar
            transacciones = user.get("transacciones", [])
            
            # Verificar si la transacción ya existe (evitar duplicados)
            tx_ids = [tx.get("transaccion_id") for tx in transacciones]
            if transaccion_id not in tx_ids:
                transacciones.append(tx_resumen)
            
            # Recalcular totales
            total_gastado = sum(tx.get("monto", 0) for tx in transacciones)
            compras_totales = len(transacciones)
            puntos_totales = sum(tx.get("puntos_generados", 0) for tx in transacciones)
            
            # Convertir a objetos TransaccionResumen para cálculo
            tx_objetos = [
                TransaccionResumen(
                    transaccion_id=tx["transaccion_id"],
                    fecha=tx["fecha"] if isinstance(tx["fecha"], datetime) else datetime.fromisoformat(str(tx["fecha"])),
                    tienda=tx["tienda"],
                    articulo=tx["articulo"],
                    cantidad=tx["cantidad"],
                    monto=tx["monto"],
                    puntos_generados=tx["puntos_generados"]
                )
                for tx in transacciones
            ]
            
            fecha_suscripcion = user.get("fecha_suscripcion", datetime.now())
            puntos_vigentes = self.calcular_puntos_vigentes(tx_objetos, fecha_suscripcion)
            puntos_listos_canje, dolares_canjeables = self.calcular_puntos_canje(puntos_vigentes)
            nivel = self.calcular_nivel(compras_totales, total_gastado)
            
            # Actualizar usuario
            await self.db.users.update_one(
                {"cedula": cedula},
                {
                    "$set": {
                        "nombre": nombre,
                        "telefono": telefono,
                        "correo": correo,
                        "transacciones": transacciones,
                        "total_gastado": total_gastado,
                        "compras_totales": compras_totales,
                        "puntos_totales": puntos_totales,
                        "puntos_vigentes": puntos_vigentes,
                        "puntos_listos_canje": puntos_listos_canje,
                        "dolares_canjeables": dolares_canjeables,
                        "nivel": nivel,
                        "ultima_actualizacion": datetime.now()
                    }
                }
            )
            
        else:
            # Usuario nuevo
            puntos_vigentes = puntos_generados  # Primera transacción
            puntos_listos_canje, dolares_canjeables = self.calcular_puntos_canje(puntos_vigentes)
            nivel = self.calcular_nivel(1, monto)
            
            nuevo_user = {
                "cedula": cedula,
                "nombre": nombre,
                "telefono": telefono,
                "correo": correo,
                "fecha_registro": datetime.now(),
                "fecha_suscripcion": fecha,  # Primera compra = fecha suscripción
                "puntos_totales": puntos_generados,
                "puntos_vigentes": puntos_vigentes,
                "puntos_listos_canje": puntos_listos_canje,
                "dolares_canjeables": dolares_canjeables,
                "nivel": nivel,
                "transacciones": [tx_resumen],
                "total_gastado": monto,
                "compras_totales": 1,
                "ultima_actualizacion": datetime.now()
            }
            
            await self.db.users.insert_one(nuevo_user)
        
        return {"cedula": cedula, "actualizado": True}
    
    async def obtener_user_puntos(self, cedula: str) -> Optional[UserPuntosResponse]:
        """Obtiene información de puntos de un usuario por cédula."""
        user = await self.db.users.find_one({"cedula": cedula})
        
        if not user:
            return None
        
        return UserPuntosResponse(
            cedula=user["cedula"],
            nombre=user["nombre"],
            nivel=user["nivel"],
            puntos_totales=user["puntos_totales"],
            puntos_vigentes=user["puntos_vigentes"],
            puntos_listos_canje=user["puntos_listos_canje"],
            dolares_canjeables=user["dolares_canjeables"],
        )
    
    async def obtener_users_listos_canje(
        self,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[UserPuntosResponse], int]:
        """
        Obtiene lista de usuarios con al menos 500 puntos vigentes.
        """
        skip = (page - 1) * limit
        filtro = {"puntos_vigentes": {"$gte": 500}}
        
        total = await self.db.users.count_documents(filtro)
        
        cursor = self.db.users.find(filtro).sort(
            "puntos_vigentes", -1
        ).skip(skip).limit(limit)
        
        users = []
        async for user in cursor:
            users.append(UserPuntosResponse(
                cedula=user["cedula"],
                nombre=user["nombre"],
                nivel=user["nivel"],
                puntos_totales=user["puntos_totales"],
                puntos_vigentes=user["puntos_vigentes"],
                puntos_listos_canje=user["puntos_listos_canje"],
                dolares_canjeables=user["dolares_canjeables"],
            ))
        
        return users, total
    
    async def obtener_user_completo(self, cedula: str) -> Optional[dict]:
        """Obtiene información completa de un usuario incluyendo transacciones."""
        return await self.db.users.find_one({"cedula": cedula})
