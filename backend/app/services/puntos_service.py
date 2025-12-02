from datetime import datetime, timedelta
from typing import Optional, List, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models import Cliente, ClientePuntosResponse
from app.models.cliente import NivelFidelizacion


class PuntosService:
    """Servicio para cálculo de puntos y niveles de fidelización."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    @staticmethod
    def calcular_nivel(compras_totales: int, total_gastado: float) -> NivelFidelizacion:
        """
        Calcula el nivel de fidelización según las reglas:
        - Kilobytes: Sin historial de compra
        - MegaBytes: ≥3 compras o ≥$500 gastado
        - GigaBytes: Ser MegaBytes + 5 compras en ese nivel o ≥$1500 total
        - TeraBytes: Ser GigaBytes + 5 compras en ese nivel o ≥$3000 total
        """
        if compras_totales == 0 and total_gastado == 0:
            return "Kilobytes"
        
        # Verificar condiciones de nivel (simplificado con totales acumulados)
        if total_gastado >= 3000 or compras_totales >= 13:
            return "TeraBytes"
        elif total_gastado >= 1500 or compras_totales >= 8:
            return "GigaBytes"
        elif total_gastado >= 500 or compras_totales >= 3:
            return "MegaBytes"
        
        return "Kilobytes"
    
    @staticmethod
    def calcular_puntos_vigentes(
        transacciones: List[dict],
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
            fecha_tx = tx.get("fecha")
            if isinstance(fecha_tx, str):
                fecha_tx = datetime.fromisoformat(fecha_tx)
            
            if inicio_periodo <= fecha_tx < fin_periodo:
                puntos += tx.get("puntos_generados", 0)
        
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
        
        # Múltiplos de 500 (o de 50 para el cálculo de dólares)
        puntos_listos = (puntos_vigentes // 500) * 500
        dolares = puntos_listos / 50
        
        return puntos_listos, dolares
    
    async def actualizar_cliente(
        self,
        cedula: str,
        nombre: str,
        telefono: Optional[str] = None,
        correo: Optional[str] = None
    ) -> dict:
        """
        Actualiza o crea un cliente y recalcula sus puntos y nivel.
        """
        # Buscar cliente existente
        cliente_existente = await self.db.clientes.find_one({"cedula": cedula})
        
        # Obtener todas las transacciones del cliente
        transacciones = await self.db.transacciones.find(
            {"cedula": cedula}
        ).to_list(length=None)
        
        # Calcular totales
        total_gastado = sum(tx.get("divisas_venta", 0) for tx in transacciones)
        compras_totales = len(transacciones)
        puntos_totales = sum(tx.get("puntos_generados", 0) for tx in transacciones)
        
        # Fecha de suscripción (mantener existente o usar la primera transacción)
        if cliente_existente:
            fecha_suscripcion = cliente_existente.get("fecha_suscripcion", datetime.now())
        elif transacciones:
            # Usar la fecha de la primera transacción como fecha de suscripción
            fechas = [tx.get("fecha") for tx in transacciones if tx.get("fecha")]
            fecha_suscripcion = min(fechas) if fechas else datetime.now()
        else:
            fecha_suscripcion = datetime.now()
        
        # Calcular puntos vigentes
        puntos_vigentes = self.calcular_puntos_vigentes(transacciones, fecha_suscripcion)
        
        # Calcular puntos para canje
        puntos_listos_canje, dolares_canjeables = self.calcular_puntos_canje(puntos_vigentes)
        
        # Calcular nivel
        nivel = self.calcular_nivel(compras_totales, total_gastado)
        
        # Preparar documento del cliente
        cliente_doc = {
            "cedula": cedula,
            "nombre": nombre,
            "telefono": telefono,
            "correo": correo,
            "fecha_suscripcion": fecha_suscripcion,
            "nivel": nivel,
            "total_gastado": total_gastado,
            "compras_totales": compras_totales,
            "puntos_totales": puntos_totales,
            "puntos_vigentes": puntos_vigentes,
            "puntos_listos_canje": puntos_listos_canje,
            "dolares_canjeables": dolares_canjeables,
            "ultima_actualizacion": datetime.now(),
        }
        
        # Upsert (insertar o actualizar)
        await self.db.clientes.update_one(
            {"cedula": cedula},
            {"$set": cliente_doc},
            upsert=True
        )
        
        return cliente_doc
    
    async def obtener_cliente_puntos(self, cedula: str) -> Optional[ClientePuntosResponse]:
        """Obtiene información de puntos de un cliente por cédula."""
        cliente = await self.db.clientes.find_one({"cedula": cedula})
        
        if not cliente:
            return None
        
        return ClientePuntosResponse(
            cedula=cliente["cedula"],
            nombre=cliente["nombre"],
            nivel=cliente["nivel"],
            puntos_totales=cliente["puntos_totales"],
            puntos_vigentes=cliente["puntos_vigentes"],
            puntos_listos_canje=cliente["puntos_listos_canje"],
            dolares_canjeables=cliente["dolares_canjeables"],
        )
    
    async def obtener_clientes_listos_canje(
        self,
        page: int = 1,
        limit: int = 10
    ) -> Tuple[List[ClientePuntosResponse], int]:
        """
        Obtiene lista de clientes con al menos 500 puntos vigentes.
        
        Returns:
            Tuple[lista_clientes, total]
        """
        skip = (page - 1) * limit
        
        # Filtrar clientes con puntos vigentes >= 500
        filtro = {"puntos_vigentes": {"$gte": 500}}
        
        # Contar total
        total = await self.db.clientes.count_documents(filtro)
        
        # Obtener página
        cursor = self.db.clientes.find(filtro).sort(
            "puntos_vigentes", -1
        ).skip(skip).limit(limit)
        
        clientes = []
        async for cliente in cursor:
            clientes.append(ClientePuntosResponse(
                cedula=cliente["cedula"],
                nombre=cliente["nombre"],
                nivel=cliente["nivel"],
                puntos_totales=cliente["puntos_totales"],
                puntos_vigentes=cliente["puntos_vigentes"],
                puntos_listos_canje=cliente["puntos_listos_canje"],
                dolares_canjeables=cliente["dolares_canjeables"],
            ))
        
        return clientes, total
