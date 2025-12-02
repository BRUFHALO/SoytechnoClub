"""
Script para probar la conexión a MongoDB.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()


async def test_connection():
    # Obtener configuración
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "soyTechno")
    
    print("=" * 50)
    print("🔍 Probando conexión a MongoDB...")
    print("=" * 50)
    
    try:
        # Conectar
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        
        # Verificar conexión con ping
        await client.admin.command('ping')
        print("✅ Conexión exitosa a MongoDB")
        
        # Info de la base de datos
        print(f"📁 Base de datos: {database_name}")
        
        # Listar colecciones
        colecciones = await db.list_collection_names()
        print(f"📂 Colecciones existentes: {colecciones if colecciones else '(ninguna)'}")
        
        # Contar documentos en colecciones principales
        if "users" in colecciones:
            count_users = await db.users.count_documents({})
            print(f"   👤 users: {count_users} documentos")
        
        if "clientes" in colecciones:
            count_clientes = await db.clientes.count_documents({})
            print(f"   👥 clientes: {count_clientes} documentos")
        
        if "transacciones" in colecciones:
            count_tx = await db.transacciones.count_documents({})
            print(f"   📝 transacciones: {count_tx} documentos")
        
        if "club_soytechno" in colecciones:
            count_club = await db.club_soytechno.count_documents({})
            print(f"   🏪 club_soytechno: {count_club} documentos")
        
        print("=" * 50)
        print("✅ Todo listo para usar el backend")
        print("=" * 50)
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False


if __name__ == "__main__":
    asyncio.run(test_connection())
