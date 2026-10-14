import React, { useState, useMemo } from 'react';
import { useCondo } from '../../context/CondoContext';
import { HouseUnit, StreetName } from '../../types';
import { Search, Filter, FileText, CheckCircle, AlertCircle, ArrowUpDown } from 'lucide-react';

interface HousesManagementProps {
  onViewReceipt: (houseCode: string) => void;
  onOpenReportPaymentForHouse?: (houseCode: string) => void;
}

export const HousesManagement: React.FC<HousesManagementProps> = ({
  onViewReceipt,
  onOpenReportPaymentForHouse,
}) => {
  const { houses, settings } = useCondo();
  const [streetFilter, setStreetFilter] = useState<'Todos' | StreetName>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | HouseUnit['status']>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'code' | 'residentName' | 'totalToPayBs' | 'pendingReceiptsCount'>('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered & Sorted houses
  const filteredHouses = useMemo(() => {
    return houses
      .filter((h) => {
        if (streetFilter !== 'Todos' && h.street !== streetFilter) return false;
        if (statusFilter !== 'Todos' && h.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            h.code.toLowerCase().includes(q) ||
            h.residentName.toLowerCase().includes(q) ||
            h.street.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc'
            ? valA.localeCompare(valB, undefined, { numeric: true })
            : valB.localeCompare(valA, undefined, { numeric: true });
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [houses, streetFilter, statusFilter, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalFilteredDebtBs = filteredHouses.reduce((acc, h) => acc + h.totalToPayBs, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading">
            Directorio Oficial de 216 Unidades Habitacionales
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribución por sectores: Calle 1 (92 casas), Calle 2 (84 casas), Calle C (40 casas) según Google Sheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Total por Cobrar (Filtrado)</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              Bs {(totalFilteredDebtBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por código (ej: 1-1A, 2-10C, C-1A) o nombre de vecino..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
            />
          </div>

          {/* Street Filter */}
          <div className="sm:col-span-4 flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
            {(['Todos', 'Calle 1', 'Calle 2', 'Calle C'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStreetFilter(st)}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer text-center ${
                  streetFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'Todos' ? 'Todas (216)' : st}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-medium"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="solvente">Solventes</option>
              <option value="pendiente">Pendientes</option>
              <option value="moroso">Morosos (&gt;2 recibos)</option>
              <option value="a_favor">Con Saldo a Favor</option>
            </select>
          </div>
        </div>

        {/* Quick count badges */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Mostrando <strong>{filteredHouses.length}</strong> de 216 unidades
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Solventes / A Favor: {houses.filter((h) => h.status === 'solvente' || h.status === 'a_favor').length}
            </span>
            <span className="flex items-center gap-1 text-rose-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Morosos: {houses.filter((h) => h.status === 'moroso').length}
            </span>
          </div>
        </div>
      </div>

      {/* Houses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th
                  onClick={() => toggleSort('code')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    CASA <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('residentName')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    PROPIETARIO(A) <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3">CALLE</th>
                <th className="py-3 px-3">ALÍCUOTA</th>
                <th className="py-3 px-3 text-right">DEUDA ANT.</th>
                <th className="py-3 px-3 text-right">MORA (3%)</th>
                <th className="py-3 px-3 text-right">SALDO FAVOR</th>
                <th
                  onClick={() => toggleSort('totalToPayBs')}
                  className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100 bg-slate-100/50"
                >
                  <div className="flex items-center justify-end gap-1 font-extrabold text-slate-900">
                    TOTAL BS <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right bg-emerald-50/50 text-emerald-900">
                  EQUIV. USD (BCV)
                </th>
                <th
                  onClick={() => toggleSort('pendingReceiptsCount')}
                  className="py-3 px-3 text-center cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center justify-center gap-1">
                    PEND. <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">ESTADO</th>
                <th className="py-3 px-3 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHouses.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No se encontraron casas con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredHouses.map((house) => (
                  <tr key={house.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{house.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{house.residentName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{house.street}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{house.alicuotaPercentStr}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {(house.currentDebt ?? 0) > 0
                        ? (house.currentDebt ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-700 font-medium">
                      {(house.moraAmount ?? 0) > 0
                        ? (house.moraAmount ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-blue-700">
                      {(house.saldoFavorActual ?? 0) > 0
                        ? (house.saldoFavorActual ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-950 bg-slate-50/60">
                      Bs {(house.totalToPayBs ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/30">
                      ${(house.totalToPayUsd ?? 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          house.pendingReceiptsCount === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : house.pendingReceiptsCount > 5
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {house.pendingReceiptsCount}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          house.status === 'solvente'
                            ? 'bg-emerald-100 text-emerald-800'
                            : house.status === 'a_favor'
                            ? 'bg-blue-100 text-blue-800'
                            : house.status === 'moroso'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {house.status === 'a_favor'
                          ? 'A Favor'
                          : house.status.charAt(0).toUpperCase() + house.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewReceipt(house.code)}
                          className="px-2 py-1 text-[11px] font-bold text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Ver y descargar recibo oficial en PDF"
                        >
                          Recibo #{house.lastReceiptNumber}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
