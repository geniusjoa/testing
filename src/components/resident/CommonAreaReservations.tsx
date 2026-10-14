import React, { useState } from 'react';
import { useCondo } from '../../context/CondoContext';
import { CommonAreaReservation } from '../../types';
import { Calendar, Plus, CheckCircle, Clock, ShieldAlert, Users, Sparkles } from 'lucide-react';

export const CommonAreaReservations: React.FC = () => {
  const { reservations, requestReservation, cancelReservation, currentHouse, currentUser } = useCondo();
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [areaName, setAreaName] = useState<CommonAreaReservation['areaName']>('Churuata y Parrillera');
  const [date, setDate] = useState(new Date(Date.now() + 86400000).toISOString().substring(0, 10));
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('18:00');
  const [eventDescription, setEventDescription] = useState('');
  const [guestCount, setGuestCount] = useState('15');

  const isSolvent = currentHouse ? currentHouse.status === 'solvente' || currentHouse.status === 'a_favor' : true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDescription.trim()) return;

    requestReservation({
      areaName,
      date,
      startTime,
      endTime,
      eventDescription: eventDescription.trim(),
      guestCount: parseInt(guestCount, 10) || 10,
    });

    setEventDescription('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Reserva de Áreas Comunes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cancha múltiple, Churuata y Parque Infantil. Requiere solvencia de condominio según reglamento interno
          </p>
        </div>

        {isSolvent ? (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Solicitud de Reserva
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Requiere Solvencia para Reservar
          </div>
        )}
      </div>

      {/* Available areas showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-slate-100 relative">
            <img
              src="https://images.unsplash.com/photo-1543854589-cb4856828551?w=600&auto=format&fit=crop&q=80"
              alt="Churuata"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Capacidad: 40 pers.
            </span>
          </div>
          <div className="p-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Churuata y Parrillera</h3>
            <p className="text-[11px] text-slate-500">
              Mobiliario, parrilleras a carbón, iluminación y toma de electricidad.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-slate-100 relative">
            <img
              src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80"
              alt="Cancha Deportiva"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Horario: 8am - 9pm
            </span>
          </div>
          <div className="p-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Cancha Deportiva de Usos Múltiples</h3>
            <p className="text-[11px] text-slate-500">
              Fútbol sala, baloncesto y voleibol para vecinos y familiares.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 bg-slate-100 relative">
            <img
              src="https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80"
              alt="Parque Infantil"
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Área Abierta
            </span>
          </div>
          <div className="p-4 space-y-1">
            <h3 className="text-sm font-bold text-slate-900">Parque Infantil y Jardines</h3>
            <p className="text-[11px] text-slate-500">
              Juegos recreativos y bancos para celebraciones familiares al aire libre.
            </p>
          </div>
        </div>
      </div>

      {/* Calendar / Reservations list */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Calendario de Reservas Registradas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{res.areaName}</h4>
                  <p className="text-slate-500 text-[11px]">
                    Fecha: <strong>{res.date}</strong> • Horario: {res.startTime} a {res.endTime}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    res.status === 'confirmada'
                      ? 'bg-emerald-100 text-emerald-800'
                      : res.status === 'rechazada'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {res.status}
                </span>
              </div>

              <p className="text-slate-700 italic">"{res.eventDescription}"</p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                <span>Casa {res.houseCode} ({res.residentName})</span>
                <span>{res.guestCount} invitados aprox.</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 font-heading">
              Solicitar Reserva de Área Común
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Condición: Casa solvente ({currentHouse?.code || 'Vecino'})
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Área a Reservar</label>
                <select
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Churuata y Parrillera">Churuata y Parrillera</option>
                  <option value="Cancha Deportiva de Usos Múltiples">Cancha Deportiva de Usos Múltiples</option>
                  <option value="Parque Infantil y Áreas Verdes">Parque Infantil y Áreas Verdes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tipo de Evento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cumpleaños infantil familiar"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nº Estimado de Asistentes</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
