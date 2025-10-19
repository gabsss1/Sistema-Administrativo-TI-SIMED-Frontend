"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getModulos, getModulosForRegistro, assignModulosToRegistro } from '@/lib/registro-base-ti'
import Swal from 'sweetalert2'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  registro_base_id: number | null
  lis_id?: number
  onSaved?: () => void
}

export function RegistroModulosDialog({ open, onOpenChange, registro_base_id, lis_id, onSaved }: Props) {
  const [modulos, setModulos] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [originalAssigned, setOriginalAssigned] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!open) return

    let mounted = true
    const load = async () => {
      if (!registro_base_id) {
        setModulos([])
        setSelected(new Set())
        setOriginalAssigned(new Set())
        return
      }

      setLoading(true)
      try {
        const available = await getModulos(lis_id)
        const assigned = await getModulosForRegistro(registro_base_id)
        if (!mounted) return

        const availableList = (available || []).slice().sort((a: any, b: any) => String(a.nombre).localeCompare(String(b.nombre)))
        setModulos(availableList)

        const assignedIds = (assigned || []).map((m: any) => m.modulo_id)
        const assignedSet = new Set<number>(assignedIds)
        setSelected(new Set(assignedSet))
        setOriginalAssigned(new Set(assignedSet))
      } catch (error) {
        console.error('Error cargando módulos:', error)
        Swal.fire({ title: 'Error', text: 'No se pudieron cargar módulos', icon: 'error' })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [open, registro_base_id, lis_id])

  const toggle = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelected(prev => {
      const next = new Set(prev)
      modulos.forEach((m: any) => next.add(m.modulo_id))
      return next
    })
  }

  const clearAll = () => setSelected(new Set())

  const isChanged = useMemo(() => {
    if (originalAssigned.size !== selected.size) return true
    let changed = false
    selected.forEach(id => { if (!originalAssigned.has(id)) changed = true })
    originalAssigned.forEach(id => { if (!selected.has(id)) changed = true })
    return changed
  }, [originalAssigned, selected])

  const handleSave = async () => {
    if (!registro_base_id) return
    setLoading(true)
    try {
      await assignModulosToRegistro(registro_base_id, Array.from(selected))
      // update local baseline to reflect saved state
      setOriginalAssigned(new Set(selected))
      Swal.fire({ title: 'Guardado', text: 'Módulos asignados correctamente', icon: 'success', timer: 1500, showConfirmButton: false })
      onSaved && onSaved()
      onOpenChange(false)
    } catch (error) {
      console.error('Error guardando módulos:', error)
      Swal.fire({ title: 'Error', text: 'No se pudieron guardar los módulos', icon: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // helper to render two balanced columns
  const renderColumns = (items: any[]) => {
    const half = Math.ceil(items.length / 2)
    const left = items.slice(0, half)
    const right = items.slice(half)
    const renderList = (list: any[]) => (
      <div className="space-y-2">
        {list.map(m => (
          <label key={m.modulo_id} className="flex items-center gap-2">
            <input
              aria-label={`Seleccionar módulo ${m.nombre}`}
              type="checkbox"
              checked={selected.has(m.modulo_id)}
              onChange={() => toggle(m.modulo_id)}
              className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{m.nombre}</span>
              {m.descripcion && <span className="text-xs text-muted-foreground">{m.descripcion}</span>}
            </div>
          </label>
        ))}
      </div>
    )

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {renderList(left)}
        {renderList(right)}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionales / Módulos</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-auto py-2">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={selectAll} size="sm" disabled={loading || modulos.length === 0}>Seleccionar todo</Button>
              <Button variant="ghost" onClick={clearAll} size="sm" disabled={loading || modulos.length === 0}>Limpiar</Button>
            </div>
            <div className="text-sm text-muted-foreground">Disponibles: {modulos.length} — Seleccionados: {selected.size}</div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm">Cargando módulos...</div>
          ) : !registro_base_id ? (
            <div className="py-8 text-center text-sm">Selecciona un registro válido para ver y asignar módulos.</div>
          ) : modulos.length === 0 ? (
            <div className="py-8 text-center text-sm">No hay módulos disponibles para este LIS.</div>
          ) : (
            renderColumns(modulos)
          )}

        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading || !isChanged || !registro_base_id}>{loading ? 'Guardando...' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RegistroModulosDialog
