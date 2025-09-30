"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts"

const data = [
  { name: "Ene", usuarios: 400, sesiones: 240 },
  { name: "Feb", usuarios: 300, sesiones: 139 },
  { name: "Mar", usuarios: 200, sesiones: 980 },
  { name: "Abr", usuarios: 278, sesiones: 390 },
  { name: "May", usuarios: 189, sesiones: 480 },
  { name: "Jun", usuarios: 239, sesiones: 380 },
  { name: "Jul", usuarios: 349, sesiones: 430 },
]

export function DashboardChart() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Usuarios Activos</CardTitle>
          <CardDescription>Crecimiento de usuarios en los últimos 7 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Area
                type="monotone"
                dataKey="usuarios"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorUsuarios)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones</CardTitle>
          <CardDescription>Actividad de sesiones por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Line
                type="monotone"
                dataKey="sesiones"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--chart-2))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
