"use client"

import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react"
import Swal from 'sweetalert2'
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Layers } from "lucide-react"
import { 
    type RegistroBaseTIDto, 
    type AreaMedica,
    type Lis,
    type Provincia,
    getRegistroBaseTI, 
    deleteRegistroBaseTI,
    getLis,
    getModulos,
    getModulosForRegistro
} from "@/lib/registro-base-ti"
import { getRegistroBaseTIWithModulos } from '@/lib/registro-base-ti'


const RegistroBaseTIDialog = lazy(() => import("./registro-base-ti-dialog").then(module => ({
    default: module.RegistroBaseTIDialog
})))

const RegistroModulosDialog = lazy(() => import('./registro-modulos-dialog').then(module => ({
    default: module.RegistroModulosDialog
})))


// Interfaz extendida para la tabla que puede recibir objetos poblados
// El backend devuelve los datos con nombres de relaciones (area_medica, lis, provincia)
interface RegistroBaseTIWithRelations extends Omit<RegistroBaseTIDto, 'area_medica_id' | 'lis_id' | 'provincia_id'> {
    area_medica: number | AreaMedica;
    // El backend puede devolver la relación en plural `area_medicas`
    area_medicas?: AreaMedica[];
  lis: number | Lis;
  provincia: number | Provincia;
  modalidad: number | { modalidad_id: number; modalidad_nombre: string };
  tipo_licencia?: number | { licencia_id: number; tipo_licencia: string };
  responsable?: number | { responsable_id: number; nombre: string };
  fecha_display?: string; // Campo que viene del backend para mostrar la fecha
}

export function RegistroBaseTITable() {
    const [registros, setRegistros] = useState<RegistroBaseTIWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [filtering, setFiltering] = useState(false)
    const [lisOptions, setLisOptions] = useState<Lis[]>([])
    const [selectedLisId, setSelectedLisId] = useState<number | undefined>(undefined)
    const [moduleOptions, setModuleOptions] = useState<any[]>([])
    const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([])
    const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false)
    // cache of modules per registro id
    const [modulosCache] = useState<Map<number, number[]>>(() => new Map())
    const [filteredByModuleSet, setFilteredByModuleSet] = useState<Set<number> | null>(null)
    const [registrosWithModulos, setRegistrosWithModulos] = useState<RegistroBaseTIWithRelations[] | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [searchInput, setSearchInput] = useState("") // Para debouncing
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingRegistro, setEditingRegistro] = useState<RegistroBaseTIDto | null>(null)
    const [modulosDialogOpen, setModulosDialogOpen] = useState(false)
    const [modulosRegistroId, setModulosRegistroId] = useState<number | null>(null)
    const [modulosLisId, setModulosLisId] = useState<number | undefined>(undefined)
    const [modulosAreaId, setModulosAreaId] = useState<number | undefined>(undefined)
    
    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage] = useState(5) // 5 registros por página

    // Debouncing para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(searchInput)
            setCurrentPage(1)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchInput])

    // Helper para normalizar y obtener el nombre del hospital desde distintas formas que pueda devolver el backend
    const getHospitalName = (registro: any) => {
        if (Array.isArray(registro.hospitales) && registro.hospitales.length > 0) {
            return registro.hospitales.map((h: any) => h.hospital_nombre).join(' - ')
        }
        if (registro.hospitales && typeof registro.hospitales === 'object' && registro.hospitales.hospital_nombre) {
            return registro.hospitales.hospital_nombre
        }
        if (registro.hospital && typeof registro.hospital === 'object' && registro.hospital.hospital_nombre) {
            return registro.hospital.hospital_nombre
        }
        return registro.name_cliente || ''
    }

    useEffect(() => {
        loadRegistros()
        // load lis options
        ;(async () => {
            try {
                const l = await getLis()
                setLisOptions(l || [])
            } catch (e) {
                console.error('Error loading LIS options', e)
            }
        })()
    }, [])
    const loadRegistros = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getRegistroBaseTI()
            console.log('📥 Registros recibidos (loadRegistros):', data)
            setRegistros(data)
        } catch (error) {
            console.error("Error loading registros:", error)
            Swal.fire({
                title: 'Error al cargar datos',
                text: 'No se pudieron cargar los registros. Por favor, recarga la página.',
                icon: 'error',
                confirmButtonText: 'Entendido'
            })
        } finally {
            setLoading(false)
        }
    }, [])
    const handleDelete = useCallback(async (id: number) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        })

        if (result.isConfirmed) {
            try {
                await deleteRegistroBaseTI(id)
                setRegistros(prev => prev.filter((registro) => registro.registro_base_id !== id))
                
                Swal.fire({
                    title: '¡Eliminado!',
                    text: 'El registro ha sido eliminado correctamente.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error("Error deleting registro:", error)
                
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un error al eliminar el registro. Inténtalo de nuevo.',
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                })
            }
        }
    }, [])
    
    const handleEdit = (registro: RegistroBaseTIWithRelations) => {
        // Extraer area_medica_id directamente del registro para el diálogo
        let area_medica_id: number | undefined = undefined;
        // Preferir la propiedad plural que devuelve el backend
        if ((registro as any).area_medicas && Array.isArray((registro as any).area_medicas) && (registro as any).area_medicas.length > 0) {
            area_medica_id = (registro as any).area_medicas[0].area_medica_id || (registro as any).area_medicas[0].id
        } else if ((registro as any).area_medica && typeof (registro as any).area_medica === 'object') {
            area_medica_id = (registro as any).area_medica.area_medica_id || (registro as any).area_medica.id
        } else if ((registro as any).area_medica_id) {
            area_medica_id = (registro as any).area_medica_id
        }

        const editingData: RegistroBaseTIDto = {
            registro_base_id: registro.registro_base_id || 0,
            // Normalize hospital extraction: support hospitales as array, object or hospital
            hospital_id: (registro as any).hospital_id || ((registro as any).hospitales && Array.isArray((registro as any).hospitales) && (registro as any).hospitales[0]
                ? ((registro as any).hospitales[0].hospital_id || (registro as any).hospitales[0].id)
                : ((registro as any).hospitales && typeof (registro as any).hospitales === 'object')
                    ? ((registro as any).hospitales.hospital_id || (registro as any).hospitales.id)
                    : ((registro as any).hospital && typeof (registro as any).hospital === 'object')
                        ? ((registro as any).hospital.hospital_id || (registro as any).hospital.id)
                        : ((registro as any).hospital_id || 0)
            ),
            version: registro.version || "",
            area_medica_id: area_medica_id || 0,
            equipo: registro.equipo || "",
            status: registro.status ?? true,
            lis_id: typeof registro.lis === 'object' && registro.lis 
                ? registro.lis.lis_id 
                : (typeof registro.lis === 'number' ? registro.lis : 0),
            provincia_id: typeof registro.provincia === 'object' && registro.provincia 
                ? registro.provincia.provincia_id 
                : (typeof registro.provincia === 'number' ? registro.provincia : 0),
            licencia_id: registro.tipo_licencia 
                ? (typeof registro.tipo_licencia === 'object' ? registro.tipo_licencia.licencia_id : registro.tipo_licencia)
                : 0,
            modalidad_id: typeof registro.modalidad === 'object' && registro.modalidad 
                ? registro.modalidad.modalidad_id 
                : (typeof registro.modalidad === 'number' ? registro.modalidad : 0),
            responsable_id: (registro as any).responsable 
                ? (typeof (registro as any).responsable === 'object' ? (registro as any).responsable.responsable_id : (registro as any).responsable)
                : ((registro as any).responsable_id || 0),
            numero_proyecto: (registro as any).numero_proyecto || "",
            numero_licencia: (registro as any).numero_licencia || "",
            fecha_implentacion: registro.fecha_implentacion || "",
            codigo_centro: (registro as any).codigo_centro || "",
            implementado: registro.implementado ?? false,
        }
        
        setEditingRegistro(editingData)
        setDialogOpen(true)
    }
    const handleCreate = () => {
        setEditingRegistro(null)
        setDialogOpen(true)
    }

    // When LIS selection changes, load modules for that LIS
    useEffect(() => {
        if (!selectedLisId) {
            setModuleOptions([])
            return
        }
        let mounted = true
        ;(async () => {
            try {
                const mods = await getModulos(selectedLisId)
                if (!mounted) return
                // Normalize modulo_id to number to avoid type mismatches
                const normalized = (mods || []).map((m: any) => ({ ...m, modulo_id: Number(m.modulo_id) }))
                setModuleOptions(normalized)
            } catch (err) {
                console.error('Error loading modules for lis', err)
                setModuleOptions([])
            }
        })()
        return () => { mounted = false }
    }, [selectedLisId])

    // Compute filtered registro ids that have the selected module
    const applyModuleFilter = async () => {
        if (!selectedModuleIds || selectedModuleIds.length === 0) {
            setFilteredByModuleSet(null)
            setRegistrosWithModulos(null)
            return
        }

        setFiltering(true)
        try {
            // Fetch the full listado que incluye modulos en la respuesta
            const withMods = await getRegistroBaseTIWithModulos()
            // Normalizar y filtrar por lis si el usuario seleccionó uno
            const candidate = selectedLisId ? (withMods || []).filter((r: any) => (typeof r.lis === 'object' ? (r.lis as any).lis_id : r.lis) === selectedLisId) : (withMods || [])

            const idsWithModule = new Set<number>()
            candidate.forEach((r: any) => {
                const id = r.registro_base_id
                if (!id) return
                // backend devuelve r.modulos como array de objetos { modulo_id, nombre }
                const assigned = (r.modulos || []).map((m: any) => m.modulo_id)
                modulosCache.set(id, assigned)
                const hasAll = selectedModuleIds.every(mid => assigned.includes(mid))
                if (hasAll) idsWithModule.add(id)
            })

            // Guardar el listado completo con modulos para que la tabla use ese conjunto
            setRegistrosWithModulos(withMods || [])
            setFilteredByModuleSet(idsWithModule)
        } catch (err) {
            console.error('Error applying module filter', err)
            setFilteredByModuleSet(null)
            setRegistrosWithModulos(null)
        } finally {
            setFiltering(false)
        }
    }

    const clearModuleFilter = () => {
        setSelectedLisId(undefined)
        setSelectedModuleIds([])
        setFilteredByModuleSet(null)
        setRegistrosWithModulos(null)
        setModulesDropdownOpen(false)
        setModuleOptions([])
        // clear caches
        try { modulosCache.clear() } catch(e) { /* ignore */ }
        // reset search and pagination
        setSearchInput("")
        setSearchTerm("")
        setCurrentPage(1)
        // reload full registros to ensure deterministic state
        loadRegistros()
    }


    const handleRegistroSaved = (isEditing?: boolean) => {
        loadRegistros()
        setDialogOpen(false)
        
        // Usar el parámetro que viene del diálogo, o como fallback el estado local
        const wasEditing = isEditing !== undefined ? isEditing : (editingRegistro !== null)
        setEditingRegistro(null)
        
        Swal.fire({
            title: '¡Éxito!',
            text: wasEditing ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        })
    }

    // Filtrar registros por término de búsqueda (optimizado con useMemo)
    const filteredRegistros = useMemo(() => {
        // When module filter is active and we fetched registrosWithModulos, use that list as the base
        const base = (registrosWithModulos && selectedModuleIds.length > 0) ? registrosWithModulos : registros

        if (!searchTerm.trim()) {
            // if module set filter exists, narrow down base by it
            if (filteredByModuleSet) return base.filter(r => filteredByModuleSet.has((r as any).registro_base_id))
            return base
        }
        
        const searchLower = searchTerm.toLowerCase()
    let results = base.filter((registro) => {
                // Buscar por nombre de hospital (relación) o fallback a name_cliente por compatibilidad
                const cliente = getHospitalName(registro).toLowerCase()
                const equipo = registro.equipo?.toLowerCase() || ""
                const version = registro.version?.toLowerCase() || ""

                // area_medica puede ser objeto o número
                const areaMedicaName = typeof registro.area_medica === 'object' && registro.area_medica
                    ? (registro.area_medica as AreaMedica).area_medica_nombre?.toLowerCase() || ""
                    : ''

                // lis puede ser objeto o número
                const lisName = typeof registro.lis === 'object' && registro.lis
                    ? (registro.lis as Lis).lis_nombre?.toLowerCase() || ""
                    : ''

                // provincia puede ser objeto o número
                const provinciaName = typeof registro.provincia === 'object' && registro.provincia
                    ? (registro.provincia as Provincia).provincia_nombre?.toLowerCase() || ""
                    : ''

                return (
                    cliente.includes(searchLower) ||
                    equipo.includes(searchLower) ||
                    version.includes(searchLower) ||
                    areaMedicaName.includes(searchLower) ||
                    lisName.includes(searchLower) ||
                    provinciaName.includes(searchLower)
                )
            })

        // Si hay un filtro por módulo, aplicar: solo dejar los registros cuyo id esté en el set
        if (filteredByModuleSet) {
            results = results.filter(r => filteredByModuleSet.has(r.registro_base_id!))
        }

        return results
    }, [registros, searchTerm, filteredByModuleSet])

    // Calcular paginación (optimizado con useMemo)
    const paginationData = useMemo(() => {
        const totalItems = filteredRegistros.length
        const totalPages = Math.ceil(totalItems / itemsPerPage)
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        const paginatedRegistros = filteredRegistros.slice(startIndex, endIndex)
        
        return {
            totalItems,
            totalPages,
            startIndex,
            endIndex,
            paginatedRegistros
        }
    }, [filteredRegistros, currentPage, itemsPerPage])


    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Registros Base TI</CardTitle>
                <CardDescription>Gestión de registros base de tecnología de la información.</CardDescription>
                <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <div className="w-full sm:w-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-8 w-full sm:max-w-sm"
                            />
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex items-center gap-2">
                            <Button onClick={handleCreate} className="w-full sm:w-auto px-4 py-2">
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Registro
                            </Button>
                            <div className="flex items-center gap-2">
                                <div className="w-44">
                                    <Select value={selectedLisId ? String(selectedLisId) : ""} onValueChange={(v) => setSelectedLisId(Number(v) || undefined)}>
                                        <SelectTrigger className="w-full"><SelectValue placeholder="Filtrar LIS"/></SelectTrigger>
                                        <SelectContent>
                                            {lisOptions.map(l => (
                                                <SelectItem key={l.lis_id} value={String(l.lis_id)}>{l.lis_nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="relative">
                                    <Button size="sm" variant="outline" onClick={() => setModulesDropdownOpen(v => !v)}>
                                        Seleccionar Módulos ({selectedModuleIds.length})
                                    </Button>
                                    {modulesDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow p-2 z-50">
                                            <div className="max-h-48 overflow-auto">
                                                {moduleOptions.map(m => (
                                                    <label key={m.modulo_id} className="flex items-center gap-2 py-1">
                                                        <input type="checkbox" checked={selectedModuleIds.includes(m.modulo_id)} onChange={() => {
                                                            setSelectedModuleIds(prev => prev.includes(m.modulo_id) ? prev.filter(id => id !== m.modulo_id) : [...prev, m.modulo_id])
                                                        }} />
                                                        <span className="text-sm">{m.nombre}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button size="sm" variant="ghost" onClick={() => { setSelectedModuleIds([]); setModulesDropdownOpen(false) }}>Limpiar</Button>
                                                <Button size="sm" onClick={() => setModulesDropdownOpen(false)}>Cerrar</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={applyModuleFilter} disabled={selectedModuleIds.length === 0 || filtering}>{filtering ? 'Aplicando...' : 'Aplicar'}</Button>
                                    <Button size="sm" variant="ghost" onClick={clearModuleFilter}>Limpiar</Button>
                                </div>
                            </div>
                        </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {/* Search skeleton */}
                        <div className="h-10 bg-gray-200 rounded animate-pulse w-[300px]"></div>
                        {/* Table skeleton */}
                        <div className="space-y-2">
                            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div>
                        <Table>
                        <TableHeader>
                <TableRow>
                    <TableHead>Hospital</TableHead>
                                <TableHead>Versión</TableHead>
                                <TableHead>Área Médica</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead>LIS</TableHead>
                                <TableHead>Modalidad</TableHead>
                                <TableHead>Provincia</TableHead>
                                <TableHead>Código Centro</TableHead>
                                <TableHead>Fecha Implementación</TableHead>
                                <TableHead>Implementación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginationData.paginatedRegistros.map((registro) => (
                                <TableRow key={registro.registro_base_id}>
                                    <TableCell>
                                        {getHospitalName(registro)}
                                    </TableCell>
                                    <TableCell>{registro.version}</TableCell>
                                    <TableCell>
                                        {Array.isArray(registro.area_medicas) && registro.area_medicas.length > 0
                                            ? registro.area_medicas[0].area_medica_nombre
                                            : (registro.area_medica && typeof registro.area_medica === 'object')
                                                ? (registro.area_medica as AreaMedica).area_medica_nombre
                                                : ''}
                                    </TableCell>
                                    <TableCell>{registro.equipo}</TableCell>
                                    <TableCell>
                                        {typeof registro.lis === 'object' && registro.lis 
                                            ? registro.lis.lis_nombre 
                                            : registro.lis}
                                    </TableCell>
                                    <TableCell>
                                        {typeof registro.modalidad === 'object' && registro.modalidad 
                                            ? registro.modalidad.modalidad_nombre 
                                            : registro.modalidad}
                                    </TableCell>
                                    <TableCell>
                                        {typeof registro.provincia === 'object' && registro.provincia 
                                            ? registro.provincia.provincia_nombre 
                                            : registro.provincia}
                                    </TableCell>
                                    <TableCell>{registro.codigo_centro || '-'}</TableCell>
                                    <TableCell>
                                        {(registro as any).fecha_display || 
                                         (registro.fecha_implentacion 
                                            ? registro.fecha_implentacion.split('-').reverse().join('/')
                                            : '-')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={registro.implementado ? "default" : "secondary"}
                                            className={registro.implementado 
                                                ? "bg-green-600 text-white hover:bg-green-700" 
                                                : "bg-yellow-500 text-white hover:bg-yellow-600"
                                            }
                                        >
                                            {registro.implementado ? "Implementado" : "Pendiente"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={registro.status ? "default" : "secondary"}>
                                            {registro.status ? "Activo" : "Cerrado"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(registro)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => handleDelete(registro.registro_base_id!)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => {
                                                    // Preparar y abrir diálogo de módulos
                                                    setModulosRegistroId(registro.registro_base_id || null)
                                                    // Extraer lis_id y area_medica_id del registro si vienen poblados
                                                    const lis_id = (registro as any).lis && typeof (registro as any).lis === 'object' ? ((registro as any).lis.lis_id || (registro as any).lis.id) : (typeof registro.lis === 'number' ? registro.lis : undefined)
                                                    setModulosLisId(lis_id)
                                                    setModulosAreaId(undefined)
                                                    setModulosDialogOpen(true)
                                                }}>
                                                    <Layers className="mr-2 h-4 w-4" />
                                                    Adicionales
                                                </DropdownMenuItem>

                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    
                    {/* Controles de paginación */}
                    {paginationData.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Mostrando {paginationData.startIndex + 1} a {Math.min(paginationData.endIndex, paginationData.totalItems)} de {paginationData.totalItems} registros
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Compact controls for mobile: only prev/next and page indicator */}
                                <div className="flex items-center space-x-2 sm:hidden w-full justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="flex-1 mr-2 justify-center"
                                        aria-label="Página anterior"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    {/* indicador de página ocultado en móvil para simplificar UI */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1))}
                                        disabled={currentPage === paginationData.totalPages}
                                        className="flex-1 ml-2 justify-center"
                                        aria-label="Página siguiente"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Full controls for larger screens */}
                                <div className="hidden sm:flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <div className="flex items-center space-x-1 overflow-x-auto">
                                        {Array.from({ length: paginationData.totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(page)}
                                                className="min-w-8"
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1))}
                                        disabled={currentPage === paginationData.totalPages}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                )}
            </CardContent>
            <Suspense fallback={<div>Cargando...</div>}>
                <RegistroBaseTIDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    registroBaseTI={editingRegistro}
                    onRegistroBaseTISaved={handleRegistroSaved}
                />
                <RegistroModulosDialog
                    open={modulosDialogOpen}
                    onOpenChange={setModulosDialogOpen}
                    registro_base_id={modulosRegistroId}
                    lis_id={modulosLisId}
                    onSaved={() => { loadRegistros(); setModulosRegistroId(null) }}
                />
            </Suspense>
        </Card>
    )
}