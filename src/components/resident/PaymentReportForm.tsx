import React, { useState, useRef } from 'react';
import { useCondo } from '../../context/CondoContext';
import {
  CreditCard,
  Upload,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Image as ImageIcon,
  ArrowRight,
  FileCheck,
} from 'lucide-react';

export const PaymentReportForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { currentHouse, settings, submitPaymentReport } = useCondo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'transferencia' | 'efectivo_usd'>('pago_movil');
  const [bankName, setBankName] = useState('Banco de Venezuela');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [amountBs, setAmountBs] = useState(
    currentHouse ? currentHouse.totalToPayBs.toFixed(2) : '0'
  );
  const [screenshotUrl, setScreenshotUrl] = useState<string>(
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80'
  );
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!currentHouse) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-slate-600 text-sm">Debe seleccionar su casa para reportar un pago.</p>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setScreenshotUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bsVal = parseFloat(amountBs);
    if (isNaN(bsVal) || bsVal <= 0 || !referenceNumber.trim()) {
      return;
    }

    const usdVal = bsVal / settings.bcvExchangeRate;

    submitPaymentReport({
      houseId: currentHouse.id,
      houseCode: currentHouse.code,
      residentName: currentHouse.residentName,
      amountBs: bsVal,
      amountUsd: usdVal,
      bcvRateUsed: settings.bcvExchangeRate,
      paymentMethod,
      bankName,
      referenceNumber: referenceNumber.trim(),
      screenshotUrl: screenshotUrl || undefined,
      notes: notes.trim() || undefined,
      monthPeriod: settings.currentBillingPeriod,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-xl mx-auto text-center space-y-4 shadow-sm animate-in fade-in">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-heading">
          ¡Reporte de Pago Registrado con Éxito!
        </h2>
        <p className="text-xs text-slate-600">
          Su comprobante con referencia <strong className="font-mono text-slate-900">{referenceNumber}</strong> por un monto de{' '}
          <strong className="font-mono text-slate-900">Bs {parseFloat(amountBs).toFixed(2)}</strong> ha sido enviado a la Junta de Condominio de Florencia.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-left space-y-1">
          <p>• Casa: <strong>{currentHouse.code} ({currentHouse.residentName})</strong></p>
          <p>• Banco Emisor: <strong>{bankName}</strong></p>
          <p>• Tasa BCV aplicada: <strong>Bs {settings.bcvExchangeRate.toFixed(2)} / USD</strong></p>
        </div>
        <p className="text-[11px] text-slate-500">
          Una vez conciliada la acreditación en la cuenta del Banco de Venezuela, su recibo se marcará como solvente de forma inmediata.
        </p>
        <button
          onClick={onSuccess}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
        >
          Volver a Mi Estado de Cuenta
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-600" />
          Reportar Pago de Condominio
        </h2>
        <p className="text-xs text-slate-500">
          Casa {currentHouse.code} — Propietario: {currentHouse.residentName} • Tasa oficial BCV: Bs {settings.bcvExchangeRate.toFixed(2)}/USD
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        {/* Method selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block">Forma o Método de Pago</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pago_movil', label: 'Pago Móvil' },
              { id: 'transferencia', label: 'Transferencia BDV / Otros' },
              { id: 'efectivo_usd', label: 'Efectivo Divisas' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center ${
                  paymentMethod === m.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bank & Reference row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Banco de Origen</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Banco de Venezuela">0102 - Banco de Venezuela</option>
              <option value="Banesco">0134 - Banesco</option>
              <option value="Mercantil">0105 - Banco Mercantil</option>
              <option value="BBVA Provincial">0108 - Banco Provincial</option>
              <option value="Bancamiga">0172 - Bancamiga</option>
              <option value="Banco Nacional de Crédito">0191 - BNC</option>
              <option value="Otro Banco">Otro Banco Nacional</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Número de Referencia (Últimos 6 a 8 dígitos)
            </label>
            <input
              type="text"
              required
              placeholder="Ej: 839201"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Amount in Bs and USD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Monto Pagado en Bolívares (Bs)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amountBs}
              onChange={(e) => setAmountBs(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono font-extrabold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Equivalente Aproximado en USD (BCV)</label>
            <div className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-200 bg-slate-50 rounded-xl text-emerald-800 flex items-center justify-between">
              <span>≈ ${(parseFloat(amountBs || '0') / settings.bcvExchangeRate).toFixed(2)} USD</span>
              <span className="text-[10px] text-slate-400">Tasa: Bs {settings.bcvExchangeRate.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Screenshot Upload (Capture) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Adjuntar Capture o Comprobante Bancario
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50"
          >
            {screenshotUrl ? (
              <div className="flex items-center gap-4">
                <img
                  src={screenshotUrl}
                  alt="Capture previo"
                  className="w-20 h-16 object-cover rounded-xl border border-slate-300"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <FileCheck className="w-4 h-4" /> Comprobante adjuntado
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Haga click si desea cambiar o seleccionar otra captura desde su dispositivo.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">
                  Haga click para subir captura de pantalla
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG o JPEG (Máximo 5MB)</p>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Observaciones o Notas (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Pago de cuota de condominio Julio + abono a fondo"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          Enviar Reporte para Validación
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
