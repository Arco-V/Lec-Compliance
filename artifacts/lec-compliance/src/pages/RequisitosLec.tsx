import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Award, Briefcase, Globe, CheckCircle2, XCircle, Plus, FileText } from "lucide-react";
import { formatRelativeTime } from "@/lib/dates";
import { Progress } from "@/components/ui/progress";
import { addDays } from "date-fns";

export default function RequisitosLec() {
  const { 
    empresa, 
    capacitacion, 
    exportaciones, 
    actividades, 
    facturas,
    updateCapacitacion,
    updateExportaciones
  } = useStore();

  const [localMasa, setLocalMasa] = useState(capacitacion.requerido.toString());
  const [localIYD, setLocalIYD] = useState(exportaciones.facturacionTotal.toString());
  const [localFacturacion, setLocalFacturacion] = useState(exportaciones.facturacionTotal.toString());
  
  const pctCapacitacion = (capacitacion.invertido / (Number(localMasa) || 1)) * 100;
  const reqPctExport = empresa.tamano === 'Micro' ? 4 : empresa.tamano === 'Grande' ? 13 : 10;
  const pctExport = (exportaciones.monto / (Number(localFacturacion) || 1)) * 100;

  const reqCount = (pctCapacitacion >= 1 ? 1 : 0) + (pctExport >= reqPctExport ? 1 : 0) + 1; // Assuming ISO 9001 is met

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Requisitos LEC</h1>
        <p className="text-muted-foreground mt-1">Monitoreo de requisitos para la Ley de Economía del Conocimiento.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ISO 9001 Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" /> Calidad / ISO 9001
              </CardTitle>
              <Badge className="bg-success hover:bg-success">Cumplido</Badge>
            </div>
            <CardDescription>Mejora continua en productos y servicios.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Certificadora:</span>
                <span className="font-medium">{empresa.certificadora}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vencimiento:</span>
                <span className="font-medium">{formatRelativeTime(addDays(new Date(), 180))}</span>
              </div>
            </div>
            <div className="space-y-2 border-t pt-4">
              <p className="text-sm font-medium">Cláusulas principales:</p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> 4. Contexto de la organización</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> 5. Liderazgo</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-success" /> 6. Planificación</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* I+D / Capacitación Card */}
        <Card className="flex flex-col lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" /> I+D y Capacitación
              </CardTitle>
              {pctCapacitacion >= 1 ? (
                <Badge className="bg-success hover:bg-success">Cumplido</Badge>
              ) : (
                <Badge variant="destructive">Pendiente</Badge>
              )}
            </div>
            <CardDescription>Inversión requerida: 1% para Capacitación o 3% para I+D.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <Tabs defaultValue="capacitacion">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="capacitacion">Capacitación</TabsTrigger>
                <TabsTrigger value="id">I+D</TabsTrigger>
              </TabsList>
              <TabsContent value="capacitacion" className="space-y-4">
                <div className="space-y-2">
                  <Label>Masa Salarial (ARS)</Label>
                  <Input 
                    type="number" 
                    value={localMasa} 
                    onChange={(e) => setLocalMasa(e.target.value)} 
                    onBlur={() => updateCapacitacion({ requerido: Number(localMasa) })}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progreso ({pctCapacitacion.toFixed(2)}%)</span>
                    <span className="text-muted-foreground">Req: 1%</span>
                  </div>
                  <Progress value={Math.min(pctCapacitacion * 100, 100)} className={pctCapacitacion >= 1 ? "bg-success/20 [&>div]:bg-success" : ""} />
                </div>
                <div className="pt-2 text-sm border-t">
                  <p className="font-medium mb-2">Actividades registradas:</p>
                  {actividades.filter(a => a.tipo === 'Capacitación').length > 0 ? (
                    actividades.filter(a => a.tipo === 'Capacitación').map(a => (
                      <div key={a.id} className="flex justify-between py-1">
                        <span>{a.nombre}</span>
                        <span className="font-medium">${a.monto.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-xs">Sin actividades cargadas.</p>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-3"><Plus className="w-3 h-3 mr-1"/> Agregar actividad</Button>
                </div>
              </TabsContent>
              <TabsContent value="id" className="space-y-4">
                <div className="space-y-2">
                  <Label>Facturación Total (ARS)</Label>
                  <Input 
                    type="number" 
                    value={localIYD} 
                    onChange={(e) => setLocalIYD(e.target.value)} 
                  />
                </div>
                <div className="pt-4 text-center text-sm text-muted-foreground">
                  Funcionalidad en desarrollo.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Exportaciones Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> Exportaciones
              </CardTitle>
              {pctExport >= reqPctExport ? (
                <Badge className="bg-success hover:bg-success">Cumplido</Badge>
              ) : (
                <Badge variant="destructive">Pendiente</Badge>
              )}
            </div>
            <CardDescription>Requerido para tamaño {empresa.tamano}: {reqPctExport}%</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label>Facturación Total (ARS)</Label>
              <Input 
                type="number" 
                value={localFacturacion} 
                onChange={(e) => setLocalFacturacion(e.target.value)} 
                onBlur={() => updateExportaciones({ facturacionTotal: Number(localFacturacion) })}
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Exportado: ${(exportaciones.monto).toLocaleString()}</span>
                <span className="text-muted-foreground">{pctExport.toFixed(2)}%</span>
              </div>
              <Progress value={Math.min((pctExport / reqPctExport) * 100, 100)} className={pctExport >= reqPctExport ? "bg-success/20 [&>div]:bg-success" : ""} />
            </div>
            <div className="pt-2 text-sm border-t">
              <p className="font-medium mb-2">Facturas tipo E:</p>
              {facturas.length > 0 ? (
                facturas.slice(0, 3).map(f => (
                  <div key={f.id} className="flex justify-between py-1">
                    <span>{f.cliente}</span>
                    <span className="font-medium">${f.monto.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-xs">Sin facturas cargadas.</p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-3"><Plus className="w-3 h-3 mr-1"/> Registrar Factura</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/30 border border-muted p-4 rounded-lg flex items-center justify-between mt-8">
        <div className="flex items-center gap-3">
          {reqCount >= 2 ? <CheckCircle2 className="w-6 h-6 text-success" /> : <XCircle className="w-6 h-6 text-destructive" />}
          <div>
            <h3 className="font-semibold text-foreground">Cumplís {reqCount} de 3 requisitos</h3>
            <p className="text-sm text-muted-foreground">Necesitás al menos 2 para mantener tu inscripción en el registro LEC.</p>
          </div>
        </div>
      </div>
    </div>
  );
}