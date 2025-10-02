import { RegistroBaseTITable } from "@/components/registro-base-ti-table";

export default function RegistroBaseTIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registro Base TI</h1>
        <p className="text-muted-foreground">Gestiona los registros de TI</p>
      </div>

      <RegistroBaseTITable />
    </div>
  );
}
