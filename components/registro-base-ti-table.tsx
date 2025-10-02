"use client"

import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Search, Plus, Edit, Trash2 } from "lucide-react"
import { 
    type RegistroBaseTIDto, 
    type AreaMedica,
    type Lis,
    type Provincia,
    getRegistroBaseTI, 
    deleteRegistroBaseTI 
} from "@/lib/registro-base-ti"
import { RegistroBaseTIDialog } from "./registro-base-ti-dialog"

// Interfaz extendida para la tabla que puede recibir objetos poblados
// El backend devuelve los datos con nombres de relaciones (area_medica, lis, provincia)
interface RegistroBaseTIWithRelations extends Omit<RegistroBaseTIDto, 'area_medica_id' | 'lis_id' | 'provincia_id'> {
  area_medica: number | AreaMedica;
  lis: number | Lis;
  provincia: number | Provincia;
  modalidad: number | { modalidad_id: number; modalidad_nombre: string };
  tipo_licencia?: number | { licencia_id: number; tipo_licencia: string };
}

export function RegistroBaseTITable() {
    const [registros, setRegistros] = useState<RegistroBaseTIWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingRegistro, setEditingRegistro] = useState<RegistroBaseTIDto | null>(null)

    useEffect(() => {
        loadRegistros()
    }, [])
    const loadRegistros = async () => {
        setLoading(true)
        try {
            const data = await getRegistroBaseTI()
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
    }
    const handleDelete = async (id: number) => {
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
                setRegistros(registros.filter((registro) => registro.registro_base_id !== id))
                
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
    }
    const handleEdit = (registro: RegistroBaseTIWithRelations) => {
        // Convertir las relaciones de objetos a IDs para el diálogo
        const editingData: RegistroBaseTIDto = {
            registro_base_id: registro.registro_base_id || 0,
            name_cliente: registro.name_cliente || "",
            version: registro.version || "",
            area_medica_id: typeof registro.area_medica === 'object' && registro.area_medica 
                ? registro.area_medica.area_medica_id 
                : (typeof registro.area_medica === 'number' ? registro.area_medica : 0),
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
            fecha_implentacion: registro.fecha_implentacion || "",
        }
        
        setEditingRegistro(editingData)
        setDialogOpen(true)
    }
    const handleCreate = () => {
        setEditingRegistro(null)
        setDialogOpen(true)
    }
    const handleRegistroSaved = () => {
        loadRegistros()
        setDialogOpen(false)
        
        const isEditing = editingRegistro !== null
        setEditingRegistro(null)
        
        Swal.fire({
            title: '¡Éxito!',
            text: isEditing ? 'Registro actualizado correctamente.' : 'Registro creado correctamente.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true
        })
    }
    const filteredRegistros = registros.filter((registro) =>
        registro.name_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        registro.version.toLowerCase().includes(searchTerm.toLowerCase())
    )
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Registros Base TI</CardTitle>
                <CardDescription>Gestión de registros base de tecnología de la información.</CardDescription>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="max-w-sm pl-8"
                            />
                        </div>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Registro
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-center text-muted-foreground">Cargando registros...</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Versión</TableHead>
                                <TableHead>Área Médica</TableHead>
                                <TableHead>Equipo</TableHead>
                                <TableHead>LIS</TableHead>
                                <TableHead>Modalidad</TableHead>
                                <TableHead>Provincia</TableHead>
                                <TableHead>Fecha Implementación</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRegistros.map((registro) => (
                                <TableRow key={registro.registro_base_id}>
                                    <TableCell>{registro.name_cliente}</TableCell>
                                    <TableCell>{registro.version}</TableCell>
                                    <TableCell>
                                        {typeof registro.area_medica === 'object' && registro.area_medica 
                                            ? registro.area_medica.area_medica_nombre 
                                            : registro.area_medica}
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
                                    <TableCell>
                                        {registro.fecha_implentacion 
                                            ? registro.fecha_implentacion.split('-').reverse().join('/')
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={registro.status ? "default" : "secondary"}>
                                            {registro.status ? "Activo" : "Inactivo"}
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
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            <RegistroBaseTIDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                registroBaseTI={editingRegistro}
                onRegistroBaseTISaved={handleRegistroSaved}
            />
        </Card>
    )
}