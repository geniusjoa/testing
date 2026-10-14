import React, { useRef, useState } from 'react';
import { useCondo } from '../../context/CondoContext';
import { ShieldCheck, Download, Upload, RefreshCw, Database, Clock, User, AlertTriangle } from 'lucide-react';

export const AuditAndBackup: React.FC = () => {
  const { auditLogs, exportBackupJSON, importBackupJSON, resetToDefaultData } = useCondo();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    exportBackupJSON();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus('Copia de seguridad restaurada con éxito.');
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          setImportStatus('Error al restaurar: El archivo no contiene un formato de respaldo válido.');
          setTimeout(() => setImportStatus(null), 4000);
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('¿Está seguro de reiniciar los datos a la plantilla inicial oficial? Esta acción restablecerá las 216 casas y los gastos de muestra.')) {
      resetToDefaultData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-600" />
            Auditoría Interna y Respaldo de Base de Datos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inmutable de operaciones financieras, respaldos JSON y trazabilidad para la Junta de Condominio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Descargar Respaldo JSON
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" />
            Restaurar Respaldo
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {importStatus && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 flex items-center gap-2">
          <Database className="w-4 h-4" />
          {importStatus}
        </div>
      )}

      {/* Backup and Data Safeguards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Respaldo Automático Local</h3>
          <p className="text-xs text-slate-500">
            Cada pago, recibo o gasto modificado se guarda en tiempo real en el almacenamiento seguro de su navegador (localStorage).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Portabilidad Total (JSON)</h3>
          <p className="text-xs text-slate-500">
            Puede descargar el archivo íntegro con las 216 casas, historial y recibos para guardarlo en memorias externas o enviarlo a la asamblea.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Restablecimiento de Fábrica</h3>
          <p className="text-xs text-slate-500">
            En caso de pruebas, puede recargar el dataset inicial oficial de 216 casas de Florencia.
          </p>
          <button
            onClick={handleReset}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer pt-1"
          >
            Restablecer a valores iniciales &rarr;
          </button>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            Trazabilidad y Bitácora de Acciones ({auditLogs.length} eventos)
          </h3>
          <span className="text-[11px] text-slate-400">Protegido contra modificaciones arbitrarias</span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">FECHA Y HORA</th>
                <th className="py-2.5 px-3">USUARIO</th>
                <th className="py-2.5 px-3">ACCIÓN</th>
                <th className="py-2.5 px-3">DETALLES REGISTRADOS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {log.user}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-rose-700 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
