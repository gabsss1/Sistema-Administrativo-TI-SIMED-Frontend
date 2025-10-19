"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
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
import { Plus } from "lucide-react"
//importar desde el lib/ las apis
import { 
    type RegistroBaseTIDto, 
    type AreaMedica,
    type Lis,
    type Modalidad,
    type Provincia,
    type TipoLicencia,
    type Responsable,
    type Hospital,
    createRegistroBaseTI, 
    updateRegistroBaseTI,
    getAreasMedicas,
    getLis,
    getModalidades,
    getProvincias,
    getTiposLicencia,
    getResponsables,
    getHospitales
} from "@/lib/registro-base-ti"

interface RegistroBaseTIDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    registroBaseTI: RegistroBaseTIDto | null
    onRegistroBaseTISaved: (isEditing?: boolean) => void
}

const initialFormData = {
    hospital_id: "",
    version: "",
    area_medica_id: "",
    equipo: "",
    status: true,
    lis_id: "",
    provincia_id: "",
    licencia_id: "",
    modalidad_id: "",
    responsable_id: "",
    numero_proyecto: "",
    numero_licencia: "",
    fecha_implentacion: "",
    codigo_centro: "",
    implementado: false,
}

export function RegistroBaseTIDialog({ open, onOpenChange, registroBaseTI, onRegistroBaseTISaved }: RegistroBaseTIDialogProps) {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    
    // Estados para los datos de las entidades relacionadas
    const [areasMedicas, setAreasMedicas] = useState<AreaMedica[]>([])
    const [lisList, setLisList] = useState<Lis[]>([])
    const [hospitalesList, setHospitalesList] = useState<Hospital[]>([])
    const [modalidades, setModalidades] = useState<Modalidad[]>([])
    const [provincias, setProvincias] = useState<Provincia[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    const [responsables, setResponsables] = useState<Responsable[]>([])
    
    const [formData, setFormData] = useState(initialFormData)

    // Cargar datos de las entidades relacionadas
    useEffect(() => {
        if (open) {
            const loadData = async () => {
                setLoadingData(true)
                try {
                    const [areasData, lisData, modalidadesData, provinciasData, tiposData, responsablesData] = await Promise.all([
                        getAreasMedicas(),
                        getLis(),
                        getModalidades(),
                        getProvincias(),
                        getTiposLicencia(),
                        getResponsables()
                    ])
                    
                    setAreasMedicas(areasData)
                    setLisList(lisData)
                    setModalidades(modalidadesData)
                    setProvincias(provinciasData)
                    setTiposLicencia(tiposData)
                    setResponsables(responsablesData)

                    // Cargar hospitales aparte (puede fallar sin bloquear el diálogo)
                        try {
                            const hosp = await getHospitales()
                            setHospitalesList(hosp)
                        } catch (err) {
                            console.warn('No se pudieron cargar hospitales', err)
                        }
                    

                } catch (error) {
                    console.error("Error loading data:", error)
                    
                    Swal.fire({
                        title: 'Error al cargar opciones',
                        text: 'No se pudieron cargar las opciones de los campos. Cierra el diálogo e inténtalo de nuevo.',
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

    useEffect(() => {
        if (registroBaseTI) {
            console.log('✏️ Abriendo diálogo de edición con registroBaseTI:', registroBaseTI);
            // area_medica ahora es un campo único; se procesa más abajo
            // Preparar hospital y area_medica si vienen
            const hospital_id = (registroBaseTI as any).hospitales ? String(((registroBaseTI as any).hospitales[0]?.hospital_id) || ((registroBaseTI as any).hospitales as any)?.hospital_id || "") : ((registroBaseTI as any).hospital_id ? String((registroBaseTI as any).hospital_id) : "")
            const area_medica_id = (registroBaseTI as any).area_medica_ids && Array.isArray((registroBaseTI as any).area_medica_ids) && (registroBaseTI as any).area_medica_ids.length > 0 ? String((registroBaseTI as any).area_medica_ids[0]) : ((registroBaseTI as any).area_medica_id ? String((registroBaseTI as any).area_medica_id) : "")
            setFormData({
                ...initialFormData,
                hospital_id,
                version: registroBaseTI.version ? String(registroBaseTI.version) : "",
                area_medica_id,
                equipo: registroBaseTI.equipo ? String(registroBaseTI.equipo) : "",
                status: registroBaseTI.status ?? true,
                lis_id: registroBaseTI.lis_id !== undefined && registroBaseTI.lis_id !== null ? String(registroBaseTI.lis_id) : "",
                provincia_id: registroBaseTI.provincia_id !== undefined && registroBaseTI.provincia_id !== null ? String(registroBaseTI.provincia_id) : "",
                licencia_id: registroBaseTI.licencia_id !== undefined && registroBaseTI.licencia_id !== null ? String(registroBaseTI.licencia_id) : "",
                modalidad_id: registroBaseTI.modalidad_id !== undefined && registroBaseTI.modalidad_id !== null ? String(registroBaseTI.modalidad_id) : "",
                responsable_id: registroBaseTI.responsable_id !== undefined && registroBaseTI.responsable_id !== null ? String(registroBaseTI.responsable_id) : "",
                numero_proyecto: registroBaseTI.numero_proyecto ? String(registroBaseTI.numero_proyecto) : "",
                numero_licencia: registroBaseTI.numero_licencia ? String(registroBaseTI.numero_licencia) : "",
                fecha_implentacion: registroBaseTI.fecha_implentacion ? String(registroBaseTI.fecha_implentacion) : "",
                codigo_centro: registroBaseTI.codigo_centro ? String(registroBaseTI.codigo_centro) : "",
                implementado: registroBaseTI.implementado ?? false,
            });
        } else {
            setFormData(initialFormData)
        }
    }, [registroBaseTI, open])

    // UseEffect adicional para re-establecer formData cuando las opciones estén cargadas
    useEffect(() => {
        if (registroBaseTI && !loadingData && tiposLicencia.length > 0 && areasMedicas.length > 0) {
            // Re-establecer formData ahora que las opciones están cargadas
            const hospital_id = (registroBaseTI as any).hospitales ? String(((registroBaseTI as any).hospitales[0]?.hospital_id) || ((registroBaseTI as any).hospitales as any)?.hospital_id || "") : ((registroBaseTI as any).hospital_id ? String((registroBaseTI as any).hospital_id) : "")
            const area_medica_id = (registroBaseTI as any).area_medica_ids && Array.isArray((registroBaseTI as any).area_medica_ids) && (registroBaseTI as any).area_medica_ids.length > 0 ? String((registroBaseTI as any).area_medica_ids[0]) : ((registroBaseTI as any).area_medica_id ? String((registroBaseTI as any).area_medica_id) : "")
            setFormData({
                ...initialFormData,
                hospital_id,
                version: registroBaseTI.version ? String(registroBaseTI.version) : "",
                area_medica_id,
                equipo: registroBaseTI.equipo ? String(registroBaseTI.equipo) : "",
                status: registroBaseTI.status ?? true,
                lis_id: registroBaseTI.lis_id !== undefined && registroBaseTI.lis_id !== null ? String(registroBaseTI.lis_id) : "",
                provincia_id: registroBaseTI.provincia_id !== undefined && registroBaseTI.provincia_id !== null ? String(registroBaseTI.provincia_id) : "",
                licencia_id: registroBaseTI.licencia_id !== undefined && registroBaseTI.licencia_id !== null ? String(registroBaseTI.licencia_id) : "",
                modalidad_id: registroBaseTI.modalidad_id !== undefined && registroBaseTI.modalidad_id !== null ? String(registroBaseTI.modalidad_id) : "",
                responsable_id: registroBaseTI.responsable_id !== undefined && registroBaseTI.responsable_id !== null ? String(registroBaseTI.responsable_id) : "",
                numero_proyecto: registroBaseTI.numero_proyecto ? String(registroBaseTI.numero_proyecto) : "",
                numero_licencia: registroBaseTI.numero_licencia ? String(registroBaseTI.numero_licencia) : "",
                fecha_implentacion: registroBaseTI.fecha_implentacion ? String(registroBaseTI.fecha_implentacion) : "",
                codigo_centro: registroBaseTI.codigo_centro ? String(registroBaseTI.codigo_centro) : "",
                implementado: registroBaseTI.implementado ?? false,
            });
        }
    }, [registroBaseTI, loadingData, tiposLicencia, areasMedicas, lisList, modalidades, provincias, responsables])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Convertir los strings a números para enviar al backend
            const dataToSend: RegistroBaseTIDto = {
                version: formData.version,
                equipo: formData.equipo,
                status: formData.status,
                lis_id: parseInt(formData.lis_id) || 0,
                provincia_id: parseInt(formData.provincia_id) || 0,
                licencia_id: parseInt(formData.licencia_id) || 0,
                modalidad_id: parseInt(formData.modalidad_id) || 0,
                responsable_id: parseInt(formData.responsable_id) || 0,
                numero_proyecto: formData.numero_proyecto,
                numero_licencia: formData.numero_licencia,
                codigo_centro: formData.codigo_centro || undefined,
                implementado: formData.implementado,
            }

            // Incluir hospital_id y area_medica_id si están presentes
            if ((formData as any).hospital_id) {
                (dataToSend as any).hospital_id = parseInt((formData as any).hospital_id)
            }
            if ((formData as any).area_medica_id) {
                (dataToSend as any).area_medica_id = parseInt((formData as any).area_medica_id)
            }

            // Solo incluir fecha_implentacion si está implementado
            if (formData.implementado && formData.fecha_implentacion) {
                dataToSend.fecha_implentacion = formData.fecha_implentacion
            }

            const isEditing = !!(registroBaseTI && registroBaseTI.registro_base_id)
            if (isEditing && registroBaseTI?.registro_base_id) {
                await updateRegistroBaseTI(registroBaseTI.registro_base_id, dataToSend)
            } else {
                await createRegistroBaseTI(dataToSend)
            }
            onRegistroBaseTISaved(isEditing)
        } catch (error) {
            console.error("Error saving registro base TI:", error)
            
            Swal.fire({
                title: 'Error al guardar',
                text: 'Hubo un problema al guardar el registro. Verifica los datos e inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            })
        } finally {
            setLoading(false)
        }
    }
    const handleInputChange = (field: string, value: string | boolean | string[]) => {
        setFormData((prev) => {
            const updated = { ...prev, [field]: value }
            
            // Si se desactiva "implementado", limpiar la fecha
            if (field === "implementado" && value === false) {
                updated.fecha_implentacion = ""
            }
            
            return updated
        })
    }
    
    // Debug: Estado actual del formulario (solo cuando hay opciones cargadas)
    if (tiposLicencia.length > 0) {
        console.log("=== ESTADO FINAL PARA DEBUGGING ===")

        console.log("Valores a buscar en Select:", {
            // area_medica_id eliminado, solo area_medica_ids
            licencia_id: formData.licencia_id,
            lis_id: formData.lis_id,
            modalidad_id: formData.modalidad_id,
            provincia_id: formData.provincia_id,
            responsable_id: formData.responsable_id
        })
        console.log("Form data completo:", formData)
        console.log("registroBaseTI original:", registroBaseTI)
        console.log("===================================")
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{registroBaseTI ? "Editar Registro Base TI" : "Crear Registro Base TI"}</DialogTitle>
                    <DialogDescription>
                        {registroBaseTI
                            ? "Modifica los detalles del registro base TI."
                            : "Rellena el formulario para crear un nuevo registro base TI."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="hospital_id">Hospital / Cliente</Label>
                            <Select
                                key={`hospital_${formData.hospital_id}_${hospitalesList.length}`}
                                value={formData.hospital_id}
                                onValueChange={(value) => handleInputChange("hospital_id", value)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar Hospital"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {hospitalesList.map((h) => (
                                        <SelectItem key={h.hospital_id} value={h.hospital_id.toString()}>
                                            {h.hospital_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="version">Versión</Label>
                            <Input
                                id="version"
                                value={formData.version}
                                onChange={(e) => handleInputChange("version", e.target.value)}
                                required
                                placeholder="Versión"
                            />
                        </div>
                        <div className="grid gap-2 col-span-1">
                            <Label htmlFor="area_medica_id">Área Médica</Label>
                            <Select
                                key={`area_medica_${formData.area_medica_id}_${areasMedicas.length}`}
                                value={formData.area_medica_id}
                                onValueChange={(value) => handleInputChange("area_medica_id", value)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar Área Médica"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {areasMedicas.map((area) => (
                                        <SelectItem key={area.area_medica_id} value={area.area_medica_id.toString()}>
                                            {area.area_medica_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 col-span-1">
                            <Label htmlFor="equipo">Equipo</Label>
                            <Input
                                id="equipo"
                                value={formData.equipo}
                                onChange={(e) => handleInputChange("equipo", e.target.value)}
                                required
                                placeholder="Equipo"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lis_id">LIS</Label>
                            <Select
                                key={`lis_${formData.lis_id}_${lisList.length}`}
                                value={formData.lis_id}
                                onValueChange={(value) => handleInputChange("lis_id", value)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar LIS"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {lisList.map((lis) => (
                                        <SelectItem key={lis.lis_id} value={lis.lis_id.toString()}>
                                            {lis.lis_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="provincia_id">Provincia</Label>
                            <Select
                                key={`provincia_${formData.provincia_id}_${provincias.length}`}
                                value={formData.provincia_id}
                                onValueChange={(value) => handleInputChange("provincia_id", value)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar Provincia"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {provincias.map((provincia) => (
                                        <SelectItem key={provincia.provincia_id} value={provincia.provincia_id.toString()}>
                                            {provincia.provincia_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="licencia_id">Tipo de Licencia</Label>
                            <Select
                                key={`licencia_${formData.licencia_id}_${tiposLicencia.length}`}
                                value={formData.licencia_id}
                                onValueChange={(value) => handleInputChange("licencia_id", value)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar Tipo de Licencia"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposLicencia.map((tipo) => (
                                        <SelectItem key={tipo.licencia_id} value={tipo.licencia_id.toString()}>
                                            {tipo.tipo_licencia}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="modalidad_id">Modalidad</Label>
                            <Select
                                key={`modalidad_${formData.modalidad_id}_${modalidades.length}`}
                                value={formData.modalidad_id}
                                onValueChange={(value) => handleInputChange("modalidad_id", value)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Cargando..." : "Seleccionar Modalidad"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {modalidades.map((modalidad) => (
                                        <SelectItem key={modalidad.modalidad_id} value={modalidad.modalidad_id.toString()}>
                                            {modalidad.modalidad_nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="responsable_id">Responsable</Label>
                            <Select
                                key={`responsable_${formData.responsable_id}_${responsables.length}`}
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
                            <Label htmlFor="numero_proyecto">Número de Proyecto</Label>
                            <Input
                                id="numero_proyecto"
                                value={formData.numero_proyecto}
                                onChange={(e) => handleInputChange("numero_proyecto", e.target.value)}
                                placeholder="Número de Proyecto"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="codigo_centro">Código Centro</Label>
                            <Input
                                id="codigo_centro"
                                value={formData.codigo_centro}
                                onChange={(e) => handleInputChange("codigo_centro", e.target.value)}
                                placeholder="Código Centro"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="numero_licencia">Número de Licencia</Label>
                            <Input
                                id="numero_licencia"
                                value={formData.numero_licencia}
                                onChange={(e) => handleInputChange("numero_licencia", e.target.value)}
                                placeholder="Número de Licencia"
                            />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="fecha_implentacion">
                                Fecha de Implementación
                                {formData.implementado && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            <Input
                                id="fecha_implentacion"
                                type="date"
                                value={formData.fecha_implentacion}
                                onChange={(e) => handleInputChange("fecha_implentacion", e.target.value)}
                                disabled={!formData.implementado}
                                required={formData.implementado}
                                className={!formData.implementado ? "bg-gray-100 cursor-not-allowed" : ""}
                            />
                            {!formData.implementado && (
                                <p className="text-sm text-gray-500">
                                    La fecha se habilitará cuando marques como "Implementado"
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="implementado"
                                    checked={formData.implementado}
                                    onCheckedChange={(checked) => handleInputChange("implementado", checked)}
                                />
                                <Label htmlFor="implementado">
                                    {formData.implementado ? "Implementado" : "Pendiente"}
                                </Label>
                            </div>
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select
                                value={formData.status ? "active" : "inactive"}
                                onValueChange={(value) => handleInputChange("status", value === "active")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Activo</SelectItem>
                                    <SelectItem value="inactive">Cerrado</SelectItem>
                                </SelectContent>
                            </Select>
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
                            ) : registroBaseTI ? (
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