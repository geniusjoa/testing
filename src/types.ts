export type StreetName = 'Calle 1' | 'Calle 2' | 'Calle C';

export interface HouseUnit {
  id: string;
  code: string; // e.g., '1-1A', '2-3B', 'C-1A'
  street: StreetName;
  residentName: string;
  alicuota: number; // e.g. 0.46365
  alicuotaPercentStr: string; // e.g. "0,46365%"
  currentDebt: number; // in Bs
  moraAmount: number; // 3% of overdue debt
  saldoFavor: number; // saldo a favor if any
  saldoFavorActual: number;
  totalToPayBs: number;
  totalToPayUsd: number;
  pendingReceiptsCount: number;
  lastReceiptNumber: number;
  phone?: string;
  email?: string;
  status: 'solvente' | 'pendiente' | 'moroso' | 'a_favor';
}

export interface ExpenseBreakdownItem {
  id: string;
  description: string;
  totalAmountBs: number;
  shareAmountBs: number; // according to alicuota
  isCommon: boolean;
  isHouseSpecific?: boolean;
}

export interface HouseSpecificExpense {
  id: string;
  houseCode: string;
  residentName?: string;
  monthYear: string;
  concept: string;
  category:
    | 'control_porton'
    | 'reparacion_particular'
    | 'multa_sancion'
    | 'reserva_area'
    | 'cargo_administrativo'
    | 'reparacion'
    | 'multa'
    | 'cuota_extra'
    | 'otro'
    | 'otros';
  amountBs: number;
  date: string;
  notes?: string;
  invoiceNumber?: string;
}

export interface BillingPeriod {
  id: string;
  monthYear: string; // e.g. "JULIO 2026", "AGOSTO 2026"
  issueDate: string; // e.g. "09/08/2026"
  dueDate: string; // e.g. "16/08/2026"
  bcvRate: number;
  status: 'borrador' | 'emitido' | 'cerrado';
  totalExpensesBs: number;
  totalReserveFundBs: number;
  totalHouseSpecificBs: number;
  totalBilledBs: number;
  receiptsCount: number;
  createdAt: string;
  issuedAt?: string;
}

export interface CondoReceipt {
  receiptNumber: number;
  houseCode: string;
  street: StreetName;
  residentName: string;
  monthYear: string; // e.g. "JULIO 2026"
  issueDate: string; // e.g. "09/08/2026"
  dueDate: string;
  alicuota: number;
  alicuotaPercentStr: string;
  expenses: ExpenseBreakdownItem[];
  houseExpenses?: HouseSpecificExpense[];
  houseExpensesTotalBs?: number;
  periodStatus?: 'borrador' | 'emitido' | 'cerrado';
  gastosMesTotalBs: number;
  fondoReservaPercent: number; // 10%
  fondoReservaBs: number;
  totalCuotaMesBs: number;
  deudaAnteriorBs: number;
  moraPercent: number; // 3%
  moraBs: number;
  saldoFavorBs: number;
  saldoFavorActualBs: number;
  totalPagarBs: number;
  totalPagarUsd: number;
  bcvRate: number;
  reserveFundAccountBalanceBs: number;
  reserveFundMonthCreditBs: number;
  reserveFundTotalBs: number;
  reserveFundPendingToCollectBs: number;
  isPaid: boolean;
  paidDate?: string;
  paymentReference?: string;
}

export interface MonthlyExpense {
  id: string;
  description: string;
  category: 'electricidad' | 'agua' | 'telecomunicaciones' | 'mantenimiento' | 'seguridad' | 'insumos' | 'otros';
  amountBs: number;
  monthYear: string;
  invoiceNumber?: string;
  supplier?: string;
  date: string;
  isCommon: boolean;
  appliesToStreets?: StreetName[];
}

export interface PaymentReport {
  id: string;
  houseCode: string;
  residentName: string;
  receiptNumber: number;
  monthYear: string;
  amountBs: number;
  amountUsd: number;
  exchangeRateBcv: number;
  paymentDate: string;
  paymentMethod: 'pago_movil' | 'transferencia' | 'deposito' | 'divisas_efectivo' | 'zelle';
  originBank: string;
  destinationBank: string;
  referenceNumber: string;
  screenshotUrl?: string;
  notes?: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Incident {
  id: string;
  houseCode: string;
  residentName: string;
  title: string;
  category: 'porton' | 'alumbrado' | 'agua' | 'areas_verdes' | 'seguridad' | 'convivencia' | 'infraestructura';
  description: string;
  priority: 'baja' | 'media' | 'alta' | 'urgente';
  status: 'reportada' | 'en_revision' | 'en_proceso' | 'resuelta';
  createdAt: string;
  photoUrl?: string;
  adminResponse?: string;
  resolvedAt?: string;
}

export interface CommonArea {
  id: 'caney' | 'salon_fiestas' | 'cancha';
  name: string;
  description: string;
  capacity: number;
  costUsd: number;
  rules: string[];
  imageUrl: string;
}

export interface Reservation {
  id: string;
  houseCode: string;
  residentName: string;
  areaId: 'caney' | 'salon_fiestas' | 'cancha';
  areaName: string;
  date: string; // YYYY-MM-DD
  timeSlot: 'manana' | 'tarde' | 'noche' | 'dia_completo';
  timeSlotLabel: string;
  guestsCount: number;
  eventDescription: string;
  costBs: number;
  costUsd: number;
  status: 'confirmada' | 'pendiente' | 'cancelada';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'urgente' | 'corte_pago' | 'asamblea' | 'mantenimiento' | 'general';
  date: string;
  author: string;
  isCutoffAlert?: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: 'admin' | 'vecino';
  action: string;
  category: 'financiero' | 'pagos' | 'facturacion' | 'incidencias' | 'reservas' | 'sistema' | 'seguridad';
  details: string;
}

export type IncidentReport = Incident;
export type CommonAreaReservation = Reservation;

export interface CondoSettings {
  condoName: string;
  rif: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  bcvExchangeRate: number; // VES per USD
  bcvLastUpdated: string;
  reserveFundPercent: number; // 10%
  lateFeePercent: number; // 3%
  paymentGracePeriodDays: number; // 7 days
  currentBillingPeriod: string; // e.g. "JULIO 2026"
  cutoffDayOfMonth: number;
  reserveFundBalanceBs: number;
  bankBalanceBs: number;
}

export interface UserAccount {
  id: string;
  username: string; // e.g. "1-1A" or "Florentino"
  houseCode?: string; // for role === 'vecino'
  residentName: string;
  role: 'admin' | 'vecino';
  password: string;
  defaultPassword?: string;
  email?: string;
  phone?: string;
  status: 'activo' | 'bloqueado' | 'suspendido';
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}
