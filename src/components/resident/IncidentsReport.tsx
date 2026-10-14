import React, { useState } from 'react';
import { useCondo } from '../../context/CondoContext';
import { IncidentReport, StreetName } from '../../types';
import { AlertTriangle, Plus, CheckCircle, Clock, Wrench, MessageSquare } from 'lucide-react';

export const IncidentsReport: React.FC = () => {
  const { incidents, reportIncident, updateIncidentStatus, currentUser, currentHouse } = useCondo();
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IncidentReport['category']>('porton');
  const [priority, setPriority] = useState<IncidentReport['priority']>('media');
  const [street, setStreet] = useState<StreetName>(
    currentHouse ? currentHouse.street : 'Calle 1'
  );
  const [locationDetails, setLocationDetails] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    reportIncident({
      title: title.trim(),
      category,
      priority,
      street,
      locationDetails: locationDetails.trim() || undefined,
      description: description.trim(),
    });

    setTitle('');
    setLocationDetails('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            Reporte de Incidencias en Tiempo Real
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Notifique averías, fallas en portones, bombas de agua o alumbrado para atención inmediata de mantenimiento
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Reportar Nueva Falla
        </button>
      </div>

      {/* Incidents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {incidents.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No hay incidencias reportadas activas en este momento.
          </div>
        ) : (
          incidents.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.priority === 'urgente'
                          ? 'bg-rose-100 text-rose-800'
                          : item.priority === 'alta'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      Prioridad {item.priority}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {item.street} {item.locationDetails ? `• ${item.locationDetails}` : ''}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'resuelta'
                      ? 'bg-emerald-100 text-emerald-800'
                      : item.status === 'en_proceso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span>
                  Reportado por: <strong>Casa {item.houseCode}</strong> ({item.reportedBy})
                </span>
                <span>{item.date}</span>
              </div>

              {/* Admin status switcher */}
              {currentUser?.role === 'admin' && item.status !== 'resuelta' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  {item.status === 'reportada' && (
                    <button
                      onClick={() => updateIncidentStatus(item.id, 'en_proceso')}
                      className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Marcar en Proceso
                    </button>
                  )}
                  <button
                    onClick={() => updateIncidentStatus(item.id, 'resuelta')}
                    className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Marcar como Resuelta
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal to report incident */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Reportar Incidencia o Falla Técnica
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Su reporte será visible para el equipo de mantenimiento y la administración del condominio
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título del Reporte</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Falla en sensor del portón eléctrico"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="porton">Portón Eléctrico</option>
                    <option value="alumbrado">Alumbrado Público</option>
                    <option value="agua">Agua / Tuberías</option>
                    <option value="seguridad">Seguridad</option>
                    <option value="limpieza">Limpieza / Jardinería</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nivel de Prioridad</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Calle Afectada</label>
                  <select
                    value={street}
                    onChange={(e) => setStreet(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="Calle 1">Calle 1 (92 casas)</option>
                    <option value="Calle 2">Calle 2 (84 casas)</option>
                    <option value="Calle C">Calle C (40 casas)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ubicación Específica</label>
                  <input
                    type="text"
                    placeholder="Ej: Cerca de la casa 1-25"
                    value={locationDetails}
                    onChange={(e) => setLocationDetails(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción de la Falla</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle los síntomas o situación ocurrida..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Enviar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
