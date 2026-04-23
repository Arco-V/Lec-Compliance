import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info, Settings, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function Alertas() {
  const { alertas, markAlertaLeida, preferencias, updatePreferencias } = useStore();
  const [filter, setFilter] = useState("all");
  const [diasAviso, setDiasAviso] = useState(preferencias.diasAvisoVencimiento.toString());

  const handleSavePref = () => {
    updatePreferencias({ diasAvisoVencimiento: Number(diasAviso) || 30 });
  };

  const filteredAlertas = alertas
    .filter(a => !a.leida)
    .filter(a => {
      if (filter === "criticos") return a.tipo === "CRITICO";
      if (filter === "lec") return a.descripcion.includes("LEC");
      if (filter === "iso") return a.descripcion.includes("ISO") || a.afectado.includes("Manual");
      return true;
    })
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'CRITICO': return <ShieldAlert className="w-5 h-5 text-destructive" />;
      case 'ADVERTENCIA': return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'INFO': return <Info className="w-5 h-5 text-primary" />;
      case 'OK': return <CheckCircle2 className="w-5 h-5 text-success" />;
      default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Alertas y Notificaciones</h1>
          <p className="text-muted-foreground mt-1">Monitoreo proactivo de vencimientos y requerimientos.</p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Preferencias de Alertas</h4>
              <p className="text-xs text-muted-foreground">Configurá con cuánta anticipación querés recibir alertas de vencimiento de documentos.</p>
              <div className="space-y-2">
                <Label htmlFor="dias">Días de aviso previo</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="dias" 
                    type="number" 
                    value={diasAviso} 
                    onChange={(e) => setDiasAviso(e.target.value)} 
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">días</span>
                </div>
              </div>
              <Button size="sm" className="w-full" onClick={handleSavePref}>Guardar preferencias</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/20 p-2 rounded-lg border">
        <Tabs value={filter} onValueChange={setFilter} className="w-full overflow-x-auto">
          <TabsList className="bg-transparent">
            <TabsTrigger value="all" className="data-[state=active]:bg-background shadow-sm">Todas</TabsTrigger>
            <TabsTrigger value="criticos" className="data-[state=active]:bg-background shadow-sm">Críticos</TabsTrigger>
            <TabsTrigger value="lec" className="data-[state=active]:bg-background shadow-sm">Solo LEC</TabsTrigger>
            <TabsTrigger value="iso" className="data-[state=active]:bg-background shadow-sm">Solo ISO 9001</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        {filteredAlertas.length > 0 ? (
          filteredAlertas.map(alerta => (
            <Card key={alerta.id} className={`overflow-hidden border-l-4 ${
              alerta.tipo === 'CRITICO' ? 'border-l-destructive' : 
              alerta.tipo === 'ADVERTENCIA' ? 'border-l-warning' : 
              alerta.tipo === 'OK' ? 'border-l-success' : 'border-l-primary'
            }`}>
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-background rounded-full p-1 shadow-sm border">
                    {getIcon(alerta.tipo)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs font-normal bg-background">{alerta.afectado}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Hace {formatDistanceToNow(alerta.fecha, { locale: es })}
                      </span>
                    </div>
                    <p className="font-medium text-foreground">{alerta.descripcion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => markAlertaLeida(alerta.id)}>
                    Descartar
                  </Button>
                  <Button size="sm" className="gap-1">
                    Acción recomendada <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-muted/10 border-dashed">
            <CardContent className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-success/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">¡Todo al día!</h3>
              <p className="text-muted-foreground mt-1">No tenés alertas pendientes por revisar.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}