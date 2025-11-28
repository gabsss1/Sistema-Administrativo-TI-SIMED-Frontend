"use client"

import { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Computer, Mouse, Keyboard } from "lucide-react"
import { 
    type Equipo,
    getEquiposList, 
    deleteEquipo,
    TipoEquipo,
    EstadoEquipo
} from "@/lib/equipos"
import { useOptimizedList } from "@/hooks/use-optimized-fetch"

// Lazy load dialog only when needed
const EquiposDialog = lazy(() => 
  import("./equipos-dialog").then(module => ({
    default: module.default
  }))
)

// Lazy load SweetAlert2 only when needed
const loadSwal = () => import('sweetalert2').then(module => {
    const Swal = module.default
    // Configurar z-index para evitar conflictos
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

export default function EquiposTable() {
    const [searchInput, setSearchInput] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null)

    const itemsPerPage = 10

    // Usar hook optimizado para cargar datos con caché
    const { 
        data: registros = [], 
        loading, 
        error, 
        refetch 
    } = useOptimizedList('equipos-list', getEquiposList, searchInput)

    // Filtrar datos por búsqueda local
    const filteredData = useMemo(() => {
        if (!registros) return []
        if (!searchInput.trim()) return registros
        
        const searchTerm = searchInput.toLowerCase()
        return registros.filter((equipo: Equipo) =>
            equipo.marca_equipo.toLowerCase().includes(searchTerm) ||
            equipo.modelo_equipo.toLowerCase().includes(searchTerm) ||
            equipo.numero_serie_equipo.toLowerCase().includes(searchTerm) ||
            equipo.tipo_equipo.toLowerCase().includes(searchTerm) ||
            equipo.estado_equipo.toLowerCase().includes(searchTerm) ||
            (equipo.observaciones?.toLowerCase().includes(searchTerm))
        )
    }, [registros, searchInput])

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        return filteredData.slice(startIndex, startIndex + itemsPerPage)
    }, [filteredData, currentPage])

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    // Reset página cuando cambia la búsqueda
    useEffect(() => {
        setCurrentPage(1)
    }, [searchInput])

    // Mostrar error si hay uno
    useEffect(() => {
        if (error) {
            loadSwal().then(Swal => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo cargar la lista de equipos",
                    customClass: {
                        container: 'swal-container-high-z'
                    },
                    backdrop: true,
                    allowOutsideClick: false
                })
            })
        }
    }, [error])

    // Handlers
    const handleEdit = (equipo: Equipo) => {
        setSelectedEquipo(equipo)
        setIsDialogOpen(true)
    }

    const handleCreate = () => {
        setSelectedEquipo(null)
        setIsDialogOpen(true)
    }

    const handleDelete = async (equipo: Equipo) => {
        const Swal = await loadSwal()
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: `Se eliminará el equipo: ${equipo.marca_equipo} ${equipo.modelo_equipo}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            customClass: {
                container: 'swal-container-high-z'
            },
            backdrop: true,
            allowOutsideClick: false
        })

        if (result.isConfirmed) {
            try {
                await deleteEquipo(equipo.equipo_id)
                await Swal.fire({
                    icon: "success",
                    title: "¡Eliminado!",
                    text: "El equipo ha sido eliminado exitosamente.",
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        container: 'swal-container-high-z'
                    },
                    backdrop: true
                })
                refetch()
            } catch (error: any) {
                await Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error.message || "No se pudo eliminar el equipo",
                    customClass: {
                        container: 'swal-container-high-z'
                    },
                    backdrop: true,
                    allowOutsideClick: false
                })
            }
        }
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setSelectedEquipo(null)
    }

    const handleEquipoSaved = () => {
        refetch()
    }

    const getEstadoBadgeColor = (estado: EstadoEquipo) => {
        switch (estado) {
            case EstadoEquipo.CONCLUIDO:
                return "bg-green-100 text-green-800 border-green-200"
            case EstadoEquipo.NO_CONCLUIDO:
                return "bg-red-100 text-red-800 border-red-200"
            case EstadoEquipo.PENDIENTE:
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const formatDate = (dateString?: Date | string) => {
        if (!dateString) return "-"
        
        try {
            let date: Date
            
            if (typeof dateString === 'string') {
                // Si es un string, asumimos que está en formato YYYY-MM-DD
                // Agregar tiempo para evitar problemas de zona horaria
                date = new Date(dateString + 'T00:00:00')
            } else {
                date = dateString
            }
            
            // Validar que la fecha es válida
            if (isNaN(date.getTime())) return "-"
            
            return date.toLocaleDateString('es-ES')
        } catch (error) {
            return "-"
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Computer className="w-5 h-5" />
                            Gestión de Equipos
                        </CardTitle>
                        <CardDescription>
                            Administra el inventario de equipos de cómputo
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Equipo
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Barra de búsqueda */}
                <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por marca, modelo, serie, tipo o estado..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Equipo</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Serie</TableHead>
                                <TableHead>Periféricos</TableHead>
                                <TableHead>F. Revisión</TableHead>
                                <TableHead>F. Conclusión</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                        {searchInput ? 'No se encontraron equipos' : 'No hay equipos registrados'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((equipo) => (
                                    <TableRow key={equipo.equipo_id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium text-gray-900">
                                                    {equipo.marca_equipo} {equipo.modelo_equipo}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                                {equipo.tipo_equipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-gray-600">
                                            {equipo.numero_serie_equipo}
                                        </TableCell>
                                        <TableCell>
                                            {equipo.tipo_equipo === TipoEquipo.PC ? (
                                                <div className="flex items-center gap-2">
                                                    {equipo.marca_mouse && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Mouse className="h-3 w-3" />
                                                            <span>{equipo.marca_mouse}</span>
                                                        </div>
                                                    )}
                                                    {equipo.marca_teclado && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                                            <Keyboard className="h-3 w-3" />
                                                            <span>{equipo.marca_teclado}</span>
                                                        </div>
                                                    )}
                                                    {!equipo.marca_mouse && !equipo.marca_teclado && (
                                                        <span className="text-xs text-gray-400">Sin periféricos</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDate(equipo.fecha_revision_paquete)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {formatDate(equipo.fecha_conclusion)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="secondary"
                                                className={getEstadoBadgeColor(equipo.estado_equipo)}
                                            >
                                                {equipo.estado_equipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem 
                                                        onClick={() => handleEdit(equipo)}
                                                        className="cursor-pointer"
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(equipo)}
                                                        className="cursor-pointer text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Eliminar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages} - {filteredData.length} equipos total
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Dialog para crear/editar */}
                <Suspense fallback={
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                }>
                    {isDialogOpen && (
                        <EquiposDialog
                            isOpen={isDialogOpen}
                            onClose={handleDialogClose}
                            equipo={selectedEquipo}
                            onEquipoSaved={handleEquipoSaved}
                        />
                    )}
                </Suspense>
            </CardContent>
        </Card>
    )
}