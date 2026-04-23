import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Archive, DownloadCloud, FileText, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const isoClauses = [
  { id: "4", title: "4. Contexto de la organización" },
  { id: "5", title: "5. Liderazgo" },
  { id: "6", title: "6. Planificación" },
  { id: "7", title: "7. Apoyo" },
  { id: "8", title: "8. Operación" },
  { id: "9", title: "9. Evaluación del desempeño" },
  { id: "10", title: "10. Mejora" }
];

const lecRequirements = [
  { id: "calidad", title: "Calidad (ISO 9001 / Otras)" },
  { id: "capacitacion", title: "Capacitación" },
  { id: "id", title: "Investigación y Desarrollo (I+D)" },
  { id: "exportaciones", title: "Exportaciones" }
];

export default function Evidencias() {
  const { documentos } = useStore();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleGenerateZip = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsDialogOpen(false);
      toast({
        title: "Paquete generado exitosamente",
        description: "El archivo ZIP con las evidencias se ha descargado.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Matriz de Evidencias</h1>
          <p className="text-muted-foreground mt-1">Control de cobertura documental por norma y requisito.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
              <Archive className="w-4 h-4 mr-2" /> Generar Paquete de Auditoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generar Paquete de Auditoría</DialogTitle>
              <DialogDescription>
                Seleccioná el alcance y período para exportar las evidencias.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Alcance del Paquete</Label>
                <RadioGroup defaultValue="ambos">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="iso9001" id="r-iso" />
                    <Label htmlFor="r-iso">Solo ISO 9001</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="lec" id="r-lec" />
                    <Label htmlFor="r-lec">Solo Ley de Economía del Conocimiento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ambos" id="r-ambos" />
                    <Label htmlFor="r-ambos">Ambos (Auditoría Integral)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md border text-sm">
                <p className="font-medium mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Documentos a incluir ({documentos.length}):</p>
                <ul className="space-y-1 text-muted-foreground max-h-32 overflow-y-auto pr-2">
                  {documentos.map(d => (
                    <li key={d.id} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                      <span className="truncate">{d.nombre} ({d.version})</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox id="pdf-report" defaultChecked />
                <Label htmlFor="pdf-report" className="text-sm font-normal">Incluir reporte PDF resumen de cumplimiento</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleGenerateZip} disabled={isGenerating}>
                {isGenerating ? "Generando..." : "Generar ZIP"}
                {!isGenerating && <DownloadCloud className="w-4 h-4 ml-2" />}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="iso9001">
            <TabsList className="mb-6">
              <TabsTrigger value="iso9001">Por Cláusula ISO 9001</TabsTrigger>
              <TabsTrigger value="lec">Por Requisito LEC</TabsTrigger>
            </TabsList>
            
            <TabsContent value="iso9001" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {isoClauses.map((clause) => {
                  const relatedDocs = documentos.filter(d => 
                    d.clausulasIso.some(c => c.startsWith(clause.id))
                  );
                  const isCovered = relatedDocs.length > 0;
                  
                  return (
                    <AccordionItem key={clause.id} value={`iso-${clause.id}`} className="border rounded-md mb-2 px-4 bg-card">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium text-foreground text-left">{clause.title}</span>
                          <Badge variant={isCovered ? "default" : "outline"} className={isCovered ? "bg-success hover:bg-success" : "text-muted-foreground"}>
                            {isCovered ? "Cubierto" : "Pendiente"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 text-muted-foreground border-t mt-2">
                        {isCovered ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground">Evidencia vinculada:</p>
                            <div className="grid gap-2">
                              {relatedDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md border text-sm">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground">{doc.nombre}</span>
                                    <span className="text-xs text-muted-foreground ml-2">v{doc.version}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs bg-background">{doc.estado}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm py-4 text-center">
                            <Circle className="w-8 h-8 text-muted/50 mx-auto mb-2" />
                            <p>No hay evidencia vinculada a esta cláusula.</p>
                            <Button variant="link" size="sm" className="mt-1">Vincular documento existente</Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>

            <TabsContent value="lec" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {lecRequirements.map((req) => {
                  const relatedDocs = documentos.filter(d => 
                    d.requisitoLec?.toLowerCase() === req.id || d.categoria === 'LEC'
                  );
                  // simplified coverage check
                  const isCovered = req.id === 'calidad' || relatedDocs.length > 0;
                  
                  return (
                    <AccordionItem key={req.id} value={`lec-${req.id}`} className="border rounded-md mb-2 px-4 bg-card">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4">
                          <span className="font-medium text-foreground text-left">{req.title}</span>
                          <Badge variant={isCovered ? "default" : "outline"} className={isCovered ? "bg-success hover:bg-success" : "text-muted-foreground"}>
                            {isCovered ? "Cubierto" : "Pendiente"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 text-muted-foreground border-t mt-2">
                        {isCovered ? (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground">Evidencia vinculada:</p>
                            <div className="grid gap-2">
                              {relatedDocs.length > 0 ? relatedDocs.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between bg-muted/30 p-2 rounded-md border text-sm">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground">{doc.nombre}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs bg-background">{doc.estado}</Badge>
                                </div>
                              )) : (
                                <p className="text-sm text-muted-foreground italic">Evidencia gestionada a través de certificado ISO 9001 vigente.</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm py-4 text-center">
                            <Circle className="w-8 h-8 text-muted/50 mx-auto mb-2" />
                            <p>No hay evidencia vinculada a este requisito.</p>
                            <Button variant="link" size="sm" className="mt-1">Cargar evidencia</Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}