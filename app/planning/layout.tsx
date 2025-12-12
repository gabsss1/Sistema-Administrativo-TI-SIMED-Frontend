import { AdminLayout } from "@/components/admin-layout"

export default function PlanningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
