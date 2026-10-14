import React, { useState } from 'react';
import { useCondo } from '../../context/CondoContext';
import {
  DollarSign,
  TrendingUp,
  Building2,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';
import { generateMonthlyFinancialReportPDF } from '../../utils/pdfGenerator';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onViewReceipt: (houseCode: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const { settings, houses, expenses, paymentReports, generateMonthlyBilling } = useCondo();
  const [billingPeriodInput, setBillingPeriodInput] = useState('AGOSTO 2026');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Financial calculations
  const totalBilledBs = houses.reduce((acc, h) => acc + h.totalToPayBs, 0);
  const totalBilledUsd = totalBilledBs / settings.bcvExchangeRate;
  const totalExpensesBs = expenses.reduce((acc, e) => acc + e.amountBs, 0);

  const solventHousesCount = houses.filter((h) => h.status === 'solvente' || h.status === 'a_favor').length;
  const pendingHousesCount = houses.filter((h) => h.status === 'pendiente').length;
  const delinquentHousesCount = houses.filter((h) => h.status === 'moroso').length;
  const pendingPayments = paymentReports.filter((p) => p.status === 'pendiente');

  // Breakdown by Street
  const calle1Houses = houses.filter((h) => h.street === 'Calle 1');
  const calle2Houses = houses.filter((h) => h.street === 'Calle 2');
  const calleCHouses = houses.filter((h) => h.street === 'Calle C');

  const handleGenerateBilling = (e: React.FormEvent) => {
    e.preventDefault();
    if (billingPeriodInput.trim()) {
      generateMonthlyBilling(billingPeriodInput.trim().toUpperCase());
      setShowGenerateModal(false);
    }
  };

  const handleExportPDF = () => {
    generateMonthlyFinancialReportPDF(settings, houses, expenses);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Building2 className="w-3.5 h-3.5" /> Administración Principal • Conjunto Residencial Florencia
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Panel de Gestión Financiera
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Supervisión de 216 unidades habitacionales (Calle 1, Calle 2, Calle C), cálculo automático de alícuotas, cobranza dual en Bolívares y Dólares BCV, y control contable SENIAT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Emitir Facturación Mensual
            </button>
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-bold rounded-xl backdrop-blur-xs transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Exportar Reporte PDF
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cuentas por Cobrar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuentas por Cobrar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 font-heading">
              Bs {(totalBilledBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span className="font-semibold text-emerald-700 font-mono">
                ≈ ${(totalBilledUsd ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>
              <span className="text-[11px] text-slate-400">Tasa: {settings.bcvExchangeRate.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Fondo de Reserva Acumulado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fondo de Reserva (10%)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-900 font-heading">
              Bs {(settings.reserveFundBalanceBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span className="font-semibold text-emerald-700 font-mono">
                ≈ ${((settings.reserveFundBalanceBs ?? 0) / (settings.bcvExchangeRate || 1)).toFixed(2)} USD
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">Patrimonio Reserva</span>
            </div>
          </div>
        </div>

        {/* Banco de Venezuela Cta Cte */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo en Banco (BDV)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 font-heading">
              Bs {(settings.bankBalanceBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 font-mono truncate mt-1">
              Cta: {settings.accountNumber}
            </p>
          </div>
        </div>

        {/* Total Gastos Comunes del Mes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gastos Mes ({settings.currentBillingPeriod})</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 font-heading">
              Bs {(totalExpensesBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <span>{expenses.length} partidas activas</span>
              <button
                onClick={() => onNavigate('gastos_facturacion')}
                className="text-xs font-bold text-purple-700 hover:underline cursor-pointer"
              >
                Ver detalle &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert for Pending Payment Reports to Approve */}
      {pendingPayments.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-amber-950">
                Tiene {pendingPayments.length} reporte(s) de pago con captura de pantalla esperando conciliación
              </h2>
              <p className="text-xs text-amber-800">
                Compruebe los números de referencia bancaria y apruebe para actualizar automáticamente el saldo y emitir el recibo solvente.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pagos_revision')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Revisar Comprobantes ({pendingPayments.length})
          </button>
        </div>
      )}

      {/* Street Breakdown Cards (Calle 1, Calle 2, Calle C) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Calle 1: 92 casas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sector 1</span>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">Calle 1</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              92 Casas
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Solventes:</span>
              <span className="font-bold text-emerald-600">
                {calle1Houses.filter((h) => h.status === 'solvente' || h.status === 'a_favor').length} casas
              </span>
            </div>
            <div className="flex justify-between">
              <span>Con Deuda / Morosos:</span>
              <span className="font-bold text-amber-600">
                {calle1Houses.filter((h) => h.status === 'moroso' || h.status === 'pendiente').length} casas
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
              <span>Monto por Cobrar:</span>
              <span className="font-mono">
                Bs {(calle1Houses.reduce((acc, h) => acc + (h.totalToPayBs || 0), 0) ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('casas')}
            className="w-full mt-2 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Ver casas de Calle 1 &rarr;
          </button>
        </div>

        {/* Calle 2: 84 casas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sector 2</span>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">Calle 2</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              84 Casas
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Solventes:</span>
              <span className="font-bold text-emerald-600">
                {calle2Houses.filter((h) => h.status === 'solvente' || h.status === 'a_favor').length} casas
              </span>
            </div>
            <div className="flex justify-between">
              <span>Con Deuda / Morosos:</span>
              <span className="font-bold text-amber-600">
                {calle2Houses.filter((h) => h.status === 'moroso' || h.status === 'pendiente').length} casas
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
              <span>Monto por Cobrar:</span>
              <span className="font-mono">
                Bs {(calle2Houses.reduce((acc, h) => acc + (h.totalToPayBs || 0), 0) ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('casas')}
            className="w-full mt-2 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Ver casas de Calle 2 &rarr;
          </button>
        </div>

        {/* Calle C: 40 casas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sector 3</span>
              <h2 className="text-lg font-extrabold text-slate-900 font-heading">Calle C</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
              40 Casas
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Solventes:</span>
              <span className="font-bold text-emerald-600">
                {calleCHouses.filter((h) => h.status === 'solvente' || h.status === 'a_favor').length} casas
              </span>
            </div>
            <div className="flex justify-between">
              <span>Con Deuda / Morosos:</span>
              <span className="font-bold text-amber-600">
                {calleCHouses.filter((h) => h.status === 'moroso' || h.status === 'pendiente').length} casas
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
              <span>Monto por Cobrar:</span>
              <span className="font-mono">
                Bs {(calleCHouses.reduce((acc, h) => acc + (h.totalToPayBs || 0), 0) ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('casas')}
            className="w-full mt-2 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Ver casas de Calle C &rarr;
          </button>
        </div>
      </div>

      {/* Quick sample preview of houses */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Muestra Rápida de Recibos y Estados de Cobro
            </h2>
            <p className="text-xs text-slate-500">
              Total de 216 unidades residenciales registradas con sus respectivas alícuotas y recibos generados
            </p>
          </div>
          <button
            onClick={() => onNavigate('casas')}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
          >
            Ver las 216 casas &rarr;
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">CASA</th>
                <th className="py-2.5 px-3">PROPIETARIO(A)</th>
                <th className="py-2.5 px-3">CALLE</th>
                <th className="py-2.5 px-3">ALÍCUOTA</th>
                <th className="py-2.5 px-3 text-right">TOTAL BS</th>
                <th className="py-2.5 px-3 text-right">TOTAL USD</th>
                <th className="py-2.5 px-3 text-center">ESTADO</th>
                <th className="py-2.5 px-3 text-center">RECIBO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {houses.slice(0, 8).map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{h.code}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">{h.residentName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{h.street}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{h.alicuotaPercentStr}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    Bs {(h.totalToPayBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-700 font-semibold">
                    ${(h.totalToPayUsd ?? 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === 'solvente'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'a_favor'
                          ? 'bg-blue-100 text-blue-800'
                          : h.status === 'moroso'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {h.status === 'a_favor'
                        ? 'Saldo a Favor'
                        : h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onViewReceipt(h.code)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    >
                      Ver #{h.lastReceiptNumber}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to Emit Billing */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Emitir Facturación Mensual de Condominio
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Se recalcularán las cuotas para las 216 casas basándose en los gastos actuales (Bs {(totalExpensesBs ?? 0).toLocaleString('es-VE')}), alícuotas, 10% fondo de reserva y mora del 3% en saldos vencidos.
            </p>

            <form onSubmit={handleGenerateBilling} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nombre del Periodo a Facturar
                </label>
                <input
                  type="text"
                  required
                  value={billingPeriodInput}
                  onChange={(e) => setBillingPeriodInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-bold"
                  placeholder="AGOSTO 2026"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
                <p className="font-semibold text-slate-800">Parámetros que se aplicarán:</p>
                <p>• Fondo de Reserva Obligatorio: 10%</p>
                <p>• Intereses de Mora: 3% sobre deuda previa</p>
                <p>• Tasa Oficial BCV: Bs {settings.bcvExchangeRate.toFixed(2)}/USD</p>
                <p>• Plazo de pago: 7 días continuos</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Generar y Notificar a Vecinos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
