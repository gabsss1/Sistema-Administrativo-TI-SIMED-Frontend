import { AdminLayout } from "@/components/admin-layout"

export const metadata = {
  title: "Notificaciones - SIMED Admin",
  description: "Gestiona tus notificaciones del sistema",
}

export default function NotificacionesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
