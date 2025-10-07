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
            setFormData({
                fecha: guardia.fecha,
                estado: guardia.estado,
                observaciones: guardia.observaciones || "",
                responsable_id: guardia.responsable_id.toString(),
            })
        } else {
            setFormData({
                ...initialFormData,
                fecha: fechaSeleccionada || "",
            })
        }
    }, [guardia, fechaSeleccionada, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const dataToSend: CreateGuardiaDto = {
                fecha: formData.fecha,
                estado: formData.estado,
                observaciones: formData.observaciones || undefined,
                responsable_id: parseInt(formData.responsable_id),
            }

            const isEditing = !!(guardia && guardia.guardia_id)
            if (isEditing && guardia?.guardia_id) {
                await updateGuardia(guardia.guardia_id, dataToSend)
            } else {
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
        setFormData((prev) => ({ 
            ...prev, 
            [field]: field === "estado" ? value as "asignada" | "completada" | "cancelada" : value 
        }))
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
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fecha">Fecha de Guardia (24 horas)</Label>
                            <Input
                                id="fecha"
                                type="date"
                                value={formData.fecha}
                                onChange={(e) => handleInputChange("fecha", e.target.value)}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                La guardia es de 24 horas completas para esta fecha
                            </p>
                        </div>
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