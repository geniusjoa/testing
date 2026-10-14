import React, { useState } from 'react';
import { useCondo } from '../../context/CondoContext';
import { PaymentReport } from '../../types';
import { CheckCircle, XCircle, Clock, Search, Image as ImageIcon, ExternalLink, ShieldCheck } from 'lucide-react';

export const PaymentsApproval: React.FC = () => {
  const { paymentReports, approvePayment, rejectPayment, settings } = useCondo();
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendiente' | 'aprobado' | 'rechazado'>('todos');
  const [search, setSearch] = useState('');
  const [selectedCapture, setSelectedCapture] = useState<string | null>(null);

  const filtered = paymentReports.filter((p) => {
    if (filterStatus !== 'todos' && p.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.houseCode.toLowerCase().includes(q) ||
        p.referenceNumber.toLowerCase().includes(q) ||
        p.residentName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = paymentReports.filter((p) => p.status === 'pendiente').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">
            Conciliación y Aprobación de Pagos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verificación de referencias bancarias, capturas de pantalla de Pago Móvil / Transferencias y acreditación automática
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {pendingCount} Pendientes de Validación
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por casa o nº de referencia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs w-full sm:w-auto">
          {(['todos', 'pendiente', 'aprobado', 'rechazado'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer capitalize ${
                filterStatus === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No hay reportes de pago registrados con los filtros seleccionados.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                item.status === 'pendiente'
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-extrabold text-slate-900 text-sm">
                    {item.houseCode}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.residentName}</h3>
                    <p className="text-[11px] text-slate-500">
                      Fecha de reporte: {item.reportDate} • Periodo: {item.monthPeriod}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'aprobado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'rechazado'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">MONTO EN BOLÍVARES:</span>
                  <span className="font-mono font-extrabold text-slate-900 text-base">
                    Bs {item.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MONTO REPORTADO EN USD:</span>
                  <span className="font-mono font-bold text-emerald-700 text-base">
                    ${item.amountUsd.toFixed(2)} USD
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">MÉTODO DE PAGO:</span>
                  <span className="font-medium text-slate-800 capitalize">{item.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BANCO EMISOR:</span>
                  <span className="font-medium text-slate-800">{item.bankName}</span>
                </div>
                <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Nº DE REFERENCIA / CONFIRMACIÓN:</span>
                  <span className="font-mono font-extrabold text-slate-900 text-sm tracking-wider">
                    {item.referenceNumber}
                  </span>
                </div>
                {item.notes && (
                  <div className="col-span-2 text-slate-600 text-[11px] italic">
                    Nota: "{item.notes}"
                  </div>
                )}
              </div>

              {/* Screenshot / Voucher Thumbnail */}
              {item.screenshotUrl && (
                <div className="py-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">
                    COMPROBANTE ADJUNTO (CAPTURE):
                  </span>
                  <div
                    onClick={() => setSelectedCapture(item.screenshotUrl || null)}
                    className="relative rounded-xl overflow-hidden border border-slate-200 cursor-pointer group h-28 bg-slate-100 flex items-center justify-center"
                  >
                    <img
                      src={item.screenshotUrl}
                      alt="Comprobante"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <ExternalLink className="w-4 h-4" />
                      Ampliar Comprobante
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {item.status === 'pendiente' && (
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => approvePayment(item.id)}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar y Solvencia
                  </button>
                  <button
                    onClick={() => {
                      const reason = window.prompt('Indique el motivo del rechazo para informar al propietario:') || 'Referencia no encontrada en cuenta bancaria';
                      rejectPayment(item.id, reason);
                    }}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                </div>
              )}

              {item.status === 'aprobado' && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Conciliado en Banco de Venezuela • Recibo solvente emitido
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal image viewer */}
      {selectedCapture && (
        <div
          onClick={() => setSelectedCapture(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 cursor-pointer"
        >
          <div className="max-w-xl max-h-[85vh] bg-white p-3 rounded-2xl shadow-2xl relative">
            <img
              src={selectedCapture}
              alt="Comprobante Bancario"
              className="max-h-[75vh] w-auto object-contain rounded-xl mx-auto"
            />
            <p className="text-center text-xs text-slate-500 mt-2 font-medium">
              Click en cualquier lugar para cerrar la vista previa
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
