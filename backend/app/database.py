from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import get_settings

settings = get_settings()

client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """Conectar a MongoDB al iniciar la aplicación."""
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    # Crear índices
    await db.clientes.create_index("cedula", unique=True)
    await db.transacciones.create_index("cedula")
    await db.transacciones.create_index("fecha")
    
    # Índices para colección users
    await db.users.create_index("cedula", unique=True)
    await db.users.create_index("nivel")
    await db.users.create_index("puntos_vigentes")
    
    print(f"✅ Conectado a MongoDB: {settings.database_name}")


async def close_mongo_connection():
    """Cerrar conexión a MongoDB al detener la aplicación."""
    global client
    if client:
        client.close()
        print("❌ Conexión a MongoDB cerrada")


def get_database() -> AsyncIOMotorDatabase:
    """Obtener instancia de la base de datos."""
    return db
