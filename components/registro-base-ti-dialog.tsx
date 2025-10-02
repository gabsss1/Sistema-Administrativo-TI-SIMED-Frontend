"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
//importar desde el lib/ las apis
import { 
    type RegistroBaseTIDto, 
    type AreaMedica,
    type Lis,
    type Modalidad,
    type Provincia,
    type TipoLicencia,
    createRegistroBaseTI, 
    updateRegistroBaseTI,
    getAreasMedicas,
    getLis,
    getModalidades,
    getProvincias,
    getTiposLicencia
} from "@/lib/registro-base-ti"

interface RegistroBaseTIDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    registroBaseTI: RegistroBaseTIDto | null
    onRegistroBaseTISaved: () => void
}

export function RegistroBaseTIDialog({ open, onOpenChange, registroBaseTI, onRegistroBaseTISaved }: RegistroBaseTIDialogProps) {
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(false)
    
    // Estados para los datos de las entidades relacionadas
    const [areasMedicas, setAreasMedicas] = useState<AreaMedica[]>([])
    const [lisList, setLisList] = useState<Lis[]>([])
    const [modalidades, setModalidades] = useState<Modalidad[]>([])
    const [provincias, setProvincias] = useState<Provincia[]>([])
    const [tiposLicencia, setTiposLicencia] = useState<TipoLicencia[]>([])
    
    const [formData, setFormData] = useState({
        name_cliente: "",
        version: "",
        area_medica_id: "",
        equipo: "",
        status: true,
        lis_id: "",
        provincia_id: "",
        licencia_id: "",
        modalidad_id: "",
        fecha_implentacion: "",
    })

    // Cargar datos de las entidades relacionadas
    useEffect(() => {
        if (open) {
            const loadData = async () => {
                setLoadingData(true)
                try {
                    const [areasData, lisData, modalidadesData, provinciasData, tiposData] = await Promise.all([
                        getAreasMedicas(),
                        getLis(),
                        getModalidades(),
                        getProvincias(),
                        getTiposLicencia()
                    ])
                    
                    setAreasMedicas(areasData)
                    setLisList(lisData)
                    setModalidades(modalidadesData)
                    setProvincias(provinciasData)
                    setTiposLicencia(tiposData)
                    

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
            const newFormData = {
                name_cliente: registroBaseTI.name_cliente || "",
                version: registroBaseTI.version || "",
                area_medica_id: registroBaseTI.area_medica_id?.toString() || "",
                equipo: registroBaseTI.equipo || "",
                status: registroBaseTI.status ?? true,
                lis_id: registroBaseTI.lis_id?.toString() || "",
                provincia_id: registroBaseTI.provincia_id?.toString() || "",
                licencia_id: registroBaseTI.licencia_id?.toString() || "",
                modalidad_id: registroBaseTI.modalidad_id?.toString() || "",
                fecha_implentacion: registroBaseTI.fecha_implentacion || "",
            }
            
            setFormData(newFormData)
        } else {
            setFormData({
                name_cliente: "",
                version: "",
                area_medica_id: "",
                equipo: "",
                status: true,
                lis_id: "",
                provincia_id: "",
                licencia_id: "",
                modalidad_id: "",
                fecha_implentacion: "",
            })
        }
    }, [registroBaseTI, open])

    // UseEffect adicional para re-establecer formData cuando las opciones estén cargadas
    useEffect(() => {
        if (registroBaseTI && !loadingData && tiposLicencia.length > 0 && areasMedicas.length > 0) {
            // Re-establecer formData ahora que las opciones están cargadas
            const newFormData = {
                name_cliente: registroBaseTI.name_cliente || "",
                version: registroBaseTI.version || "",
                area_medica_id: registroBaseTI.area_medica_id?.toString() || "",
                equipo: registroBaseTI.equipo || "",
                status: registroBaseTI.status ?? true,
                lis_id: registroBaseTI.lis_id?.toString() || "",
                provincia_id: registroBaseTI.provincia_id?.toString() || "",
                licencia_id: registroBaseTI.licencia_id?.toString() || "",
                modalidad_id: registroBaseTI.modalidad_id?.toString() || "",
                fecha_implentacion: registroBaseTI.fecha_implentacion || "",
            }
            
            setFormData(newFormData)
        }
    }, [registroBaseTI, loadingData, tiposLicencia, areasMedicas, lisList, modalidades, provincias])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Convertir los strings a números para enviar al backend
            const dataToSend: RegistroBaseTIDto = {
                name_cliente: formData.name_cliente,
                version: formData.version,
                area_medica_id: parseInt(formData.area_medica_id) || 0,
                equipo: formData.equipo,
                status: formData.status,
                lis_id: parseInt(formData.lis_id) || 0,
                provincia_id: parseInt(formData.provincia_id) || 0,
                licencia_id: parseInt(formData.licencia_id) || 0,
                modalidad_id: parseInt(formData.modalidad_id) || 0,
                fecha_implentacion: formData.fecha_implentacion,
            }

            if (registroBaseTI && registroBaseTI.registro_base_id) {
                await updateRegistroBaseTI(registroBaseTI.registro_base_id, dataToSend)
            } else {
                await createRegistroBaseTI(dataToSend)
            }
            onRegistroBaseTISaved()
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
    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }
    
    // Debug: Estado actual del formulario (solo cuando hay opciones cargadas)
    if (tiposLicencia.length > 0) {
        console.log("=== ESTADO FINAL PARA DEBUGGING ===")

        console.log("Valores a buscar en Select:", {
            area_medica_id: formData.area_medica_id,
            licencia_id: formData.licencia_id,
            lis_id: formData.lis_id,
            modalidad_id: formData.modalidad_id,
            provincia_id: formData.provincia_id
        })
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
                            <Label htmlFor="name_cliente">Nombre del Cliente</Label>
                            <Input
                                id="name_cliente"
                                value={formData.name_cliente}
                                onChange={(e) => handleInputChange("name_cliente", e.target.value)}
                                required
                                placeholder="Nombre del Cliente"
                            />
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
                        <div className="grid gap-2">
                            <Label htmlFor="area_medica_id">Área Médica</Label>
                            <Select
                                key={`area_medica_${formData.area_medica_id}_${areasMedicas.length}`}
                                value={formData.area_medica_id}
                                onValueChange={(value) => {
                                    console.log("Cambiando area_medica_id a:", value)
                                    handleInputChange("area_medica_id", value)
                                }}
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
                        <div className="grid gap-2">
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
                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="fecha_implentacion">Fecha de Implementación</Label>
                            <Input
                                id="fecha_implentacion"
                                type="date"
                                value={formData.fecha_implentacion}
                                onChange={(e) => handleInputChange("fecha_implentacion", e.target.value)}
                                required
                            />
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
                                    <SelectItem value="inactive">Inactivo</SelectItem>
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