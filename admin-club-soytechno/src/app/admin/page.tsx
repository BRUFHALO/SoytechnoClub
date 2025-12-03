"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { NivelBadge } from "@/components/ui/Badge";
import {
  Users,
  TrendingUp,
  Gift,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL, formatNumber, formatCurrency } from "@/lib/utils";
import { NivelFidelizacion, UserListItem, UserPuntosResponse } from "@/types";

interface DashboardStats {
  totalUsuarios: number;
  puntosTotales: number;
  usuariosListosCanje: number;
  dolaresDisponiblesCanje: number;
}

interface NivelStats {
  nivel: NivelFidelizacion;
  cantidad: number;
  porcentaje: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    puntosTotales: 0,
    usuariosListosCanje: 0,
    dolaresDisponiblesCanje: 0,
  });
  const [usuariosPorNivel, setUsuariosPorNivel] = useState<NivelStats[]>([]);
  const [ultimosUsuarios, setUltimosUsuarios] = useState<UserListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Obtener todos los usuarios
      const usersRes = await fetch(`${API_BASE_URL}/api/users/?page=1&limit=500`);
      const usersData = await usersRes.json();
      
      // Obtener usuarios listos para canje
      const canjeRes = await fetch(`${API_BASE_URL}/api/users/listos-canje/?page=1&limit=100`);
      const canjeData = await canjeRes.json();

      const usuarios: UserListItem[] = usersData.users || [];
      const usuariosCanje: UserPuntosResponse[] = canjeData.users || [];

      // Calcular estadísticas
      const totalPuntos = usuarios.reduce((sum, u) => sum + u.puntos_totales, 0);
      const totalDolaresCanje = usuariosCanje.reduce((sum, u) => sum + u.dolares_canjeables, 0);

      setStats({
        totalUsuarios: usersData.total || 0,
        puntosTotales: totalPuntos,
        usuariosListosCanje: canjeData.total || 0,
        dolaresDisponiblesCanje: totalDolaresCanje,
      });

      // Calcular distribución por nivel
      const niveles: NivelFidelizacion[] = ["Kilobytes", "MegaBytes", "GigaBytes", "TeraBytes"];
      const nivelCounts = niveles.map(nivel => ({
        nivel,
        cantidad: usuarios.filter(u => u.nivel === nivel).length,
        porcentaje: usuarios.length > 0 
          ? (usuarios.filter(u => u.nivel === nivel).length / usuarios.length) * 100 
          : 0,
      }));
      setUsuariosPorNivel(nivelCounts);

      // Últimos usuarios (ordenados por puntos)
      const topUsuarios = [...usuarios]
        .sort((a, b) => b.puntos_vigentes - a.puntos_vigentes)
        .slice(0, 5);
      setUltimosUsuarios(topUsuarios);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Resumen del programa de fidelización Club Soytechno"
      />

      <div className="p-6">
        {/* Loading state */}
        {isLoading && (
          <div className="mb-6 flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-cyan-600" />
            <span className="ml-2 text-slate-500">Cargando datos...</span>
          </div>
        )}

        {/* KPIs principales */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Usuarios</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalUsuarios)}
                </p>
                <p className="text-xs text-slate-500">registrados en el programa</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Puntos Acumulados</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.puntosTotales)}
                </p>
                <p className="text-xs text-slate-500">TechnoBits totales</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Listos para Canje</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.usuariosListosCanje)}
                </p>
                <p className="text-xs text-slate-500">usuarios con ≥500 pts</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">$ Canjeables</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.dolaresDisponiblesCanje)}
                </p>
                <p className="text-xs text-slate-500">disponibles en cupones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de distribución y top usuarios */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribución por nivel */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Nivel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usuariosPorNivel.map((item) => (
                  <div key={item.nivel} className="flex items-center gap-4">
                    <NivelBadge nivel={item.nivel} className="w-24 justify-center" />
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-600">
                          {formatNumber(item.cantidad)} usuarios
                        </span>
                        <span className="font-medium text-slate-900">
                          {item.porcentaje.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-cyan-500"
                          style={{ width: `${item.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top usuarios por puntos */}
          <Card>
            <CardHeader>
              <CardTitle>Top Usuarios por Puntos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Usuario
                      </th>
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Nivel
                      </th>
                      <th className="pb-3 text-right font-medium text-slate-500">
                        Puntos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ultimosUsuarios.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-500">
                          No hay usuarios registrados
                        </td>
                      </tr>
                    ) : (
                      ultimosUsuarios.map((usuario) => (
                        <tr key={usuario.cedula}>
                          <td className="py-3">
                            <p className="font-medium text-slate-900">
                              {usuario.nombre}
                            </p>
                            <p className="text-xs text-slate-500">
                              {usuario.cedula}
                            </p>
                          </td>
                          <td className="py-3">
                            <NivelBadge nivel={usuario.nivel} />
                          </td>
                          <td className="py-3 text-right font-medium text-slate-900">
                            {formatNumber(usuario.puntos_vigentes)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información de reglas */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reglas del Programa TechnoBits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Acumulación</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-600">$1 = 1 punto</p>
                  <p className="text-xs text-slate-500">En tienda física y online</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Conversión</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-600">50 pts = $1</p>
                  <p className="text-xs text-slate-500">Para canje en cupones</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Mínimo Canje</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-600">500 pts</p>
                  <p className="text-xs text-slate-500">Equivalente a $10</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-900">Vigencia</p>
                  <p className="mt-1 text-2xl font-bold text-cyan-600">1 año</p>
                  <p className="text-xs text-slate-500">Desde fecha de suscripción</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
