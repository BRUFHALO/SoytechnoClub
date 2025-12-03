"use client";

import { useState } from "react";
import Header from "@/components/ui/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NivelBadge } from "@/components/ui/Badge";
import { Search, User as UserIcon, TrendingUp, Gift, DollarSign, Calendar, Phone, Mail, ShoppingBag, Clock } from "lucide-react";
import { API_BASE_URL, formatNumber, formatCurrency } from "@/lib/utils";
import { User, TransaccionResumen, NIVELES_INFO } from "@/types";

export default function ClientesPage() {
  const [cedula, setCedula] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Limpiar cédula: eliminar espacios
  const limpiarCedula = (value: string) => {
    return value.trim().replace(/\s+/g, "");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cedulaLimpia = limpiarCedula(cedula);
    
    if (!cedulaLimpia) {
      setError("Ingresa una cédula para buscar");
      return;
    }

    setIsSearching(true);
    setError(null);
    setUsuario(null);

    try {
      // Usar el nuevo endpoint de usuarios
      const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(cedulaLimpia)}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Usuario no encontrado");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      const data: User = await response.json();
      setUsuario(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar usuario");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setCedula("");
    setUsuario(null);
    setError(null);
  };

  return (
    <>
      <Header
        title="Consulta de Clientes"
        subtitle="Buscar información de puntos y nivel por cédula"
      />

      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          {/* Buscador */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-cyan-600" />
                Buscar Cliente
              </CardTitle>
              <CardDescription>
                Ingresa la cédula del cliente para consultar sus puntos y nivel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Ej: V-12345678"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    error={error || undefined}
                  />
                </div>
                <Button type="submit" isLoading={isSearching}>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
                {(usuario || error) && (
                  <Button type="button" variant="outline" onClick={handleClear}>
                    Limpiar
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Resultado de búsqueda */}
          {usuario && (
            <div className="space-y-6">
              {/* Información del usuario */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    {/* Avatar */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100">
                      <UserIcon className="h-10 w-10 text-cyan-600" />
                    </div>

                    {/* Info básica */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {usuario.nombre}
                      </h2>
                      <p className="text-slate-500">{usuario.cedula}</p>
                      <div className="mt-2">
                        <NivelBadge nivel={usuario.nivel} />
                        <span className="ml-2 text-sm text-slate-500">
                          {NIVELES_INFO[usuario.nivel].descripcion}
                        </span>
                      </div>
                      {/* Contacto */}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                        {usuario.telefono && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {usuario.telefono}
                          </span>
                        )}
                        {usuario.correo && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {usuario.correo}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Puntos destacados */}
                    <div className="rounded-lg bg-cyan-50 p-4 text-center">
                      <p className="text-sm text-cyan-700">Puntos Vigentes</p>
                      <p className="text-3xl font-bold text-cyan-600">
                        {formatNumber(usuario.puntos_vigentes)}
                      </p>
                      <p className="text-xs text-cyan-600">TechnoBits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Métricas de puntos */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Puntos Totales</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatNumber(usuario.puntos_totales)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                        <DollarSign className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Total Gastado</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(usuario.total_gastado)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <Gift className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Listos para Canje</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatNumber(usuario.puntos_listos_canje)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <ShoppingBag className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Compras Totales</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatNumber(usuario.compras_totales)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Estado de canje */}
              <Card>
                <CardHeader>
                  <CardTitle>Estado de Canje</CardTitle>
                </CardHeader>
                <CardContent>
                  {usuario.puntos_vigentes >= 500 ? (
                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <Gift className="h-5 w-5" />
                        <p className="font-medium">¡Cliente elegible para canje!</p>
                      </div>
                      <p className="mt-2 text-sm text-green-600">
                        Puede canjear {formatNumber(usuario.puntos_listos_canje)} puntos 
                        por un cupón de {formatCurrency(usuario.dolares_canjeables)}.
                      </p>
                      <p className="mt-1 text-xs text-green-600">
                        Recuerda: Se requiere una compra mínima de $80 para usar el cupón.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-slate-50 p-4">
                      <p className="text-slate-700">
                        El cliente necesita acumular{" "}
                        <span className="font-bold">
                          {formatNumber(500 - usuario.puntos_vigentes)} puntos más
                        </span>{" "}
                        para alcanzar el mínimo de canje (500 puntos).
                      </p>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-500">Progreso hacia el canje</span>
                          <span className="font-medium">
                            {((usuario.puntos_vigentes / 500) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{
                              width: `${Math.min((usuario.puntos_vigentes / 500) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Historial de transacciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-cyan-600" />
                    Historial de Transacciones
                  </CardTitle>
                  <CardDescription>
                    Últimas {usuario.transacciones?.length || 0} transacciones del cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usuario.transacciones && usuario.transacciones.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50">
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Fecha</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Tienda</th>
                            <th className="px-3 py-2 text-left font-medium text-slate-600">Artículo</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-600">Cant.</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-600">Monto</th>
                            <th className="px-3 py-2 text-right font-medium text-slate-600">Puntos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {usuario.transacciones.slice(0, 10).map((tx, idx) => (
                            <tr key={tx.transaccion_id || idx} className="hover:bg-slate-50">
                              <td className="px-3 py-2 text-slate-600">{tx.fecha}</td>
                              <td className="px-3 py-2 text-slate-900">{tx.tienda}</td>
                              <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate">{tx.articulo}</td>
                              <td className="px-3 py-2 text-right text-slate-600">{tx.cantidad}</td>
                              <td className="px-3 py-2 text-right font-medium text-slate-900">
                                {formatCurrency(tx.monto)}
                              </td>
                              <td className="px-3 py-2 text-right">
                                <span className="rounded bg-cyan-100 px-2 py-0.5 text-cyan-700 font-medium">
                                  +{tx.puntos_generados}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {usuario.transacciones.length > 10 && (
                        <p className="mt-3 text-center text-sm text-slate-500">
                          Mostrando 10 de {usuario.transacciones.length} transacciones
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center py-8 text-slate-500">
                      No hay transacciones registradas
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Progreso de nivel */}
              <Card>
                <CardHeader>
                  <CardTitle>Progreso de Nivel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-2">
                    {(["Kilobytes", "MegaBytes", "GigaBytes", "TeraBytes"] as const).map(
                      (nivel, idx) => {
                        const isCurrentOrPast =
                          NIVELES_INFO[usuario.nivel].orden >= NIVELES_INFO[nivel].orden;
                        const isCurrent = usuario.nivel === nivel;

                        return (
                          <div key={nivel} className="flex flex-1 flex-col items-center">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                                isCurrent
                                  ? "bg-cyan-600 text-white"
                                  : isCurrentOrPast
                                  ? "bg-cyan-100 text-cyan-600"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <p
                              className={`mt-2 text-xs ${
                                isCurrent
                                  ? "font-bold text-cyan-600"
                                  : isCurrentOrPast
                                  ? "text-slate-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {nivel}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Info adicional */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <p className="text-slate-500">Fecha de Suscripción</p>
                      <p className="font-medium text-slate-900">{usuario.fecha_suscripcion}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Última Actualización</p>
                      <p className="font-medium text-slate-900">{usuario.ultima_actualizacion}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">$ Canjeables</p>
                      <p className="font-medium text-green-600">{formatCurrency(usuario.dolares_canjeables)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Estado vacío */}
          {!usuario && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <UserIcon className="mx-auto h-16 w-16 text-slate-300" />
                <p className="mt-4 text-lg font-medium text-slate-700">
                  Busca un cliente por su cédula
                </p>
                <p className="text-sm text-slate-500">
                  Ingresa la cédula en el buscador para ver la información de puntos, nivel y transacciones
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
