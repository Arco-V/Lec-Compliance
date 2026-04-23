import { useMemo, useState } from "react";
import { useStore, Documento } from "@/store/useStore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Search,
  Plus,
  Eye,
  UploadCloud,
  Clock,
  Calendar as CalendarIcon,
  Tag,
  User,
  Folder,
  FolderOpen,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays } from "date-fns";
import { cn } from "@/lib/utils";

const SIN_CARPETA = "Sin carpeta";

function splitFolder(nombre: string): { carpeta: string; titulo: string } {
  const idx = nombre.indexOf("/");
  if (idx === -1) return { carpeta: SIN_CARPETA, titulo: nombre };
  return {
    carpeta: nombre.slice(0, idx).trim() || SIN_CARPETA,
    titulo: nombre.slice(idx + 1).trim() || nombre,
  };
}

function progressColor(pct: number) {
  if (pct >= 80) return "text-emerald-700";
  if (pct >= 60) return "text-amber-700";
  return "text-rose-700";
}

export default function Documentos() {
  const { documentos, addDocumento } = useStore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Add form state
  const [carpeta, setCarpeta] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<"ISO 9001" | "LEC" | "Interno">("ISO 9001");
  const [responsable, setResponsable] = useState("");
  const [frecuencia, setFrecuencia] = useState("12 meses");

  const existingFolders = useMemo(() => {
    const set = new Set<string>();
    documentos.forEach((d) => {
      const { carpeta } = splitFolder(d.nombre);
      if (carpeta !== SIN_CARPETA) set.add(carpeta);
    });
    return Array.from(set).sort();
  }, [documentos]);

  const filteredDocs = useMemo(() => {
    const q = search.toLowerCase();
    return documentos.filter(
      (doc) =>
        doc.nombre.toLowerCase().includes(q) ||
        doc.categoria.toLowerCase().includes(q) ||
        doc.responsable.toLowerCase().includes(q),
    );
  }, [documentos, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Documento[]>();
    filteredDocs.forEach((doc) => {
      const { carpeta } = splitFolder(doc.nombre);
      const arr = groups.get(carpeta) ?? [];
      arr.push(doc);
      groups.set(carpeta, arr);
    });
    return Array.from(groups.entries())
      .map(([carpeta, docs]) => {
        const total = docs.length;
        const vigentes = docs.filter((d) => d.estado === "vigente").length;
        const porVencer = docs.filter((d) => d.estado === "por_vencer").length;
        const vencidos = docs.filter((d) => d.estado === "vencido").length;
        const pct = total === 0 ? 0 : Math.round((vigentes / total) * 100);
        return { carpeta, docs, total, vigentes, porVencer, vencidos, pct };
      })
      .sort((a, b) => {
        if (a.carpeta === SIN_CARPETA) return 1;
        if (b.carpeta === SIN_CARPETA) return -1;
        return a.carpeta.localeCompare(b.carpeta);
      });
  }, [filteredDocs]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCarpeta = carpeta.trim();
    const finalTitulo = titulo.trim();
    const nombre = finalCarpeta ? `${finalCarpeta}/${finalTitulo}` : finalTitulo;
    addDocumento({
      nombre,
      categoria,
      clausulasIso: categoria === "ISO 9001" ? ["4.1"] : [],
      version: "v1.0",
      ultimaRevision: new Date(),
      proximaRevision: addDays(new Date(), 365),
      estado: "vigente",
      responsable,
      frecuencia,
      historial: [
        {
          version: "v1.0",
          fecha: new Date(),
          autor: responsable,
          cambio: "Creación inicial",
        },
      ],
    });
    setIsAddOpen(false);
    setCarpeta("");
    setTitulo("");
    setResponsable("");
  };

  return (
    <div className="space-y-6 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestión del registro documental ISO 9001 y LEC, organizado por carpeta.
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Agregar documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Agregar nuevo documento</DialogTitle>
              <DialogDescription>
                Indicá la carpeta y el nombre. Si dejás la carpeta vacía, irá a “Sin
                carpeta”.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="carpeta">Carpeta</Label>
                <Input
                  id="carpeta"
                  value={carpeta}
                  onChange={(e) => setCarpeta(e.target.value)}
                  list="folder-options"
                  placeholder="Ej.: Evaluaciones de desempeño"
                />
                <datalist id="folder-options">
                  {existingFolders.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="titulo">Nombre del documento</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej.: Evaluación de desempeño - García A."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={categoria}
                  onValueChange={(v: any) => setCategoria(v)}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISO 9001">ISO 9001</SelectItem>
                    <SelectItem value="LEC">LEC</SelectItem>
                    <SelectItem value="Interno">Interno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsable">Responsable</Label>
                <Input
                  id="responsable"
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frecuencia">Frecuencia de revisión</Label>
                <Select value={frecuencia} onValueChange={setFrecuencia}>
                  <SelectTrigger id="frecuencia">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 meses">6 meses</SelectItem>
                    <SelectItem value="12 meses">12 meses</SelectItem>
                    <SelectItem value="24 meses">24 meses</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Guardar documento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, carpeta, categoría o responsable…"
              className="w-full pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {grouped.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground text-sm">
              No se encontraron documentos.
            </CardContent>
          </Card>
        )}

        {grouped.map((group) => {
          const isCollapsed = collapsed[group.carpeta];
          return (
            <Card key={group.carpeta} className="overflow-hidden">
              <button
                type="button"
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [group.carpeta]: !c[group.carpeta] }))
                }
                className="w-full text-left px-5 py-4 flex items-center gap-4 hover-elevate"
              >
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    !isCollapsed && "rotate-90",
                  )}
                />
                {isCollapsed ? (
                  <Folder className="w-5 h-5 text-slate-500" />
                ) : (
                  <FolderOpen className="w-5 h-5 text-emerald-600" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{group.carpeta}</h3>
                    <span className="text-xs text-muted-foreground">
                      {group.total} documento{group.total === 1 ? "" : "s"}
                    </span>
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
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={group.pct} className="h-1.5 flex-1 max-w-md" />
                    <span
                      className={cn(
                        "text-sm font-semibold tabular-nums w-12 text-right",
                        progressColor(group.pct),
                      )}
                    >
                      {group.pct}%
                    </span>
                  </div>
                </div>
              </button>

              {!isCollapsed && (
                <div className="border-t">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/40 text-muted-foreground text-xs uppercase">
                      <tr>
                        <th className="px-5 py-2.5 font-medium">Nombre</th>
                        <th className="px-4 py-2.5 font-medium">Categoría</th>
                        <th className="px-4 py-2.5 font-medium">Versión</th>
                        <th className="px-4 py-2.5 font-medium">Estado</th>
                        <th className="px-4 py-2.5 font-medium">Próxima revisión</th>
                        <th className="px-4 py-2.5 font-medium">Responsable</th>
                        <th className="px-4 py-2.5 font-medium text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {group.docs.map((doc) => {
                        const { titulo } = splitFolder(doc.nombre);
                        return (
                          <tr
                            key={doc.id}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-5 py-3 font-medium text-foreground">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span>{titulo}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {doc.categoria}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {doc.version}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  doc.estado === "vigente"
                                    ? "bg-success hover:bg-success text-success-foreground"
                                    : doc.estado === "por_vencer"
                                    ? "bg-warning hover:bg-warning text-warning-foreground"
                                    : "bg-destructive text-white"
                                }
                              >
                                {doc.estado === "vigente"
                                  ? "Vigente"
                                  : doc.estado === "por_vencer"
                                  ? "Por vencer"
                                  : "Vencido"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(doc.proximaRevision)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {doc.responsable}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Sheet>
                                <SheetTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDoc(doc)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" /> Ver
                                  </Button>
                                </SheetTrigger>
                                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                  {selectedDoc && selectedDoc.id === doc.id && (
                                    <DocumentoDetail doc={selectedDoc} />
                                  )}
                                </SheetContent>
                              </Sheet>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function DocumentoDetail({ doc }: { doc: Documento }) {
  const { carpeta, titulo } = splitFolder(doc.nombre);
  return (
    <>
      <SheetHeader className="mb-6">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="outline">{doc.categoria}</Badge>
          <Badge
            className={
              doc.estado === "vigente"
                ? "bg-success hover:bg-success text-success-foreground"
                : doc.estado === "por_vencer"
                ? "bg-warning hover:bg-warning text-warning-foreground"
                : "bg-destructive text-white"
            }
          >
            {doc.estado}
          </Badge>
          {carpeta !== SIN_CARPETA && (
            <Badge variant="secondary" className="text-xs">
              <Folder className="w-3 h-3 mr-1" />
              {carpeta}
            </Badge>
          )}
        </div>
        <SheetTitle className="text-2xl">{titulo}</SheetTitle>
        <SheetDescription>Versión actual: {doc.version}</SheetDescription>
      </SheetHeader>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Responsable</p>
            <p className="text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-muted-foreground" /> {doc.responsable}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Frecuencia</p>
            <p className="text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" /> {doc.frecuencia}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Última revisión</p>
            <p className="text-sm flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              {formatDate(doc.ultimaRevision)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Próxima revisión</p>
            <p className="text-sm flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              {formatDate(doc.proximaRevision)}
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Vinculaciones
          </h4>
          <div className="space-y-2">
            {doc.clausulasIso.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cláusulas ISO 9001</p>
                <div className="flex flex-wrap gap-1">
                  {doc.clausulasIso.map((c) => (
                    <Badge key={c} variant="secondary" className="text-xs">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {doc.requisitoLec && (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Requisito LEC</p>
                <Badge
                  variant="outline"
                  className="text-xs bg-sidebar-accent/10 border-sidebar-primary/20 text-sidebar-primary"
                >
                  {doc.requisitoLec}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-semibold">Historial de versiones</h4>
            <Button variant="outline" size="sm" className="h-7 text-xs">
              <UploadCloud className="w-3 h-3 mr-1" /> Nueva versión
            </Button>
          </div>
          <div className="space-y-3">
            {doc.historial.map((h, i) => (
              <div key={i} className="text-sm border-l-2 border-muted pl-3 py-1">
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="font-medium">{h.version}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(h.fecha)}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">{h.cambio}</p>
                <p className="text-xs mt-1 italic">— {h.autor}</p>
              </div>
            ))}
            {doc.historial.length === 0 && (
              <p className="text-xs text-muted-foreground">Sin historial registrado.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
