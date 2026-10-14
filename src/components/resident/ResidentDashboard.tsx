import React, { useState } from 'react';
import { useCondo } from '../../context/CondoContext';
import {
  Home,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  MessageSquare,
  Sparkles,
  Download,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  X,
  Save,
} from 'lucide-react';

interface ResidentDashboardProps {
  onNavigate: (tab: string) => void;
  onViewReceipt: () => void;
}

export const ResidentDashboard: React.FC<ResidentDashboardProps> = ({
  onNavigate,
  onViewReceipt,
}) => {
  const { currentHouse, currentHouseReceipt, settings, expenses, changeOwnPassword } = useCondo();

  // Password change modal state
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  if (!currentHouse) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <Home className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="font-bold text-slate-800 text-base">Inicie sesión como vecino</h3>
        <p className="text-xs text-slate-500">
          Seleccione su casa para consultar su estado de cuenta y reportar pagos.
        </p>
      </div>
    );
  }

  const isSolvent = currentHouse.status === 'solvente' || currentHouse.status === 'a_favor';

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPass.length < 6) {
      setPassError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Las contraseñas no coinciden.');
      return;
    }

    const res = changeOwnPassword(newPass);
    if (res.success) {
      setPassSuccess('¡Contraseña actualizada exitosamente!');
      setTimeout(() => {
        setIsChangePassOpen(false);
        setNewPass('');
        setConfirmPass('');
        setPassSuccess('');
      }, 1800);
    } else {
      setPassError(res.error || 'Error al cambiar la contraseña.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Resident Welcome & Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Home className="w-3.5 h-3.5" /> Casa {currentHouse.code} • {currentHouse.street}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Bienvenido(a), {currentHouse.residentName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Alícuota asignada: <strong>{currentHouse.alicuotaPercentStr}</strong> • Conjunto Residencial Florencia
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => setIsChangePassOpen(true)}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              title="Cambiar contraseña personal de acceso"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              Seguridad & Contraseña
            </button>

            {isSolvent ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 px-4 py-3 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-300 block">
                    Estado Actual
                  </span>
                  <span className="text-base font-extrabold text-white">Solvente / Al Día</span>
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/20 border border-amber-500/40 px-4 py-3 rounded-2xl flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-amber-300 block">
                    Saldo Pendiente
                  </span>
                  <span className="text-base font-extrabold text-white font-mono">
                    Bs {(currentHouse.totalToPayBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security & Data Privacy Guarantee Banner */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-slate-700">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Privacidad Garantizada:</strong> Su sesión está cifrada y restringida exclusivamente a la información de la <strong>Casa {currentHouse.code}</strong>.
          </span>
        </div>
        <button
          onClick={() => setIsChangePassOpen(true)}
          className="text-emerald-700 hover:text-emerald-900 font-bold underline shrink-0 cursor-pointer text-[11px]"
        >
          Modificar Clave
        </button>
      </div>

      {/* Payment Notice / Cutoff Banner (Mandatory Venezuelan Law & Condominium Rule) */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5 text-xs text-amber-900">
          <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-700" />
            Aviso de Cobranza Oficial — Periodo {settings.currentBillingPeriod}
          </p>
          <p className="text-amber-800">
            El pago del recibo deberá realizarse dentro de los <strong>siete (7) días continuos</strong> posteriores a su emisión, en bolívares o su equivalente en dólares a la tasa oficial BCV (<strong>Bs {settings.bcvExchangeRate.toFixed(2)}/USD</strong>). Vencido el plazo se aplicará 3% de mora mensual.
          </p>
        </div>
        {!isSolvent && (
          <button
            onClick={() => onNavigate('reportar_pago')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Reportar Pago Móvil / Transferencia
          </button>
        )}
      </div>

      {/* Current Receipt Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recibo del Mes</span>
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Recibo Nº {currentHouse.lastReceiptNumber} — {settings.currentBillingPeriod}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewReceipt}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              Ver Recibo Oficial Completo
            </button>
          </div>
        </div>

        {/* Breakdown row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Cuota del Mes</span>
            <span className="font-mono font-extrabold text-slate-900 text-base">
              Bs {(currentHouseReceipt?.totalCuotaMesBs ?? (currentHouse.alicuota ? (expenses.reduce((a, b) => a + (b.amountBs || 0), 0) * currentHouse.alicuota / 100 * 1.1) : 0)).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Incluye 10% fondo reserva</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Deuda Anterior</span>
            <span className="font-mono font-bold text-slate-700 text-base">
              {(currentHouse.currentDebt ?? 0) > 0
                ? `Bs ${(currentHouse.currentDebt ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                : 'Bs 0,00'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              {(currentHouse.pendingReceiptsCount ?? 0) > 0 ? `${currentHouse.pendingReceiptsCount} recibos pend.` : 'Sin retrasos'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Mora (3%)</span>
            <span className="font-mono font-bold text-amber-700 text-base">
              {(currentHouse.moraAmount ?? 0) > 0
                ? `Bs ${(currentHouse.moraAmount ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}`
                : 'Bs 0,00'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Por vencimiento</span>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-[10px] text-emerald-800 font-bold uppercase block">Total a Pagar</span>
            <span className="font-mono font-extrabold text-emerald-950 text-lg block">
              Bs {(currentHouse.totalToPayBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
            <span className="font-mono font-bold text-emerald-700 text-xs block">
              ≈ ${(currentHouse.totalToPayUsd ?? 0).toFixed(2)} USD (BCV)
            </span>
          </div>
        </div>

        {/* Official Bank Account Information */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <CreditCard className="w-4 h-4 text-rose-600" />
            Datos Oficiales del Conjunto Residencial para Pago Móvil / Transferencia:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Banco y Tipo de Cuenta:</span>
              <span className="font-bold text-slate-800">{settings.bankName} - {settings.accountType}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Número de Cuenta Corriente:</span>
              <span className="font-mono font-extrabold text-slate-900">{settings.accountNumber}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Beneficiario y RIF:</span>
              <span className="font-bold text-slate-800">{settings.condoName} ({settings.rif})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Resident Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('reportar_pago')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Reportar Pago</h3>
          <p className="text-xs text-slate-500">
            Suba su comprobante bancario (capture) para validación inmediata por la Junta de Condominio.
          </p>
        </div>

        <div
          onClick={() => onNavigate('incidencias')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Reporte de Incidencias</h3>
          <p className="text-xs text-slate-500">
            Notifique fallas de alumbrado, portón eléctrico, tuberías o limpieza en tiempo real.
          </p>
        </div>

        <div
          onClick={() => onNavigate('reservas')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Reserva de Áreas Comunes</h3>
          <p className="text-xs text-slate-500">
            Verifique disponibilidad y reserve la Cancha Deportiva, Churuata o Parque Infantil.
          </p>
        </div>
      </div>

      {/* MODAL: Change Own Password */}
      {isChangePassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base font-heading">
                  Cambiar Contraseña de Propietario
                </h3>
              </div>
              <button
                onClick={() => setIsChangePassOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <p className="font-bold text-slate-900">Casa {currentHouse.code} • {currentHouse.residentName}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Esta contraseña es personal e intransferible. Asegúrese de recordarla para sus próximos accesos.
                </p>
              </div>

              {passError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Repita la contraseña"
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePassOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Nueva Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

