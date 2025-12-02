"""
Script de inicio para el backend Club Soytechno.

Uso:
    python run.py
    python run.py --port 8080
    python run.py --host 0.0.0.0 --port 8000
"""

import uvicorn
import argparse
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()


def main():
    parser = argparse.ArgumentParser(description="Club Soytechno API Server")
    
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host para el servidor (default: 127.0.0.1)"
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Puerto para el servidor (default: 8000)"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        default=True,
        help="Activar auto-reload en desarrollo (default: True)"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Número de workers (default: 1, no usar con --reload)"
    )
    parser.add_argument(
        "--prod",
        action="store_true",
        help="Modo producción (desactiva reload, usa múltiples workers)"
    )
    
    args = parser.parse_args()
    
    # Configuración según modo
    if args.prod:
        reload = False
        workers = args.workers if args.workers > 1 else 4
        log_level = "info"
    else:
        reload = args.reload
        workers = 1
        log_level = "debug"
    
    print("=" * 50)
    print("🚀 Club Soytechno API")
    print("=" * 50)
    print(f"📍 Host: {args.host}")
    print(f"🔌 Puerto: {args.port}")
    print(f"🔄 Auto-reload: {reload}")
    print(f"👷 Workers: {workers}")
    print(f"📝 Log level: {log_level}")
    print("=" * 50)
    print(f"🌐 API: http://{args.host}:{args.port}")
    print(f"📚 Docs: http://{args.host}:{args.port}/docs")
    print("=" * 50)
    
    uvicorn.run(
        "app.main:app",
        host=args.host,
        port=args.port,
        reload=reload,
        workers=workers if not reload else 1,
        log_level=log_level,
    )


if __name__ == "__main__":
    main()
