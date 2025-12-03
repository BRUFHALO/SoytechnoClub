"use client";

import { useState, useEffect } from "react";
import Header from "@/components/ui/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { NivelBadge } from "@/components/ui/Badge";
import {
  Users,
  Search,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { API_BASE_URL, formatNumber, formatCurrency } from "@/lib/utils";
import { UserListItem, UsersListResponse, NivelFidelizacion } from "@/types";
import Link from "next/link";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<UserListItem[]>([]);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [nivelFilter, setNivelFilter] = useState<NivelFidelizacion | "todos">("todos");

  // Paginación
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/users/?${params}`);

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data: UsersListResponse = await response.json();
      setUsuarios(data.users);
      setTotalUsuarios(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
      setUsuarios([]);
      setTotalUsuarios(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [page]);

  // Filtrar usuarios localmente
  const filteredUsuarios = usuarios.filter((usuario) => {
    const matchesSearch =
      usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      usuario.cedula.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNivel = nivelFilter === "todos" || usuario.nivel === nivelFilter;
    return matchesSearch && matchesNivel;
  });

  const totalPages = Math.ceil(totalUsuarios / limit);

  const handleExportCSV = () => {
    const headers = ["Cédula", "Nombre", "Teléfono", "Correo", "Nivel", "Puntos Totales", "Puntos Vigentes", "Total Gastado", "Compras"];
    const rows = filteredUsuarios.map((u) => [
      u.cedula,
      u.nombre,
      u.telefono || "",
      u.correo || "",
      u.nivel,
      u.puntos_totales,
      u.puntos_vigentes,
      u.total_gastado,
      u.compras_totales,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios_club_soytechno_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Estadísticas
  const stats = {
    totalUsuarios: totalUsuarios,
    totalGastado: filteredUsuarios.reduce((sum, u) => sum + u.total_gastado, 0),
    totalPuntos: filteredUsuarios.reduce((sum, u) => sum + u.puntos_totales, 0),
  };

  return (
    <>
      <Header
        title="Usuarios"
        subtitle="Lista completa de usuarios del programa de fidelización"
      />

      <div className="p-6">
        {/* KPIs */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100">
                <Users className="h-6 w-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Usuarios</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalUsuarios)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <span className="text-xl font-bold text-green-600">$</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Gastado</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.totalGastado)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <span className="text-lg font-bold text-purple-600">TB</span>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Puntos</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(stats.totalPuntos)}
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
                <Button variant="outline" onClick={fetchUsuarios} isLoading={isLoading}>
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

        {/* Tabla de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>
              {totalUsuarios} usuarios registrados en el programa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            {isLoading ? (
              <div className="py-12 text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-cyan-600" />
                <p className="mt-2 text-slate-500">Cargando usuarios...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        Usuario
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        Contacto
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-slate-600">
                        Nivel
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">
                        Puntos
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">
                        Gastado
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-slate-600">
                        Compras
                      </th>
                      <th className="px-4 py-3 text-center font-medium text-slate-600">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsuarios.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : (
                      filteredUsuarios.map((usuario) => (
                        <tr key={usuario.cedula} className="hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{usuario.nombre}</p>
                            <p className="text-xs text-slate-500">{usuario.cedula}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-slate-600">{usuario.telefono || "-"}</p>
                            <p className="text-xs text-slate-400">{usuario.correo || "-"}</p>
                          </td>
                          <td className="px-4 py-3">
                            <NivelBadge nivel={usuario.nivel} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-medium text-slate-900">
                              {formatNumber(usuario.puntos_vigentes)}
                            </p>
                            <p className="text-xs text-slate-400">
                              de {formatNumber(usuario.puntos_totales)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-600">
                            {formatCurrency(usuario.total_gastado)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">
                            {usuario.compras_totales}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Link href={`/admin/clientes?cedula=${usuario.cedula}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-500">
                  Mostrando {(page - 1) * limit + 1} -{" "}
                  {Math.min(page * limit, totalUsuarios)} de {totalUsuarios} usuarios
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
      </div>
    </>
  );
}
