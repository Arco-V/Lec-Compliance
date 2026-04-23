import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Plus,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Circle,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { formatDate, formatRelativeTime } from "@/lib/dates";
import {
  useStore,
  type Auditoria,
  type AuditoriaTipo,
  generateChecklistForClauses,
} from "@/store/useStore";

const ISO_CLAUSES = [
  { value: "4", label: "4. Contexto de la organización" },
  { value: "5", label: "5. Liderazgo" },
  { value: "6", label: "6. Planificación" },
  { value: "7", label: "7. Apoyo" },
  { value: "8", label: "8. Operación" },
  { value: "9", label: "9. Evaluación del desempeño" },
  { value: "10", label: "10. Mejora" },
];

function tipoBadge(tipo: AuditoriaTipo) {
  if (tipo === "Externa") return "bg-violet-100 text-violet-800 border-violet-200";
  if (tipo === "Seguimiento") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
}

function estadoBadge(estado: Auditoria["estado"]) {
  if (estado === "Completada") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (estado === "En curso") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function checklistProgress(a: Auditoria) {
  if (a.checklist.length === 0) return 0;
  const done = a.checklist.filter((c) => c.cubierto).length;
  return Math.round((done / a.checklist.length) * 100);
}

export default function Auditorias() {
  const { toast } = useToast();
  const auditorias = useStore((s) => s.auditorias);
  const addAuditoria = useStore((s) => s.addAuditoria);
  const updateAuditoria = useStore((s) => s.updateAuditoria);
  const deleteAuditoria = useStore((s) => s.deleteAuditoria);
  const toggleChecklistItem = useStore((s) => s.toggleChecklistItem);
  const addHallazgo = useStore((s) => s.addHallazgo);

  const [cursor, setCursor] = useState(new Date());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  // New audit form state
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(format(addDays(new Date(), 14), "yyyy-MM-dd"));
  const [tipo, setTipo] = useState<AuditoriaTipo>("Interna");
  const [responsable, setResponsable] = useState("");
  const [alcance, setAlcance] = useState<string[]>(["7", "8"]);
  const [notas, setNotas] = useState("");

  const selected = auditorias.find((a) => a.id === selectedId) ?? null;

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    return days;
  }, [cursor]);

  const auditsByDay = useMemo(() => {
    const map = new Map<string, Auditoria[]>();
    auditorias.forEach((a) => {
      const key = format(new Date(a.fecha), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    });
    return map;
  }, [auditorias]);

  const upcoming = useMemo(() => {
    return [...auditorias]
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .filter((a) => a.estado !== "Completada")
      .slice(0, 6);
  }, [auditorias]);

  const completadas = useMemo(
    () => auditorias.filter((a) => a.estado === "Completada"),
    [auditorias],
  );

  function resetForm() {
    setTitulo("");
    setFecha(format(addDays(new Date(), 14), "yyyy-MM-dd"));
    setTipo("Interna");
    setResponsable("");
    setAlcance(["7", "8"]);
    setNotas("");
  }

  function handleCreate() {
    if (!titulo.trim() || !responsable.trim() || alcance.length === 0) {
      toast({
        title: "Faltan datos",
        description: "Completá título, responsable y al menos una cláusula.",
        variant: "destructive",
      });
      return;
    }
    addAuditoria({
      titulo: titulo.trim(),
      fecha: new Date(fecha),
      tipo,
      alcance,
      responsable: responsable.trim(),
      notas: notas.trim(),
    });
    toast({
      title: "Auditoría programada",
      description: `Se generó el checklist con ${alcance.reduce(
        (acc, c) => acc + (generateChecklistForClauses([c]).length),
        0,
      )} ítems de evidencia.`,
    });
    setShowNew(false);
    resetForm();
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CalendarCheck className="h-8 w-8 text-emerald-600" />
            Calendario de auditorías
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Programá auditorías internas y externas, y generá checklists de evidencias
            automáticamente por cláusula ISO 9001.
          </p>
        </div>

        <Dialog
          open={showNew}
          onOpenChange={(o) => {
            setShowNew(o);
            if (!o) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Programar auditoría
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nueva auditoría</DialogTitle>
              <DialogDescription>
                El checklist de evidencias se genera automáticamente según las cláusulas
                ISO 9001 que incluyas en el alcance.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <Label>Título</Label>
                <Input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej.: Auditoría interna Q3 — Calidad y Operaciones"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={tipo} onValueChange={(v) => setTipo(v as AuditoriaTipo)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Interna">Interna</SelectItem>
                      <SelectItem value="Externa">Externa</SelectItem>
                      <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Responsable</Label>
                <Input
                  value={responsable}
                  onChange={(e) => setResponsable(e.target.value)}
                  placeholder="Ej.: María Fernández"
                />
              </div>

              <div>
                <Label className="mb-2 block">Alcance (cláusulas ISO 9001)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ISO_CLAUSES.map((c) => {
                    const checked = alcance.includes(c.value);
                    return (
                      <label
                        key={c.value}
                        className={cn(
                          "flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
                          checked
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : "border-slate-200 hover:border-slate-300",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) => {
                            setAlcance((prev) =>
                              v ? [...prev, c.value] : prev.filter((x) => x !== c.value),
                            );
                          }}
                        />
                        <span>{c.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label>Notas</Label>
                <Textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Foco de la auditoría, alcance adicional, etc."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNew(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate}>Programar y generar checklist</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base capitalize">
              {format(cursor, "MMMM yyyy", { locale: es })}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCursor(subMonths(cursor, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCursor(new Date())}
              >
                Hoy
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCursor(addMonths(cursor, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 text-xs uppercase tracking-wider text-slate-400 mb-2">
              {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                <div key={d} className="px-2 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const key = format(day, "yyyy-MM-dd");
                const audits = auditsByDay.get(key) ?? [];
                const inMonth = isSameMonth(day, cursor);
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={key}
                    className={cn(
                      "min-h-[88px] rounded-md border p-1.5 flex flex-col gap-1 text-xs transition-colors",
                      inMonth ? "bg-white border-slate-200" : "bg-slate-50/60 border-slate-100 text-slate-400",
                      isToday && "ring-2 ring-emerald-500/40 border-emerald-300",
                    )}
                  >
                    <div className={cn("font-medium", isToday && "text-emerald-700")}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {audits.slice(0, 2).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedId(a.id)}
                          className={cn(
                            "w-full text-left truncate rounded px-1.5 py-0.5 border text-[11px] hover:opacity-90",
                            tipoBadge(a.tipo),
                          )}
                          title={a.titulo}
                        >
                          {a.titulo}
                        </button>
                      ))}
                      {audits.length > 2 && (
                        <div className="text-[10px] text-slate-500 px-1">
                          +{audits.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Próximas auditorías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.length === 0 && (
              <div className="text-sm text-slate-500 py-6 text-center">
                <ClipboardList className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                No hay auditorías programadas. Programá la primera para empezar a
                construir tu evidencia.
              </div>
            )}
            {upcoming.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className="w-full text-left rounded-lg border border-slate-200 p-3 hover-elevate transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-slate-900 truncate">
                      {a.titulo}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatDate(a.fecha)} · {formatRelativeTime(a.fecha)}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0", tipoBadge(a.tipo))}>
                    {a.tipo}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={checklistProgress(a)} className="h-1.5 flex-1" />
                  <span className="text-[11px] text-slate-500 tabular-nums w-9 text-right">
                    {checklistProgress(a)}%
                  </span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {completadas.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Historial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100">
              {completadas.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className="w-full text-left flex items-center justify-between gap-4 py-3 hover-elevate rounded-md px-2 -mx-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-slate-900 truncate">
                        {a.titulo}
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatDate(a.fecha)} · {a.responsable}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.hallazgos.length > 0 && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        {a.hallazgos.length} hallazgo{a.hallazgos.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                    <Badge variant="outline" className={estadoBadge(a.estado)}>
                      {a.estado}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AuditoriaSheet
        auditoria={selected}
        onClose={() => setSelectedId(null)}
        onToggleItem={(itemId) => selected && toggleChecklistItem(selected.id, itemId)}
        onAddHallazgo={(h) => selected && addHallazgo(selected.id, h)}
        onUpdate={(d) => selected && updateAuditoria(selected.id, d)}
        onDelete={() => {
          if (!selected) return;
          deleteAuditoria(selected.id);
          setSelectedId(null);
          toast({ title: "Auditoría eliminada" });
        }}
      />
    </div>
  );
}

function AuditoriaSheet({
  auditoria,
  onClose,
  onToggleItem,
  onAddHallazgo,
  onUpdate,
  onDelete,
}: {
  auditoria: Auditoria | null;
  onClose: () => void;
  onToggleItem: (itemId: string) => void;
  onAddHallazgo: (h: { severidad: "Mayor" | "Menor" | "Observación"; descripcion: string }) => void;
  onUpdate: (d: Partial<Auditoria>) => void;
  onDelete: () => void;
}) {
  const [nuevoHallazgo, setNuevoHallazgo] = useState("");
  const [severidad, setSeveridad] = useState<"Mayor" | "Menor" | "Observación">("Menor");

  if (!auditoria) return null;

  const progress = checklistProgress(auditoria);
  const grouped = auditoria.checklist.reduce<Record<string, typeof auditoria.checklist>>(
    (acc, item) => {
      acc[item.clausula] = acc[item.clausula] ?? [];
      acc[item.clausula].push(item);
      return acc;
    },
    {},
  );

  return (
    <Sheet open={!!auditoria} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-left">{auditoria.titulo}</SheetTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription className="text-left">
            {formatDate(auditoria.fecha)} · {formatRelativeTime(auditoria.fecha)} · {auditoria.responsable}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={tipoBadge(auditoria.tipo)}>
              {auditoria.tipo}
            </Badge>
            <Badge variant="outline" className={estadoBadge(auditoria.estado)}>
              {auditoria.estado}
            </Badge>
            <Select
              value={auditoria.estado}
              onValueChange={(v) => onUpdate({ estado: v as Auditoria["estado"] })}
            >
              <SelectTrigger className="h-7 w-[150px] text-xs">
                <SelectValue placeholder="Cambiar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Programada">Programada</SelectItem>
                <SelectItem value="En curso">En curso</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Checklist de evidencias</h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {auditoria.checklist.filter((c) => c.cubierto).length} / {auditoria.checklist.length}
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />

            <div className="space-y-4">
              {Object.entries(grouped).map(([clausula, items]) => (
                <div key={clausula} className="rounded-lg border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    {clausula}
                  </div>
                  <div className="space-y-2">
                    {items.map((it) => (
                      <label
                        key={it.id}
                        className="flex items-start gap-2 cursor-pointer rounded-md p-1.5 hover:bg-slate-50"
                      >
                        <Checkbox
                          checked={it.cubierto}
                          onCheckedChange={() => onToggleItem(it.id)}
                          className="mt-0.5"
                        />
                        <span
                          className={cn(
                            "text-sm",
                            it.cubierto ? "text-slate-400 line-through" : "text-slate-700",
                          )}
                        >
                          {it.descripcion}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Hallazgos
            </h3>
            {auditoria.hallazgos.length === 0 && (
              <p className="text-xs text-slate-500 mb-3">
                Aún no se registraron hallazgos.
              </p>
            )}
            <div className="space-y-2 mb-3">
              {auditoria.hallazgos.map((h) => (
                <div
                  key={h.id}
                  className="flex items-start gap-2 rounded-md border border-slate-200 p-2.5"
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "shrink-0",
                      h.severidad === "Mayor" && "bg-rose-50 text-rose-800 border-rose-200",
                      h.severidad === "Menor" && "bg-amber-50 text-amber-800 border-amber-200",
                      h.severidad === "Observación" && "bg-blue-50 text-blue-800 border-blue-200",
                    )}
                  >
                    {h.severidad}
                  </Badge>
                  <span className="text-sm text-slate-700">{h.descripcion}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-start">
              <Select value={severidad} onValueChange={(v) => setSeveridad(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mayor">Mayor</SelectItem>
                  <SelectItem value="Menor">Menor</SelectItem>
                  <SelectItem value="Observación">Observación</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={nuevoHallazgo}
                onChange={(e) => setNuevoHallazgo(e.target.value)}
                placeholder="Describí el hallazgo"
              />
              <Button
                onClick={() => {
                  if (!nuevoHallazgo.trim()) return;
                  onAddHallazgo({ severidad, descripcion: nuevoHallazgo.trim() });
                  setNuevoHallazgo("");
                }}
              >
                Agregar
              </Button>
            </div>
          </div>

          {auditoria.notas && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Notas</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">
                {auditoria.notas}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Alcance</h3>
            <div className="flex flex-wrap gap-1.5">
              {auditoria.alcance.map((c) => (
                <Badge key={c} variant="outline" className="bg-slate-50">
                  <Circle className="h-2 w-2 mr-1.5 fill-emerald-500 text-emerald-500" />
                  Cláusula {c}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <Button variant="ghost" onClick={onDelete} className="text-rose-600 hover:text-rose-700">
              Eliminar
            </Button>
            <Button variant="outline" onClick={onClose}>Cerrar</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
