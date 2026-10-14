import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';
import { CondoLogo } from './Logo';
import {
  DollarSign,
  Bell,
  User,
  LogOut,
  Shield,
  Home,
  Check,
  RefreshCw,
  Edit2,
  Menu,
  X,
  AlertCircle,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
}) => {
  const { currentUser, settings, updateBcvRate, logout, announcements, paymentReports } = useCondo();
  const [isEditingBcv, setIsEditingBcv] = useState(false);
  const [tempBcv, setTempBcv] = useState(settings.bcvExchangeRate.toString());
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingPaymentsCount = paymentReports.filter((p) => p.status === 'pendiente').length;
  const activeAlerts = announcements.filter((a) => a.isCutoffAlert || a.type === 'urgente');

  const handleSaveBcv = () => {
    const val = parseFloat(tempBcv);
    if (!isNaN(val) && val > 0) {
      updateBcvRate(val);
      setIsEditingBcv(false);
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => setActiveTab('inicio')}
            className="cursor-pointer flex items-center shrink-0"
          >
            <CondoLogo size="md" showRif={true} />
          </div>

          {/* Desktop BCV Tasa Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-emerald-950 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tasa Oficial BCV:
            </span>
            {isEditingBcv && currentUser?.role === 'admin' ? (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  value={tempBcv}
                  onChange={(e) => setTempBcv(e.target.value)}
                  className="w-20 bg-white border border-emerald-400 rounded px-1.5 py-0.5 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  autoFocus
                />
                <button
                  onClick={handleSaveBcv}
                  className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                  title="Guardar tasa BCV"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-extrabold text-emerald-900">
                  Bs {settings.bcvExchangeRate.toFixed(2)}
                </span>
                <span className="text-[10px] text-emerald-700">/ USD</span>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setTempBcv(settings.bcvExchangeRate.toString());
                      setIsEditingBcv(true);
                    }}
                    className="p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 rounded cursor-pointer"
                    title="Editar tasa BCV oficial"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & Auth User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Notificaciones y alertas de pago"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-5 h-5" />
                {(activeAlerts.length > 0 || (currentUser?.role === 'admin' && pendingPaymentsCount > 0)) && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                )}
              </button>

              {/* Notifications Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      Alertas y Notificaciones
                    </h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2 space-y-2">
                    {/* Payment Cutoff Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-900">
                            Fecha de Corte y Recibos Listos
                          </p>
                          <p className="text-amber-800 text-[11px] mt-0.5">
                            Periodo: {settings.currentBillingPeriod}. Plazo de 7 días continuos para realizar su pago a tasa BCV sin mora (3%).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Admin pending payments notice */}
                    {currentUser?.role === 'admin' && pendingPaymentsCount > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
                        <p className="font-bold text-blue-900">
                          {pendingPaymentsCount} Pagos Pendientes por Conciliar
                        </p>
                        <p className="text-blue-800 text-[11px] mt-0.5">
                          Hay transferencias y pagos móviles reportados con capture listos para verificación.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab('pagos_revision');
                            setShowNotifications(false);
                          }}
                          className="mt-2 text-xs font-bold text-blue-700 hover:underline"
                        >
                          Ir a conciliación de pagos &rarr;
                        </button>
                      </div>
                    )}

                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="py-2 text-xs">
                        <p className="font-semibold text-slate-900">{ann.title}</p>
                        <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">
                          {ann.content}
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {ann.date} • {ann.author}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Switch */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 pl-3 pr-2 py-1.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
                      currentUser.role === 'admin'
                        ? 'bg-rose-600 shadow-xs'
                        : 'bg-emerald-600 shadow-xs'
                    }`}
                  >
                    {currentUser.role === 'admin' ? (
                      <Shield className="w-3.5 h-3.5" />
                    ) : (
                      <Home className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="leading-tight hidden sm:block text-left">
                    <p className="font-bold text-slate-900 text-xs">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {currentUser.role === 'admin'
                        ? 'Administrador General'
                        : `Vecino (${currentUser.houseCode})`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                Ingresar
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
              aria-label="Alternar menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bar for BCV & Quick info */}
      <div className="md:hidden px-4 py-2 bg-emerald-50/80 border-t border-emerald-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-emerald-950 font-semibold">
          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tasa BCV:</span>
          <span className="font-mono font-bold">Bs {settings.bcvExchangeRate.toFixed(2)}</span>
        </div>
        <span className="text-[10px] text-emerald-700 font-medium">
          Periodo: {settings.currentBillingPeriod}
        </span>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-2 text-sm shadow-lg">
          {currentUser?.role === 'admin' ? (
            <>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'dashboard' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                }`}
              >
                Panel Financiero
              </button>
              <button
                onClick={() => {
                  setActiveTab('casas');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'casas' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                }`}
              >
                Directorio 216 Casas
              </button>
              <button
                onClick={() => {
                  setActiveTab('pagos_revision');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'pagos_revision' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                }`}
              >
                Conciliación de Pagos ({pendingPaymentsCount})
              </button>
              <button
                onClick={() => {
                  setActiveTab('gastos_facturacion');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'gastos_facturacion' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                }`}
              >
                Módulo de Facturación
              </button>
              <button
                onClick={() => {
                  setActiveTab('seniat_fiscal');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'seniat_fiscal' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                }`}
              >
                Libro SENIAT & Legal
              </button>
              <button
                onClick={() => {
                  setActiveTab('seguridad');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'seguridad' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700'
                }`}
              >
                Seguridad y Usuarios
              </button>
              <button
                onClick={() => {
                  setActiveTab('logs_auditoria');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'logs_auditoria' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-slate-700'
                }`}
              >
                Auditoría y Respaldos
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setActiveTab('mi_casa');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'mi_casa' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
                }`}
              >
                Estado de Cuenta & Recibo
              </button>
              <button
                onClick={() => {
                  setActiveTab('reportar_pago');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'reportar_pago' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
                }`}
              >
                Reportar Pago (Capture)
              </button>
              <button
                onClick={() => {
                  setActiveTab('incidencias');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'incidencias' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
                }`}
              >
                Reportar Incidencias
              </button>
              <button
                onClick={() => {
                  setActiveTab('reservas');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'reservas' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
                }`}
              >
                Reservar Áreas Comunes
              </button>
              <button
                onClick={() => {
                  setActiveTab('comunicados');
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                  activeTab === 'comunicados' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700'
                }`}
              >
                Comunicados y Alertas
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
