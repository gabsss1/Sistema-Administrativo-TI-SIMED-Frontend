"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CalendarDays, Clock, Users, AlertCircle } from "lucide-react";
import CalendarioGuardias from "../../components/calendario-guardias";

function getPeruDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const peruOffset = -5;
  return new Date(utc + 3600000 * peruOffset);
}

export default function GestionarGuardiasPage() {
  const peruDate = getPeruDate();
  const currentDateTime = peruDate.toLocaleString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestionar Guardias</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {currentDateTime} (Hora de Perú)
          </p>
        </div>

        {/* Cards informativos */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium ml-2">Guardias 24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cada guardia es de 24 horas completas. Haz clic en un día para asignar.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium ml-2">Responsables</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Asigna guardias a los responsables disponibles
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium ml-2">Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Asignada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Cancelada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendario principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-primary" />
              Calendario de Guardias
            </CardTitle>
            <CardDescription>
              Gestiona las guardias de 24 horas del personal médico. Cada guardia cubre un día completo. Haz clic en un día para asignar o en una guardia existente para editarla.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarioGuardias />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
