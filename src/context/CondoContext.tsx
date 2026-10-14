import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  HouseUnit,
  MonthlyExpense,
  PaymentReport,
  Incident,
  Reservation,
  Announcement,
  AuditLog,
  CondoSettings,
  CondoReceipt,
  ExpenseBreakdownItem,
  UserAccount,
  BillingPeriod,
  HouseSpecificExpense,
} from '../types';
import {
  initialCondoSettings,
  initialExpenses,
  initialHouses,
  initialAnnouncements,
  initialAuditLogs,
  createInitialUsers,
  initialBillingPeriods,
  initialHouseSpecificExpenses,
} from '../data/initialData';

export interface CurrentUser {
  role: 'admin' | 'vecino';
  name: string;
  houseCode?: string;
  username?: string;
}

interface CondoContextType {
  currentUser: CurrentUser | null;
  currentHouse: HouseUnit | null;
  currentHouseReceipt: CondoReceipt | null;
  settings: CondoSettings;
  houses: HouseUnit[];
  users: UserAccount[];
  expenses: MonthlyExpense[];
  billingPeriods: BillingPeriod[];
  currentSelectedPeriod: string;
  setCurrentSelectedPeriod: (period: string) => void;
  houseSpecificExpenses: HouseSpecificExpense[];
  addHouseSpecificExpense: (expense: Omit<HouseSpecificExpense, 'id'>) => void;
  deleteHouseSpecificExpense: (id: string) => void;
  createBillingPeriod: (data: { monthYear: string; issueDate: string; dueDate: string; bcvRate?: number }) => void;
  copyExpensesFromPreviousPeriod: (fromPeriod: string, toPeriod: string) => void;
  getReceiptForHouseAndPeriod: (houseCode: string, periodMonthYear?: string) => CondoReceipt | null;
  getAllReceiptsForPeriod: (periodMonthYear?: string) => CondoReceipt[];
  emitBillingPeriod: (periodMonthYear: string) => void;
  paymentReports: PaymentReport[];
  incidents: Incident[];
  reservations: Reservation[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  loginAdmin: (user: string, pass: string) => { success: boolean; error?: string };
  loginVecino: (usernameOrHouse: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (userId: string, updates: Partial<UserAccount>) => void;
  resetUserPassword: (userId: string, newPass?: string) => string;
  bulkResetPasswords: () => void;
  toggleUserStatus: (userId: string) => void;
  createUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  changeOwnPassword: (currentPass: string, newPass: string) => { success: boolean; error?: string };
  updateBcvRate: (newRate: number) => void;
  addPaymentReport: (data: Omit<PaymentReport, 'id' | 'createdAt' | 'status'>) => void;
  submitPaymentReport: (data: any) => void;
  approvePayment: (paymentId: string) => void;
  rejectPayment: (paymentId: string, reason: string) => void;
  addExpense: (expense: Omit<MonthlyExpense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  generateMonthlyBilling: (periodName: string) => void;
  addIncident: (incident: Omit<Incident, 'id' | 'createdAt' | 'status'>) => void;
  reportIncident: (data: any) => void;
  updateIncidentStatus: (id: string, status: Incident['status'], response?: string) => void;
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => void;
  requestReservation: (data: any) => void;
  cancelReservation: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  getReceiptForHouse: (houseCode: string) => CondoReceipt | null;
  exportDatabaseBackup: () => string;
  importDatabaseBackup: (jsonContent: string) => boolean;
  resetToOriginalData: () => void;
}

const CondoContext = createContext<CondoContextType | undefined>(undefined);

const STORAGE_KEYS = {
  HOUSES: 'florencia_houses_v1',
  USERS: 'florencia_users_v2',
  EXPENSES: 'florencia_expenses_v1',
  PAYMENTS: 'florencia_payments_v1',
  INCIDENTS: 'florencia_incidents_v1',
  RESERVATIONS: 'florencia_reservations_v1',
  ANNOUNCEMENTS: 'florencia_announcements_v1',
  AUDIT_LOGS: 'florencia_audit_logs_v1',
  SETTINGS: 'florencia_settings_v1',
  USER: 'florencia_auth_user_v1',
  BILLING_PERIODS: 'florencia_billing_periods_v1',
  HOUSE_EXPENSES: 'florencia_house_expenses_v1',
  CURRENT_PERIOD: 'florencia_current_selected_period_v1',
};

const initialSamplePayments: PaymentReport[] = [
  {
    id: 'pay-1',
    houseCode: '1-1A',
    residentName: 'Belkis Hernandez',
    receiptNumber: 1024,
    monthYear: 'JULIO 2026',
    amountBs: 2000.00,
    amountUsd: 2.64,
    exchangeRateBcv: 757.54,
    paymentDate: '2026-08-08',
    paymentMethod: 'pago_movil',
    originBank: 'Banco de Venezuela',
    destinationBank: 'Banco de Venezuela (01-02-0686-3400-0000-3447)',
    referenceNumber: '009841',
    status: 'aprobado',
    createdAt: '2026-08-08 14:20:00',
    reviewedAt: '2026-08-08 16:45:00',
    reviewedBy: 'Florentino (Admin)',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    notes: 'Pago mensual de condominio adelantado con saldo a favor restante.',
  },
  {
    id: 'pay-2',
    houseCode: '2-1C',
    residentName: 'Oliva Albarran de Nuñez',
    receiptNumber: 1118,
    monthYear: 'JULIO 2026',
    amountBs: 1146.36,
    amountUsd: 1.51,
    exchangeRateBcv: 757.54,
    paymentDate: '2026-08-09',
    paymentMethod: 'transferencia',
    originBank: 'Banesco',
    destinationBank: 'Banco de Venezuela',
    referenceNumber: '88492019',
    status: 'pendiente',
    createdAt: '2026-08-09 11:30:00',
    screenshotUrl: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80',
    notes: 'Reporte de pago pendiente por conciliar.',
  },
];

const initialSampleIncidents: Incident[] = [
  {
    id: 'inc-1',
    houseCode: '1-4A',
    residentName: 'Luis Gutierrez',
    title: 'Lámpara de poste titilando frente a la casa 1-4A',
    category: 'alumbrado',
    description: 'La luminaria LED del poste de alumbrado público titila intermitentemente durante la noche.',
    priority: 'media',
    status: 'en_proceso',
    createdAt: '2026-08-06 19:40:00',
    adminResponse: 'Se asignó al electricista de guardia para revisión el martes.',
  },
  {
    id: 'inc-2',
    houseCode: '2-15A',
    residentName: 'Willian Carrero',
    title: 'Control del portón no abre a la primera pulsación',
    category: 'porton',
    description: 'El receptor inalámbrico del portón de Calle 2 parece tener interferencia o bajo alcance.',
    priority: 'alta',
    status: 'en_revision',
    createdAt: '2026-08-07 08:15:00',
  },
];

const initialSampleReservations: Reservation[] = [
  {
    id: 'res-1',
    houseCode: '1-1B',
    residentName: 'Astrid Agudelo',
    areaId: 'caney',
    areaName: 'Caney / Churuata Central',
    date: '2026-08-16',
    timeSlot: 'tarde',
    timeSlotLabel: 'Tarde (2:00 PM - 7:00 PM)',
    guestsCount: 20,
    eventDescription: 'Cumpleaños familiar privado',
    costBs: 11363.10,
    costUsd: 15,
    status: 'confirmada',
    createdAt: '2026-08-05 10:00:00',
  },
];

export const CondoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or default
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : { role: 'admin', name: 'Florentino (Administrador)', username: 'Florentino' };
  });

  const [settings, setSettings] = useState<CondoSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : initialCondoSettings;
  });

  const [houses, setHouses] = useState<HouseUnit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOUSES);
    return saved ? JSON.parse(saved) : initialHouses;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return createInitialUsers(initialHouses);
  });

  const [expenses, setExpenses] = useState<MonthlyExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [paymentReports, setPaymentReports] = useState<PaymentReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : initialSamplePayments;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
    return saved ? JSON.parse(saved) : initialSampleIncidents;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return saved ? JSON.parse(saved) : initialSampleReservations;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BILLING_PERIODS);
    return saved ? JSON.parse(saved) : initialBillingPeriods;
  });

  const [currentSelectedPeriod, setCurrentSelectedPeriod] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_PERIOD);
    return saved || 'JULIO 2026';
  });

  const [houseSpecificExpenses, setHouseSpecificExpenses] = useState<HouseSpecificExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOUSE_EXPENSES);
    return saved ? JSON.parse(saved) : initialHouseSpecificExpenses;
  });

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOUSES, JSON.stringify(houses));
  }, [houses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLING_PERIODS, JSON.stringify(billingPeriods));
  }, [billingPeriods]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PERIOD, currentSelectedPeriod);
  }, [currentSelectedPeriod]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOUSE_EXPENSES, JSON.stringify(houseSpecificExpenses));
  }, [houseSpecificExpenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(paymentReports));
  }, [paymentReports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper log audit
  const logAction = (action: string, category: AuditLog['category'], details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Sistema',
      role: currentUser?.role || 'admin',
      action,
      category,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Login methods with password verification
  const loginAdmin = (usernameInput: string, pass: string) => {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check against users state
    const adminAccount = users.find(
      (u) => u.role === 'admin' && (u.username.toLowerCase() === cleanUser || cleanUser === 'admin')
    );

    if (adminAccount) {
      if (adminAccount.status === 'bloqueado') {
        logAction('Acceso Bloqueado Admin', 'seguridad', `Intento de acceso con usuario admin bloqueado: ${usernameInput}`);
        return { success: false, error: 'Esta cuenta administrativa ha sido bloqueada por seguridad.' };
      }
      if (adminAccount.password !== cleanPass) {
        logAction('Fallo Autenticación Admin', 'seguridad', `Contraseña incorrecta para el usuario administrador "${usernameInput}".`);
        return { success: false, error: 'Contraseña de administrador incorrecta.' };
      }

      const adminUser: CurrentUser = {
        role: 'admin',
        name: adminAccount.residentName,
        username: adminAccount.username,
      };
      setCurrentUser(adminUser);

      // update last login
      setUsers((prev) =>
        prev.map((u) =>
          u.id === adminAccount.id
            ? { ...u, lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19) }
            : u
        )
      );

      logAction('Inicio de sesión Administrador', 'seguridad', `Acceso concedido al panel financiero para ${adminAccount.username}.`);
      return { success: true };
    }

    // Default master fallback
    if (cleanUser === 'florentino' && cleanPass === 'Florencia2026') {
      const adminUser: CurrentUser = {
        role: 'admin',
        name: 'Florentino (Administrador)',
        username: 'Florentino',
      };
      setCurrentUser(adminUser);
      logAction('Inicio de sesión Administrador', 'seguridad', 'Acceso al panel financiero de administración con clave maestra.');
      return { success: true };
    }

    logAction('Fallo Autenticación Admin', 'seguridad', `Usuario o clave inválida: "${usernameInput}".`);
    return { success: false, error: 'Usuario o contraseña de administrador incorrectos.' };
  };

  const loginVecino = (usernameOrHouse: string, pass: string) => {
    const cleanInput = usernameOrHouse.trim().toUpperCase();
    const cleanPass = pass.trim();

    if (!cleanInput || !cleanPass) {
      return { success: false, error: 'Debe ingresar el código de inmueble y su contraseña.' };
    }

    // Search user
    const foundUser = users.find(
      (u) =>
        u.role === 'vecino' &&
        (u.username.toUpperCase() === cleanInput ||
          (u.houseCode && u.houseCode.toUpperCase() === cleanInput))
    );

    if (!foundUser) {
      logAction('Intento Fallido Acceso Vecino', 'seguridad', `Inmueble/usuario "${usernameOrHouse}" no existe en el registro.`);
      return { success: false, error: `Inmueble o usuario "${usernameOrHouse}" no encontrado en el directorio de 216 casas.` };
    }

    if (foundUser.status === 'bloqueado') {
      logAction('Acceso Denegado', 'seguridad', `Acceso denegado: Casa ${foundUser.houseCode} tiene el usuario bloqueado.`);
      return { success: false, error: 'El acceso para este inmueble ha sido suspendido por la Junta de Condominio. Contacte a la administración.' };
    }

    if (foundUser.password !== cleanPass) {
      logAction('Contraseña Incorrecta Vecino', 'seguridad', `Clave incorrecta introducida para Casa ${foundUser.houseCode}.`);
      return { success: false, error: 'Contraseña de acceso incorrecta. Verifique mayúsculas o contacte a la administración para restablecerla.' };
    }

    const vecinoUser: CurrentUser = {
      role: 'vecino',
      name: foundUser.residentName,
      houseCode: foundUser.houseCode,
      username: foundUser.username,
    };
    setCurrentUser(vecinoUser);

    // Update lastLogin
    setUsers((prev) =>
      prev.map((u) =>
        u.id === foundUser.id
          ? { ...u, lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19) }
          : u
      )
    );

    logAction(`Inicio de sesión Vecino ${foundUser.houseCode}`, 'seguridad', `Ingreso exitoso del propietario ${foundUser.residentName}.`);
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAction('Cierre de sesión', 'seguridad', `Usuario ${currentUser.name} cerró sesión.`);
    }
    setCurrentUser(null);
  };

  // User Management & Security Module Functions
  const updateUser = (userId: string, updates: Partial<UserAccount>) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...updates,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : u
      )
    );

    const target = users.find((u) => u.id === userId);
    if (target && target.houseCode) {
      if (updates.residentName || updates.phone !== undefined || updates.email !== undefined) {
        setHouses((prev) =>
          prev.map((h) =>
            h.code === target.houseCode
              ? {
                  ...h,
                  residentName: updates.residentName || h.residentName,
                  phone: updates.phone !== undefined ? updates.phone : h.phone,
                  email: updates.email !== undefined ? updates.email : h.email,
                }
              : h
          )
        );
      }
    }

    logAction('Actualización de Usuario', 'seguridad', `Modificados datos de cuenta de ${target?.username || userId}.`);
  };

  const resetUserPassword = (userId: string, newPass?: string): string => {
    const target = users.find((u) => u.id === userId);
    if (!target) return '';
    const finalPassword =
      newPass && newPass.trim()
        ? newPass.trim()
        : target.defaultPassword || (target.houseCode ? `Florencia.${target.houseCode}` : 'Florencia2026');

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              password: finalPassword,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : u
      )
    );

    logAction(
      'Restablecimiento de Contraseña',
      'seguridad',
      `Contraseña restablecida para ${target.username} (${target.residentName}).`
    );
    return finalPassword;
  };

  const bulkResetPasswords = () => {
    setUsers((prev) =>
      prev.map((u) => ({
        ...u,
        password: u.defaultPassword || (u.houseCode ? `Florencia.${u.houseCode}` : 'Florencia2026'),
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      }))
    );
    logAction(
      'Restablecimiento Masivo de Contraseñas',
      'seguridad',
      'Se restablecieron las contraseñas predeterminadas para los 216 copropietarios y la administración.'
    );
  };

  const toggleUserStatus = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const newStatus = target.status === 'activo' ? 'bloqueado' : 'activo';
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              status: newStatus,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : u
      )
    );
    logAction(
      'Cambio de Estado de Usuario',
      'seguridad',
      `El usuario ${target.username} (${target.residentName}) ha sido ${newStatus === 'activo' ? 'activado' : 'bloqueado'}.`
    );
  };

  const createUser = (user: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setUsers((prev) => [newUser, ...prev]);
    logAction('Creación de Usuario', 'seguridad', `Creado nuevo usuario ${user.username} con rol ${user.role}.`);
  };

  const changeOwnPassword = (currentPass: string, newPass: string) => {
    if (!currentUser) return { success: false, error: 'No hay sesión de usuario activa.' };
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
    }

    const userAccount = users.find(
      (u) =>
        (currentUser.role === 'vecino' && u.houseCode === currentUser.houseCode) ||
        (currentUser.role === 'admin' && (u.username === currentUser.username || u.role === 'admin'))
    );

    if (!userAccount) {
      return { success: false, error: 'Usuario no encontrado en la base de datos.' };
    }

    if (userAccount.password !== currentPass.trim()) {
      return { success: false, error: 'La contraseña actual no coincide.' };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === userAccount.id
          ? {
              ...u,
              password: newPass.trim(),
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            }
          : u
      )
    );

    logAction(
      'Cambio de Contraseña',
      'seguridad',
      `El usuario ${userAccount.username} (${userAccount.residentName}) cambió su contraseña de acceso.`
    );

    return { success: true };
  };

  // BCV Rate Update
  const updateBcvRate = (newRate: number) => {
    if (newRate <= 0) return;
    setSettings((prev) => ({
      ...prev,
      bcvExchangeRate: newRate,
      bcvLastUpdated: new Date().toISOString(),
    }));

    // Update houses USD equivalents
    setHouses((prev) =>
      prev.map((h) => ({
        ...h,
        totalToPayUsd: Number((h.totalToPayBs / newRate).toFixed(2)),
      }))
    );

    logAction(
      'Actualización Tasa BCV',
      'financiero',
      `Tasa oficial cambiada a ${newRate.toFixed(2)} Bs/USD.`
    );
  };

  // Payment reporting & approval
  const addPaymentReport = (data: Omit<PaymentReport, 'id' | 'createdAt' | 'status'>) => {
    const newReport: PaymentReport = {
      ...data,
      id: `pay-${Date.now()}`,
      status: 'pendiente',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setPaymentReports((prev) => [newReport, ...prev]);
    logAction(
      'Reporte de Pago Registrado',
      'pagos',
      `Casa ${data.houseCode} reportó pago Ref: ${data.referenceNumber} por Bs ${data.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}.`
    );
  };

  const approvePayment = (paymentId: string) => {
    const report = paymentReports.find((p) => p.id === paymentId);
    if (!report) return;

    setPaymentReports((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'aprobado',
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              reviewedBy: currentUser?.name || 'Administración',
            }
          : p
      )
    );

    // Update house debt and saldo a favor
    setHouses((prev) =>
      prev.map((h) => {
        if (h.code === report.houseCode) {
          const newDebt = Math.max(0, h.totalToPayBs - report.amountBs);
          const surplus = Math.max(0, report.amountBs - h.totalToPayBs);
          let newStatus: HouseUnit['status'] = 'pendiente';
          if (newDebt === 0) {
            newStatus = surplus > 0 ? 'a_favor' : 'solvente';
          }
          return {
            ...h,
            currentDebt: newDebt > 0 ? newDebt : 0,
            moraAmount: newDebt > 0 ? Number((newDebt * 0.03).toFixed(2)) : 0,
            saldoFavorActual: surplus,
            totalToPayBs: newDebt,
            totalToPayUsd: Number((newDebt / settings.bcvExchangeRate).toFixed(2)),
            pendingReceiptsCount: newDebt === 0 ? 0 : Math.max(0, h.pendingReceiptsCount - 1),
            status: newStatus,
          };
        }
        return h;
      })
    );

    // Update bank balance
    setSettings((prev) => ({
      ...prev,
      bankBalanceBs: prev.bankBalanceBs + report.amountBs,
    }));

    logAction(
      'Pago Conciliado y Aprobado',
      'pagos',
      `Aprobado pago de Casa ${report.houseCode} (${report.residentName}) por Bs ${report.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}. Ref: ${report.referenceNumber}.`
    );
  };

  const rejectPayment = (paymentId: string, reason: string) => {
    const report = paymentReports.find((p) => p.id === paymentId);
    if (!report) return;

    setPaymentReports((prev) =>
      prev.map((p) =>
        p.id === paymentId
          ? {
              ...p,
              status: 'rechazado',
              rejectionReason: reason,
              reviewedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
              reviewedBy: currentUser?.name || 'Administración',
            }
          : p
      )
    );

    logAction(
      'Pago Rechazado',
      'pagos',
      `Rechazado pago de Casa ${report.houseCode}. Motivo: ${reason}.`
    );
  };

  // Expenses management
  const addExpense = (expense: Omit<MonthlyExpense, 'id'>) => {
    const newExp: MonthlyExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [...prev, newExp]);
    logAction(
      'Nuevo Gasto Registrado',
      'financiero',
      `Registrado gasto: "${expense.description}" por Bs ${expense.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}.`
    );
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    if (exp) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      logAction('Gasto Eliminado', 'financiero', `Eliminado gasto "${exp.description}".`);
    }
  };

  // House Specific Expenses (Gastos por Vivienda)
  const addHouseSpecificExpense = (expense: Omit<HouseSpecificExpense, 'id'>) => {
    const house = houses.find((h) => h.code.toUpperCase() === expense.houseCode.toUpperCase());
    const newExpense: HouseSpecificExpense = {
      ...expense,
      id: `hse-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      residentName: expense.residentName || house?.residentName || 'Propietario',
    };
    setHouseSpecificExpenses((prev) => [newExpense, ...prev]);
    logAction(
      'Gasto de Vivienda Registrado',
      'facturacion',
      `Casa ${expense.houseCode}: ${expense.concept} - Bs ${(expense.amountBs ?? 0).toLocaleString('es-VE')}`
    );
  };

  const deleteHouseSpecificExpense = (id: string) => {
    const exp = houseSpecificExpenses.find((e) => e.id === id);
    setHouseSpecificExpenses((prev) => prev.filter((e) => e.id !== id));
    if (exp) {
      logAction('Gasto de Vivienda Eliminado', 'facturacion', `Eliminado cargo a Casa ${exp.houseCode}: ${exp.concept}`);
    }
  };

  // Billing Periods Management (Carga de Recibos por Meses)
  const createBillingPeriod = (data: { monthYear: string; issueDate: string; dueDate: string; bcvRate?: number }) => {
    const cleanMonthYear = data.monthYear.toUpperCase().trim();
    const existing = billingPeriods.find((p) => p.monthYear.toUpperCase() === cleanMonthYear);
    if (existing) {
      setCurrentSelectedPeriod(existing.monthYear);
      return;
    }

    const newPeriod: BillingPeriod = {
      id: `period-${Date.now()}`,
      monthYear: cleanMonthYear,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      bcvRate: data.bcvRate || settings.bcvExchangeRate,
      status: 'borrador',
      totalExpensesBs: 0,
      totalReserveFundBs: 0,
      totalHouseSpecificBs: 0,
      totalBilledBs: 0,
      receiptsCount: houses.length,
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setBillingPeriods((prev) => [newPeriod, ...prev]);
    setCurrentSelectedPeriod(newPeriod.monthYear);
    logAction(
      'Nuevo Periodo de Facturación Creado',
      'facturacion',
      `Creado periodo de facturación mensual: ${newPeriod.monthYear} (Tasa BCV: Bs ${newPeriod.bcvRate})`
    );
  };

  const copyExpensesFromPreviousPeriod = (fromPeriod: string, toPeriod: string) => {
    const prevExpenses = expenses.filter((e) => e.monthYear.toUpperCase() === fromPeriod.toUpperCase());
    if (prevExpenses.length === 0) return;

    const copied = prevExpenses.map((e) => ({
      ...e,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      monthYear: toPeriod,
      date: new Date().toISOString().substring(0, 10),
    }));

    setExpenses((prev) => [...copied, ...prev]);
    logAction(
      'Gastos Básicos Duplicados',
      'facturacion',
      `Copiadas ${copied.length} partidas comunes de ${fromPeriod} a ${toPeriod}`
    );
  };

  // Receipt calculation for any house and any period (including basic & house-specific expenses)
  const getReceiptForHouseAndPeriod = (houseCode: string, periodMonthYear?: string): CondoReceipt | null => {
    const period = periodMonthYear || currentSelectedPeriod || settings.currentBillingPeriod;
    const house = houses.find((h) => h.code.toUpperCase() === houseCode.toUpperCase());
    if (!house) return null;

    const periodData = billingPeriods.find((p) => p.monthYear.toUpperCase() === period.toUpperCase());
    const bcvRate = periodData?.bcvRate || settings.bcvExchangeRate;
    const issueDate = periodData?.issueDate || '09/08/2026';
    const dueDate = periodData?.dueDate || '16/08/2026';

    // 1. Basic / common expenses for this period
    const applicableCommonExpenses = expenses.filter((e) => {
      const matchPeriod = e.monthYear.toUpperCase() === period.toUpperCase();
      const matchStreet = !e.appliesToStreets || e.appliesToStreets.includes(house.street);
      return matchPeriod && matchStreet;
    });

    const breakdownItems: ExpenseBreakdownItem[] = applicableCommonExpenses.map((e) => {
      const share = Number(((e.amountBs * house.alicuota) / 100).toFixed(2));
      return {
        id: e.id,
        description: e.description,
        totalAmountBs: e.amountBs,
        shareAmountBs: share,
        isCommon: e.isCommon,
      };
    });

    // 2. House specific expenses (Gastos por Vivienda) for this house and period
    const specificExpensesForHouse = houseSpecificExpenses.filter(
      (hse) =>
        hse.monthYear.toUpperCase() === period.toUpperCase() &&
        hse.houseCode.toUpperCase() === house.code.toUpperCase()
    );
    const houseExpensesTotalBs = specificExpensesForHouse.reduce((acc, curr) => acc + (curr.amountBs ?? 0), 0);

    const gastosMesTotalBs = breakdownItems.reduce((acc, curr) => acc + (curr.shareAmountBs ?? 0), 0);
    const fondoReservaBs = Number((gastosMesTotalBs * (settings.reserveFundPercent / 100)).toFixed(2));
    const totalCuotaMesBs = Number((gastosMesTotalBs + fondoReservaBs + houseExpensesTotalBs).toFixed(2));

    // For debts:
    const deudaAnteriorBs = house.currentDebt ?? 0;
    const moraBs = house.moraAmount ?? 0;
    const saldoFavorBs = house.saldoFavor ?? 0;
    const saldoFavorActualBs = house.saldoFavorActual ?? 0;
    const subtotal = totalCuotaMesBs + deudaAnteriorBs + moraBs;
    const totalPagarBs = Math.max(0, Number((subtotal - saldoFavorActualBs).toFixed(2)));
    const totalPagarUsd = Number((totalPagarBs / bcvRate).toFixed(2));

    return {
      receiptNumber: house.lastReceiptNumber,
      houseCode: house.code,
      street: house.street,
      residentName: house.residentName,
      monthYear: period,
      issueDate,
      dueDate,
      alicuota: house.alicuota,
      alicuotaPercentStr: house.alicuotaPercentStr,
      expenses: breakdownItems,
      houseExpenses: specificExpensesForHouse,
      houseExpensesTotalBs,
      periodStatus: periodData?.status || 'emitido',
      gastosMesTotalBs,
      fondoReservaPercent: settings.reserveFundPercent,
      fondoReservaBs,
      totalCuotaMesBs,
      deudaAnteriorBs,
      moraPercent: settings.lateFeePercent,
      moraBs,
      saldoFavorBs,
      saldoFavorActualBs,
      totalPagarBs,
      totalPagarUsd,
      bcvRate,
      reserveFundAccountBalanceBs: settings.bankBalanceBs,
      reserveFundMonthCreditBs: 1261.42,
      reserveFundTotalBs: settings.reserveFundBalanceBs,
      reserveFundPendingToCollectBs: 4593.44,
      isPaid: totalPagarBs <= 0,
    };
  };

  const getAllReceiptsForPeriod = (periodMonthYear?: string): CondoReceipt[] => {
    const period = periodMonthYear || currentSelectedPeriod || settings.currentBillingPeriod;
    return houses.map((h) => getReceiptForHouseAndPeriod(h.code, period)!);
  };

  const emitBillingPeriod = (periodMonthYear: string) => {
    const period = periodMonthYear.toUpperCase().trim();

    // Calculate totals for this period
    const periodExpenses = expenses.filter((e) => e.monthYear.toUpperCase() === period);
    const totalExpBs = periodExpenses.reduce((a, b) => a + (b.amountBs ?? 0), 0);
    const totalReserveBs = totalExpBs * (settings.reserveFundPercent / 100);
    const periodHouseExp = houseSpecificExpenses.filter((e) => e.monthYear.toUpperCase() === period);
    const totalHseBs = periodHouseExp.reduce((a, b) => a + (b.amountBs ?? 0), 0);
    const grandTotalBilled = totalExpBs + totalReserveBs + totalHseBs;

    // Update or add period
    setBillingPeriods((prev) => {
      const exists = prev.find((p) => p.monthYear.toUpperCase() === period);
      if (exists) {
        return prev.map((p) =>
          p.monthYear.toUpperCase() === period
            ? {
                ...p,
                status: 'emitido' as const,
                totalExpensesBs: totalExpBs,
                totalReserveFundBs: totalReserveBs,
                totalHouseSpecificBs: totalHseBs,
                totalBilledBs: grandTotalBilled,
                issuedAt: new Date().toISOString().substring(0, 10),
              }
            : p
        );
      } else {
        return [
          {
            id: `period-${Date.now()}`,
            monthYear: period,
            issueDate: new Date().toLocaleDateString('es-VE'),
            dueDate: new Date(Date.now() + 7 * 86400000).toLocaleDateString('es-VE'),
            bcvRate: settings.bcvExchangeRate,
            status: 'emitido' as const,
            totalExpensesBs: totalExpBs,
            totalReserveFundBs: totalReserveBs,
            totalHouseSpecificBs: totalHseBs,
            totalBilledBs: grandTotalBilled,
            receiptsCount: 216,
            createdAt: new Date().toISOString().substring(0, 10),
            issuedAt: new Date().toISOString().substring(0, 10),
          },
          ...prev,
        ];
      }
    });

    setSettings((prev) => ({ ...prev, currentBillingPeriod: period }));
    setCurrentSelectedPeriod(period);

    // Recompute cuota and balances for each house based on this period
    setHouses((prev) =>
      prev.map((h) => {
        const receipt = getReceiptForHouseAndPeriod(h.code, period);
        if (!receipt) return h;
        return {
          ...h,
          lastReceiptNumber: h.lastReceiptNumber + 1,
          totalToPayBs: receipt.totalPagarBs,
          totalToPayUsd: receipt.totalPagarUsd,
          pendingReceiptsCount: receipt.totalPagarBs > 0 ? h.pendingReceiptsCount + 1 : 0,
          status: receipt.totalPagarBs === 0 ? 'solvente' : h.currentDebt > 0 ? 'moroso' : 'pendiente',
        };
      })
    );

    // Also create announcement of new billing
    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      title: `🔔 Recibos Emitidos: Periodo ${period}`,
      content: `Se ha emitido la facturación mensual correspondiente a ${period} con gastos básicos comunes y cargos particulares por vivienda. Recuerde que dispone de siete (7) días continuos para realizar su pago a la tasa oficial BCV.`,
      type: 'corte_pago',
      date: new Date().toISOString().substring(0, 10),
      author: 'Administración Florencia',
      isCutoffAlert: true,
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    logAction(
      'Emisión de Recibos Mensuales',
      'facturacion',
      `Emitidos 216 recibos de condominio para ${period}. Total facturado: Bs ${grandTotalBilled.toLocaleString('es-VE', { minimumFractionDigits: 2 })}.`
    );
  };

  // Monthly Billing Generation (Emisión de Recibos)
  const generateMonthlyBilling = (periodName: string) => {
    emitBillingPeriod(periodName);
  };

  // Generate Receipt Data for a specific house
  const getReceiptForHouse = (houseCode: string): CondoReceipt | null => {
    return getReceiptForHouseAndPeriod(houseCode, currentSelectedPeriod);
  };

  // Helper getters for currently logged in resident
  const currentHouse = currentUser?.houseCode
    ? houses.find((h) => h.code.toUpperCase() === currentUser.houseCode?.toUpperCase()) || null
    : null;

  const currentHouseReceipt = currentHouse ? getReceiptForHouse(currentHouse.code) : null;

  // Compatibility wrappers for resident forms
  const submitPaymentReport = (data: any) => {
    addPaymentReport({
      houseCode: data.houseCode || currentHouse?.code || '1-1A',
      residentName: data.residentName || currentHouse?.residentName || 'Vecino',
      receiptNumber: data.receiptNumber || (currentHouse ? currentHouse.lastReceiptNumber : 1000),
      monthYear: data.monthPeriod || settings.currentBillingPeriod,
      amountBs: Number(data.amountBs),
      amountUsd: Number(data.amountUsd),
      exchangeRateBcv: Number(data.bcvRateUsed) || settings.bcvExchangeRate,
      paymentDate: new Date().toISOString().substring(0, 10),
      paymentMethod: data.paymentMethod || 'pago_movil',
      originBank: data.bankName || 'Banco de Venezuela',
      destinationBank: settings.bankName,
      referenceNumber: String(data.referenceNumber || ''),
      screenshotUrl: data.screenshotUrl,
      notes: data.notes,
    });
  };

  const addIncident = (incidentData: Omit<Incident, 'id' | 'createdAt' | 'status'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `inc-${Date.now()}`,
      status: 'reportada',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setIncidents((prev) => [newIncident, ...prev]);
    logAction('Incidencia Registrada', 'incidencias', `Casa ${incidentData.houseCode} reportó incidencia: "${incidentData.title}".`);
  };

  const updateIncidentStatus = (incidentId: string, status: Incident['status'], adminNotes?: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status,
              adminNotes: adminNotes ?? inc.adminNotes,
              resolvedAt: status === 'resuelta' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : inc.resolvedAt,
            }
          : inc
      )
    );
    logAction('Estado de Incidencia Actualizado', 'incidencias', `Incidencia ${incidentId} cambiada a ${status}.`);
  };

  const addReservation = (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
    const newReservation: Reservation = {
      ...reservationData,
      id: `res-${Date.now()}`,
      status: 'confirmada',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setReservations((prev) => [newReservation, ...prev]);
    logAction('Reserva Creada', 'reservas', `Casa ${reservationData.houseCode} reservó ${reservationData.areaName} para el ${reservationData.date}.`);
  };

  const cancelReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((res) => (res.id === reservationId ? { ...res, status: 'cancelada' as const } : res))
    );
    logAction('Reserva Cancelada', 'reservas', `Cancelada la reserva ${reservationId}.`);
  };

  const addAnnouncement = (data: Omit<Announcement, 'id' | 'date'>) => {
    const newAnnouncement: Announcement = {
      ...data,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    logAction('Comunicado Publicado', 'sistema', `Publicado comunicado: "${data.title}".`);
  };

  const reportIncident = (data: any) => {
    addIncident({
      houseCode: currentHouse?.code || '1-1A',
      residentName: currentHouse?.residentName || 'Vecino',
      title: data.title,
      category: data.category || 'mantenimiento',
      description: data.description,
      priority: data.priority || 'media',
    });
  };

  const requestReservation = (data: any) => {
    addReservation({
      houseCode: currentHouse?.code || '1-1A',
      residentName: currentHouse?.residentName || 'Vecino',
      areaId: data.areaId || 'caney',
      areaName: data.areaName || 'Caney Principal',
      date: data.date,
      timeSlot: data.timeSlot || 'tarde',
      timeSlotLabel: `${data.startTime || '14:00'} a ${data.endTime || '18:00'}`,
      guestsCount: data.guestCount || data.guestsCount || 10,
      eventDescription: data.eventDescription || 'Reunión familiar',
      costBs: 0,
      costUsd: 0,
    });
  };

  // Backup & Restore
  const exportDatabaseBackup = () => {
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings,
      houses,
      users,
      expenses,
      billingPeriods,
      houseSpecificExpenses,
      currentSelectedPeriod,
      paymentReports,
      incidents,
      reservations,
      announcements,
      auditLogs,
    };
    logAction('Respaldo de Base de Datos', 'sistema', 'Exportado respaldo completo del sistema (incluyendo usuarios y contraseñas) en formato JSON.');
    return JSON.stringify(backupData, null, 2);
  };

  const importDatabaseBackup = (jsonContent: string): boolean => {
    try {
      const data = JSON.parse(jsonContent);
      if (!data.houses || !data.settings) return false;

      setSettings(data.settings);
      setHouses(data.houses);
      if (data.users) setUsers(data.users);
      if (data.expenses) setExpenses(data.expenses);
      if (data.billingPeriods) setBillingPeriods(data.billingPeriods);
      if (data.houseSpecificExpenses) setHouseSpecificExpenses(data.houseSpecificExpenses);
      if (data.currentSelectedPeriod) setCurrentSelectedPeriod(data.currentSelectedPeriod);
      if (data.paymentReports) setPaymentReports(data.paymentReports);
      if (data.incidents) setIncidents(data.incidents);
      if (data.reservations) setReservations(data.reservations);
      if (data.announcements) setAnnouncements(data.announcements);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      logAction('Restauración de Base de Datos', 'sistema', 'Restaurados datos desde archivo de respaldo JSON.');
      return true;
    } catch {
      return false;
    }
  };

  const resetToOriginalData = () => {
    setSettings(initialCondoSettings);
    setHouses(initialHouses);
    setUsers(createInitialUsers(initialHouses));
    setExpenses(initialExpenses);
    setBillingPeriods(initialBillingPeriods);
    setHouseSpecificExpenses(initialHouseSpecificExpenses);
    setCurrentSelectedPeriod('JULIO 2026');
    setPaymentReports(initialSamplePayments);
    setIncidents(initialSampleIncidents);
    setReservations(initialSampleReservations);
    setAnnouncements(initialAnnouncements);
    setAuditLogs(initialAuditLogs);
    localStorage.clear();
    logAction('Reinicio de Datos', 'sistema', 'Se restablecieron los datos originales del sistema y usuarios de las 216 casas.');
  };

  return (
    <CondoContext.Provider
      value={{
        currentUser,
        currentHouse,
        currentHouseReceipt,
        settings,
        houses,
        users,
        expenses,
        billingPeriods,
        currentSelectedPeriod,
        setCurrentSelectedPeriod,
        houseSpecificExpenses,
        addHouseSpecificExpense,
        deleteHouseSpecificExpense,
        createBillingPeriod,
        copyExpensesFromPreviousPeriod,
        getReceiptForHouseAndPeriod,
        getAllReceiptsForPeriod,
        emitBillingPeriod,
        paymentReports,
        incidents,
        reservations,
        announcements,
        auditLogs,
        loginAdmin,
        loginVecino,
        logout,
        updateUser,
        resetUserPassword,
        bulkResetPasswords,
        toggleUserStatus,
        createUser,
        changeOwnPassword,
        updateBcvRate,
        addPaymentReport,
        submitPaymentReport,
        approvePayment,
        rejectPayment,
        addExpense,
        deleteExpense,
        generateMonthlyBilling,
        addIncident,
        reportIncident,
        updateIncidentStatus,
        addReservation,
        requestReservation,
        cancelReservation,
        addAnnouncement,
        getReceiptForHouse,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetToOriginalData,
      }}
    >
      {children}
    </CondoContext.Provider>
  );
};

export const useCondo = () => {
  const context = useContext(CondoContext);
  if (!context) {
    throw new Error('useCondo must be used within a CondoProvider');
  }
  return context;
};
