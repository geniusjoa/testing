import React from 'react';
import { useCondo } from '../../context/CondoContext';
import { Scale, FileCheck, ShieldAlert, BookOpen, Download, Building, Landmark } from 'lucide-react';
import { generateMonthlyFinancialReportPDF } from '../../utils/pdfGenerator';

export const SeniatFiscal: React.FC = () => {
  const { settings, expenses, houses } = useCondo();

  const totalIngresosEsperadosBs = houses.reduce((acc, h) => acc + h.totalCuotaMesBs, 0);
  const totalEgresosBs = expenses.reduce((acc, e) => acc + e.amountBs, 0);
  const fondoReservaBs = totalEgresosBs * (settings.reserveFundPercent / 100);

  const handleDownloadLibro = () => {
    generateMonthlyFinancialReportPDF(settings, houses, expenses);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Scale className="w-6 h-6 text-rose-600" />
            Marco Legal SENIAT y Ley de Propiedad Horizontal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cumplimiento tributario venezolano, régimen de facturación de condominio, libro de ingresos/egresos y fiscalización
          </p>
        </div>

        <button
          onClick={handleDownloadLibro}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          Descargar Libro para Auditoría SENIAT
        </button>
      </div>

      {/* Tax Info & Entity Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-700">
            <Landmark className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Identificación Fiscal</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">{settings.condoName}</p>
          <div className="bg-slate-100 p-2.5 rounded-xl text-xs font-mono font-bold text-slate-800 flex justify-between">
            <span>RIF OFICIAL:</span>
            <span className="text-rose-700">{settings.rif}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Persona jurídica sin fines de lucro bajo la Ley de Propiedad Horizontal (Gaceta Oficial Nº 3.241).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-700">
            <FileCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Régimen IVA / Facturación</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">No Sujeto a IVA (Cuotas de Gastos)</p>
          <p className="text-xs text-slate-600">
            Las cuotas de condominio constituyen reembolso de gastos comunes conforme a la Ley de Propiedad Horizontal. Los recibos emitidos cumplen con providencias administrativas del SENIAT como comprobantes válidos de cobro.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Fondo de Reserva Obligatorio</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900">10% Sobre Total Gastos del Mes</p>
          <p className="text-xs text-slate-600">
            Estipulado legalmente para imprevistos, conservación y reparaciones mayores de áreas e instalaciones comunes del Conjunto Residencial.
          </p>
        </div>
      </div>

      {/* Book of Incomes & Expenses Preview (Libro de Ingresos y Egresos) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-heading">
              Libro Contable de Ingresos y Egresos — Periodo {settings.currentBillingPeriod}
            </h3>
            <p className="text-xs text-slate-500">
              Control transparente de partidas comunes con soporte de facturas de proveedores
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
            216 Casas Activas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Facturado a Vecinos</span>
            <span className="font-mono font-extrabold text-slate-900 text-lg">
              Bs {totalIngresosEsperadosBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Egresos por Servicios y Obras</span>
            <span className="font-mono font-extrabold text-rose-700 text-lg">
              Bs {totalEgresosBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">Aporte a Fondo de Reserva (10%)</span>
            <span className="font-mono font-extrabold text-emerald-900 text-lg">
              Bs {fondoReservaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Legal articles box */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Normativas Legales Aplicadas en el Sistema:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-600">
            <li>
              <strong>Art. 13 y 14 Ley de Propiedad Horizontal:</strong> Cada propietario debe contribuir a los gastos comunes según la alícuota porcentual correspondiente (0,46365% promedio para las 216 casas).
            </li>
            <li>
              <strong>Providencia Administrativa SENIAT Nº SNAT/2011/00071:</strong> Exigencias para comprobantes fiscales y conservación de soportes contables durante al menos 5 años.
            </li>
            <li>
              <strong>Circular Banco Central de Venezuela (BCV):</strong> Valoración de cobros de referencia en divisas pagaderos a la tasa oficial del día de emisión o pago efectivo en cuentas nacionales en Bolívares.
            </li>
            <li>
              <strong>Tratamiento diferenciado de Calle C:</strong> Exclusión transparente de gastos en portones vehiculares y motores no compartidos por los vecinos de dicha calle.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
