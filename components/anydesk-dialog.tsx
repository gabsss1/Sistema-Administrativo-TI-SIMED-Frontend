"use client"

import type React from "react"
import { useState, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { 
    type Anydesk,
    type CreateAnydeskDto, 
    createAnydesk, 
    updateAnydesk
} from "@/lib/anydesk"
import { useHospitales } from "@/hooks/use-hospitales"

// Lazy load SweetAlert2
const loadSwal = () => import('sweetalert2').then(module => {
    const Swal = module.default
    // Configurar z-index y backdrop para evitar conflictos con Dialog
    Swal.mixin({
        customClass: {
            container: 'swal-container-high-z',
            popup: 'swal-popup-high-z'
        },
        didOpen: () => {
            // Asegurar que el backdrop de SweetAlert esté por encima del Dialog
            const swalContainer = document.querySelector('.swal2-container')
            if (swalContainer) {
                (swalContainer as HTMLElement).style.zIndex = '10000'
            }
        }
    })
    return Swal
})

interface AnydeskDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    anydesk: Anydesk | null
    onAnydeskSaved: (isEditing?: boolean) => void
}

interface FormData {
    anydesk_nombre: string
    anydesk_numero: string
    servidor: boolean
    hospital_id: string
}

const initialFormData: FormData = {
    anydesk_nombre: "",
    anydesk_numero: "",
    servidor: false,
    hospital_id: "",
}

const AnydeskDialog = memo(function AnydeskDialog({ open, onOpenChange, anydesk, onAnydeskSaved }: AnydeskDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [tempDialogOpen, setTempDialogOpen] = useState(true) // Para controlar visibility durante SweetAlert
    const { hospitales, loading: loadingHospitales, error: hospitalError } = useHospitales()

    // Cargar datos cuando se abre el diálogo
    useEffect(() => {
        if (open && anydesk) {
            setFormData({
                anydesk_nombre: anydesk.anydesk_nombre || "",
                anydesk_numero: anydesk.anydesk_numero || "",
                servidor: anydesk.servidor || false,
                hospital_id: anydesk.hospitales?.hospital_id ? String(anydesk.hospitales.hospital_id) : "",
            })
        } else if (open && !anydesk) {
            setFormData(initialFormData)
        }
        setTempDialogOpen(open)
    }, [anydesk, open])

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validar campos requeridos
            if (!formData.anydesk_nombre.trim() || !formData.anydesk_numero.trim() || !formData.hospital_id) {
                // Cerrar temporalmente el dialog para mostrar SweetAlert
                setTempDialogOpen(false)
                const Swal = await loadSwal()
                await Swal.fire({
                    icon: "warning",
                    title: "Campos requeridos",
                    text: "Por favor completa todos los campos requeridos",
                    customClass: {
                        container: 'swal-over-dialog'
                    },
                    backdrop: true,
                    allowOutsideClick: false
                })
                // Restaurar dialog después de SweetAlert
                setTempDialogOpen(true)
                return
            }

            // Convertir los datos para enviar al backend
            const dataToSend: CreateAnydeskDto = {
                anydesk_nombre: formData.anydesk_nombre.trim(),
                anydesk_numero: formData.anydesk_numero.trim(),
                servidor: formData.servidor,
                hospital_id: parseInt(formData.hospital_id, 10),
            }

            let success = false
            if (anydesk && anydesk.anydesk_id) {
                // Editar registro existente
                await updateAnydesk(anydesk.anydesk_id, dataToSend)
                success = true
                const Swal = await loadSwal()
                await Swal.fire({
                    icon: "success",
                    title: "¡Actualización exitosa!",
                    text: "El registro de Anydesk ha sido actualizado correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        container: 'swal-over-dialog'
                    },
                    backdrop: true
                })
            } else {
                // Crear nuevo registro
                await createAnydesk(dataToSend)
                success = true
                const Swal = await loadSwal()
                await Swal.fire({
                    icon: "success",
                    title: "¡Registro exitoso!",
                    text: "El registro de Anydesk ha sido creado correctamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        container: 'swal-over-dialog'
                    },
                    backdrop: true
                })
            }

            if (success) {
                setFormData(initialFormData)
                onOpenChange(false)
                onAnydeskSaved(!!anydesk)
            }
        } catch (error: any) {
            console.error("Error al guardar Anydesk:", error)
            // Cerrar temporalmente el dialog para mostrar error
            setTempDialogOpen(false)
            const Swal = await loadSwal()
            await Swal.fire({
                icon: "error", 
                title: "Error",
                text: error.message || "Ha ocurrido un error al guardar el registro",
                customClass: {
                    container: 'swal-over-dialog'
                },
                backdrop: true,
                allowOutsideClick: false
            })
            // Restaurar dialog después de SweetAlert
            setTempDialogOpen(true)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open && tempDialogOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {anydesk ? "Editar Anydesk" : "Nuevo Anydesk"}
                    </DialogTitle>
                    <DialogDescription>
                        {anydesk 
                            ? "Modifica los datos de la conexión Anydesk" 
                            : "Agrega una nueva conexión Anydesk al sistema"
                        }
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="anydesk_nombre">Nombre *</Label>
                        <Input
                            id="anydesk_nombre"
                            value={formData.anydesk_nombre}
                            onChange={(e) => handleInputChange("anydesk_nombre", e.target.value)}
                            placeholder="Ej: AnyDesk Principal"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="anydesk_numero">Número *</Label>
                        <Input
                            id="anydesk_numero"
                            value={formData.anydesk_numero}
                            onChange={(e) => handleInputChange("anydesk_numero", e.target.value)}
                            placeholder="Ej: 123456789"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="servidor">Es servidor principal</Label>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="servidor"
                                checked={formData.servidor}
                                onCheckedChange={(checked) => handleInputChange("servidor", checked)}
                                disabled={loading}
                            />
                            <span className="text-sm text-muted-foreground">
                                {formData.servidor ? "Sí" : "No"}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hospital_id">Hospital *</Label>
                        <Select 
                            value={formData.hospital_id} 
                            onValueChange={(value) => handleInputChange("hospital_id", value)}
                            disabled={loading || loadingHospitales}
                        >
                            <SelectTrigger id="hospital_id">
                                <SelectValue placeholder={loadingHospitales ? "Cargando..." : "Selecciona un hospital"} />
                            </SelectTrigger>
                            <SelectContent>
                                {hospitales.map((hospital) => (
                                    <SelectItem key={hospital.hospital_id} value={String(hospital.hospital_id)}>
                                        {hospital.hospital_nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {anydesk ? "Actualizar" : "Crear"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
})

export default AnydeskDialog