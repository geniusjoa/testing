import React, { useState, useMemo } from 'react';
import { useCondo } from '../../context/CondoContext';
import { MonthlyExpense, StreetName, HouseSpecificExpense, CondoReceipt } from '../../types';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  Home,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Search,
  Filter,
  Eye,
  FileText,
  Copy,
  AlertCircle,
  ShieldCheck,
  Building2,
  Sparkles,
  Tag,
  Wrench,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { generateReceiptPDF, generateMonthlyFinancialReportPDF } from '../../utils/pdfGenerator';

interface ExpensesBillingProps {
  onViewReceipt?: (houseCode: string) => void;
}

export const ExpensesBilling: React.FC<ExpensesBillingProps> = ({ onViewReceipt }) => {
  const {
    expenses,
    settings,
    houses,
    billingPeriods,
    houseSpecificExpenses,
    currentSelectedPeriod,
    setCurrentSelectedPeriod,
    addExpense,
    deleteExpense,
    addHouseSpecificExpense,
    deleteHouseSpecificExpense,
    createBillingPeriod,
    copyExpensesFromPreviousPeriod,
    getAllReceiptsForPeriod,
    emitBillingPeriod,
  } = useCondo();

  // Internal Tabs
  const [activeTab, setActiveTab] = useState<'basicos' | 'viviendas' | 'recibos'>('basicos');

  // Modals state
  const [showAddBasicModal, setShowAddBasicModal] = useState(false);
  const [showAddHouseExpenseModal, setShowAddHouseExpenseModal] = useState(false);
  const [showNewPeriodModal, setShowNewPeriodModal] = useState(false);
  const [showConfirmEmitModal, setShowConfirmEmitModal] = useState(false);

  // Form state for Basic Expense
  const [basicDesc, setBasicDesc] = useState('');
  const [basicCategory, setBasicCategory] = useState<MonthlyExpense['category']>('mantenimiento');
  const [basicAmountBs, setBasicAmountBs] = useState('');
  const [basicInvoice, setBasicInvoice] = useState('');
  const [basicSupplier, setBasicSupplier] = useState('');
  const [basicIsCommon, setBasicIsCommon] = useState(true);
  const [basicStreets, setBasicStreets] = useState<StreetName[]>(['Calle 1', 'Calle 2', 'Calle C']);

  // Form state for House Specific Expense
  const [houseExpCode, setHouseExpCode] = useState('1-1A');
  const [houseExpConcept, setHouseExpConcept] = useState('');
  const [houseExpCategory, setHouseExpCategory] = useState<HouseSpecificExpense['category']>('control_porton');
  const [houseExpAmountBs, setHouseExpAmountBs] = useState('');
  const [houseExpInvoice, setHouseExpInvoice] = useState('');
  const [houseExpNotes, setHouseExpNotes] = useState('');

  // Form state for New Billing Period
  const [newPeriodMonthYear, setNewPeriodMonthYear] = useState('');
  const [newPeriodIssueDate, setNewPeriodIssueDate] = useState(new Date().toISOString().substring(0, 10));
  const [newPeriodDueDate, setNewPeriodDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  );
  const [newPeriodBcv, setNewPeriodBcv] = useState(settings.bcvExchangeRate.toString());
  const [copyExpensesOnCreate, setCopyExpensesOnCreate] = useState(true);

  // Search & Filter in Receipts Tab
  const [receiptSearch, setReceiptSearch] = useState('');
  const [receiptFilter, setReceiptFilter] = useState<'todos' | 'con_gastos_vivienda' | 'con_deuda' | 'solventes'>('todos');

  // Active period object
  const activePeriodObj = useMemo(() => {
    return (
      billingPeriods.find((p) => p.monthYear === currentSelectedPeriod) || {
        id: 'default',
        monthYear: currentSelectedPeriod,
        issueDate: '01/08/2026',
        dueDate: '08/08/2026',
        bcvRate: settings.bcvExchangeRate,
        isEmitted: false,
      }
    );
  }, [billingPeriods, currentSelectedPeriod, settings.bcvExchangeRate]);

  // Expenses for the selected period
  const periodBasicExpenses = useMemo(() => {
    return expenses.filter((e) => e.monthYear === currentSelectedPeriod);
  }, [expenses, currentSelectedPeriod]);

  // House-specific expenses for the selected period
  const periodHouseExpenses = useMemo(() => {
    return houseSpecificExpenses.filter((h) => h.monthYear === currentSelectedPeriod);
  }, [houseSpecificExpenses, currentSelectedPeriod]);

  // Calculations for Basic Expenses
  const totalBasicExpensesBs = periodBasicExpenses.reduce((acc, curr) => acc + curr.amountBs, 0);
  const fondoReservaBs = totalBasicExpensesBs * (settings.reserveFundPercent / 100);
  const totalGastosComunesConFondoBs = totalBasicExpensesBs + fondoReservaBs;

  // Calculations for House-Specific Expenses
  const totalHouseExpensesBs = periodHouseExpenses.reduce((acc, curr) => acc + curr.amountBs, 0);
  const housesWithSpecificExpensesCount = new Set(periodHouseExpenses.map((h) => h.houseCode)).size;

  // Gran Total facturado en el periodo
  const granTotalPeriodoBs = totalGastosComunesConFondoBs + totalHouseExpensesBs;

  // All 216 calculated receipts for this period
  const allPeriodReceipts = useMemo(() => {
    return getAllReceiptsForPeriod(currentSelectedPeriod);
  }, [getAllReceiptsForPeriod, currentSelectedPeriod]);

  // Filtered receipts
  const filteredReceipts = useMemo(() => {
    return allPeriodReceipts.filter((r) => {
      const matchSearch =
        r.houseCode.toLowerCase().includes(receiptSearch.toLowerCase()) ||
        r.residentName.toLowerCase().includes(receiptSearch.toLowerCase()) ||
        r.street.toLowerCase().includes(receiptSearch.toLowerCase());

      if (!matchSearch) return false;

      if (receiptFilter === 'con_gastos_vivienda') {
        return (r.houseExpensesTotalBs ?? 0) > 0;
      }
      if (receiptFilter === 'con_deuda') {
        return (r.deudaAnteriorBs ?? 0) > 0;
      }
      if (receiptFilter === 'solventes') {
        return (r.deudaAnteriorBs ?? 0) === 0;
      }
      return true;
    });
  }, [allPeriodReceipts, receiptSearch, receiptFilter]);

  // Handlers
  const handleAddBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(basicAmountBs);
    if (!basicDesc.trim() || isNaN(amount) || amount <= 0) return;

    addExpense({
      description: basicDesc.trim(),
      category: basicCategory,
      amountBs: amount,
      monthYear: currentSelectedPeriod,
      invoiceNumber: basicInvoice.trim() || undefined,
      supplier: basicSupplier.trim() || undefined,
      date: new Date().toISOString().substring(0, 10),
      isCommon: basicIsCommon,
      appliesToStreets: basicIsCommon ? undefined : basicStreets,
    });

    setBasicDesc('');
    setBasicAmountBs('');
    setBasicInvoice('');
    setBasicSupplier('');
    setShowAddBasicModal(false);
  };

  const handleAddHouseExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(houseExpAmountBs);
    if (!houseExpConcept.trim() || isNaN(amount) || amount <= 0) return;

    addHouseSpecificExpense({
      houseCode: houseExpCode,
      monthYear: currentSelectedPeriod,
      concept: houseExpConcept.trim(),
      category: houseExpCategory,
      amountBs: amount,
      invoiceNumber: houseExpInvoice.trim() || undefined,
      date: new Date().toISOString().substring(0, 10),
      notes: houseExpNotes.trim() || undefined,
    });

    setHouseExpConcept('');
    setHouseExpAmountBs('');
    setHouseExpInvoice('');
    setHouseExpNotes('');
    setShowAddHouseExpenseModal(false);
  };

  const handleCreatePeriodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodMonthYear.trim()) return;

    const formattedName = newPeriodMonthYear.trim().toUpperCase();
    const bcvRate = parseFloat(newPeriodBcv) || settings.bcvExchangeRate;

    createBillingPeriod({
      monthYear: formattedName,
      issueDate: newPeriodIssueDate,
      dueDate: newPeriodDueDate,
      bcvRate,
    });

    if (copyExpensesOnCreate && currentSelectedPeriod) {
      copyExpensesFromPreviousPeriod(currentSelectedPeriod, formattedName);
    }

    setCurrentSelectedPeriod(formattedName);
    setNewPeriodMonthYear('');
    setShowNewPeriodModal(false);
  };

  const handleCopyExpenses = () => {
    // Find prior period
    const currentIndex = billingPeriods.findIndex((p) => p.monthYear === currentSelectedPeriod);
    const priorPeriod = currentIndex > 0 ? billingPeriods[currentIndex - 1]?.monthYear : 'JULIO 2026';

    if (confirm(`¿Desea copiar los gastos básicos recurrentes desde ${priorPeriod} hacia ${currentSelectedPeriod}?`)) {
      const count = copyExpensesFromPreviousPeriod(priorPeriod, currentSelectedPeriod);
      alert(`Se copiaron ${count} partidas de gastos básicos para ${currentSelectedPeriod}.`);
    }
  };

  const handleConfirmEmitPeriod = () => {
    emitBillingPeriod(currentSelectedPeriod);
    setShowConfirmEmitModal(false);
    setActiveTab('recibos');
  };

  const toggleStreet = (street: StreetName) => {
    if (basicStreets.includes(street)) {
      if (basicStreets.length > 1) {
        setBasicStreets(basicStreets.filter((s) => s !== street));
      }
    } else {
      setBasicStreets([...basicStreets, street]);
    }
  };

  const selectedHouseObj = houses.find((h) => h.code === houseExpCode);

  return (
    <div className="space-y-6">
      {/* Top Banner / Module Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 font-heading">
                Módulo de Facturación y Recibos Mensuales
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Carga por meses de gastos básicos comunes y gastos particulares asignados por vivienda (216 unidades)
              </p>
            </div>
          </div>
        </div>

        {/* Period Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-semibold text-slate-700">Mes:</span>
            <select
              value={currentSelectedPeriod}
              onChange={(e) => setCurrentSelectedPeriod(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              {billingPeriods.map((p) => (
                <option key={p.id} value={p.monthYear}>
                  {p.monthYear} {p.isEmitted ? '✓ (Emitido)' : '✎ (Borrador)'}
                </option>
              ))}
            </select>
          </div>

          {/* Status Badge */}
          {activePeriodObj.isEmitted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Emitido y Notificado
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Borrador en Carga
            </span>
          )}

          {/* Action: Create New Month */}
          <button
            onClick={() => setShowNewPeriodModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Mes
          </button>

          {/* Action: Emit Period */}
          {!activePeriodObj.isEmitted ? (
            <button
              onClick={() => setShowConfirmEmitModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Emitir Facturación del Mes
            </button>
          ) : (
            <button
              onClick={() => generateMonthlyFinancialReportPDF(settings, houses, periodBasicExpenses)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Descargar balance general del mes en PDF"
            >
              <Download className="w-3.5 h-3.5" />
              PDF Balance General
            </button>
          )}
        </div>
      </div>

      {/* Financial KPIs Banner for the Active Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Gastos Básicos Comunes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gastos Básicos (Comunes)</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-heading">
            Bs {totalBasicExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {periodBasicExpenses.length} facturas/partidas comunes
          </p>
        </div>

        {/* 2. Fondo de Reserva Legal */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Fondo Reserva ({settings.reserveFundPercent}%)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-900 font-heading">
            Bs {fondoReservaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Reserva obligatoria por Ley de Propiedad
          </p>
        </div>

        {/* 3. Gastos por Viviendas (Cargos Específicos) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gastos por Vivienda (No Común)</span>
            <Home className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 font-heading">
            Bs {totalHouseExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            {periodHouseExpenses.length} cargos a {housesWithSpecificExpensesCount} casas específicas
          </p>
        </div>

        {/* 4. Total a Facturar en el Mes */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gran Total Facturado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 font-heading">
            Bs {granTotalPeriodoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-300 mt-0.5">
            ≈ ${(granTotalPeriodoBs / settings.bcvExchangeRate).toFixed(2)} USD (BCV Bs {settings.bcvExchangeRate.toFixed(2)})
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('basicos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'basicos'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            1. Gastos Básicos del Condominio ({periodBasicExpenses.length})
          </button>

          <button
            onClick={() => setActiveTab('viviendas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'viviendas'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4" />
            2. Gastos por Viviendas ({periodHouseExpenses.length})
          </button>

          <button
            onClick={() => setActiveTab('recibos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'recibos'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            3. Recibos de las 216 Casas ({allPeriodReceipts.length})
          </button>
        </div>

        {/* Contextual Action Button based on Sub-Tab */}
        <div>
          {activeTab === 'basicos' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyExpenses}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl cursor-pointer"
                title="Copiar partidas fijas del mes anterior"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar Mes Anterior
              </button>
              <button
                onClick={() => setShowAddBasicModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Cargar Gasto Básico
              </button>
            </div>
          )}

          {activeTab === 'viviendas' && (
            <button
              onClick={() => setShowAddHouseExpenseModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Cargar Gasto a Vivienda
            </button>
          )}

          {activeTab === 'recibos' && (
            <button
              onClick={() => generateMonthlyFinancialReportPDF(settings, houses, periodBasicExpenses)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar Balance General (PDF)
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: GASTOS BÁSICOS DEL CONDOMINIO */}
      {activeTab === 'basicos' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-rose-600" />
                  Facturas y Servicios Básicos de {currentSelectedPeriod}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Partidas de mantenimiento, Corpoelec, agua, vigilancia y servicios distribuidos entre las 216 casas por alícuota
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                Total: Bs {totalBasicExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {periodBasicExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No hay gastos básicos cargados para {currentSelectedPeriod}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Puede registrar facturas individuales con el botón &quot;Cargar Gasto Básico&quot; o clonar rápidamente las partidas del mes anterior.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handleCopyExpenses}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer"
                  >
                    Copiar Partidas del Mes Anterior
                  </button>
                  <button
                    onClick={() => setShowAddBasicModal(true)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Registrar Primer Gasto
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">DESCRIPCIÓN DEL GASTO</th>
                      <th className="py-2.5 px-3">CATEGORÍA</th>
                      <th className="py-2.5 px-3">PROVEEDOR / FACTURA</th>
                      <th className="py-2.5 px-3">ALCANCE</th>
                      <th className="py-2.5 px-3 text-right">MONTO BS</th>
                      <th className="py-2.5 px-3 text-right">EQUIV. USD</th>
                      <th className="py-2.5 px-3 text-center">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periodBasicExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{exp.description}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <p className="font-medium text-slate-800">{exp.supplier || 'N/A'}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{exp.invoiceNumber || 'Sin factura'}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {exp.isCommon ? (
                            <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Común 216 casas
                            </span>
                          ) : (
                            <span className="text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {exp.appliesToStreets?.join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          Bs {exp.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          ${(exp.amountBs / settings.bcvExchangeRate).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar partida"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right uppercase text-[11px]">
                        Subtotal Gastos Básicos:
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-extrabold text-slate-900">
                        Bs {totalBasicExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        ${(totalBasicExpensesBs / settings.bcvExchangeRate).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right uppercase text-[11px] text-emerald-800">
                        + Fondo de Reserva Legal ({settings.reserveFundPercent}%):
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-extrabold text-emerald-800">
                        Bs {fondoReservaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700">
                        ${(fondoReservaBs / settings.bcvExchangeRate).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GASTOS POR VIVIENDAS (CARGOS ESPECÍFICOS) */}
      {activeTab === 'viviendas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/40">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-amber-600" />
                  Cargos Específicos por Vivienda (No Comunes) - {currentSelectedPeriod}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gastos directos cargados únicamente al recibo de la casa indicada (controles de portón, reparaciones particulares, multas, acometidas)
                </p>
              </div>
              <button
                onClick={() => setShowAddHouseExpenseModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Asignar Gasto a Vivienda
              </button>
            </div>

            {periodHouseExpenses.length === 0 ? (
              <div className="p-12 text-center">
                <Home className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No hay cargos por vivienda registrados en {currentSelectedPeriod}</p>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Utilice el botón &quot;Asignar Gasto a Vivienda&quot; para cargar conceptos específicos a una o varias casas (ej: duplicados de control de portón, reparaciones de llave de paso, etc.).
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setShowAddHouseExpenseModal(true)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Asignar Primer Cargo a Vivienda
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3">VIVIENDA</th>
                      <th className="py-2.5 px-3">PROPIETARIO</th>
                      <th className="py-2.5 px-3">CONCEPTO DEL CARGO</th>
                      <th className="py-2.5 px-3">CATEGORÍA</th>
                      <th className="py-2.5 px-3">COMPROBANTE</th>
                      <th className="py-2.5 px-3 text-right">MONTO BS</th>
                      <th className="py-2.5 px-3 text-right">EQUIV. USD</th>
                      <th className="py-2.5 px-3 text-center">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periodHouseExpenses.map((hexp) => {
                      const house = houses.find((h) => h.code === hexp.houseCode);
                      return (
                        <tr key={hexp.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-mono font-bold">
                              {hexp.houseCode}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{house?.street}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 font-medium">
                            {house?.residentName || 'Propietario no registrado'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {hexp.concept}
                            {hexp.notes && <p className="text-[10px] text-slate-400 font-normal">{hexp.notes}</p>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                hexp.category === 'control_porton'
                                  ? 'bg-blue-100 text-blue-800'
                                  : hexp.category === 'reparacion'
                                  ? 'bg-amber-100 text-amber-800'
                                  : hexp.category === 'multa'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {hexp.category.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {hexp.invoiceNumber || '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-900">
                            Bs {hexp.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                            ${(hexp.amountBs / settings.bcvExchangeRate).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => deleteHouseSpecificExpense(hexp.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar cargo de esta vivienda"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-amber-50/60 font-bold border-t border-amber-200 text-slate-900">
                    <tr>
                      <td colSpan={5} className="py-2 px-3 text-right uppercase text-[11px] text-amber-900">
                        Total Gastos por Viviendas ({periodHouseExpenses.length} cargos):
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-extrabold text-amber-950">
                        Bs {totalHouseExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-700">
                        ${(totalHouseExpensesBs / settings.bcvExchangeRate).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: EMISIÓN Y VISTA PREVIA DE RECIBOS DE LAS 216 CASAS */}
      {activeTab === 'recibos' && (
        <div className="space-y-4">
          {/* Controls: Search and Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por casa (1-1A), calle o propietario..."
                value={receiptSearch}
                onChange={(e) => setReceiptSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setReceiptFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  receiptFilter === 'todos'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todas (216)
              </button>
              <button
                onClick={() => setReceiptFilter('con_gastos_vivienda')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  receiptFilter === 'con_gastos_vivienda'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                Con Gastos Vivienda ({housesWithSpecificExpensesCount})
              </button>
              <button
                onClick={() => setReceiptFilter('con_deuda')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  receiptFilter === 'con_deuda'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Con Deuda Anterior
              </button>
              <button
                onClick={() => setReceiptFilter('solventes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  receiptFilter === 'solventes'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Al Día
              </button>
            </div>
          </div>

          {/* Receipts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">CASA</th>
                    <th className="py-2.5 px-3">PROPIETARIO</th>
                    <th className="py-2.5 px-3">CALLE</th>
                    <th className="py-2.5 px-3">ALÍCUOTA</th>
                    <th className="py-2.5 px-3 text-right">COMÚN (BS)</th>
                    <th className="py-2.5 px-3 text-right">GASTO VIVIENDA</th>
                    <th className="py-2.5 px-3 text-right">DEUDA + MORA</th>
                    <th className="py-2.5 px-3 text-right bg-emerald-50/50">TOTAL A PAGAR</th>
                    <th className="py-2.5 px-3 text-right">EQUIV. USD</th>
                    <th className="py-2.5 px-3 text-center">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredReceipts.map((rcpt) => (
                    <tr key={rcpt.houseCode} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">
                        {rcpt.houseCode}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">
                        {rcpt.residentName}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-500">
                        {rcpt.street}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-bold">
                        {rcpt.alicuotaPercentStr}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-800">
                        {(rcpt.gastosMesTotalBs + rcpt.fondoReservaBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {(rcpt.houseExpensesTotalBs ?? 0) > 0 ? (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded text-[11px]">
                            +Bs {(rcpt.houseExpensesTotalBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {(rcpt.deudaAnteriorBs + rcpt.moraBs) > 0 ? (
                          <span className="text-rose-600 font-semibold">
                            Bs {(rcpt.deudaAnteriorBs + rcpt.moraBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-600">Al día</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-slate-950 bg-emerald-50/50">
                        Bs {rcpt.totalPagarBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                        ${rcpt.totalPagarUsd.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-sans">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onViewReceipt && onViewReceipt(rcpt.houseCode)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Ver recibo oficial detallado"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateReceiptPDF(rcpt, settings)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Descargar recibo en PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-right">
              Mostrando {filteredReceipts.length} de 216 recibos generados para {currentSelectedPeriod}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR GASTO BÁSICO COMÚN */}
      {showAddBasicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Registrar Gasto Básico del Condominio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Partida común aplicable al periodo {currentSelectedPeriod} para distribución por alícuota
            </p>

            <form onSubmit={handleAddBasicSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción del Gasto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Mantenimiento Preventivo de Bombas de Agua"
                  value={basicDesc}
                  onChange={(e) => setBasicDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={basicCategory}
                    onChange={(e) => setBasicCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="electricidad">Electricidad (Corpoelec)</option>
                    <option value="agua">Agua Potable</option>
                    <option value="telecomunicaciones">Telecomunicaciones (GSM/Netuno)</option>
                    <option value="mantenimiento">Mantenimiento y Portón</option>
                    <option value="seguridad">Seguridad y Vigilancia</option>
                    <option value="insumos">Insumos y Limpieza</option>
                    <option value="otros">Otros Gastos</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Monto en Bolívares (Bs)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={basicAmountBs}
                    onChange={(e) => setBasicAmountBs(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  {parseFloat(basicAmountBs) > 0 && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      ≈ ${(parseFloat(basicAmountBs) / settings.bcvExchangeRate).toFixed(2)} USD (BCV)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nº de Factura / Control</label>
                  <input
                    type="text"
                    placeholder="FACT-00123"
                    value={basicInvoice}
                    onChange={(e) => setBasicInvoice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Proveedor / RIF</label>
                  <input
                    type="text"
                    placeholder="Distribuidora C.A."
                    value={basicSupplier}
                    onChange={(e) => setBasicSupplier(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Scope */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">¿Es común a las 216 casas?</span>
                  <input
                    type="checkbox"
                    checked={basicIsCommon}
                    onChange={(e) => setBasicIsCommon(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                </div>

                {!basicIsCommon && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500 block mb-1.5 font-medium">
                      Seleccione las calles a las que aplica este gasto:
                    </span>
                    <div className="flex gap-2">
                      {(['Calle 1', 'Calle 2', 'Calle C'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleStreet(st)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                            basicStreets.includes(st)
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBasicModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Guardar Gasto Básico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CARGAR GASTO A VIVIENDA ESPECÍFICA */}
      {showAddHouseExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600" />
              Asignar Gasto a Vivienda Específica
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Este cargo se reflejará exclusivamente en el recibo de la casa seleccionada para el mes de {currentSelectedPeriod}
            </p>

            <form onSubmit={handleAddHouseExpenseSubmit} className="mt-4 space-y-3.5">
              {/* House Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Seleccionar Vivienda</label>
                <select
                  value={houseExpCode}
                  onChange={(e) => setHouseExpCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  {houses.map((h) => (
                    <option key={h.code} value={h.code}>
                      Casa {h.code} ({h.street}) - {h.residentName}
                    </option>
                  ))}
                </select>
                {selectedHouseObj && (
                  <p className="text-[11px] text-amber-800 font-medium mt-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Propietario(a): <strong>{selectedHouseObj.residentName}</strong> | {selectedHouseObj.street}
                  </p>
                )}
              </div>

              {/* Quick Presets for Concept */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Concepto del Cargo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Duplicado adicional de control de portón eléctrico"
                  value={houseExpConcept}
                  onChange={(e) => setHouseExpConcept(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                {/* Concept Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: 'Control de Portón', cat: 'control_porton' as const, text: 'Control adicional portón eléctrico' },
                    { label: 'Llave de Paso', cat: 'reparacion' as const, text: 'Reemplazo llave de paso particular' },
                    { label: 'Multa Ruido', cat: 'multa' as const, text: 'Multa por ruidos molestos en horario no permitido' },
                    { label: 'Acometida', cat: 'reparacion' as const, text: 'Reparación particular de acometida' },
                    { label: 'Cuota Especial', cat: 'cuota_extra' as const, text: 'Cuota extraordinaria individual' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setHouseExpConcept(preset.text);
                        setHouseExpCategory(preset.cat);
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-amber-100 text-slate-700 text-[10px] font-semibold rounded-md transition-colors cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={houseExpCategory}
                    onChange={(e) => setHouseExpCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    <option value="control_porton">Control de Portón</option>
                    <option value="reparacion">Reparación Particular</option>
                    <option value="multa">Multa / Sanción</option>
                    <option value="cuota_extra">Cuota Extraordinaria</option>
                    <option value="otro">Otro Cargo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Monto en Bolívares (Bs)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={houseExpAmountBs}
                    onChange={(e) => setHouseExpAmountBs(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  {parseFloat(houseExpAmountBs) > 0 && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      ≈ ${(parseFloat(houseExpAmountBs) / settings.bcvExchangeRate).toFixed(2)} USD
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nº Comprobante / Recibo</label>
                  <input
                    type="text"
                    placeholder="COMP-001"
                    value={houseExpInvoice}
                    onChange={(e) => setHouseExpInvoice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Observaciones</label>
                  <input
                    type="text"
                    placeholder="Entrega personal firmada"
                    value={houseExpNotes}
                    onChange={(e) => setHouseExpNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddHouseExpenseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Cargar a Casa {houseExpCode}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREAR NUEVO PERIODO MENSUAL */}
      {showNewPeriodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Calendar className="w-5 h-5 text-rose-600" />
              Crear Nuevo Periodo de Facturación
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Habilita un nuevo mes para la carga de recibos, gastos básicos y cargos por viviendas
            </p>

            <form onSubmit={handleCreatePeriodSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Mes y Año</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: AGOSTO 2026 o SEPTIEMBRE 2026"
                  value={newPeriodMonthYear}
                  onChange={(e) => setNewPeriodMonthYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fecha de Emisión</label>
                  <input
                    type="date"
                    required
                    value={newPeriodIssueDate}
                    onChange={(e) => setNewPeriodIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={newPeriodDueDate}
                    onChange={(e) => setNewPeriodDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tasa Oficial BCV para el Periodo (Bs/USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPeriodBcv}
                  onChange={(e) => setNewPeriodBcv(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyExpensesOnCreate}
                    onChange={(e) => setCopyExpensesOnCreate(e.target.checked)}
                    className="w-4 h-4 text-rose-600 rounded"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    Copiar automáticamente los gastos básicos del periodo actual ({currentSelectedPeriod})
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewPeriodModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Crear Periodo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EMISIÓN DE FACTURACIÓN */}
      {showConfirmEmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-heading text-center">
              ¿Emitir y Publicar Facturación de {currentSelectedPeriod}?
            </h3>
            <p className="text-xs text-slate-600 mt-2 text-center leading-relaxed">
              Esta acción consolidará los recibos para las <strong>216 casas</strong> sumando los <strong>gastos básicos comunes (por alícuota)</strong>, el <strong>fondo de reserva legal (10%)</strong> y los <strong>gastos por viviendas asignados</strong>.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Gastos Básicos:</span>
                <span className="font-mono font-bold">Bs {totalBasicExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Fondo Reserva (10%):</span>
                <span className="font-mono font-bold">Bs {fondoReservaBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-amber-900 font-bold">
                <span>Gastos por Viviendas ({periodHouseExpenses.length}):</span>
                <span className="font-mono">Bs {totalHouseExpensesBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-1 text-slate-900 font-extrabold text-sm">
                <span>Gran Total:</span>
                <span className="font-mono text-rose-700">Bs {granTotalPeriodoBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmEmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmEmitPeriod}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Confirmar y Emitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
