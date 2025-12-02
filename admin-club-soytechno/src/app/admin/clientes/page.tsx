"use client";

import { useState } from "react";
import Header from "@/components/ui/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NivelBadge } from "@/components/ui/Badge";
import { Search, User, TrendingUp, Gift, DollarSign, Calendar, Phone, Mail } from "lucide-react";
import { API_BASE_URL, formatNumber, formatCurrency } from "@/lib/utils";
import { ClientePuntosResponse, NIVELES_INFO } from "@/types";

export default function ClientesPage() {
  const [cedula, setCedula] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [cliente, setCliente] = useState<ClientePuntosResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cedula.trim()) {
      setError("Ingresa una cédula para buscar");
      return;
    }

    setIsSearching(true);
    setError(null);
    setCliente(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/puntos/cliente/${encodeURIComponent(cedula.trim())}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Cliente no encontrado");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}`);
      }

      const data: ClientePuntosResponse = await response.json();
      setCliente(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar cliente");
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setCedula("");
    setCliente(null);
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
                {(cliente || error) && (
                  <Button type="button" variant="outline" onClick={handleClear}>
                    Limpiar
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Resultado de búsqueda */}
          {cliente && (
            <div className="space-y-6">
              {/* Información del cliente */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    {/* Avatar */}
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cyan-100">
                      <User className="h-10 w-10 text-cyan-600" />
                    </div>

                    {/* Info básica */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {cliente.nombre}
                      </h2>
                      <p className="text-slate-500">{cliente.cedula}</p>
                      <div className="mt-2">
                        <NivelBadge nivel={cliente.nivel} />
                        <span className="ml-2 text-sm text-slate-500">
                          {NIVELES_INFO[cliente.nivel].descripcion}
                        </span>
                      </div>
                    </div>

                    {/* Puntos destacados */}
                    <div className="rounded-lg bg-cyan-50 p-4 text-center">
                      <p className="text-sm text-cyan-700">Puntos Vigentes</p>
                      <p className="text-3xl font-bold text-cyan-600">
                        {formatNumber(cliente.puntos_vigentes)}
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
                          {formatNumber(cliente.puntos_totales)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100">
                        <TrendingUp className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Puntos Vigentes</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatNumber(cliente.puntos_vigentes)}
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
                          {formatNumber(cliente.puntos_listos_canje)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">$ Canjeables</p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(cliente.dolares_canjeables)}
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
                  {cliente.puntos_vigentes >= 500 ? (
                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <Gift className="h-5 w-5" />
                        <p className="font-medium">¡Cliente elegible para canje!</p>
                      </div>
                      <p className="mt-2 text-sm text-green-600">
                        Puede canjear {formatNumber(cliente.puntos_listos_canje)} puntos 
                        por un cupón de {formatCurrency(cliente.dolares_canjeables)}.
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
                          {formatNumber(500 - cliente.puntos_vigentes)} puntos más
                        </span>{" "}
                        para alcanzar el mínimo de canje (500 puntos).
                      </p>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-500">Progreso hacia el canje</span>
                          <span className="font-medium">
                            {((cliente.puntos_vigentes / 500) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-cyan-500"
                            style={{
                              width: `${Math.min((cliente.puntos_vigentes / 500) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
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
                          NIVELES_INFO[cliente.nivel].orden >= NIVELES_INFO[nivel].orden;
                        const isCurrent = cliente.nivel === nivel;

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
            </div>
          )}

          {/* Estado vacío */}
          {!cliente && !error && (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="mx-auto h-16 w-16 text-slate-300" />
                <p className="mt-4 text-lg font-medium text-slate-700">
                  Busca un cliente por su cédula
                </p>
                <p className="text-sm text-slate-500">
                  Ingresa la cédula en el buscador para ver la información de puntos y nivel
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
