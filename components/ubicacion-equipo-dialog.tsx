"use client"

import { useState, useEffect, Suspense, lazy } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Save, X, Search } from "lucide-react"
import { getUbicacionEquipo, updateUbicacionEquipo, type UbicacionEquipo } from "@/lib/equipos"
import type { UbicacionData } from "./mapa-ubicacion"

// Lazy load del mapa para mejor rendimiento
const MapaUbicacion = lazy(() => import("./mapa-ubicacion"))

// Lazy load SweetAlert2
const loadSwal = () => import('sweetalert2').then(module => module.default)

interface UbicacionEquipoDialogProps {
    isOpen: boolean
    onClose: () => void
    equipoId: number
    equipoNombre: string
}

export default function UbicacionEquipoDialog({
    isOpen,
    onClose,
    equipoId,
    equipoNombre
}: UbicacionEquipoDialogProps) {
    const [ubicacion, setUbicacion] = useState<UbicacionData>({
        latitud: undefined,
        longitud: undefined,
        altitud: undefined,
        direccion_fisica: ''
    })
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [modoEdicion, setModoEdicion] = useState(false)
    const [busquedaDireccion, setBusquedaDireccion] = useState('')
    const [buscandoDireccion, setBuscandoDireccion] = useState(false)

    useEffect(() => {
        if (isOpen) {
            cargarUbicacion()
        }
    }, [isOpen, equipoId])

    const cargarUbicacion = async () => {
        setLoadingData(true)
        try {
            const data = await getUbicacionEquipo(equipoId)
            setUbicacion({
                latitud: data.latitud ? Number(data.latitud) : undefined,
                longitud: data.longitud ? Number(data.longitud) : undefined,
                altitud: data.altitud ? Number(data.altitud) : undefined,
                direccion_fisica: data.direccion_fisica
            })
            // Si no tiene ubicación, activar modo edición automáticamente
            if (!data.latitud || !data.longitud) {
                setModoEdicion(true)
            }
        } catch (error) {
            console.error('Error cargando ubicación:', error)
            setModoEdicion(true) // Activar edición si hay error
        } finally {
            setLoadingData(false)
        }
    }

    const handleUbicacionChange = (nuevaUbicacion: UbicacionData) => {
        setUbicacion(nuevaUbicacion)
    }

    const handleDireccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUbicacion({
            ...ubicacion,
            direccion_fisica: e.target.value
        })
    }

    const obtenerUbicacionActual = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUbicacion({
                        ...ubicacion,
                        latitud: position.coords.latitude,
                        longitud: position.coords.longitude,
                        altitud: position.coords.altitude || ubicacion.altitud
                    })
                },
                (error) => {
                    loadSwal().then(Swal => {
                        Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "error",
                            title: "Error al obtener ubicación",
                            text: "Asegúrese de dar permisos de ubicación.",
                            showConfirmButton: false,
                            timer: 3000,
                            timerProgressBar: true
                        })
                    })
                }
            )
        }
    }

    const buscarDireccion = async () => {
        if (!busquedaDireccion.trim()) {
            const Swal = await loadSwal()
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "Ingrese una dirección",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })
            return
        }

        setBuscandoDireccion(true)
        try {
            // Usar Nominatim (OpenStreetMap) para geocodificación
            // Agregar país Perú para mejor precisión
            const query = encodeURIComponent(`${busquedaDireccion}, Perú`)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=pe`
            )
            const data = await response.json()

            if (data && data.length > 0) {
                const result = data[0]
                const lat = parseFloat(result.lat)
                const lng = parseFloat(result.lon)

                // Obtener altitud
                let altitud = ubicacion.altitud
                try {
                    const elevResponse = await fetch(
                        `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
                    )
                    const elevData = await elevResponse.json()
                    if (elevData.results && elevData.results[0]) {
                        altitud = elevData.results[0].elevation
                    }
                } catch (error) {
                    console.error('Error obteniendo altitud:', error)
                }

                setUbicacion({
                    latitud: lat,
                    longitud: lng,
                    altitud,
                    direccion_fisica: result.display_name
                })
                // El mapa se actualizará automáticamente con zoom
            } else {
                const Swal = await loadSwal()
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "error",
                    title: "Dirección no encontrada",
                    text: "Intente con más detalles",
                    showConfirmButton: false,
                    timer: 4000,
                    timerProgressBar: true
                })
            }
        } catch (error) {
            console.error('Error en geocodificación:', error)
            const Swal = await loadSwal()
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Error al buscar dirección",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })
        } finally {
            setBuscandoDireccion(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!ubicacion.latitud || !ubicacion.longitud) {
            const Swal = await loadSwal()
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "warning",
                title: "Seleccione una ubicación",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })
            return
        }

        setLoading(true)
        try {
            await updateUbicacionEquipo(equipoId, {
                latitud: ubicacion.latitud,
                longitud: ubicacion.longitud,
                altitud: ubicacion.altitud,
                direccion_fisica: ubicacion.direccion_fisica
            })

            const Swal = await loadSwal()
            await Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Ubicación guardada exitosamente",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            })

            setModoEdicion(false)
            cargarUbicacion() // Recargar datos
        } catch (error: any) {
            const Swal = await loadSwal()
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: error.message || "Error al guardar ubicación",
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setModoEdicion(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Ubicación del Equipo
                    </DialogTitle>
                    <DialogDescription>
                        {equipoNombre}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información de ubicación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Latitud</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={ubicacion.latitud?.toFixed(6) || '-'}
                                    disabled
                                    className="bg-gray-50"
                                />
                                {ubicacion.latitud && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        OK
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Longitud</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={ubicacion.longitud?.toFixed(6) || '-'}
                                    disabled
                                    className="bg-gray-50"
                                />
                                {ubicacion.longitud && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        OK
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección Física</Label>
                            <Input
                                id="direccion"
                                type="text"
                                value={ubicacion.direccion_fisica || ''}
                                onChange={handleDireccionChange}
                                disabled
                                placeholder="Ej: Av. Principal 123, Ciudad"
                                className="bg-gray-50"
                            />
                        </div>
                    </div>

                    {/* Buscador de dirección y botones de ubicación - Siempre visible para poder actualizar */}
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <Label htmlFor="busqueda" className="mb-2 block">
                                    Buscar Dirección en Perú
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="busqueda"
                                        type="text"
                                        value={busquedaDireccion}
                                        onChange={(e) => setBusquedaDireccion(e.target.value)}
                                        placeholder="Ej: Av. Arequipa 1234, Lima"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                buscarDireccion()
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={buscarDireccion}
                                        disabled={buscandoDireccion}
                                        className="gap-2"
                                    >
                                        {buscandoDireccion ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                Buscando...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4" />
                                                Buscar
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={obtenerUbicacionActual}
                                className="gap-2"
                            >
                                <Navigation className="w-4 h-4" />
                                Usar Mi Ubicación Actual
                            </Button>
                        </div>
                    </div>

                    {/* Mapa */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">
                            {modoEdicion ? 'Haga clic en el mapa para seleccionar la ubicación' : 'Ubicación en el mapa'}
                        </Label>
                        <Suspense fallback={
                            <div className="h-[400px] w-full bg-gray-100 rounded-md flex items-center justify-center">
                                <div className="text-center">
                                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-gray-500">Cargando mapa...</p>
                                </div>
                            </div>
                        }>
                            {!loadingData && (
                                <MapaUbicacion
                                    ubicacion={ubicacion}
                                    onUbicacionChange={handleUbicacionChange}
                                    editable={modoEdicion}
                                    height="400px"
                                />
                            )}
                        </Suspense>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        {modoEdicion ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        cargarUbicacion()
                                        setModoEdicion(false)
                                    }}
                                    disabled={loading}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Guardar Ubicación
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                >
                                    Cerrar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setModoEdicion(true)}
                                >
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Editar Ubicación
                                </Button>
                            </>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
