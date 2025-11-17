import AnydeskTable from "@/components/anydesk-table";

export default function AnydeskPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Anydesk</h1>
        <p className="text-muted-foreground">Gestiona las conexiones Anydesk por hospital</p>
      </div>

      <AnydeskTable />
    </div>
  );
}