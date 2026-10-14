import React from 'react';
import { CondoReceipt, CondoSettings } from '../types';
import { CondoLogo } from './Logo';
import { generateReceiptPDF } from '../utils/pdfGenerator';
import { Printer, Download, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ReceiptViewProps {
  receipt: CondoReceipt;
  settings: CondoSettings;
  onBack?: () => void;
  onPayNow?: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receipt,
  settings,
  onBack,
  onPayNow,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateReceiptPDF(receipt, settings);
  };

  const totalGastosMesGlobal = receipt.expenses.reduce((acc, curr) => acc + curr.totalAmountBs, 0);
  const fondoReservaGlobal = totalGastosMesGlobal * 0.10;
  const granTotalGlobal = totalGastosMesGlobal + fondoReservaGlobal;

  return (
    <div className="space-y-4 max-w-4xl mx-auto" id="receipt-container">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          )}
          <span className="text-sm font-bold text-slate-900">
            Recibo Digital #{receipt.receiptNumber} - Casa {receipt.houseCode}
          </span>
          {receipt.isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Solvente
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" /> Pendiente por Pagar
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onPayNow && !receipt.isPaid && (
            <button
              onClick={onPayNow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Reportar Pago
            </button>
          )}
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Descargar documento PDF con logo oficial"
          >
            <Download className="w-4 h-4 text-rose-600" />
            Descargar PDF
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Imprimir recibo"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Printable Official Receipt Area (matches PDF design 100%) */}
      <div className="printable-area bg-white p-6 sm:p-8 rounded-xl border border-slate-300 shadow-md font-sans text-slate-800 text-xs">
        {/* Main Document Frame */}
        <div className="border border-slate-900 p-4 sm:p-6 space-y-4">
          {/* Header Row */}
          <div className="border-b border-slate-900 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h1 className="text-base sm:text-xl font-extrabold uppercase tracking-wide text-slate-950 font-heading">
              CONJUNTO RESIDENCIAL FLORENCIA {receipt.street.toUpperCase()}
            </h1>
            <span className="text-[11px] font-bold text-slate-600">
              RIF: {settings.rif}
            </span>
          </div>

          {/* Top 3 Columns: Info | Reserve Fund | Logo */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
            {/* Left Col: Recibo Nº & Unit Data */}
            <div className="md:col-span-5 border border-slate-400 p-2.5 rounded bg-slate-50/50 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                <span className="font-bold text-slate-800">Recibo de Cobro Nº</span>
                <span className="font-extrabold text-base text-slate-900">
                  {receipt.receiptNumber.toLocaleString('es-VE')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <span className="text-slate-500 block text-[10px]">CASA / UNIDAD:</span>
                  <span className="font-bold text-slate-900 text-sm">{receipt.houseCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ALÍCUOTA:</span>
                  <span className="font-bold text-slate-900">{receipt.alicuotaPercentStr}</span>
                </div>
              </div>
              <div className="border-t border-slate-200 pt-1">
                <span className="text-slate-500 block text-[10px]">PROPIETARIO(A):</span>
                <span className="font-bold text-slate-900">{receipt.residentName}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
                <span>MES: <strong>{receipt.monthYear}</strong></span>
                <span>Emisión: <strong>{receipt.issueDate}</strong></span>
              </div>
            </div>

            {/* Center Col: Saldo Fondo de Reserva */}
            <div className="md:col-span-4 border border-slate-400 p-2.5 rounded bg-emerald-50/40 space-y-1 text-[10px]">
              <div className="font-extrabold text-emerald-950 uppercase border-b border-emerald-200 pb-0.5 text-center">
                Saldo en Cta Fondo de Reserva
              </div>
              <div className="flex justify-between text-slate-700 pt-1">
                <span>Saldo en Banco:</span>
                <span className="font-mono font-bold">Bs {(receipt.reserveFundAccountBalanceBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Crédito Mes:</span>
                <span className="font-mono font-bold">Bs {(receipt.reserveFundMonthCreditBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-emerald-900 font-bold border-t border-emerald-200 pt-0.5">
                <span>Total Disponible:</span>
                <span className="font-mono">Bs {(receipt.reserveFundTotalBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-[9px] pt-0.5">
                <span>Por cobrar: Bs {(receipt.reserveFundPendingToCollectBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
                <span>Recibos Pend: {(receipt.deudaAnteriorBs ?? 0) > 0 ? 'Con mora' : 'Al día'}</span>
              </div>
            </div>

            {/* Right Col: Official Logo */}
            <div className="md:col-span-3 flex flex-col items-center justify-center p-2 border border-slate-300 rounded bg-white">
              <CondoLogo size="md" showRif={true} />
            </div>
          </div>

          {/* Green Summary Metric Strip (matches PDF 2) */}
          <div className="overflow-x-auto border border-emerald-700 rounded bg-emerald-50">
            <table className="w-full text-center text-[10px] sm:text-xs">
              <thead>
                <tr className="bg-emerald-700 text-white font-bold border-b border-emerald-800">
                  <th className="py-1.5 px-2">TOTAL CUOTA {receipt.monthYear}</th>
                  <th className="py-1.5 px-2">DEUDA</th>
                  <th className="py-1.5 px-2">MORA 3%</th>
                  <th className="py-1.5 px-2">SALDO A FAVOR</th>
                  <th className="py-1.5 px-2 bg-emerald-900">TOTAL A PAGAR (BS)</th>
                  <th className="py-1.5 px-2">SALDO A FAVOR ACTUAL</th>
                  <th className="py-1.5 px-2 bg-emerald-950 text-emerald-300">EQUIV. $ (BCV)</th>
                </tr>
              </thead>
              <tbody className="font-mono font-bold text-slate-900">
                <tr className="divide-x divide-emerald-200">
                  <td className="py-2 px-2">
                    {(receipt.totalCuotaMesBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-slate-700">
                    {(receipt.deudaAnteriorBs ?? 0) > 0
                      ? (receipt.deudaAnteriorBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
                      : '-'}
                  </td>
                  <td className="py-2 px-2 text-amber-700">
                    {(receipt.moraBs ?? 0) > 0
                      ? (receipt.moraBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
                      : '-'}
                  </td>
                  <td className="py-2 px-2 text-emerald-700">
                    {(receipt.saldoFavorBs ?? 0) > 0
                      ? (receipt.saldoFavorBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
                      : '-'}
                  </td>
                  <td className="py-2 px-2 text-base font-extrabold text-slate-950 bg-emerald-100/80">
                    Bs {(receipt.totalPagarBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2 text-emerald-800">
                    {(receipt.saldoFavorActualBs ?? 0) > 0
                      ? (receipt.saldoFavorActualBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
                      : '-'}
                  </td>
                  <td className="py-2 px-2 text-sm font-extrabold text-emerald-950 bg-emerald-200/50">
                    $ {(receipt.totalPagarUsd ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Breakdown Table of Expenses */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="py-1.5 px-3">DESCRIPCION DEL GASTO</th>
                  <th className="py-1.5 px-3 text-right">GASTO DEL MES</th>
                  <th className="py-1.5 px-3 text-right">COMUN</th>
                  <th className="py-1.5 px-3 text-center">NO COMUN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(receipt.expenses || []).map((item, idx) => (
                  <tr key={item.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                    <td className="py-1 px-3 text-slate-800">{item.description}</td>
                    <td className="py-1 px-3 text-right font-mono text-slate-700">
                      {(item.totalAmountBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1 px-3 text-right font-mono font-semibold text-slate-900">
                      {(item.shareAmountBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-1 px-3 text-center text-slate-400 font-mono">-</td>
                  </tr>
                ))}
                {/* House-specific expenses (Cargos No Comunes por Vivienda) */}
                {(receipt.houseExpenses || []).map((hse, idx) => (
                  <tr key={hse.id || `hse-${idx}`} className="bg-amber-50/40">
                    <td className="py-1 px-3 text-amber-950 font-medium">
                      <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-200/80 text-amber-900 mr-1.5 uppercase">
                        Vivienda
                      </span>
                      {hse.concept} {hse.invoiceNumber ? `(Fact. ${hse.invoiceNumber})` : ''}
                    </td>
                    <td className="py-1 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1 px-3 text-right font-mono font-bold text-amber-900">
                      {(hse.amountBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100/90 font-bold border-t-2 border-slate-400 text-slate-900">
                <tr>
                  <td className="py-1 px-3 uppercase text-[10px]">GASTOS MES (COMUNES)</td>
                  <td className="py-1 px-3 text-right font-mono">
                    {(totalGastosMesGlobal ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-3 text-right font-mono text-slate-800">
                    {(receipt.gastosMesTotalBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-3 text-right font-mono text-slate-400">-</td>
                </tr>
                <tr>
                  <td className="py-1 px-3 uppercase text-[10px]">FONDO DE RESERVA 10%</td>
                  <td className="py-1 px-3 text-right font-mono text-emerald-800">
                    {(fondoReservaGlobal ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-3 text-right font-mono text-emerald-800">
                    {(receipt.fondoReservaBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-1 px-3 text-right font-mono text-slate-400">-</td>
                </tr>
                {(receipt.houseExpensesTotalBs ?? 0) > 0 && (
                  <tr className="bg-amber-100/50">
                    <td className="py-1 px-3 uppercase text-[10px] text-amber-900">GASTOS POR VIVIENDA (NO COMUNES)</td>
                    <td className="py-1 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1 px-3 text-right font-mono text-slate-400">-</td>
                    <td className="py-1 px-3 text-right font-mono text-amber-900">
                      {(receipt.houseExpensesTotalBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
                <tr className="border-t border-slate-300 text-xs bg-slate-200/70">
                  <td className="py-1.5 px-3 uppercase">TOTAL GASTOS COMUNES Y NO COMUNES</td>
                  <td className="py-1.5 px-3 text-right font-mono">
                    {(granTotalGlobal ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={2} className="py-1.5 px-3 text-right font-mono font-extrabold text-slate-950">
                    Bs {(receipt.totalCuotaMesBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal and Bank Instructions (Matches PDF exactly) */}
          <div className="border border-amber-300 bg-amber-50/60 p-3 rounded text-[10px] space-y-1 text-slate-800">
            <p className="font-medium text-slate-900">
              • El pago del recibo deberá realizarse dentro de los <strong>siete (7) días continuos</strong> una vez emitido el mismo, en Bs o su equivalente en dólares a la tasa oficial BCV vigente (Bs {settings.bcvExchangeRate.toFixed(2)}/USD).
            </p>
            <p className="font-semibold text-slate-900 pt-0.5">
              • Depósito o Transferencia: <strong>{settings.bankName}</strong> | {settings.accountType} Nº: <span className="font-mono font-bold bg-white px-1.5 py-0.5 border border-amber-200 rounded">{settings.accountNumber}</span> a nombre del <strong>{settings.condoName}</strong> | RIF: <strong>{settings.rif}</strong>.
            </p>
            <p className="text-[9px] text-slate-500 italic">
              * Documento expedido en cumplimiento con la Ley de Propiedad Horizontal de Venezuela y requerimientos contables exigidos por el SENIAT.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
