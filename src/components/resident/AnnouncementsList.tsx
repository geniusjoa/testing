import React, { useState } from 'react';
import { useCondo } from '../../context/CondoContext';
import { Announcement } from '../../types';
import { Bell, Plus, Calendar, AlertCircle, Pin, Shield } from 'lucide-react';

export const AnnouncementsList: React.FC = () => {
  const { announcements, addAnnouncement, currentUser } = useCondo();
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Announcement['type']>('informativo');
  const [content, setContent] = useState('');
  const [isCutoffAlert, setIsCutoffAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addAnnouncement({
      title: title.trim(),
      type,
      content: content.trim(),
      isCutoffAlert,
    });

    setTitle('');
    setContent('');
    setIsCutoffAlert(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Bell className="w-6 h-6 text-rose-600" />
            Comunicados Internos y Alertas de Pago
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Canal oficial de avisos de cobranza, asambleas de copropietarios y reportes de mantenimiento
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Publicar Comunicado Oficial
          </button>
        )}
      </div>

      {/* Announcements Stream */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className={`rounded-2xl border p-5 shadow-xs transition-all ${
              ann.isCutoffAlert
                ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-100'
                : ann.type === 'urgente'
                ? 'bg-rose-50/40 border-rose-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {ann.isCutoffAlert && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-900 flex items-center gap-1 uppercase tracking-wider">
                    <AlertCircle className="w-3 h-3" /> Aviso de Cobro
                  </span>
                )}
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    ann.type === 'urgente'
                      ? 'bg-rose-100 text-rose-800'
                      : ann.type === 'mantenimiento'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {ann.type}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {ann.date}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-2 font-heading">{ann.title}</h3>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed whitespace-pre-line">{ann.content}</p>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 mt-3 border-t border-slate-200/60">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                {ann.author}
              </span>
              <span className="text-slate-400">Dirigido a: 216 Casas (Calle 1, 2 y C)</span>
            </div>
          </div>
        ))}
      </div>

      {/* New announcement modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Emitir Nuevo Comunicado a Copropietarios
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              El mensaje aparecerá instantáneamente en el panel de los 216 vecinos
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título del Comunicado</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Convocatoria a Asamblea Extraordinaria"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Notificación</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="informativo">Informativo General</option>
                    <option value="urgente">Urgente / Convocatoria</option>
                    <option value="mantenimiento">Trabajos de Mantenimiento</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isCutoffAlert}
                      onChange={(e) => setIsCutoffAlert(e.target.checked)}
                      className="w-4 h-4 text-rose-600 rounded"
                    />
                    Destacar como Alerta de Cobranza
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Contenido del Mensaje</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Escriba el comunicado detallado..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  Publicar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
