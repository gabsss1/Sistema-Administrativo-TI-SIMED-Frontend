import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Activity, TrendingUp, Database } from "lucide-react"

const stats = [
  {
    title: "Total Usuarios",
    value: "2,847",
    change: "+12%",
    icon: Users,
    color: "text-chart-1",
  },
  {
    title: "Sesiones Activas",
    value: "1,234",
    change: "+8%",
    icon: Activity,
    color: "text-chart-2",
  },
  {
    title: "Crecimiento",
    value: "23.5%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "text-chart-3",
  },
  {
    title: "Base de Datos",
    value: "98.2%",
    change: "+0.3%",
    icon: Database,
    color: "text-chart-4",
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-chart-2">{stat.change}</span> desde el mes pasado
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
