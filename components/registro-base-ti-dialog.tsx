"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
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
    const [searchHospital, setSearchHospital] = useState("")
    const [searchAreaMedica, setSearchAreaMedica] = useState("")
    const [searchLis, setSearchLis] = useState("")
    const [searchProvincia, setSearchProvincia] = useState("")
    const [searchLicencia, setSearchLicencia] = useState("")
    const [searchModalidad, setSearchModalidad] = useState("")
    const [searchResponsable, setSearchResponsable] = useState("")

    const statusOptions = [
        { id: 'active', nombre: 'Activo' },
        { id: 'inactive', nombre: 'Cerrado' }
    ]

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
                        confirmButtonText: 'Entendido',
                        position: 'top-end',
                        toast: true,
                        timer: 5000,
                        timerProgressBar: true,
                        showConfirmButton: true,
                        customClass: {
                            container: 'swal2-top-end-container'
                        }
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
            
            // Parsear hospital_id
            const hospital_id = (registroBaseTI as any).hospitales 
                ? String(((registroBaseTI as any).hospitales[0]?.hospital_id) || ((registroBaseTI as any).hospitales as any)?.hospital_id || "") 
                : ((registroBaseTI as any).hospital_id ? String((registroBaseTI as any).hospital_id) : "")
            
            // Parsear area_medica_id - puede venir como objeto area_medica o directamente como area_medica_id
            let area_medica_id = "";
            if ((registroBaseTI as any).area_medica?.area_medica_id) {
                area_medica_id = String((registroBaseTI as any).area_medica.area_medica_id);
            } else if ((registroBaseTI as any).area_medica_id) {
                area_medica_id = String((registroBaseTI as any).area_medica_id);
            }
            
            // Parsear lis_id
            const lis_id = (registroBaseTI as any).lis?.lis_id 
                ? String((registroBaseTI as any).lis.lis_id) 
                : (registroBaseTI.lis_id !== undefined && registroBaseTI.lis_id !== null ? String(registroBaseTI.lis_id) : "");
            
            // Parsear provincia_id
            const provincia_id = (registroBaseTI as any).provincia?.provincia_id 
                ? String((registroBaseTI as any).provincia.provincia_id) 
                : (registroBaseTI.provincia_id !== undefined && registroBaseTI.provincia_id !== null ? String(registroBaseTI.provincia_id) : "");
            
            // Parsear licencia_id
            const licencia_id = (registroBaseTI as any).tipo_licencia?.licencia_id 
                ? String((registroBaseTI as any).tipo_licencia.licencia_id) 
                : (registroBaseTI.licencia_id !== undefined && registroBaseTI.licencia_id !== null ? String(registroBaseTI.licencia_id) : "");
            
            // Parsear modalidad_id
            const modalidad_id = (registroBaseTI as any).modalidad?.modalidad_id 
                ? String((registroBaseTI as any).modalidad.modalidad_id) 
                : (registroBaseTI.modalidad_id !== undefined && registroBaseTI.modalidad_id !== null ? String(registroBaseTI.modalidad_id) : "");
            
            // Parsear responsable_id
            const responsable_id = (registroBaseTI as any).responsable?.responsable_id 
                ? String((registroBaseTI as any).responsable.responsable_id) 
                : (registroBaseTI.responsable_id !== undefined && registroBaseTI.responsable_id !== null ? String(registroBaseTI.responsable_id) : "");
            
            setFormData({
                ...initialFormData,
                hospital_id,
                version: registroBaseTI.version ? String(registroBaseTI.version) : "",
                area_medica_id,
                equipo: registroBaseTI.equipo ? String(registroBaseTI.equipo) : "",
                status: registroBaseTI.status ?? true,
                lis_id,
                provincia_id,
                licencia_id,
                modalidad_id,
                responsable_id,
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
            const hospital_id = (registroBaseTI as any).hospitales 
                ? String(((registroBaseTI as any).hospitales[0]?.hospital_id) || ((registroBaseTI as any).hospitales as any)?.hospital_id || "") 
                : ((registroBaseTI as any).hospital_id ? String((registroBaseTI as any).hospital_id) : "")
            
            // Parsear area_medica_id
            let area_medica_id = "";
            if ((registroBaseTI as any).area_medica?.area_medica_id) {
                area_medica_id = String((registroBaseTI as any).area_medica.area_medica_id);
            } else if ((registroBaseTI as any).area_medica_id) {
                area_medica_id = String((registroBaseTI as any).area_medica_id);
            }
            
            // Parsear lis_id
            const lis_id = (registroBaseTI as any).lis?.lis_id 
                ? String((registroBaseTI as any).lis.lis_id) 
                : (registroBaseTI.lis_id !== undefined && registroBaseTI.lis_id !== null ? String(registroBaseTI.lis_id) : "");
            
            // Parsear provincia_id
            const provincia_id = (registroBaseTI as any).provincia?.provincia_id 
                ? String((registroBaseTI as any).provincia.provincia_id) 
                : (registroBaseTI.provincia_id !== undefined && registroBaseTI.provincia_id !== null ? String(registroBaseTI.provincia_id) : "");
            
            // Parsear licencia_id
            const licencia_id = (registroBaseTI as any).tipo_licencia?.licencia_id 
                ? String((registroBaseTI as any).tipo_licencia.licencia_id) 
                : (registroBaseTI.licencia_id !== undefined && registroBaseTI.licencia_id !== null ? String(registroBaseTI.licencia_id) : "");
            
            // Parsear modalidad_id
            const modalidad_id = (registroBaseTI as any).modalidad?.modalidad_id 
                ? String((registroBaseTI as any).modalidad.modalidad_id) 
                : (registroBaseTI.modalidad_id !== undefined && registroBaseTI.modalidad_id !== null ? String(registroBaseTI.modalidad_id) : "");
            
            // Parsear responsable_id
            const responsable_id = (registroBaseTI as any).responsable?.responsable_id 
                ? String((registroBaseTI as any).responsable.responsable_id) 
                : (registroBaseTI.responsable_id !== undefined && registroBaseTI.responsable_id !== null ? String(registroBaseTI.responsable_id) : "");
            
            setFormData({
                ...initialFormData,
                hospital_id,
                version: registroBaseTI.version ? String(registroBaseTI.version) : "",
                area_medica_id,
                equipo: registroBaseTI.equipo ? String(registroBaseTI.equipo) : "",
                status: registroBaseTI.status ?? true,
                lis_id,
                provincia_id,
                licencia_id,
                modalidad_id,
                responsable_id,
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
                hospital_id: parseInt(formData.hospital_id),
                version: formData.version,
                area_medica_id: parseInt(formData.area_medica_id),
                equipo: formData.equipo,
                status: formData.status,
                lis_id: parseInt(formData.lis_id),
                provincia_id: parseInt(formData.provincia_id),
                licencia_id: parseInt(formData.licencia_id),
                modalidad_id: parseInt(formData.modalidad_id),
                responsable_id: parseInt(formData.responsable_id),
                numero_proyecto: formData.numero_proyecto,
                numero_licencia: formData.numero_licencia,
                codigo_centro: formData.codigo_centro || undefined,
                implementado: formData.implementado,
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
                confirmButtonText: 'Entendido',
                position: 'top-end',
                toast: true,
                timer: 5000,
                timerProgressBar: true,
                showConfirmButton: true,
                customClass: {
                    container: 'swal2-top-end-container'
                }
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

    const normalize = (str: string) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    // Filtro mejorado para hospitales
    const filteredHospitales = hospitalesList
        .filter(h =>
            !searchHospital || normalize(h.hospital_nombre).includes(normalize(searchHospital))
        )
        .sort((a, b) => {
            const s = normalize(searchHospital);
            const aName = normalize(a.hospital_nombre);
            const bName = normalize(b.hospital_nombre);
            const aStarts = aName.startsWith(s) ? -1 : 0;
            const bStarts = bName.startsWith(s) ? -1 : 0;
            return bStarts - aStarts || aName.localeCompare(bName);
        });

    // Filtro para áreas médicas
    const filteredAreasMedicas = areasMedicas
        .filter(area =>
            !searchAreaMedica || normalize(area.area_medica_nombre).includes(normalize(searchAreaMedica))
        )
        .sort((a, b) => {
            const s = normalize(searchAreaMedica);
            const aName = normalize(a.area_medica_nombre);
            const bName = normalize(b.area_medica_nombre);
            const aStarts = aName.startsWith(s) ? -1 : 0;
            const bStarts = bName.startsWith(s) ? -1 : 0;
            return bStarts - aStarts || aName.localeCompare(bName);
        });

    // Filtro para LIS
    const filteredLis = lisList
        .filter(lis =>
            !searchLis || normalize(lis.lis_nombre).includes(normalize(searchLis))
        )
        .sort((a, b) => {
            const s = normalize(searchLis);
            const aName = normalize(a.lis_nombre);
            const bName = normalize(b.lis_nombre);
            const aStarts = aName.startsWith(s) ? -1 : 0;
            const bStarts = bName.startsWith(s) ? -1 : 0;
            return bStarts - aStarts || aName.localeCompare(bName);
        });

    // Filtro para Provincia
    const filteredProvincias = provincias
        .filter(p =>
            !searchProvincia || normalize(p.provincia_nombre).includes(normalize(searchProvincia))
        )
        .sort((a, b) => {
            const s = normalize(searchProvincia);
            const aName = normalize(a.provincia_nombre);
            const bName = normalize(b.provincia_nombre);
            const aStarts = aName.startsWith(s) ? -1 : 0;
            const bStarts = bName.startsWith(s) ? -1 : 0;
            return bStarts - aStarts || aName.localeCompare(bName);
        });

    // Filtro para Tipo de Licencia
    const filteredLicencias = tiposLicencia
        .filter(t =>
            !searchLicencia || normalize(t.tipo_licencia).includes(normalize(searchLicencia))
        )
        .sort((a, b) => {
            const s = normalize(searchLicencia);
            const aName = normalize(a.tipo_licencia);
            const bName = normalize(b.tipo_licencia);
            const aStarts = aName.startsWith(s) ? -1 : 0;
            const bStarts = bName.startsWith(s) ? -1 : 0;
            return bStarts - aStarts || aName.localeCompare(bName);
        });

    // Filtro para Modalidad
    const filteredModalidades = modalidades
        .filter(m =>
            !searchModalidad || normalize(m.modalidad_nombre).includes(normalize(searchModalidad))
        )
        .sort((a, b) => {
            const s = normalize(searchModalidad);
            const aName = normalize(a.modalidad_nombre);
            const bName = normalize(b.modalidad_nombre);
            const aStarts = aName.startsWith(s) ? -1 : 0;
            const bStarts = bName.startsWith(s) ? -1 : 0;
            return bStarts - aStarts || aName.localeCompare(bName);
        });

    // Filtro para Responsable
    const filteredResponsables = responsables
        .filter(r =>
            !searchResponsable || normalize(r.nombre).includes(normalize(searchResponsable))
        )
        .sort((a, b) => {
            const s = normalize(searchResponsable);
            const aName = normalize(a.nombre);
            const bName = normalize(b.nombre);
            const aStarts = aName.startsWith(s) ? -1 : 0;
            const bStarts = bName.startsWith(s) ? -1 : 0;
            return bStarts - aStarts || aName.localeCompare(bName);
        });

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
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between"
                                    disabled={loadingData}
                                >
                                    {formData.hospital_id
                                    ? hospitalesList.find(h => h.hospital_id.toString() === formData.hospital_id)?.hospital_nombre
                                    : (loadingData ? "Cargando..." : "Seleccionar Hospital")}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                                <Command className="w-full">
                                    <div className="sticky top-0 bg-white z-10 p-2">
                                        <CommandInput placeholder="Buscar hospital..." value={searchHospital} onValueChange={setSearchHospital}/>
                                    </div>
                                    <CommandList className="max-h-[45vh] overflow-y-auto">
                                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredHospitales.map(h => (
                                        <CommandItem
                                            key={h.hospital_id}
                                            value={h.hospital_nombre}
                                            onSelect={() => handleInputChange("hospital_id", h.hospital_id.toString())}
                                        >
                                            <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                formData.hospital_id === h.hospital_id.toString()
                                                ? "opacity-100"
                                                : "opacity-0"
                                            )}
                                            />
                                            {h.hospital_nombre}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                            </Popover>
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
                        <div className="grid gap-2 col-span-1">
                            <Label htmlFor="version">Versión <span className="text-red-500">*</span></Label>
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                        disabled={loadingData}
                                    >
                                        {formData.area_medica_id
                                            ? areasMedicas.find(area => area.area_medica_id.toString() === formData.area_medica_id)?.area_medica_nombre
                                            : (loadingData ? "Cargando..." : "Seleccionar Área Médica")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                                    <Command className="w-full">
                                        <div className="sticky top-0 bg-white z-10 p-2">
                                            <CommandInput placeholder="Buscar área médica..." value={searchAreaMedica} onValueChange={setSearchAreaMedica} />
                                        </div>
                                        <CommandList className="max-h-[45vh] overflow-y-auto">
                                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredAreasMedicas.map(area => (
                                                    <CommandItem
                                                        key={area.area_medica_id}
                                                        value={area.area_medica_nombre}
                                                        onSelect={() => handleInputChange("area_medica_id", area.area_medica_id.toString())}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.area_medica_id === area.area_medica_id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {area.area_medica_nombre}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lis_id">LIS</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                        disabled={loadingData}
                                    >
                                        {formData.lis_id
                                            ? lisList.find(lis => lis.lis_id.toString() === formData.lis_id)?.lis_nombre
                                            : (loadingData ? "Cargando..." : "Seleccionar LIS")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                                    <Command className="w-full">
                                        <div className="sticky top-0 bg-white z-10 p-2">
                                            <CommandInput placeholder="Buscar LIS..." value={searchLis} onValueChange={setSearchLis} />
                                        </div>
                                        <CommandList className="max-h-[45vh] overflow-y-auto">
                                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredLis.map(lis => (
                                                    <CommandItem
                                                        key={lis.lis_id}
                                                        value={lis.lis_nombre}
                                                        onSelect={() => handleInputChange("lis_id", lis.lis_id.toString())}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.lis_id === lis.lis_id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {lis.lis_nombre}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="provincia_id">Provincia</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                        disabled={loadingData}
                                    >
                                        {formData.provincia_id
                                            ? provincias.find(p => p.provincia_id.toString() === formData.provincia_id)?.provincia_nombre
                                            : (loadingData ? "Cargando..." : "Seleccionar Provincia")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                                    <Command className="w-full">
                                        <div className="sticky top-0 bg-white z-10 p-2">
                                            <CommandInput placeholder="Buscar provincia..." value={searchProvincia} onValueChange={setSearchProvincia} />
                                        </div>
                                        <CommandList className="max-h-[45vh] overflow-y-auto">
                                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredProvincias.map(provincia => (
                                                    <CommandItem
                                                        key={provincia.provincia_id}
                                                        value={provincia.provincia_nombre}
                                                        onSelect={() => handleInputChange("provincia_id", provincia.provincia_id.toString())}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.provincia_id === provincia.provincia_id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {provincia.provincia_nombre}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="licencia_id">Tipo de Licencia</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                        disabled={loadingData}
                                    >
                                        {formData.licencia_id
                                            ? tiposLicencia.find(t => t.licencia_id.toString() === formData.licencia_id)?.tipo_licencia
                                            : (loadingData ? "Cargando..." : "Seleccionar Tipo de Licencia")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                                    <Command className="w-full">
                                        <div className="sticky top-0 bg-white z-10 p-2">
                                            <CommandInput placeholder="Buscar tipo de licencia..." value={searchLicencia} onValueChange={setSearchLicencia} />
                                        </div>
                                        <CommandList className="max-h-[45vh] overflow-y-auto">
                                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredLicencias.map(tipo => (
                                                    <CommandItem
                                                        key={tipo.licencia_id}
                                                        value={tipo.tipo_licencia}
                                                        onSelect={() => handleInputChange("licencia_id", tipo.licencia_id.toString())}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.licencia_id === tipo.licencia_id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {tipo.tipo_licencia}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="modalidad_id">Modalidad</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                        disabled={loadingData}
                                    >
                                        {formData.modalidad_id
                                            ? modalidades.find(m => m.modalidad_id.toString() === formData.modalidad_id)?.modalidad_nombre
                                            : (loadingData ? "Cargando..." : "Seleccionar Modalidad")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                                    <Command className="w-full">
                                        <div className="sticky top-0 bg-white z-10 p-2">
                                            <CommandInput placeholder="Buscar modalidad..." value={searchModalidad} onValueChange={setSearchModalidad} />
                                        </div>
                                        <CommandList className="max-h-[45vh] overflow-y-auto">
                                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredModalidades.map(modalidad => (
                                                    <CommandItem
                                                        key={modalidad.modalidad_id}
                                                        value={modalidad.modalidad_nombre}
                                                        onSelect={() => handleInputChange("modalidad_id", modalidad.modalidad_id.toString())}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.modalidad_id === modalidad.modalidad_id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {modalidad.modalidad_nombre}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="responsable_id">Responsable</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between"
                                        disabled={loadingData}
                                    >
                                        {formData.responsable_id
                                            ? responsables.find(r => r.responsable_id.toString() === formData.responsable_id)?.nombre
                                            : (loadingData ? "Cargando..." : "Seleccionar Responsable")}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[min(90vw,400px)] max-h-[60vh] overflow-y-auto z-50">
                                    <Command className="w-full">
                                        <div className="sticky top-0 bg-white z-10 p-2">
                                            <CommandInput placeholder="Buscar responsable..." value={searchResponsable} onValueChange={setSearchResponsable} />
                                        </div>
                                        <CommandList className="max-h-[45vh] overflow-y-auto">
                                            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredResponsables.map(responsable => (
                                                    <CommandItem
                                                        key={responsable.responsable_id}
                                                        value={responsable.nombre}
                                                        onSelect={() => handleInputChange("responsable_id", responsable.responsable_id.toString())}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                formData.responsable_id === responsable.responsable_id.toString()
                                                                    ? "opacity-100"
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                        {responsable.nombre}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
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
                                    {statusOptions.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                                    ))}
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