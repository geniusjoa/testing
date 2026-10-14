import React, { useState } from 'react';
import { CondoProvider, useCondo } from './context/CondoContext';
import { Navbar } from './components/Navbar';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HousesManagement } from './components/admin/HousesManagement';
import { ExpensesBilling } from './components/admin/ExpensesBilling';
import { PaymentsApproval } from './components/admin/PaymentsApproval';
import { SeniatFiscal } from './components/admin/SeniatFiscal';
import { AuditAndBackup } from './components/admin/AuditAndBackup';
import { SecurityManagement } from './components/admin/SecurityManagement';
import { ResidentDashboard } from './components/resident/ResidentDashboard';
import { PaymentReportForm } from './components/resident/PaymentReportForm';
import { IncidentsReport } from './components/resident/IncidentsReport';
import { CommonAreaReservations } from './components/resident/CommonAreaReservations';
import { AnnouncementsList } from './components/resident/AnnouncementsList';
import { ReceiptView } from './components/ReceiptView';
import {
  LayoutDashboard,
  Home,
  Users,
  CheckSquare,
  FileSpreadsheet,
  Scale,
  Shield,
  CreditCard,
  AlertTriangle,
  Calendar,
  Bell,
  FileText,
  KeyRound,
} from 'lucide-react';

function CondoAppContent() {
  const { currentUser, currentHouse, currentHouseReceipt, getReceiptForHouse, settings } = useCondo();
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [viewingReceiptHouseCode, setViewingReceiptHouseCode] = useState<string | null>(null);

  // Determine view mode based on current user
  const isAdmin = currentUser?.role === 'admin';

  // Open full receipt for a given house
  const handleOpenReceipt = (houseCode: string) => {
    setViewingReceiptHouseCode(houseCode);
    setActiveTab('recibo_detalle');
  };

  const receiptToDisplay = viewingReceiptHouseCode
    ? getReceiptForHouse(viewingReceiptHouseCode)
    : currentHouseReceipt;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs Bar */}
        <div className="no-print mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
            {isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'dashboard' || activeTab === 'inicio'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Panel Financiero
                </button>

                <button
                  onClick={() => setActiveTab('casas')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'casas'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Directorio 216 Casas
                </button>

                <button
                  onClick={() => setActiveTab('pagos_revision')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'pagos_revision'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  Conciliación de Pagos
                </button>

                <button
                  onClick={() => setActiveTab('gastos_facturacion')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'gastos_facturacion'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Módulo de Facturación
                </button>

                <button
                  onClick={() => setActiveTab('seniat_fiscal')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'seniat_fiscal'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  Libro SENIAT & Legal
                </button>

                <button
                  onClick={() => setActiveTab('incidencias')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'incidencias'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Incidencias
                </button>

                <button
                  onClick={() => setActiveTab('reservas')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'reservas'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Reservas
                </button>

                <button
                  onClick={() => setActiveTab('comunicados')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'comunicados'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Comunicados
                </button>

                <button
                  onClick={() => setActiveTab('seguridad')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'seguridad'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-indigo-500" />
                  Seguridad & Claves
                </button>

                <button
                  onClick={() => setActiveTab('logs_auditoria')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'logs_auditoria'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Auditoría y Respaldos
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('mi_casa')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'mi_casa' || activeTab === 'inicio'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  Estado de Cuenta
                </button>

                <button
                  onClick={() => {
                    if (currentHouse) {
                      handleOpenReceipt(currentHouse.code);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'recibo_detalle'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Mi Recibo Digital
                </button>

                <button
                  onClick={() => setActiveTab('reportar_pago')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'reportar_pago'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  Reportar Pago
                </button>

                <button
                  onClick={() => setActiveTab('incidencias')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'incidencias'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Reportar Incidencias
                </button>

                <button
                  onClick={() => setActiveTab('reservas')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'reservas'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Reservar Áreas
                </button>

                <button
                  onClick={() => setActiveTab('comunicados')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    activeTab === 'comunicados'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  Comunicados y Avisos
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Views Rendering */}
        <main>
          {/* Official Printable Receipt View */}
          {activeTab === 'recibo_detalle' && receiptToDisplay ? (
            <ReceiptView
              receipt={receiptToDisplay}
              settings={settings}
              onBack={() => setActiveTab(isAdmin ? 'dashboard' : 'mi_casa')}
              onPayNow={() => setActiveTab('reportar_pago')}
            />
          ) : isAdmin ? (
            /* Admin Views */
            <>
              {(activeTab === 'dashboard' || activeTab === 'inicio') && (
                <AdminDashboard
                  onNavigate={setActiveTab}
                  onViewReceipt={handleOpenReceipt}
                />
              )}
              {activeTab === 'casas' && (
                <HousesManagement
                  onViewReceipt={handleOpenReceipt}
                />
              )}
              {activeTab === 'pagos_revision' && <PaymentsApproval />}
              {activeTab === 'gastos_facturacion' && <ExpensesBilling onViewReceipt={handleOpenReceipt} />}
              {activeTab === 'seniat_fiscal' && <SeniatFiscal />}
              {activeTab === 'incidencias' && <IncidentsReport />}
              {activeTab === 'reservas' && <CommonAreaReservations />}
              {activeTab === 'comunicados' && <AnnouncementsList />}
              {activeTab === 'seguridad' && <SecurityManagement />}
              {activeTab === 'logs_auditoria' && <AuditAndBackup />}
            </>
          ) : (
            /* Resident Views */
            <>
              {(activeTab === 'mi_casa' || activeTab === 'inicio') && (
                <ResidentDashboard
                  onNavigate={setActiveTab}
                  onViewReceipt={() => {
                    if (currentHouse) handleOpenReceipt(currentHouse.code);
                  }}
                />
              )}
              {activeTab === 'reportar_pago' && (
                <PaymentReportForm onSuccess={() => setActiveTab('mi_casa')} />
              )}
              {activeTab === 'incidencias' && <IncidentsReport />}
              {activeTab === 'reservas' && <CommonAreaReservations />}
              {activeTab === 'comunicados' && <AnnouncementsList />}
            </>
          )}
        </main>
      </div>

      {/* Footer (hidden on print) */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-800">
            {settings.condoName} • RIF: {settings.rif}
          </p>
          <p>
            216 Unidades Residenciales (Calle 1: 92 | Calle 2: 84 | Calle C: 40) • Conforme a la Ley de Propiedad Horizontal y SENIAT
          </p>
          <p className="text-[11px] text-slate-400">
            Tasa referencial Banco Central de Venezuela: Bs {settings.bcvExchangeRate.toFixed(2)}/USD • Banco de Venezuela Cta Cte: {settings.accountNumber}
          </p>
        </div>
      </footer>

      {/* Login / Switch Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <CondoProvider>
      <CondoAppContent />
    </CondoProvider>
  );
}
