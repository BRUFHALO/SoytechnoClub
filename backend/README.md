# Club Soytechno - Backend API

API FastAPI para el programa de fidelización Club Soytechno.

## Requisitos

- Python 3.10+
- MongoDB

## Instalación

1. Crear entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
copy .env.example .env
# Editar .env con tus configuraciones
```

## Ejecutar

```bash
uvicorn app.main:app --reload --port 8000
```

La API estará disponible en: http://localhost:8000

Documentación Swagger: http://localhost:8000/docs

## Endpoints

### Puntos

- `GET /api/puntos/cliente/{cedula}` - Consulta puntos de un cliente
- `GET /api/puntos/listos-canje` - Lista clientes listos para canje (≥500 puntos)

### Data

- `POST /api/data/upload` - Subir archivo Excel/CSV de transacciones

## Estructura del Proyecto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # Aplicación FastAPI
│   ├── config.py         # Configuración
│   ├── database.py       # Conexión MongoDB
│   ├── models/           # Modelos Pydantic
│   │   ├── cliente.py
│   │   ├── transaccion.py
│   │   └── responses.py
│   ├── routers/          # Endpoints
│   │   ├── puntos.py
│   │   └── data.py
│   └── services/         # Lógica de negocio
│       ├── puntos_service.py
│       └── excel_service.py
├── requirements.txt
├── .env.example
└── README.md
```

## Reglas de Negocio

### Sistema de Puntos (TechnoBits)

- **Acumulación**: $1 gastado = 1 punto
- **Conversión**: 50 puntos = $1 canjeable
- **Mínimo canje**: 500 puntos ($10)
- **Vigencia**: 1 año desde fecha de suscripción

### Niveles de Fidelización

| Nivel | Nombre | Condición |
|-------|--------|-----------|
| 1 | Kilobytes | Sin historial de compra |
| 2 | MegaBytes | ≥3 compras o ≥$500 gastado |
| 3 | GigaBytes | ≥8 compras o ≥$1500 gastado |
| 4 | TeraBytes | ≥13 compras o ≥$3000 gastado |
