import { useMemo, useState } from "react";
import { useStore, type Documento } from "@/store/useStore";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  Archive,
  DownloadCloud,
  FileText,
  CheckCircle2,
  Circle,
  Folder,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const isoClauses = [
  { id: "4", title: "4. Contexto de la organización" },
  { id: "5", title: "5. Liderazgo" },
  { id: "6", title: "6. Planificación" },
  { id: "7", title: "7. Apoyo" },
  { id: "8", title: "8. Operación" },
  { id: "9", title: "9. Evaluación del desempeño" },
  { id: "10", title: "10. Mejora" },
];

const lecRequirements = [
  { id: "calidad", title: "Calidad (ISO 9001 / Otras)" },
  { id: "capacitacion", title: "Capacitación" },
  { id: "id", title: "Investigación y Desarrollo (I+D)" },
  { id: "exportaciones", title: "Exportaciones" },
];

const SIN_CARPETA = "Sin carpeta";

function splitFolder(nombre: string): { carpeta: string; titulo: string } {
  const idx = nombre.indexOf("/");
  if (idx === -1) return { carpeta: SIN_CARPETA, titulo: nombre };
  return {
    carpeta: nombre.slice(0, idx).trim() || SIN_CARPETA,
    titulo: nombre.slice(idx + 1).trim() || nombre,
  };
}

interface EvidenceGroup {
  carpeta: string;
  docs: Documento[];
  vigentes: number;
  porVencer: number;
  vencidos: number;
  pct: number;
}

function groupDocs(docs: Documento[]): EvidenceGroup[] {
  const map = new Map<string, Documento[]>();
  docs.forEach((d) => {
    const { carpeta } = splitFolder(d.nombre);
    const arr = map.get(carpeta) ?? [];
    arr.push(d);
    map.set(carpeta, arr);
  });
  return Array.from(map.entries())
    .map(([carpeta, docs]) => {
      const total = docs.length;
      const vigentes = docs.filter((d) => d.estado === "vigente").length;
      const porVencer = docs.filter((d) => d.estado === "por_vencer").length;
      const vencidos = docs.filter((d) => d.estado === "vencido").length;
      const pct = total === 0 ? 0 : Math.round((vigentes / total) * 100);
      return { carpeta, docs, vigentes, porVencer, vencidos, pct };
    })
    .sort((a, b) => {
      if (a.carpeta === SIN_CARPETA) return 1;
      if (b.carpeta === SIN_CARPETA) return -1;
      return a.carpeta.localeCompare(b.carpeta);
    });
}

function estadoColor(estado: Documento["estado"]) {
  if (estado === "vigente") return "bg-success text-success-foreground";
  if (estado === "por_vencer") return "bg-warning text-warning-foreground";
  return "bg-destructive text-white";
}

function progressTextColor(pct: number) {
  if (pct >= 80) return "text-emerald-700";
  if (pct >= 60) return "text-amber-700";
  return "text-rose-700";
}

function GroupCard({ group }: { group: EvidenceGroup }) {
  const [open, setOpen] = useState(group.docs.length <= 3);
  const isMulti = group.docs.length > 1;

  return (
    <div className="rounded-md border bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover-elevate"
      >
        <ChevronRight
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform shrink-0",
            open && "rotate-90",
          )}
        />
        {isMulti ? (
          <Folder className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-primary shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-foreground truncate">
              {group.carpeta === SIN_CARPETA
                ? splitFolder(group.docs[0].nombre).titulo
                : group.carpeta}
            </span>
            {isMulti && (
              <span className="text-xs text-muted-foreground">
                {group.docs.length} documentos
              </span>
            )}
            {group.porVencer > 0 && (
              <Badge
                variant="outline"
                className="bg-warning/10 text-warning-foreground border-warning/30 text-[10px] h-5"
              >
                {group.porVencer} por vencer
              </Badge>
            )}
            {group.vencidos > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5">
                {group.vencidos} vencido{group.vencidos === 1 ? "" : "s"}
              </Badge>
            )}
            {!isMulti && (
              <Badge className={cn("text-[10px] h-5", estadoColor(group.docs[0].estado))}>
                {group.docs[0].estado}
              </Badge>
            )}
          </div>
          {isMulti && (
            <div className="mt-1.5 flex items-center gap-2">
              <Progress value={group.pct} className="h-1 flex-1 max-w-xs" />
              <span
                className={cn(
                  "text-xs tabular-nums w-9 text-right font-semibold",
                  progressTextColor(group.pct),
                )}
              >
                {group.pct}%
              </span>
            </div>
          )}
        </div>
      </button>
      {open && isMulti && (
        <div className="border-t bg-background/60">
          <ul className="divide-y">
            {group.docs.map((doc) => {
              const { titulo } = splitFolder(doc.nombre);
              return (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-2 px-4 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate text-foreground">{titulo}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {doc.version}
                    </span>
                  </div>
                  <Badge className={cn("text-[10px] h-5", estadoColor(doc.estado))}>
                    {doc.estado}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

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

  const isoSections = useMemo(
    () =>
      isoClauses.map((c) => {
        const related = documentos.filter((d) =>
          d.clausulasIso.some((cl) => cl.startsWith(c.id)),
        );
        return { ...c, groups: groupDocs(related), totalDocs: related.length };
      }),
    [documentos],
  );

  const lecSections = useMemo(
    () =>
      lecRequirements.map((req) => {
        const related = documentos.filter(
          (d) =>
            d.requisitoLec?.toLowerCase() === req.id ||
            (req.id === "calidad" && d.categoria === "ISO 9001"),
        );
        return { ...req, groups: groupDocs(related), totalDocs: related.length };
      }),
    [documentos],
  );

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Matriz de Evidencias</h1>
          <p className="text-muted-foreground mt-1">
            Cobertura documental por norma y requisito. Las evidencias compuestas
            por múltiples documentos (por ejemplo, una evaluación de desempeño por
            empleado) se agrupan automáticamente.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Archive className="w-4 h-4 mr-2" /> Generar paquete de auditoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generar paquete de auditoría</DialogTitle>
              <DialogDescription>
                Seleccioná el alcance y período para exportar las evidencias.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label>Alcance del paquete</Label>
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
                    <Label htmlFor="r-ambos">Ambos (auditoría integral)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-muted/50 p-4 rounded-md border text-sm">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Documentos a incluir (
                  {documentos.length}):
                </p>
                <ul className="space-y-1 text-muted-foreground max-h-32 overflow-y-auto pr-2">
                  {documentos.map((d) => (
                    <li key={d.id} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                      <span className="truncate">
                        {d.nombre} ({d.version})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="pdf-report" defaultChecked />
                <Label htmlFor="pdf-report" className="text-sm font-normal">
                  Incluir reporte PDF resumen de cumplimiento
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
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
              <TabsTrigger value="iso9001">Por cláusula ISO 9001</TabsTrigger>
              <TabsTrigger value="lec">Por requisito LEC</TabsTrigger>
            </TabsList>

            <TabsContent value="iso9001" className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {isoSections.map((section) => {
                  const isCovered = section.totalDocs > 0;
                  return (
                    <AccordionItem
                      key={section.id}
                      value={`iso-${section.id}`}
                      className="border rounded-md mb-2 px-4 bg-card"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4 gap-3">
                          <span className="font-medium text-foreground text-left">
                            {section.title}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isCovered && (
                              <span className="text-xs text-muted-foreground">
                                {section.totalDocs} doc{section.totalDocs === 1 ? "" : "s"}
                                {section.groups.length !== section.totalDocs &&
                                  ` · ${section.groups.length} evidencia${section.groups.length === 1 ? "" : "s"}`}
                              </span>
                            )}
                            <Badge
                              variant={isCovered ? "default" : "outline"}
                              className={
                                isCovered
                                  ? "bg-success hover:bg-success text-success-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {isCovered ? "Cubierto" : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 border-t mt-2">
                        {isCovered ? (
                          <div className="space-y-2">
                            {section.groups.map((g) => (
                              <GroupCard key={g.carpeta + section.id} group={g} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm py-4 text-center text-muted-foreground">
                            <Circle className="w-8 h-8 text-muted/50 mx-auto mb-2" />
                            <p>No hay evidencia vinculada a esta cláusula.</p>
                            <Link href="/documentos">
                              <Button variant="link" size="sm" className="mt-1">
                                Vincular documento existente
                              </Button>
                            </Link>
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
                {lecSections.map((section) => {
                  const isCovered = section.totalDocs > 0;
                  return (
                    <AccordionItem
                      key={section.id}
                      value={`lec-${section.id}`}
                      className="border rounded-md mb-2 px-4 bg-card"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center justify-between w-full pr-4 gap-3">
                          <span className="font-medium text-foreground text-left">
                            {section.title}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isCovered && (
                              <span className="text-xs text-muted-foreground">
                                {section.totalDocs} doc{section.totalDocs === 1 ? "" : "s"}
                                {section.groups.length !== section.totalDocs &&
                                  ` · ${section.groups.length} evidencia${section.groups.length === 1 ? "" : "s"}`}
                              </span>
                            )}
                            <Badge
                              variant={isCovered ? "default" : "outline"}
                              className={
                                isCovered
                                  ? "bg-success hover:bg-success text-success-foreground"
                                  : "text-muted-foreground"
                              }
                            >
                              {isCovered ? "Cubierto" : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 border-t mt-2">
                        {isCovered ? (
                          <div className="space-y-2">
                            {section.groups.map((g) => (
                              <GroupCard key={g.carpeta + section.id} group={g} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm py-4 text-center text-muted-foreground">
                            <Circle className="w-8 h-8 text-muted/50 mx-auto mb-2" />
                            <p>No hay evidencia vinculada a este requisito.</p>
                            <Link href="/documentos">
                              <Button variant="link" size="sm" className="mt-1">
                                Cargar evidencia
                              </Button>
                            </Link>
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
