import EquiposTable from "@/components/equipos-table"

export default function EquiposPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Equipos</h1>
        <p className="text-muted-foreground">Gestiona el inventario de equipos de cómputo</p>
      </div>

      <EquiposTable />
    </div>
  )
}