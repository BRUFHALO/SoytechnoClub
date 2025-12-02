// Tipos para el sistema de fidelización Club Soytechno

export type NivelFidelizacion = "Kilobytes" | "MegaBytes" | "GigaBytes" | "TeraBytes";

export interface Cliente {
  _id?: string;
  cedula: string;
  nombre: string;
  telefono?: string;
  correo?: string;
  fecha_suscripcion: string;
  nivel: NivelFidelizacion;
  total_gastado: number;
  compras_totales: number;
  puntos_totales: number;
  puntos_vigentes: number;
  puntos_listos_canje: number;
  dolares_canjeables: number;
  ultima_actualizacion?: string;
}

export interface ClientePuntosResponse {
  cedula: string;
  nombre: string;
  nivel: NivelFidelizacion;
  puntos_totales: number;
  puntos_vigentes: number;
  puntos_listos_canje: number;
  dolares_canjeables: number;
}

export interface ClientesListosCanje {
  total: number;
  clientes: ClientePuntosResponse[];
}

export interface UploadResponse {
  registros_procesados: number;
  clientes_actualizados: number;
  errores: string[];
}

export interface Transaccion {
  _id?: string;
  tienda: string;
  marca: string;
  fecha: string;
  canal_venta: string;
  cedula: string;
  nombre_razon_social: string;
  telefono?: string;
  correo_electronico?: string;
  articulo: string;
  descripcion_articulo: string;
  cantidad: number;
  divisas_venta: number;
  categoria: string;
  numero: string;
  puntos_generados: number;
}

// Información de niveles para mostrar en UI
export const NIVELES_INFO: Record<NivelFidelizacion, {
  orden: number;
  color: string;
  bgColor: string;
  descripcion: string;
}> = {
  Kilobytes: {
    orden: 1,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
    descripcion: "Nivel Básico",
  },
  MegaBytes: {
    orden: 2,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    descripcion: "Nivel Intermedio",
  },
  GigaBytes: {
    orden: 3,
    color: "text-purple-700",
    bgColor: "bg-purple-100",
    descripcion: "Nivel Avanzado",
  },
  TeraBytes: {
    orden: 4,
    color: "text-amber-700",
    bgColor: "bg-amber-100",
    descripcion: "Nivel Pro",
  },
};
