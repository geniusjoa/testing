import React, { useState, useMemo } from 'react';
import { useCondo } from '../../context/CondoContext';
import { UserAccount } from '../../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Search,
  Download,
  Filter,
  UserCheck,
  UserX,
  Plus,
  Clock,
  Home,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  X,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

export const SecurityManagement: React.FC = () => {
  const {
    users,
    houses,
    auditLogs,
    updateUser,
    resetUserPassword,
    bulkResetPasswords,
    toggleUserStatus,
    createUser,
  } = useCondo();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [streetFilter, setStreetFilter] = useState<'todos' | 'Calle 1' | 'Calle 2' | 'Calle C' | 'admin'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'bloqueado'>('todos');

  // Modals & UI States
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState<'activo' | 'bloqueado'>('activo');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Password visibility map { [userId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Admin User Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'vecino'>('admin');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // Bulk reset confirmation modal
  const [isBulkResetConfirmOpen, setIsBulkResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle password visibility
  const toggleShowPassword = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Copy password to clipboard
  const handleCopyPassword = (userId: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(userId);
    showToast('Contraseña copiada al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Street filter
      if (streetFilter === 'admin') {
        if (u.role !== 'admin') return false;
      } else if (streetFilter !== 'todos') {
        const h = houses.find((house) => house.code === u.houseCode);
        if (!h || h.street !== streetFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'todos' && u.status !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesCode = u.houseCode?.toLowerCase().includes(term);
        const matchesName = u.residentName.toLowerCase().includes(term);
        const matchesUser = u.username.toLowerCase().includes(term);
        return Boolean(matchesCode || matchesName || matchesUser);
      }

      return true;
    });
  }, [users, houses, streetFilter, statusFilter, searchTerm]);

  // Statistics
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === 'activo').length;
  const blockedCount = users.filter((u) => u.status === 'bloqueado').length;
  const securityLogs = auditLogs.filter((l) => l.category === 'seguridad').slice(0, 8);

  // Export credentials to CSV
  const handleExportCSV = () => {
    const headers = ['Tipo', 'Inmueble', 'Calle', 'Propietario', 'Usuario', 'Contraseña_Acceso', 'Estado', 'Telefono', 'Correo'];
    const rows = users.map((u) => {
      const h = houses.find((house) => house.code === u.houseCode);
      return [
        u.role === 'admin' ? 'Administrador' : 'Propietario',
        u.houseCode || 'Oficina',
        h?.street || 'N/A',
        `"${u.residentName}"`,
        u.username,
        `"${u.password}"`,
        u.status,
        u.phone || '',
        u.email || '',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Credenciales_Florencia_216_Casas_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Archivo CSV de credenciales generado exitosamente.');
  };

  // Open Edit User Modal
  const handleOpenEdit = (user: UserAccount) => {
    setSelectedUserForEdit(user);
    setEditPassword(user.password);
    setEditStatus(user.status === 'bloqueado' ? 'bloqueado' : 'activo');
    setEditEmail(user.email || '');
    setEditPhone(user.phone || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    updateUser(selectedUserForEdit.id, {
      password: editPassword.trim(),
      status: editStatus,
      email: editEmail.trim(),
      phone: editPhone.trim(),
    });

    showToast(`Credenciales actualizadas para ${selectedUserForEdit.username}`);
    setSelectedUserForEdit(null);
  };

  // Reset password to default for single user
  const handleSingleReset = (user: UserAccount) => {
    const newP = resetUserPassword(user.id);
    showToast(`Contraseña restablecida a: ${newP}`);
  };

  // Handle create new user
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) return;

    createUser({
      username: newUsername.trim(),
      residentName: newName.trim(),
      role: newRole,
      password: newPassword.trim(),
      defaultPassword: newPassword.trim(),
      email: newEmail.trim() || undefined,
      phone: newPhone.trim() || undefined,
      status: 'activo',
    });

    setIsAddUserOpen(false);
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setNewEmail('');
    setNewPhone('');
    showToast(`Usuario ${newUsername} registrado exitosamente.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in slide-in-from-bottom-5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Shield className="w-3.5 h-3.5" />
              Módulo de Administración de Seguridad y Control de Acceso
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
              Gestión de Usuarios y Contraseñas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Administre las credenciales de acceso de los <strong>216 copropietarios</strong> y personal administrativo. Garantice la confidencialidad para que cada vecino únicamente pueda ver la información correspondiente a su inmueble.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Exportar Claves (CSV)
            </button>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Security Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80 text-left">
          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold block">Total Cuentas</span>
            <span className="text-xl font-bold text-white font-mono">{totalUsers}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">216 Casas + 1 Junta Admin</span>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-emerald-400 font-semibold block">Cuentas Activas</span>
            <span className="text-xl font-bold text-emerald-300 font-mono">{activeCount}</span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Acceso habilitado</span>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-rose-400 font-semibold block">Cuentas Bloqueadas</span>
            <span className="text-xl font-bold text-rose-400 font-mono">{blockedCount}</span>
            <span className="text-[10px] text-rose-400/80 block mt-0.5">Acceso restringido</span>
          </div>

          <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-[11px] text-indigo-400 font-semibold block">Patrón de Contraseña</span>
            <span className="text-sm font-bold text-white font-mono block truncate">Florencia.[Código]</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Ej: Florencia.1-1A</span>
          </div>
        </div>
      </div>

      {/* Quick Security Actions Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Política de Aislamiento de Datos por Inmueble
            </h2>
            <p className="text-[11px] text-slate-500">
              Cada propietario al autenticarse con su contraseña única solo tiene permiso para consultar su estado de cuenta, recibos y reportar sus pagos.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBulkResetConfirmOpen(true)}
          className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
          Restablecer Claves Masivas
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por código de casa (ej: 1-1A), nombre de propietario o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
            />
          </div>

          {/* Street pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setStreetFilter('todos')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                streetFilter === 'todos'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setStreetFilter('Calle 1')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                streetFilter === 'Calle 1'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Calle 1 (92)
            </button>
            <button
              onClick={() => setStreetFilter('Calle 2')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                streetFilter === 'Calle 2'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Calle 2 (84)
            </button>
            <button
              onClick={() => setStreetFilter('Calle C')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                streetFilter === 'Calle C'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Calle C (40)
            </button>
            <button
              onClick={() => setStreetFilter('admin')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                streetFilter === 'admin'
                  ? 'bg-rose-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Admins
            </button>
          </div>
        </div>

        {/* Second row of status filter */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar estado:</span>
            <button
              onClick={() => setStatusFilter('todos')}
              className={`font-semibold cursor-pointer ${statusFilter === 'todos' ? 'text-indigo-600 font-bold underline' : 'hover:text-slate-900'}`}
            >
              Todos
            </button>
            <span>•</span>
            <button
              onClick={() => setStatusFilter('activo')}
              className={`font-semibold cursor-pointer ${statusFilter === 'activo' ? 'text-emerald-600 font-bold underline' : 'hover:text-slate-900'}`}
            >
              Activos ({activeCount})
            </button>
            <span>•</span>
            <button
              onClick={() => setStatusFilter('bloqueado')}
              className={`font-semibold cursor-pointer ${statusFilter === 'bloqueado' ? 'text-rose-600 font-bold underline' : 'hover:text-slate-900'}`}
            >
              Bloqueados ({blockedCount})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Mostrando {filteredUsers.length} de {users.length} cuentas registradas
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Inmueble / Rol</th>
                <th className="py-3 px-4">Propietario / Titular</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Contraseña de Acceso</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Último Ingreso</th>
                <th className="py-3 px-4 text-right">Acciones de Seguridad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isVisible = !!visiblePasswords[u.id];
                  const house = houses.find((h) => h.code === u.houseCode);
                  const isCopied = copiedId === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* House or Admin Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <Shield className="w-3 h-3 text-rose-600" />
                            Administrador
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 text-xs px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                              {u.houseCode}
                            </span>
                            <span className="text-[10px] text-slate-400">{house?.street || ''}</span>
                          </div>
                        )}
                      </td>

                      {/* Resident Name & contact */}
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900 text-xs">{u.residentName}</p>
                        <p className="text-[10px] text-slate-400">
                          {u.phone || 'Sin teléfono'} • {u.email || 'Sin correo'}
                        </p>
                      </td>

                      {/* Username */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {u.username}
                      </td>

                      {/* Password */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100/90 px-2 py-1 rounded-lg border border-slate-200">
                          <span className="font-mono text-xs font-bold text-slate-900 select-all">
                            {isVisible ? u.password : '••••••••••••'}
                          </span>
                          <button
                            onClick={() => toggleShowPassword(u.id)}
                            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                            title={isVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleCopyPassword(u.id, u.password)}
                            className="text-slate-400 hover:text-indigo-600 p-0.5 cursor-pointer"
                            title="Copiar contraseña"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {u.status === 'activo' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <UserX className="w-3 h-3 text-rose-600" />
                            Bloqueado
                          </span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        {u.lastLogin ? (
                          <div className="flex items-center gap-1 text-slate-700">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{u.lastLogin}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Nunca ha ingresado</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar credenciales y datos"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleSingleReset(u)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Restablecer a contraseña predeterminada"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.status === 'activo'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.status === 'activo' ? 'Bloquear acceso' : 'Desbloquear acceso'}
                          >
                            {u.status === 'activo' ? (
                              <Lock className="w-3.5 h-3.5" />
                            ) : (
                              <Unlock className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Trail Log Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900">
              Bitácora de Autenticación y Eventos de Seguridad
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Registro automático de inicios de sesión y cambios de contraseña
          </span>
        </div>

        <div className="space-y-2">
          {securityLogs.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No hay registros recientes de seguridad.</p>
          ) : (
            securityLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                      {log.user}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono shrink-0">
                  {log.timestamp}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL: Edit User Credentials */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base font-heading">
                  Editar Credenciales de Acceso
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">{selectedUserForEdit.residentName}</p>
                <p className="text-slate-500">
                  {selectedUserForEdit.role === 'admin'
                    ? 'Cuenta de Administración General'
                    : `Inmueble Casa ${selectedUserForEdit.houseCode}`}
                </p>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Nueva Contraseña de Acceso
                </label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono font-medium"
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditPassword(
                      selectedUserForEdit.defaultPassword ||
                        `Florencia.${selectedUserForEdit.houseCode || '2026'}`
                    )
                  }
                  className="text-[11px] text-indigo-600 hover:underline font-semibold"
                >
                  Restaurar a valor predeterminado (Florencia.{selectedUserForEdit.houseCode || '2026'})
                </button>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Estado de la Cuenta</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                >
                  <option value="activo">Activo (Permite acceso a su estado de cuenta)</option>
                  <option value="bloqueado">Bloqueado (Acceso revocado por administración)</option>
                </select>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Teléfono</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="0414-1234567"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="propietario@email.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add New User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base font-heading">
                  Crear Usuario de Sistema
                </h3>
              </div>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Vigilancia Principal / Auditoria"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Usuario (Login)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: vigilante1"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Rol</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  >
                    <option value="admin">Administrador / Junta</option>
                    <option value="vecino">Vecino / Propietario</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Contraseña Inicial</label>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Teléfono</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0414-0000000"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Correo</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="usuario@condominio.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Bulk Reset Confirmation */}
      {isBulkResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-heading">
              ¿Restablecer Contraseñas a Valores Predeterminados?
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción restablecerá la contraseña de acceso de las <strong>216 casas</strong> al formato oficial <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-slate-800">Florencia.[Código]</code> (por ejemplo: <strong className="font-mono text-slate-900">Florencia.1-1A</strong>) y la contraseña de administración a <strong className="font-mono text-slate-900">Florencia2026</strong>.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsBulkResetConfirmOpen(false)}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  bulkResetPasswords();
                  setIsBulkResetConfirmOpen(false);
                  showToast('Se restablecieron las contraseñas predeterminadas para todas las unidades.');
                }}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                Sí, Restablecer Todas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
