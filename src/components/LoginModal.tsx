import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { CondoLogo } from './Logo';
import { Shield, Home, Lock, User, AlertCircle, ArrowRight, X, Eye, EyeOff, KeyRound } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAdmin, loginVecino, houses } = useCondo();
  const [activeTab, setActiveTab] = useState<'admin' | 'vecino'>('vecino');

  // Admin form state
  const [adminUser, setAdminUser] = useState('Florentino');
  const [adminPass, setAdminPass] = useState('Florencia2026');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Vecino form state
  const [selectedStreet, setSelectedStreet] = useState<'Calle 1' | 'Calle 2' | 'Calle C'>('Calle 1');
  const [selectedHouseCode, setSelectedHouseCode] = useState('1-1A');
  const [vecinoPassword, setVecinoPassword] = useState('Florencia.1-1A');
  const [showVecinoPass, setShowVecinoPass] = useState(false);
  const [vecinoSearch, setVecinoSearch] = useState('');
  const [vecinoError, setVecinoError] = useState('');

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const res = loginAdmin(adminUser, adminPass);
    if (res.success) {
      onClose();
    } else {
      setAdminError(res.error || 'Credenciales incorrectas de administrador.');
    }
  };

  const handleVecinoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVecinoError('');
    if (!selectedHouseCode || !vecinoPassword) {
      setVecinoError('Por favor seleccione su inmueble e ingrese su contraseña.');
      return;
    }

    const res = loginVecino(selectedHouseCode, vecinoPassword);
    if (res.success) {
      onClose();
    } else {
      setVecinoError(res.error || 'Contraseña incorrecta o usuario bloqueado.');
    }
  };

  const handleHouseSelect = (code: string) => {
    setSelectedHouseCode(code);
    // If the user hasn't typed a custom password, keep synced with default template
    setVecinoPassword(`Florencia.${code}`);
    setVecinoError('');
  };

  const filteredHouses = houses.filter(
    (h) =>
      h.street === selectedStreet &&
      (h.code.toLowerCase().includes(vecinoSearch.toLowerCase()) ||
        h.residentName.toLowerCase().includes(vecinoSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-center mb-3">
            <CondoLogo size="md" inverted={true} showRif={true} />
          </div>
          <h2 className="text-xl font-bold font-heading">Portal de Acceso Seguro</h2>
          <p className="text-xs text-slate-400 mt-1">
            Conjunto Residencial Florencia • 216 Inmuebles Protegidos
          </p>

          {/* Toggle Role Tabs */}
          <div className="flex bg-slate-800 p-1 rounded-xl mt-4 max-w-xs mx-auto text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('vecino');
                setVecinoError('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'vecino'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Propietario
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setAdminError('');
              }}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Administración
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Credenciales del Administrador:</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Usuario: <strong className="font-mono text-amber-950">Florentino</strong> | Clave:{' '}
                    <strong className="font-mono text-amber-950">Florencia2026</strong>
                  </p>
                </div>
              </div>

              {adminError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Usuario Administrador</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-medium"
                    placeholder="Florentino"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Contraseña de Administrador</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-medium"
                    placeholder="Florencia2026"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Entrar al Panel de Administración
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVecinoSubmit} className="space-y-4">
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <p className="font-bold">Privacidad y Protección de Datos:</p>
                  <p className="text-[11px] text-emerald-900 mt-0.5">
                    Cada propietario tiene acceso restringido <strong>únicamente a la información de su inmueble</strong>, estado de cuenta y recibos.
                  </p>
                </div>
              </div>

              {vecinoError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{vecinoError}</span>
                </div>
              )}

              {/* Street tabs */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ubicación por Calle
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold text-center">
                  {(['Calle 1', 'Calle 2', 'Calle C'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setSelectedStreet(st);
                        const firstInStreet = houses.find((h) => h.street === st);
                        if (firstInStreet) handleHouseSelect(firstInStreet.code);
                      }}
                      className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                        selectedStreet === st
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input for house or name */}
              <div>
                <input
                  type="text"
                  placeholder="Filtrar por número (ej: 1-1A) o nombre de propietario..."
                  value={vecinoSearch}
                  onChange={(e) => setVecinoSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* House select list */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Número de Casa ({filteredHouses.length} unidades en {selectedStreet})
                </label>
                <select
                  value={selectedHouseCode}
                  onChange={(e) => handleHouseSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium bg-white"
                >
                  {filteredHouses.map((h) => (
                    <option key={h.code} value={h.code}>
                      Casa {h.code} — {h.residentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Contraseña de Propietario
                  </label>
                  <span className="text-[10px] text-emerald-700 font-medium font-mono">
                    Defecto: Florencia.{selectedHouseCode}
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showVecinoPass ? 'text' : 'password'}
                    required
                    value={vecinoPassword}
                    onChange={(e) => setVecinoPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    placeholder={`Florencia.${selectedHouseCode}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVecinoPass(!showVecinoPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showVecinoPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showVecinoPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  La contraseña inicial asignada por la administración es <strong className="font-mono text-slate-700">Florencia.{selectedHouseCode}</strong>.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Ingresar a Mi Estado de Cuenta ({selectedHouseCode})
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick sample buttons for fast testing */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-500 block mb-1.5 font-medium">Accesos rápidos de prueba:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: '1-1A', name: 'Belkis Hernandez', street: 'Calle 1' as const },
                    { code: '2-1A', name: 'José Martinez', street: 'Calle 2' as const },
                    { code: 'C-1A', name: 'Luisa Jimenez', street: 'Calle C' as const },
                  ].map((demo) => (
                    <button
                      key={demo.code}
                      type="button"
                      onClick={() => {
                        setSelectedStreet(demo.street);
                        setSelectedHouseCode(demo.code);
                        setVecinoPassword(`Florencia.${demo.code}`);
                      }}
                      className="text-[11px] px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      {demo.code} ({demo.name.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
