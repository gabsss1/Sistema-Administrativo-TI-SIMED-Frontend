"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { 
    type CreateGuardiaDto, 
    type Guardia,
    createGuardia, 
    updateGuardia
} from "@/lib/guardias"
import { 
    type Responsable,
    getResponsables
} from "@/lib/registro-base-ti"

interface GuardiaDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    guardia: Guardia | null
    fechaSeleccionada: string | null
    onGuardiaSaved: (isEditing?: boolean) => void
}

const initialFormData = {
    fecha: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "asignada" as "asignada" | "completada" | "cancelada",
    observaciones: "",
    responsable_id: "",
}

export function GuardiaDialog({ open, onOpenChange, guardia, fechaSeleccionada, onGuardiaSaved }: GuardiaDialogProps) {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    
    const [responsables, setResponsables] = useState<Responsable[]>([])
    const [formData, setFormData] = useState(initialFormData)

    // Cargar responsables cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            const loadData = async () => {
                setLoadingData(true)
                try {
                    const responsablesData = await getResponsables()
                    setResponsables(responsablesData)
                } catch (error) {
                    console.error("Error loading responsables:", error)
                    Swal.fire({
                        title: 'Error al cargar responsables',
                        text: 'No se pudieron cargar los responsables. Inténtalo de nuevo.',
                        icon: 'error',
                        confirmButtonText: 'Entendido'
                    })
                } finally {
                    setLoadingData(false)
                }
            }
            loadData()
        }
    }, [open])

    // Configurar formulario para edición o creación
    useEffect(() => {
        if (guardia) {
            // Para editar: solo configurar la fecha única y datos existentes
            const responsableId = guardia.responsable?.responsable_id?.toString() || "";
            
            // Asegurar que la fecha se mantenga en formato YYYY-MM-DD sin conversiones de zona horaria
            let fechaCorregida = guardia.fecha;
            
            // Si la fecha viene como objeto Date del backend, convertirla correctamente
            if (guardia.fecha && (Object.prototype.toString.call(guardia.fecha) === '[object Date]' || typeof guardia.fecha === 'object')) {
                const fechaObj = new Date(guardia.fecha);
                fechaCorregida = fechaObj.getFullYear() + '-' + 
                    String(fechaObj.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(fechaObj.getDate()).padStart(2, '0');
            } else if (typeof guardia.fecha === 'string' && guardia.fecha.includes('T')) {
                // Si viene como ISO string, extraer solo la parte de la fecha
                fechaCorregida = guardia.fecha.split('T')[0];
            }
            
            console.log('Configurando formulario para editar guardia:', {
                fecha_original: guardia.fecha,
                fecha_corregida: fechaCorregida,
                estado: guardia.estado,
                responsable: guardia.responsable?.nombre
            });
            
            setFormData({
                fecha: fechaCorregida,
                fecha_inicio: "", // No necesario en modo edición
                fecha_fin: "",    // No necesario en modo edición
                estado: guardia.estado,
                observaciones: guardia.observaciones || "",
                responsable_id: responsableId,
            })
        } else {
            // Para nueva guardia, usar la fecha seleccionada como base
            const fechaBase = fechaSeleccionada || "";
            let fechaFin = "";
            
            if (fechaBase) {
                // Fecha de fin es el día siguiente por defecto
                const fechaFinDate = new Date(fechaBase);
                fechaFinDate.setDate(fechaFinDate.getDate() + 1);
                fechaFin = fechaFinDate.toISOString().split('T')[0];
            }
            
            setFormData({
                ...initialFormData,
                fecha: fechaBase,
                fecha_inicio: fechaBase,
                fecha_fin: fechaFin,
            })
        }
    }, [guardia, fechaSeleccionada, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const isEditing = !!(guardia && guardia.guardia_id)
            
            if (isEditing && guardia?.guardia_id) {
                // Para edición: usar solo los campos necesarios
                // Agregar hora del mediodía para evitar problemas de zona horaria
                const fechaConHora = `${formData.fecha}T12:00:00`;
                
                const dataToSend = {
                    fecha: fechaConHora, // Enviar con hora para evitar problema de zona horaria
                    estado: formData.estado,
                    observaciones: formData.observaciones || undefined,
                    responsable_id: parseInt(formData.responsable_id),
                }
                
                console.log('Actualizando guardia con datos (con hora):', dataToSend);
                
                await updateGuardia(guardia.guardia_id, dataToSend)
            } else {
                // Para creación: usar fecha inicio y fin (sin zona horaria para evitar cambios de día)
                const fechaInicioISO = `${formData.fecha_inicio}T12:00:00`;
                const fechaFinISO = `${formData.fecha_fin}T12:00:00`;

                const dataToSend: CreateGuardiaDto = {
                    fecha: formData.fecha_inicio,
                    fecha_inicio: fechaInicioISO,
                    fecha_fin: fechaFinISO,
                    estado: formData.estado,
                    observaciones: formData.observaciones || undefined,
                    responsable_id: parseInt(formData.responsable_id),
                }
                
                console.log('Creando guardia con fechas:', {
                    fecha: dataToSend.fecha,
                    fecha_inicio: dataToSend.fecha_inicio,
                    fecha_fin: dataToSend.fecha_fin
                });
                
                await createGuardia(dataToSend)
            }
            onGuardiaSaved(isEditing)
        } catch (error) {
            console.error("Error saving guardia:", error)
            
            Swal.fire({
                title: 'Error al guardar',
                text: 'Hubo un problema al guardar la guardia. Verifica los datos e inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        if (field === "estado") {
            console.log('Cambiando estado de:', formData.estado, 'a:', value);
        }
        setFormData((prev) => ({ 
            ...prev, 
            [field]: field === "estado" ? value as "asignada" | "completada" | "cancelada" : value 
        }))
    }

    // Función para formatear la fecha de manera legible
    const formatearFecha = (fecha: string) => {
        if (!fecha) return "";
        // Separar la fecha para evitar problemas de zona horaria
        const [year, month, day] = fecha.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month es 0-indexado
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{guardia ? "Editar Guardia" : "Crear Nueva Guardia"}</DialogTitle>
                    <DialogDescription>
                        {guardia
                            ? "Modifica los detalles de la guardia."
                            : "Rellena el formulario para crear una nueva guardia."}
                    </DialogDescription>
                    
                    {/* Mostrar información del día de guardia */}
                    {(guardia?.fecha || fechaSeleccionada) && (
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        Día de Guardia
                                    </p>
                                    <p className="text-sm text-slate-600 capitalize">
                                        {formatearFecha(guardia?.fecha || fechaSeleccionada || "")}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Duración</p>
                                    <p className="text-sm font-medium text-slate-700">24 horas</p>
                                </div>
                            </div>
                            
                            {guardia?.responsable && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                    <p className="text-xs text-slate-500">Responsable actual</p>
                                    <p className="text-sm font-medium text-slate-800">{guardia.responsable.nombre}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        {guardia ? (
                            // Modo edición: solo mostrar fecha única
                            <div className="grid gap-2">
                                <Label htmlFor="fecha">Fecha de Guardia</Label>
                                <Input
                                    id="fecha"
                                    type="date"
                                    value={formData.fecha}
                                    onChange={(e) => handleInputChange("fecha", e.target.value)}
                                    required
                                    disabled={!!guardia} // Deshabilitar si es edición
                                />
                                {guardia && (
                                    <p className="text-xs text-gray-500">
                                        La fecha no se puede cambiar al editar una guardia existente
                                    </p>
                                )}
                            </div>
                        ) : (
                            // Modo creación: mostrar fecha inicio y fin para registro masivo
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="fecha_inicio">Fecha de Inicio</Label>
                                    <Input
                                        id="fecha_inicio"
                                        type="date"
                                        value={formData.fecha_inicio}
                                        onChange={(e) => handleInputChange("fecha_inicio", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="fecha_fin">Fecha de Fin</Label>
                                    <Input
                                        id="fecha_fin"
                                        type="date"
                                        value={formData.fecha_fin}
                                        onChange={(e) => handleInputChange("fecha_fin", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        )}
                        
                        {!guardia && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> La guardia se extiende desde la fecha de inicio hasta la fecha de fin seleccionada. Se creará una guardia por cada día en el rango.
                                </p>
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="responsable_id">Responsable</Label>
                            <Select
                                value={formData.responsable_id}
                                onValueChange={(value) => handleInputChange("responsable_id", value)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar Responsable"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {responsables.map((responsable) => (
                                        <SelectItem key={responsable.responsable_id} value={responsable.responsable_id.toString()}>
                                            {responsable.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="estado">Estado</Label>
                            <Select
                                value={formData.estado}
                                onValueChange={(value) => handleInputChange("estado", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar Estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="asignada">Asignada</SelectItem>
                                    <SelectItem value="completada">Completada</SelectItem>
                                    <SelectItem value="cancelada">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Input
                                id="observaciones"
                                value={formData.observaciones}
                                onChange={(e) => handleInputChange("observaciones", e.target.value)}
                                placeholder="Observaciones (opcional)"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="sm:mr-2">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : guardia ? (
                                "Actualizar"
                            ) : (
                                "Crear"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}