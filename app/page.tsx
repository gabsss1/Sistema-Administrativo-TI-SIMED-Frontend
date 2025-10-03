import Link from "next/link"
import { LayoutDashboard, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header simple */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Panel Administrativo</h1>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido al Panel de Administración de FAST-IT</h2>
            <p className="text-muted-foreground">Opciones Administrativas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">


            <Card className="hover:shadow-md transition-shadow">

              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" />
                  Registro Base TI
                </CardTitle>
                <CardDescription>Ingreso de data de clientes</CardDescription>
              </CardHeader>

              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/registro-base-ti">Ir a Registro Base TI</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Dashboard
                </CardTitle>
                <CardDescription>Visualización de métricas y datos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard">Ir a Dashboard</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gestionar Anydesk
                </CardTitle>
                <CardDescription>Proximamente</CardDescription>
              </CardHeader>
              {/* <CardContent>
                <Button asChild className="w-full">
                  <Link href="/settings">Ir a Configuración</Link>
                </Button>
              </CardContent> */}
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}