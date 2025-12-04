"use client"

import React, { useEffect, useState } from "react"
import Swal from 'sweetalert2'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Upload, Trash2, Eye } from 'lucide-react'
import * as pdfApi from '@/lib/registro-base-ti-pdf'

interface RegistroBaseTIPdfDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    registroBaseId: number | null
}

type PdfRecord = {
    id?: number | null
    filename?: string
    mimetype?: string
}

export function RegistroBaseTIPdfDialog({ open, onOpenChange, registroBaseId }: RegistroBaseTIPdfDialogProps) {
    const [loading, setLoading] = useState(false)
    const [existingPdf, setExistingPdf] = useState<PdfRecord | null>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const fetchExisting = async () => {
        if (!registroBaseId) {
            setExistingPdf(null)
            return
        }
        try {
            setLoading(true)
            const meta = await pdfApi.metadataPorRegistro(registroBaseId)
            if (meta && meta.exists) {
                setExistingPdf({ id: null, filename: meta.filename ?? `Documento de registro ${registroBaseId}` })
            } else {
                setExistingPdf(null)
            }
        } catch (err: any) {
            console.error('Error fetching existing PDF', err)
            if (err?.message && err.message.includes('401')) {
                Swal.fire({ icon: 'error', title: 'Autorización Denegada', text: 'El backend requiere credenciales básicas. Verifica .env.local (NEXT_PUBLIC_API_USER / NEXT_PUBLIC_API_PASS) y reinicia el dev server.' })
            }
            setExistingPdf(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (open) fetchExisting()
        else setExistingPdf(null)
    }, [open, registroBaseId])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) {
            setSelectedFile(null)
            return
        }
        setSelectedFile(files[0])
    }

    const handleUpload = async () => {
        if (!selectedFile) return
        if (!registroBaseId) {
            Swal.fire({ icon: 'warning', title: 'Registro no seleccionado', text: 'Selecciona un registro antes de subir.' })
            return
        }
        try {
            setLoading(true)
            await pdfApi.subirPdf(registroBaseId, selectedFile)
            await Swal.fire({ icon: 'success', title: 'Subido', text: 'El documento se subió correctamente.' })
            setSelectedFile(null)
            await fetchExisting()
        } catch (err: any) {
            console.error('Upload error', err)
            if (err?.message && err.message.includes('401')) {
                Swal.fire({ icon: 'error', title: 'Autorización Denegada', text: 'Fallo al autenticar con el backend. Revisa tus credenciales en .env.local.' })
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir el documento.' })
            }
        } finally {
            setLoading(false)
        }
    }
    const handleView = async () => {
        if (!registroBaseId) return
        try {
            setLoading(true)
            const blob = await pdfApi.verPdfPorRegistro(registroBaseId)
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank')
            setTimeout(() => URL.revokeObjectURL(url), 60_000)
        } catch (err: any) {
            console.error('Error viewing PDF', err)
            if (err?.message && err.message.includes('401')) {
                Swal.fire({ icon: 'error', title: 'Autorización Denegada', text: 'No autorizado para descargar el documento. Revisa tus credenciales.' })
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo obtener el documento.' })
            }
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!registroBaseId) return

        const result = await Swal.fire({
            title: '¿Eliminar documento?',
            text: 'Esta acción eliminará el documento almacenado.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        })
        if (!result.isConfirmed) return
        try {
            setLoading(true)
            await pdfApi.eliminarPdfPorRegistro(registroBaseId)
            await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El documento fue eliminado.' })
            setExistingPdf(null)
        } catch (err) {
            console.error('Delete error', err)
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el documento.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] sm:max-w-[640px] lg:max-w-[900px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Adjuntar Acta</DialogTitle>
                    <DialogDescription>Sube o administra el acta (PDF) asociada a este registro.</DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Documento (PDF)</label>

                        {existingPdf ? (
                            <div className="flex items-center justify-between gap-4 p-3 border rounded-md bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <svg className="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v8l3-3 3 3V2M6 20h12a2 2 0 002-2V8l-4-4H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <div className="flex flex-col">
                                        <span className="font-medium truncate max-w-xs">{existingPdf.filename || `Documento #${existingPdf.id}`}</span>
                                        <span className="text-xs text-muted-foreground">Archivo guardado en el servidor</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={handleView}>Ver / Descargar</Button>
                                    <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-700 border-red-700 hover:bg-red-50"><Trash2 className="mr-2 h-4 w-4"/>Eliminar</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">No hay documento adjunto.</div>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                            <input id="pdf-input" type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                            <label htmlFor="pdf-input" className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded-md cursor-pointer hover:shadow-sm">
                                <Upload className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Seleccionar archivo</span>
                            </label>
                            <div className="flex-1 text-sm truncate">
                                {selectedFile ? (
                                    <span className="font-medium">{selectedFile.name}</span>
                                ) : (
                                    <span className="text-muted-foreground">{existingPdf ? 'Selecciona un archivo para reemplazar' : 'Ningún archivo seleccionado'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {loading && (<div className="text-sm text-muted-foreground">Cargando...</div>)}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cerrar</Button>
                    <Button onClick={handleUpload} disabled={!selectedFile || loading}><Upload className="mr-2 h-4 w-4"/>Subir</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RegistroBaseTIPdfDialog
