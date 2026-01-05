"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Download, Edit, Trash2, Bell } from "lucide-react";
import Swal from 'sweetalert2';
import { 
  type Guardia, 
  getGuardiasPorCalendario, 
  deleteGuardia,
  descargarExcelGuardias 
} from "@/lib/guardias";
import { GuardiaDialog } from "./guardia-dialog";
import { CalendarioSkeleton } from "./loading-skeletons";

function getPeruDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const peruOffset = -5;
  return new Date(utc + 3600000 * peruOffset);
}

export default function CalendarioGuardias() {
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [year, setYear] = useState<number>(getPeruDate().getFullYear());
  const [month, setMonth] = useState<number>(getPeruDate().getMonth() + 1);
  const [loading, setLoading] = useState(true); // Inicia en true para mostrar skeleton inicial
  const [operationLoading, setOperationLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuardia, setEditingGuardia] = useState<Guardia | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  const loadGuardias = async () => {
    setLoading(true);
    try {

      const data = await getGuardiasPorCalendario(year, month);
      console.log('Guardias cargadas del backend:', data);
      console.log('Estados encontrados:', Array.from(new Set(data.map(g => g.estado))));
      setGuardias(data);
    } catch (error) {
      console.error("Error loading guardias:", error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las guardias',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuardias();
    
    // Polling cada 30 segundos para auto-actualizar guardias
    const interval = setInterval(() => {
      loadGuardias();
    }, 30000);

    return () => clearInterval(interval);
  }, [year, month]);

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Funciones para manejar guardias
  const handleCrearGuardia = (fecha?: string) => {
    setEditingGuardia(null);
    setFechaSeleccionada(fecha || null);
    setDialogOpen(true);
  };

  const handleEditarGuardia = (guardia: Guardia) => {
    setEditingGuardia(guardia);
    setFechaSeleccionada(null);
    setDialogOpen(true);
  };

  const handleEliminarGuardia = async (guardia: Guardia) => {
    if (operationLoading) return; // Prevenir múltiples eliminaciones
    
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la guardia de 24h de ${guardia.usuario?.nombre} el ${guardia.fecha}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setOperationLoading(true);
      try {
        await deleteGuardia(guardia.guardia_id!);
        await loadGuardias();
        Swal.fire('Eliminado!', 'La guardia ha sido eliminada.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'No se pudo eliminar la guardia.', 'error');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleGuardiaSaved = async (isEditing?: boolean) => {
    await loadGuardias();
    setDialogOpen(false);
    setEditingGuardia(null);
    setFechaSeleccionada(null);
    
    Swal.fire({
      title: '¡Éxito!',
      text: isEditing ? 'Guardia actualizada correctamente.' : 'Guardia creada correctamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false,
      position: 'top-end',
      toast: true
    });
  };

  const handleDescargarExcel = async () => {
    if (operationLoading) return;
    
    setOperationLoading(true);
    try {
      await descargarExcelGuardias(year, month);
    } catch (error) {
      Swal.fire('Error!', 'No se pudo descargar el Excel.', 'error');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCambiarMes = (direccion: 'anterior' | 'siguiente') => {
    if (loading) return; // Prevenir cambios mientras carga
    
    if (direccion === 'anterior') {
      if (month === 1) {
        setYear(year - 1);
        setMonth(12);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 12) {
        setYear(year + 1);
        setMonth(1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  // Generar matriz de días del mes
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendar: { day: number; guardias: Guardia[] }[][] = [];
  let week: { day: number; guardias: Guardia[] }[] = [];
  
  // Agregar días vacíos al inicio
  for (let i = 0; i < firstDay; i++) {
    week.push({ day: 0, guardias: [] });
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const guardiasDia = guardias.filter(g => g.fecha === dateStr);
    week.push({ day: d, guardias: guardiasDia });
    
    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }
  
  // Completar la última semana
  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ day: 0, guardias: [] });
    }
    calendar.push(week);
  }

  // Mostrar skeleton mientras carga
  if (loading) {
    return <CalendarioSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header responsive */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <button 
              onClick={() => handleCambiarMes('anterior')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              {months[month - 1]} {year}
            </h1>
            
            <button 
              onClick={() => handleCambiarMes('siguiente')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => handleCrearGuardia()}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva Guardia</span>
              <span className="sm:hidden">Nueva</span>
            </button>
            <button 
              onClick={handleDescargarExcel}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 transition-colors disabled:opacity-50"
              disabled={loading || operationLoading}
            >
              {operationLoading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{operationLoading ? 'Descargando...' : 'Excel'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendario responsivo */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header días - Oculto en móvil */}
        <div className="hidden sm:grid grid-cols-7 border-b border-gray-200">
          {days.map(d => (
            <div key={d} className="p-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>
        
        {/* Vista móvil - Lista */}
        <div className="sm:hidden">
          {calendar.flat().filter(celda => celda.day > 0).map((celda, idx) => {
            const today = getPeruDate();
            const isToday = celda.day === today.getDate() && 
              month === today.getMonth() + 1 && 
              year === today.getFullYear();
            
            return (
              <div key={idx} className="border-b border-gray-100 last:border-b-0">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-semibold ${
                        isToday ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {celda.day}
                      </span>
                      <span className="text-sm text-gray-500">
                        {days[new Date(year, month - 1, celda.day).getDay()]} {celda.day}
                      </span>
                      {isToday && (
                        <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                          Hoy
                        </span>
                      )}
                    </div>

                  </div>
                  
                  {celda.guardias.length > 0 ? (
                    <div className="space-y-2">
                      {celda.guardias.map(g => (
                        <div 
                          key={g.guardia_id}
                          onClick={() => handleEditarGuardia(g)}
                          className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                            g.estado === 'completada' 
                              ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                              : g.estado === 'asignada'
                              ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                              : 'bg-red-50 border border-red-200 hover:bg-red-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className={`text-sm font-medium ${
                                g.estado === 'completada' 
                                  ? 'text-green-800' 
                                  : g.estado === 'asignada'
                                  ? 'text-blue-800'
                                  : 'text-red-800'
                              }`}>
                                {g.usuario?.nombre} {g.usuario?.apellido}
                              </p>
                              <p className={`text-xs ${
                                g.estado === 'completada' 
                                  ? 'text-green-600' 
                                  : g.estado === 'asignada'
                                  ? 'text-blue-600'
                                  : 'text-red-600'
                              }`}>
                                Guardia 24hrs • {g.estado.charAt(0).toUpperCase() + g.estado.slice(1)}
                              </p>
                            </div>
                            {/* Campanita roja si está completada sin observaciones */}
                            {g.estado === 'completada' && !g.observaciones ? (
                              <div className="bg-red-500 text-white p-1.5 rounded-full animate-pulse" title="Falta completar observaciones">
                                <Bell className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className={`w-3 h-3 rounded-full ${
                                g.estado === 'completada' ? 'bg-green-500' : 
                                g.estado === 'asignada' ? 'bg-blue-500' : 'bg-red-500'
                              }`}></div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditarGuardia(g);
                              }}
                              className="p-1 hover:bg-blue-50 rounded text-blue-500"
                              title="Editar guardia"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarGuardia(g);
                              }}
                              className="p-1 hover:bg-red-50 rounded text-red-500"
                              title="Eliminar guardia"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Sin guardias</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Vista desktop - Grid */}
        <div className="hidden sm:grid grid-cols-7">
          {calendar.flat().map((celda, idx) => {
            const today = getPeruDate();
            const isToday = celda.day > 0 && 
              celda.day === today.getDate() && 
              month === today.getMonth() + 1 && 
              year === today.getFullYear();
            
            // Determinar el color de fondo basado en la guardia principal
            const guardiaPrincipal = celda.guardias[0]; // Tomar la primera guardia si hay múltiples
            let bgColor = 'bg-white';
            let textColor = 'text-gray-700';
            let hoverColor = 'hover:bg-gray-50';
            
            if (guardiaPrincipal) {
              switch (guardiaPrincipal.estado) {
                case 'completada':
                  bgColor = 'bg-green-50 border-green-200';
                  textColor = 'text-green-800';
                  hoverColor = 'hover:bg-green-100';
                  break;
                case 'asignada':
                  bgColor = 'bg-blue-50 border-blue-200';
                  textColor = 'text-blue-800';
                  hoverColor = 'hover:bg-blue-100';
                  break;
                case 'cancelada':
                  bgColor = 'bg-red-50 border-red-200';
                  textColor = 'text-red-800';
                  hoverColor = 'hover:bg-red-100';
                  break;
              }
            }
            
            if (celda.day === 0) {
              bgColor = 'bg-gray-50/50';
            } else if (isToday && !guardiaPrincipal) {
              bgColor = 'bg-gray-100';
            }
            
            return (
              <div 
                key={idx} 
                onClick={celda.day > 0 && celda.guardias.length > 0 ? () => handleEditarGuardia(celda.guardias[0]) : undefined}
                className={`group min-h-[140px] border-r border-b border-gray-200 last:border-r-0 p-3 transition-colors flex flex-col ${bgColor} ${celda.guardias.length > 0 ? `cursor-pointer ${hoverColor}` : ''}`}
              >
                {celda.day > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-lg font-semibold ${
                        isToday && !guardiaPrincipal ? 'bg-gray-900 text-white px-2 py-1 rounded-md text-sm' : textColor
                      }`}>
                        {celda.day}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* Campanita roja si la guardia está completada sin observaciones */}
                        {guardiaPrincipal && guardiaPrincipal.estado === 'completada' && !guardiaPrincipal.observaciones && (
                          <div className="bg-red-500 text-white p-1 rounded-full animate-pulse" title="Falta completar observaciones">
                            <Bell className="h-3 w-3" />
                          </div>
                        )}
                        {celda.guardias.length > 1 && (
                          <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                            +{celda.guardias.length - 1}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Información de la guardia */}
                    {celda.guardias.length > 0 && (
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="text-center">
                          <p className={`font-semibold text-sm leading-tight ${textColor}`}>
                            {guardiaPrincipal.usuario?.nombre || 'Sin asignar'} {guardiaPrincipal.usuario?.apellido || ''}
                          </p>
                          <p className={`text-xs mt-1 ${textColor.replace('800', '600')}`}>
                            Guardia {guardiaPrincipal.estado}
                          </p>
                          {celda.guardias.length > 1 && (
                            <p className={`text-xs mt-0.5 ${textColor.replace('800', '500')}`}>
                              +{celda.guardias.length - 1} más
                            </p>
                          )}
                        </div>
                        
                        {/* Botones de acción en hover */}
                        <div className="flex justify-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarGuardia(guardiaPrincipal);
                            }}
                            className="p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm text-blue-600 hover:text-blue-700"
                            title="Editar guardia"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarGuardia(guardiaPrincipal);
                            }}
                            className="p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm text-red-600 hover:text-red-700"
                            title="Eliminar guardia"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Días sin guardia - solo mostrar vacío */}
                    {celda.guardias.length === 0 && (
                      <div className="flex-1"></div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Diálogo para crear/editar guardias */}
      <GuardiaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        guardia={editingGuardia}
        fechaSeleccionada={fechaSeleccionada}
        onGuardiaSaved={handleGuardiaSaved}
      />
    </div>
  );
}
