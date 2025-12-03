import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API base URL - producción con fallback a local
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://soytechnoclub.onrender.com";
export const API_BASE_URL_LOCAL = process.env.NEXT_PUBLIC_API_URL_LOCAL || "http://localhost:8000";

// Función para hacer fetch con fallback
export async function fetchWithFallback(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok && response.status >= 500) {
      throw new Error("Server error");
    }
    return response;
  } catch (error) {
    // Fallback a localhost si falla producción
    console.warn("Fallback to local API:", error);
    return fetch(`${API_BASE_URL_LOCAL}${endpoint}`, options);
  }
}

// Formateador de moneda
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// Formateador de números
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-VE").format(num);
}
