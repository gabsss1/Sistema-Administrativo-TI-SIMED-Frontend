"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { 
    type Equipo, 
    type CreateEquipoData, 
    TipoEquipo, 
    EstadoEquipo, 
    createEquipo, 
    updateEquipo 
} from "@/lib/equipos"
import { Computer, Mouse, Keyboard, Calendar, FileText } from "lucide-react"

interface EquipoDialogProps {
    isOpen: boolean
    onClose: () => void
    equipo?: Equipo | null
    onEquipoSaved: () => void
}

// Lazy load SweetAlert2
const loadSwal = () => import('sweetalert2').then(module => {
    const Swal = module.default
    Swal.mixin({
        customClass: {
            container: 'swal-container-high-z',
            popup: 'swal-popup-high-z'
        },
        didOpen: () => {
            const swalContainer = document.querySelector('.swal2-container')
            if (swalContainer) {
                (swalContainer as HTMLElement).style.zIndex = '10000'
            }
        }
    })
    return Swal
})

export default function EquipoDialog({ isOpen, onClose, equipo, onEquipoSaved }: EquipoDialogProps) {
    // Helper function para formatear fecha para input date
    const formatDateForInput = (date?: Date | string): string => {
        if (!date) return ''
        
        try {
            let dateObj: Date
            
            if (typeof date === 'string') {
                // Si es string, asegurar que tiene tiempo para evitar problemas de zona horaria
                dateObj = date.includes('T') ? new Date(date) : new Date(date + 'T00:00:00')
            } else {
                dateObj = date
            }
            
            if (isNaN(dateObj.getTime())) return ''
            
            // Formatear como YYYY-MM-DD usando la fecha local
            const year = dateObj.getFullYear()
            const month = String(dateObj.getMonth() + 1).padStart(2, '0')
            const day = String(dateObj.getDate()).padStart(2, '0')
            
            return `${year}-${month}-${day}`
        } catch {
            return ''
        }
    }

    const [formData, setFormData] = useState<CreateEquipoData>({
        tipo_equipo: TipoEquipo.PC,
        marca_equipo: "",
        modelo_equipo: "",
        numero_serie_equipo: "",
        marca_mouse: "",
        modelo_mouse: "",
        serie_mouse: "",
        marca_teclado: "",
        modelo_teclado: "",
        serie_teclado: "",
        fecha_revision_paquete: undefined,
        fecha_conclusion: undefined,
        observaciones: "",
        estado_equipo: EstadoEquipo.PENDIENTE,
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const isEditing = !!equipo

    useEffect(() => {
        if (equipo) {
            setFormData({
                tipo_equipo: equipo.tipo_equipo,
                marca_equipo: equipo.marca_equipo,
                modelo_equipo: equipo.modelo_equipo,
                numero_serie_equipo: equipo.numero_serie_equipo,
                marca_mouse: equipo.marca_mouse || "",
                modelo_mouse: equipo.modelo_mouse || "",
                serie_mouse: equipo.serie_mouse || "",
                marca_teclado: equipo.marca_teclado || "",
                modelo_teclado: equipo.modelo_teclado || "",
                serie_teclado: equipo.serie_teclado || "",
                fecha_revision_paquete: equipo.fecha_revision_paquete,
                fecha_conclusion: equipo.fecha_conclusion,
                observaciones: equipo.observaciones || "",
                estado_equipo: equipo.estado_equipo,
            })
        } else {
            setFormData({
                tipo_equipo: TipoEquipo.PC,
                marca_equipo: "",
                modelo_equipo: "",
                numero_serie_equipo: "",
                marca_mouse: "",
                modelo_mouse: "",
                serie_mouse: "",
                marca_teclado: "",
                modelo_teclado: "",
                serie_teclado: "",
                fecha_revision_paquete: undefined,
                fecha_conclusion: undefined,
                observaciones: "",
                estado_equipo: EstadoEquipo.PENDIENTE,
            })
        }
        // Limpiar errores cuando cambia el equipo o se abre el diálogo
        setErrors({})
    }, [equipo])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        
        // Reset errors
        setErrors({})
        
        try {
            // Validation
            const newErrors: Record<string, string> = {}
            
            if (!formData.tipo_equipo) {
                newErrors.tipo_equipo = "Selecciona un tipo de equipo"
            }
            if (!formData.marca_equipo.trim()) {
                newErrors.marca_equipo = "Ingresa la marca del equipo"
            }
            if (!formData.modelo_equipo.trim()) {
                newErrors.modelo_equipo = "Ingresa el modelo del equipo"
            }
            if (!formData.numero_serie_equipo.trim()) {
                newErrors.numero_serie_equipo = "Ingresa el número de serie"
            }
            
            // Validaciones específicas para PC (periféricos obligatorios)
            if (formData.tipo_equipo === TipoEquipo.PC) {
                if (!formData.marca_mouse?.trim()) {
                    newErrors.marca_mouse = "Ingresa la marca del mouse"
                }
                if (!formData.modelo_mouse?.trim()) {
                    newErrors.modelo_mouse = "Ingresa el modelo del mouse"
                }
                if (!formData.serie_mouse?.trim()) {
                    newErrors.serie_mouse = "Ingresa el número de serie del mouse"
                }
                if (!formData.marca_teclado?.trim()) {
                    newErrors.marca_teclado = "Ingresa la marca del teclado"
                }
                if (!formData.modelo_teclado?.trim()) {
                    newErrors.modelo_teclado = "Ingresa el modelo del teclado"
                }
                if (!formData.serie_teclado?.trim()) {
                    newErrors.serie_teclado = "Ingresa el número de serie del teclado"
                }
            }
            
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors)
                setLoading(false)
                return
            }

            // Prepare data for submission
            const submitData = { ...formData }

            if (isEditing) {
                await updateEquipo(equipo!.equipo_id, submitData)
            } else {
                await createEquipo(submitData)
            }

            const Swal = await loadSwal()
            await Swal.fire({
                icon: "success",
                title: isEditing ? "¡Equipo actualizado!" : "¡Equipo creado!",
                text: `El equipo ha sido ${isEditing ? "actualizado" : "creado"} exitosamente.`,
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                    container: 'swal-container-high-z'
                }
            })

            onEquipoSaved()
            onClose()
        } catch (error: any) {
            const Swal = await loadSwal()
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Ocurrió un error al guardar el equipo",
                customClass: {
                    container: 'swal-container-high-z'
                }
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field: keyof CreateEquipoData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }))
        // Limpiar error cuando el usuario empieza a escribir
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const handleSelectChange = (field: keyof CreateEquipoData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        
        // Si cambia el tipo de equipo a impresora, limpiar campos de periféricos
        if (field === 'tipo_equipo' && value === TipoEquipo.IMPRESORA) {
            setFormData(prev => ({
                ...prev,
                [field]: value,
                marca_mouse: "",
                modelo_mouse: "",
                serie_mouse: "",
                marca_teclado: "",
                modelo_teclado: "",
                serie_teclado: ""
            }))
            
            // Limpiar errores de periféricos
            setErrors(prev => ({
                ...prev,
                marca_mouse: "",
                modelo_mouse: "",
                serie_mouse: "",
                marca_teclado: "",
                modelo_teclado: "",
                serie_teclado: ""
            }))
        }
        
        // Limpiar error cuando el usuario selecciona un valor
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    const isPCSelected = formData.tipo_equipo === TipoEquipo.PC

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Computer className="h-5 w-5 text-primary" />
                        {isEditing ? "Editar Equipo" : "Nuevo Equipo"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modifica los datos del equipo" : "Completa la información del nuevo equipo"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información Básica */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Computer className="h-4 w-4" />
                            Información Básica
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tipo_equipo">Tipo de Equipo *</Label>
                                <Select
                                    value={formData.tipo_equipo}
                                    onValueChange={handleSelectChange('tipo_equipo')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(TipoEquipo).map((tipo) => (
                                            <SelectItem key={tipo} value={tipo}>
                                                {tipo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tipo_equipo && (
                                    <p className="text-sm text-red-600">{errors.tipo_equipo}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="estado_equipo">Estado *</Label>
                                <Select
                                    value={formData.estado_equipo}
                                    onValueChange={handleSelectChange('estado_equipo')}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(EstadoEquipo).map((estado) => (
                                            <SelectItem key={estado} value={estado}>
                                                {estado}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="marca_equipo">Marca *</Label>
                                <Input
                                    id="marca_equipo"
                                    value={formData.marca_equipo}
                                    onChange={handleInputChange('marca_equipo')}
                                    placeholder="Ej: Dell, HP, Lenovo"
                                    disabled={loading}
                                />
                                {errors.marca_equipo && (
                                    <p className="text-sm text-red-600">{errors.marca_equipo}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="modelo_equipo">Modelo *</Label>
                                <Input
                                    id="modelo_equipo"
                                    value={formData.modelo_equipo}
                                    onChange={handleInputChange('modelo_equipo')}
                                    placeholder="Ej: OptiPlex 3070"
                                    disabled={loading}
                                />
                                {errors.modelo_equipo && (
                                    <p className="text-sm text-red-600">{errors.modelo_equipo}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="numero_serie_equipo">Número de Serie *</Label>
                            <Input
                                id="numero_serie_equipo"
                                value={formData.numero_serie_equipo}
                                onChange={handleInputChange('numero_serie_equipo')}
                                placeholder="Número de serie del equipo"
                                disabled={loading}
                            />
                            {errors.numero_serie_equipo && (
                                <p className="text-sm text-red-600">{errors.numero_serie_equipo}</p>
                            )}
                        </div>
                    </div>

                    {/* Periféricos (solo para PC) */}
                    {isPCSelected && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium flex items-center gap-2">
                                    <Mouse className="h-4 w-4" />
                                    Periféricos (PC)
                                </h3>
                                
                                {/* Mouse */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                                        <Mouse className="h-3 w-3" />
                                        Mouse
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="marca_mouse">Marca Mouse *</Label>
                                            <Input
                                                id="marca_mouse"
                                                value={formData.marca_mouse}
                                                onChange={handleInputChange('marca_mouse')}
                                                placeholder="Ej: Logitech"
                                                disabled={loading}
                                            />
                                            {errors.marca_mouse && (
                                                <p className="text-sm text-red-600">{errors.marca_mouse}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="modelo_mouse">Modelo Mouse *</Label>
                                            <Input
                                                id="modelo_mouse"
                                                value={formData.modelo_mouse}
                                                onChange={handleInputChange('modelo_mouse')}
                                                placeholder="Ej: M705"
                                                disabled={loading}
                                            />
                                            {errors.modelo_mouse && (
                                                <p className="text-sm text-red-600">{errors.modelo_mouse}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="serie_mouse">Serie Mouse *</Label>
                                            <Input
                                                id="serie_mouse"
                                                value={formData.serie_mouse}
                                                onChange={handleInputChange('serie_mouse')}
                                                placeholder="Número de serie"
                                                disabled={loading}
                                            />
                                            {errors.serie_mouse && (
                                                <p className="text-sm text-red-600">{errors.serie_mouse}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Teclado */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                                        <Keyboard className="h-3 w-3" />
                                        Teclado
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="marca_teclado">Marca Teclado *</Label>
                                            <Input
                                                id="marca_teclado"
                                                value={formData.marca_teclado}
                                                onChange={handleInputChange('marca_teclado')}
                                                placeholder="Ej: Dell"
                                                disabled={loading}
                                            />
                                            {errors.marca_teclado && (
                                                <p className="text-sm text-red-600">{errors.marca_teclado}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="modelo_teclado">Modelo Teclado *</Label>
                                            <Input
                                                id="modelo_teclado"
                                                value={formData.modelo_teclado}
                                                onChange={handleInputChange('modelo_teclado')}
                                                placeholder="Ej: KB216"
                                                disabled={loading}
                                            />
                                            {errors.modelo_teclado && (
                                                <p className="text-sm text-red-600">{errors.modelo_teclado}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="serie_teclado">Serie Teclado *</Label>
                                            <Input
                                                id="serie_teclado"
                                                value={formData.serie_teclado}
                                                onChange={handleInputChange('serie_teclado')}
                                                placeholder="Número de serie"
                                                disabled={loading}
                                            />
                                            {errors.serie_teclado && (
                                                <p className="text-sm text-red-600">{errors.serie_teclado}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Fechas de Seguimiento */}
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Fechas de Seguimiento
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fecha_revision_paquete">Fecha de Revisión del Paquete</Label>
                                <Input
                                    id="fecha_revision_paquete"
                                    type="date"
                                    value={formatDateForInput(formData.fecha_revision_paquete)}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setFormData(prev => ({
                                            ...prev,
                                            fecha_revision_paquete: value ? new Date(value + 'T00:00:00') : undefined
                                        }))
                                    }}
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fecha_conclusion">Fecha de Conclusión</Label>
                                <Input
                                    id="fecha_conclusion"
                                    type="date"
                                    value={formatDateForInput(formData.fecha_conclusion)}
                                    onChange={(e) => {
                                        const value = e.target.value
                                        setFormData(prev => ({
                                            ...prev,
                                            fecha_conclusion: value ? new Date(value + 'T00:00:00') : undefined
                                        }))
                                    }}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Información Adicional */}
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Información Adicional
                        </h3>
                        
                        <div className="space-y-2">
                            <Label htmlFor="observaciones">Observaciones</Label>
                            <Textarea
                                id="observaciones"
                                value={formData.observaciones}
                                onChange={handleInputChange('observaciones')}
                                placeholder="Incluye configuración (RAM, procesador, almacenamiento), programas instalados, y observaciones adicionales sobre el equipo"
                                disabled={loading}
                                rows={4}
                            />
                            <p className="text-xs text-gray-500">
                                Incluye: Configuración del equipo, programas instalados, y cualquier observación adicional
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? "Guardando..." : (isEditing ? "Actualizar" : "Crear")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}