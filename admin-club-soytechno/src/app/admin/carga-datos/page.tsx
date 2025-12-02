"use client";

import { useState, useRef } from "react";
import Header from "@/components/ui/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from "lucide-react";
import { API_BASE_URL, formatNumber } from "@/lib/utils";
import { UploadResponse } from "@/types";

export default function CargaDatosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar extensión
      const validExtensions = [".csv", ".xlsx", ".xls"];
      const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf("."));
      
      if (!validExtensions.includes(fileExtension)) {
        setError("Formato no válido. Solo se permiten archivos CSV o Excel (.xlsx, .xls)");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const validExtensions = [".csv", ".xlsx", ".xls"];
      const fileExtension = droppedFile.name.toLowerCase().slice(droppedFile.name.lastIndexOf("."));
      
      if (!validExtensions.includes(fileExtension)) {
        setError("Formato no válido. Solo se permiten archivos CSV o Excel (.xlsx, .xls)");
        setFile(null);
        return;
      }

      setFile(droppedFile);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/data/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }

      const result: UploadResponse = await response.json();
      setUploadResult(result);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Header
        title="Carga de Datos"
        subtitle="Importar transacciones desde archivo Excel o CSV"
      />

      <div className="p-6">
        <div className="mx-auto max-w-3xl">
          {/* Información de formato */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-cyan-600" />
                Formato del Archivo
              </CardTitle>
              <CardDescription>
                El archivo debe contener las siguientes columnas en el orden especificado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-slate-50 p-4">
                <code className="text-xs text-slate-700">
                  Tienda, Marca, Fecha, Canal de Venta, Cedula, Nombre o Razon Social, 
                  Telefono, Correo Electronico, Articulo, Descripcion Articulo, 
                  Cantidad, Divisas de Venta, Categoria, Numero
                </code>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  CSV (.csv)
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Excel (.xlsx, .xls)
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Zona de carga */}
          <Card>
            <CardHeader>
              <CardTitle>Subir Archivo</CardTitle>
              <CardDescription>
                Arrastra el archivo o haz clic para seleccionarlo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Dropzone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  file
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-300 hover:border-cyan-400 hover:bg-slate-50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="h-12 w-12 text-cyan-600" />
                    <p className="font-medium text-slate-900">{file.name}</p>
                    <p className="text-sm text-slate-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-12 w-12 text-slate-400" />
                    <p className="font-medium text-slate-700">
                      Arrastra tu archivo aquí
                    </p>
                    <p className="text-sm text-slate-500">
                      o haz clic para seleccionar
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-4 text-red-700">
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Resultado de carga */}
              {uploadResult && (
                <div className="mt-4 rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <p className="font-medium">¡Archivo procesado exitosamente!</p>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded bg-white p-3">
                      <p className="text-sm text-slate-500">Registros procesados</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatNumber(uploadResult.registros_procesados)}
                      </p>
                    </div>
                    <div className="rounded bg-white p-3">
                      <p className="text-sm text-slate-500">Clientes actualizados</p>
                      <p className="text-xl font-bold text-slate-900">
                        {formatNumber(uploadResult.clientes_actualizados)}
                      </p>
                    </div>
                  </div>

                  {/* Errores de procesamiento */}
                  {uploadResult.errores && uploadResult.errores.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-2 flex items-center gap-1 text-sm font-medium text-amber-700">
                        <AlertCircle className="h-4 w-4" />
                        Advertencias ({uploadResult.errores.length})
                      </p>
                      <div className="max-h-32 overflow-y-auto rounded bg-amber-50 p-2">
                        {uploadResult.errores.map((err, idx) => (
                          <p key={idx} className="text-xs text-amber-700">
                            • {err}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botones */}
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!file}
                  isLoading={isUploading}
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploading ? "Procesando..." : "Subir y Procesar"}
                </Button>
                {(file || uploadResult || error) && (
                  <Button variant="outline" onClick={handleReset}>
                    Limpiar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Historial de cargas (placeholder) */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Historial de Cargas</CardTitle>
              <CardDescription>Últimas importaciones realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-slate-300" />
                <p className="mt-2">No hay cargas recientes</p>
                <p className="text-sm">El historial aparecerá aquí después de la primera importación</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
