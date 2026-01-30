"use client"

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Configurar iconos de Leaflet (necesario para Next.js)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export interface UbicacionData {
    latitud?: number
    longitud?: number
    altitud?: number
    direccion_fisica?: string
}

interface MapaUbicacionProps {
    ubicacion: UbicacionData
    onUbicacionChange?: (ubicacion: UbicacionData) => void
    editable?: boolean
    height?: string
}

// Componente para centrar el mapa cuando cambia la posición
function MapUpdater({ position }: { position: [number, number] | null }) {
    const map = useMap()
    
    useEffect(() => {
        if (position) {
            map.setView(position, 17, {
                animate: true,
                duration: 1
            })
        }
    }, [position, map])
    
    return null
}

// Componente para manejar el click en el mapa
function LocationMarker({ 
    position, 
    onPositionChange 
}: { 
    position: [number, number] | null
    onPositionChange: (lat: number, lng: number) => void 
}) {
    return position === null ? null : (
        <Marker position={position}>
            <Popup>
                Ubicación seleccionada
                <br />
                Lat: {position[0].toFixed(6)}
                <br />
                Lng: {position[1].toFixed(6)}
            </Popup>
        </Marker>
    )
}

export default function MapaUbicacion({
    ubicacion,
    onUbicacionChange,
    editable = false,
    height = '400px'
}: MapaUbicacionProps) {
    const [position, setPosition] = useState<[number, number] | null>(null)
    const [isClient, setIsClient] = useState(false)

    // Coordenadas por defecto (centro de Paraguay)
    const defaultCenter: [number, number] = [-25.2637, -57.5759]

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (ubicacion.latitud && ubicacion.longitud) {
            setPosition([ubicacion.latitud, ubicacion.longitud])
        }
    }, [ubicacion])

    const handlePositionChange = async (lat: number, lng: number) => {
        setPosition([lat, lng])
        
        // Obtener altitud usando API de elevación (opcional)
        let altitud = ubicacion.altitud
        try {
            const response = await fetch(
                `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`
            )
            const data = await response.json()
            if (data.results && data.results[0]) {
                altitud = data.results[0].elevation
            }
        } catch (error) {
            console.error('Error obteniendo altitud:', error)
        }

        if (onUbicacionChange) {
            onUbicacionChange({
                latitud: lat,
                longitud: lng,
                altitud,
                direccion_fisica: ubicacion.direccion_fisica
            })
        }
    }

    const center = position || defaultCenter

    // Solo renderizar en el cliente para evitar problemas con SSR
    if (!isClient) {
        return (
            <div 
                style={{ height }} 
                className="w-full bg-gray-100 rounded-md flex items-center justify-center"
            >
                <p className="text-gray-500">Cargando mapa...</p>
            </div>
        )
    }

    return (
        <div style={{ height }} className="w-full rounded-md overflow-hidden border border-gray-300">
            <MapContainer
                center={center}
                zoom={position ? 15 : 6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Componente para centrar el mapa cuando cambia la posición */}
                <MapUpdater position={position} />
                
                {editable ? (
                    <LocationMarker 
                        position={position} 
                        onPositionChange={handlePositionChange}
                    />
                ) : position && (
                    <Marker position={position}>
                        <Popup>
                            <div className="text-sm">
                                <p><strong>Ubicación del equipo</strong></p>
                                <p>Lat: {position[0].toFixed(6)}</p>
                                <p>Lng: {position[1].toFixed(6)}</p>
                                {ubicacion.altitud && (
                                    <p>Altitud: {ubicacion.altitud.toFixed(2)}m</p>
                                )}
                                {ubicacion.direccion_fisica && (
                                    <p>Dir: {ubicacion.direccion_fisica}</p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}
            </MapContainer>
        </div>
    )
}
