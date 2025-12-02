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
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { NivelFidelizacion } from "@/types";

// Datos de ejemplo para el dashboard (se reemplazarán con datos reales del API)
const mockStats = {
  totalClientes: 1250,
  clientesNuevosMes: 85,
  puntosTotales: 2450000,
  puntosCanjeados: 180000,
  clientesListosCanje: 156,
  dolaresDisponiblesCanje: 3120,
};

const mockClientesPorNivel = [
  { nivel: "Kilobytes" as NivelFidelizacion, cantidad: 650, porcentaje: 52 },
  { nivel: "MegaBytes" as NivelFidelizacion, cantidad: 380, porcentaje: 30.4 },
  { nivel: "GigaBytes" as NivelFidelizacion, cantidad: 170, porcentaje: 13.6 },
  { nivel: "TeraBytes" as NivelFidelizacion, cantidad: 50, porcentaje: 4 },
];

const mockUltimosClientes = [
  { cedula: "V-12345678", nombre: "Juan Pérez", nivel: "GigaBytes" as NivelFidelizacion, puntos: 3500 },
  { cedula: "V-87654321", nombre: "María García", nivel: "MegaBytes" as NivelFidelizacion, puntos: 1200 },
  { cedula: "V-11223344", nombre: "Carlos López", nivel: "TeraBytes" as NivelFidelizacion, puntos: 8500 },
  { cedula: "V-55667788", nombre: "Ana Rodríguez", nivel: "Kilobytes" as NivelFidelizacion, puntos: 250 },
  { cedula: "V-99887766", nombre: "Pedro Martínez", nivel: "MegaBytes" as NivelFidelizacion, puntos: 980 },
];

export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Resumen del programa de fidelización Club Soytechno"
      />

      <div className="p-6">
        {/* KPIs principales */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Clientes</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(mockStats.totalClientes)}
                </p>
                <p className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +{mockStats.clientesNuevosMes} este mes
                </p>
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
                  {formatNumber(mockStats.puntosTotales)}
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
                  {formatNumber(mockStats.clientesListosCanje)}
                </p>
                <p className="text-xs text-slate-500">clientes con ≥500 pts</p>
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
                  {formatCurrency(mockStats.dolaresDisponiblesCanje)}
                </p>
                <p className="text-xs text-slate-500">disponibles en cupones</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sección de distribución y últimos clientes */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Distribución por nivel */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Nivel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClientesPorNivel.map((item) => (
                  <div key={item.nivel} className="flex items-center gap-4">
                    <NivelBadge nivel={item.nivel} className="w-24 justify-center" />
                    <div className="flex-1">
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-600">
                          {formatNumber(item.cantidad)} clientes
                        </span>
                        <span className="font-medium text-slate-900">
                          {item.porcentaje}%
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

          {/* Últimos clientes actualizados */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Clientes Actualizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left font-medium text-slate-500">
                        Cliente
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
                    {mockUltimosClientes.map((cliente) => (
                      <tr key={cliente.cedula}>
                        <td className="py-3">
                          <p className="font-medium text-slate-900">
                            {cliente.nombre}
                          </p>
                          <p className="text-xs text-slate-500">
                            {cliente.cedula}
                          </p>
                        </td>
                        <td className="py-3">
                          <NivelBadge nivel={cliente.nivel} />
                        </td>
                        <td className="py-3 text-right font-medium text-slate-900">
                          {formatNumber(cliente.puntos)}
                        </td>
                      </tr>
                    ))}
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
