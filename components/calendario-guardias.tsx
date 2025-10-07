"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Download, Edit, Trash2 } from "lucide-react";
import Swal from 'sweetalert2';
import { 
  type Guardia, 
  getGuardiasPorCalendario, 
  deleteGuardia,
  descargarExcelGuardias 
} from "@/lib/guardias";
import { GuardiaDialog } from "./guardia-dialog";

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
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGuardia, setEditingGuardia] = useState<Guardia | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);

  const loadGuardias = async () => {
    setLoading(true);
    try {
      const data = await getGuardiasPorCalendario(year, month);
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
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar la guardia de 24h de ${guardia.responsable?.nombre} el ${guardia.fecha}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteGuardia(guardia.guardia_id!);
        await loadGuardias();
        Swal.fire('Eliminado!', 'La guardia ha sido eliminada.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'No se pudo eliminar la guardia.', 'error');
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
    try {
      await descargarExcelGuardias(year, month);
    } catch (error) {
      Swal.fire('Error!', 'No se pudo descargar el Excel.', 'error');
    }
  };

  const handleCambiarMes = (direccion: 'anterior' | 'siguiente') => {
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

  return (
    <div>
      {/* Header con controles */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={() => handleCambiarMes('anterior')}>
          &lt; Anterior
        </Button>
        <div className="flex items-center gap-4">
          <div className="font-bold text-lg">{months[month - 1]} {year}</div>
          <Button onClick={() => handleCrearGuardia()} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Guardia
          </Button>
          <Button variant="outline" onClick={handleDescargarExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Excel
          </Button>
        </div>
        <Button variant="outline" onClick={() => handleCambiarMes('siguiente')}>
          Siguiente &gt;
        </Button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {days.map(d => <div key={d} className="font-semibold p-2">{d}</div>)}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-2">
        {calendar.flat().map((celda, idx) => (
          <Card 
            key={idx} 
            className={`min-h-[120px] p-2 cursor-pointer hover:shadow-md transition-shadow ${
              celda.day === 0 ? 'opacity-30' : ''
            }`}
            onClick={() => celda.day > 0 && handleCrearGuardia(`${year}-${String(month).padStart(2, "0")}-${String(celda.day).padStart(2, "0")}`)}
          >
            <CardContent className="p-0 w-full h-full">
              {celda.day > 0 && (
                <>
                  <div className="font-semibold text-sm mb-2">{celda.day}</div>
                  <div className="space-y-1 max-h-[80px] overflow-y-auto">
                    {celda.guardias.map(g => (
                      <div 
                        key={g.guardia_id} 
                        className="text-xs p-2 rounded border cursor-pointer hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditarGuardia(g);
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-bold text-sm">24 hrs</div>
                            <div className="truncate font-medium">{g.responsable?.nombre}</div>
                            <span className={`inline-block px-2 py-1 rounded text-white text-[10px] mt-1 ${
                              g.estado === 'asignada' ? 'bg-blue-500' : 
                              g.estado === 'completada' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {g.estado}
                            </span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarGuardia(g);
                            }}
                            className="text-red-500 hover:text-red-700 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
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
