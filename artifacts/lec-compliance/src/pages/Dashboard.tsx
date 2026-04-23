import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import { FileCheck, ShieldAlert, CalendarClock, DollarSign } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const { documentos, alertas } = useStore();
  const vigentes = documentos.filter(d => d.estado === 'vigente').length;
  const total = documentos.length;
  
  const proximos = documentos
    .filter(d => d.estado === 'por_vencer' || d.estado === 'vencido')
    .sort((a, b) => a.proximaRevision.getTime() - b.proximaRevision.getTime());
    
  const proximoVencer = proximos.length > 0 ? proximos[0] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Resumen general de cumplimiento LEC e ISO 9001.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Vigentes</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vigentes} / {total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((vigentes / total) * 100)}% actualizados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado LEC</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">2 / 3</div>
            <p className="text-xs text-muted-foreground mt-1">
              Requisitos cumplidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Vencimiento</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">
              {proximoVencer ? proximoVencer.nombre : 'Ninguno'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {proximoVencer ? (
                isPast(proximoVencer.proximaRevision) 
                  ? `Venció hace ${formatDistanceToNow(proximoVencer.proximaRevision, { locale: es })}`
                  : `Vence en ${formatDistanceToNow(proximoVencer.proximaRevision, { locale: es })}`
              ) : 'Todo al día'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Beneficio Fiscal en Riesgo</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">$30.000.000 ARS</div>
            <p className="text-xs text-destructive/80 mt-1">Estimado anual</p>
          </CardContent>
        </Card>
      </div>
      
      {/* ... Add remaining dashboard content ... */}
    </div>
  );
}
