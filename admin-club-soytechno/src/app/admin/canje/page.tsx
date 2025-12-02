"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NivelBadge } from "@/components/ui/Badge";
import {
  Gift,
  Search,
  Download,
  RefreshCw,
  Users,
  DollarSign,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { API_BASE_URL, formatNumber, formatCurrency } from "@/lib/utils";
import { ClientePuntosResponse, ClientesListosCanje, NivelFidelizacion } from "@/types";

export default function CanjePage() {
  const [clientes, setClientes] = useState<ClientePuntosResponse[]>([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [nivelFilter, setNivelFilter] = useState<NivelFidelizacion | "todos">("todos");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchClientes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/puntos/listos-canje?${params}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data: ClientesListosCanje = await response.json();
      setClientes(data.clientes);
      setTotalClientes(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      // Datos de ejemplo para desarrollo
      setClientes([
        {
          cedula: "V-12345678",
          nombre: "Juan Pérez",
          nivel: "GigaBytes",
          puntos_totales: 4200,
          puntos_vigentes: 3800,
          puntos_listos_canje: 3500,
          dolares_canjeables: 70,
        },
        {
          cedula: "V-87654321",
          nombre: "María García",
          nivel: "MegaBytes",
          puntos_totales: 1500,
          puntos_vigentes: 1200,
          puntos_listos_canje: 1000,
          dolares_canjeables: 20,
        },
        {
          cedula: "V-11223344",
          nombre: "Carlos López",
          nivel: "TeraBytes",
          puntos_totales: 12000,
          puntos_vigentes: 8500,
          puntos_listos_canje: 8500,
          dolares_canjeables: 170,
        },
        {
          cedula: "V-55667788",
          nombre: "Ana Rodríguez",
          nivel: "GigaBytes",
          puntos_totales: 2800,
          puntos_vigentes: 2500,
          puntos_listos_canje: 2500,
          dolares_canjeables: 50,
        },
        {
          cedula: "V-99887766",
          nombre: "Pedro Martínez",
          nivel: "MegaBytes",
          puntos_totales: 980,
          puntos_vigentes: 750,
          puntos_listos_canje: 500,
          dolares_canjeables: 10,
        },
      ]);
      setTotalClientes(5);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [page]);

  // Filtrar clientes localmente
  const filteredClientes = clientes.filter((cliente) => {
    const matchesSearch =
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cedula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNivel = nivelFilter === "todos" || cliente.nivel === nivelFilter;
    return matchesSearch && matchesNivel;
  });

  // Calcular totales
  const totalDolaresCanjeables = filteredClientes.reduce(
    (sum, c) => sum + c.dolares_canjeables,
    0
  );
  const totalPuntosListos = filteredClientes.reduce(
    (sum, c) => sum + c.puntos_listos_canje,
    0
  );

  const totalPages = Math.ceil(totalClientes / limit);

  const handleExportCSV = () => {
    const headers = ["Cédula", "Nombre", "Nivel", "Puntos Vigentes", "Puntos Canje", "$ Canjeables"];
    const rows = filteredClientes.map((c) => [
      c.cedula,
      c.nombre,
      c.nivel,
      c.puntos_vigentes,
      c.puntos_listos_canje,
      c.dolares_canjeables,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `clientes_listos_canje_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header
        title="Canje de Puntos"
        subtitle="Clientes con puntos disponibles para canjear"
      />

      <div className="p-6">
        {/* KPIs */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Clientes Elegibles</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(filteredClientes.length)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Puntos Listos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(totalPuntosListos)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total $ Canjeables</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(totalDolaresCanjeables)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y acciones */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 gap-3">
                {/* Búsqueda */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre o cédula..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 pl-10 pr-4 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                {/* Filtro por nivel */}
                <select
                  value={nivelFilter}
                  onChange={(e) => setNivelFilter(e.target.value as NivelFidelizacion | "todos")}
                  className="h-10 rounded-lg border border-slate-300 px-3 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="todos">Todos los niveles</option>
                  <option value="Kilobytes">Kilobytes</option>
                  <option value="MegaBytes">MegaBytes</option>
                  <option value="GigaBytes">GigaBytes</option>
                  <option value="TeraBytes">TeraBytes</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchClientes} isLoading={isLoading}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </Button>
                <Button variant="secondary" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Listos para Canje</CardTitle>
            <CardDescription>
              Clientes con al menos 500 puntos vigentes (mínimo para canje)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                ⚠️ Mostrando datos de ejemplo. {error}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Nivel
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Puntos Vigentes
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      Puntos Canje
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-slate-600">
                      $ Canjeables
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No se encontraron clientes con los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    filteredClientes.map((cliente) => (
                      <tr key={cliente.cedula} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{cliente.nombre}</p>
                          <p className="text-xs text-slate-500">{cliente.cedula}</p>
                        </td>
                        <td className="px-4 py-3">
                          <NivelBadge nivel={cliente.nivel} />
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          {formatNumber(cliente.puntos_vigentes)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="rounded bg-amber-100 px-2 py-1 font-medium text-amber-700">
                            {formatNumber(cliente.puntos_listos_canje)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-green-600">
                            {formatCurrency(cliente.dolares_canjeables)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  Mostrando {(page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, totalClientes)} de {totalClientes} clientes
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nota informativa */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-sm">
              <Gift className="h-5 w-5 flex-shrink-0 text-cyan-600" />
              <div>
                <p className="font-medium text-slate-900">Reglas de Canje</p>
                <ul className="mt-1 list-inside list-disc text-slate-600">
                  <li>Mínimo 500 puntos para generar un cupón ($10)</li>
                  <li>Cada 50 puntos = $1 acumulable</li>
                  <li>Se requiere compra mínima de $80 para usar el cupón</li>
                  <li>Los puntos tienen vigencia de 1 año desde la suscripción</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
