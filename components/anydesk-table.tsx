"use client"

import { useState, useEffect, useMemo, useCallback, Suspense, lazy, memo, startTransition } from "react"
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Monitor, Download, Copy } from "lucide-react"
import { 
    type Anydesk,
    getAnydeskList, 
    deleteAnydesk
} from "@/lib/anydesk"
import { useOptimizedList } from "@/hooks/use-optimized-fetch"

// Lazy load dialog only when needed
const AnydeskDialog = lazy(() => 
  import("./anydesk-dialog").then(module => ({
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

export default function AnydeskTable() {
    const [searchInput, setSearchInput] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedAnydesk, setSelectedAnydesk] = useState<Anydesk | null>(null)

    const itemsPerPage = 10
    const searchParams = useSearchParams()

    // Usar hook optimizado para cargar datos con caché
    const { 
        data: registros = [], 
        loading, 
        error, 
        refetch 
    } = useOptimizedList('anydesk-list', getAnydeskList, searchInput)

    // Filtrar y paginar datos (solo filtrar, la búsqueda ya se hace en el backend)
    const filteredData = useMemo(() => registros || [], [registros])

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
                    text: "No se pudo cargar la lista de Anydesk",
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
    const handleEdit = (anydesk: Anydesk) => {
        setSelectedAnydesk(anydesk)
        setIsDialogOpen(true)
    }

    const handleCreate = () => {
        setSelectedAnydesk(null)
        setIsDialogOpen(true)
    }

    const handleDelete = async (anydesk: Anydesk) => {
        const Swal = await loadSwal()
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: `Se eliminará el registro de Anydesk: ${anydesk.anydesk_nombre}`,
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
                await deleteAnydesk(anydesk.anydesk_id)
                await Swal.fire({
                    icon: "success",
                    title: "¡Eliminado!",
                    text: "El registro ha sido eliminado exitosamente.",
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
                    text: error.message || "No se pudo eliminar el registro",
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
        setSelectedAnydesk(null)
    }

    const handleAnydeskSaved = () => {
        refetch()
    }

    // Función para copiar el número de AnyDesk al portapapeles
    const handleOpenAnydesk = useCallback(async (numero: string) => {
        try {
            // Verificar si la API del portapapeles está disponible
            if (!navigator.clipboard) {
                throw new Error('API del portapapeles no disponible')
            }
            
            await navigator.clipboard.writeText(numero)
            const Swal = await loadSwal()
            Swal.fire({
                title: '¡Copiado!',
                text: `Número ${numero} copiado al portapapeles`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            })
        } catch (error) {
            console.error('Error al copiar:', error)
            
            // Método de respaldo: crear un input temporal y usar execCommand
            try {
                const textArea = document.createElement('textarea')
                textArea.value = numero
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                textArea.style.top = '-999999px'
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                
                const successful = document.execCommand('copy')
                document.body.removeChild(textArea)
                
                if (successful) {
                    const Swal = await loadSwal()
                    Swal.fire({
                        title: '¡Copiado!',
                        text: `Número ${numero} copiado al portapapeles (método alternativo)`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    })
                } else {
                    throw new Error('No se pudo copiar con método alternativo')
                }
            } catch (fallbackError) {
                console.error('Error en método de respaldo:', fallbackError)
                
                // Si todo falla, mostrar el número para copia manual
                const Swal = await loadSwal()
                Swal.fire({
                    title: 'Error al copiar',
                    text: 'No se pudo copiar automáticamente. Copia este número manualmente:',
                    html: `
                        <div class="bg-gray-100 p-3 rounded font-mono text-lg mt-2 border" 
                             style="user-select: all; cursor: pointer;"
                             onclick="this.select(); document.execCommand('copy');"
                             title="Haz click para seleccionar todo">
                            ${numero}
                        </div>
                        <p class="text-sm text-gray-600 mt-2">💡 Haz click en el número para seleccionarlo</p>
                    `,
                    icon: 'warning',
                    confirmButtonText: 'Entendido',
                    width: 400
                })
            }
        }
    }, [])

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="w-5 h-5" />
                            Gestión de Anydesk
                        </CardTitle>
                        <CardDescription>
                            Administra las conexiones Anydesk por hospital
                        </CardDescription>
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Anydesk
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Barra de búsqueda */}
                <div className="flex items-center space-x-2 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre, número o hospital..."
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
                                <TableHead>Nombre</TableHead>
                                <TableHead>Número</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Hospital</TableHead>
                                <TableHead className="w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6">
                                        Cargando...
                                    </TableCell>
                                </TableRow>
                            ) : paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6">
                                        {searchInput ? "No se encontraron resultados" : "No hay registros de Anydesk"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((registro) => (
                                    <TableRow key={registro.anydesk_id}>
                                        <TableCell className="font-medium">
                                            {registro.anydesk_nombre}
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="secondary" 
                                                className="cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-1"
                                                onClick={() => handleOpenAnydesk(registro.anydesk_numero)}
                                                title="Click para copiar número"
                                            >
                                                <Copy className="w-3 h-3" />
                                                {registro.anydesk_numero}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={registro.servidor ? "default" : "secondary"}>
                                                {registro.servidor ? "Servidor Principal" : "Cliente"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {registro.hospitales?.hospital_nombre || "Sin hospital"}
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
                                                    <DropdownMenuItem onClick={() => handleEdit(registro)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => handleDelete(registro)}
                                                        className="text-red-600"
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
                            Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} a{" "}
                            {Math.min(currentPage * itemsPerPage, filteredData.length)} de {filteredData.length} registros
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                Página {currentPage} de {totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Dialog */}
            <Suspense fallback={null}>
                <AnydeskDialog
                    open={isDialogOpen}
                    onOpenChange={handleDialogClose}
                    anydesk={selectedAnydesk}
                    onAnydeskSaved={handleAnydeskSaved}
                />
            </Suspense>
        </Card>
    )
}