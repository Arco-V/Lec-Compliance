import { useState } from "react";
import { useStore, Documento } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  UploadCloud, 
  Clock, 
  Calendar as CalendarIcon,
  Tag,
  User
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/dates";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDays } from "date-fns";

export default function Documentos() {
  const { documentos, addDocumento, updateDocumento } = useStore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null);
  
  // Add form state
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState<"ISO 9001" | "LEC" | "Interno">("ISO 9001");
  const [responsable, setResponsable] = useState("");
  const [frecuencia, setFrecuencia] = useState("12 meses");
  
  const filteredDocs = documentos.filter(doc => 
    doc.nombre.toLowerCase().includes(search.toLowerCase()) || 
    doc.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocumento({
      nombre,
      categoria,
      clausulasIso: categoria === "ISO 9001" ? ["4.1"] : [],
      version: "v1.0",
      ultimaRevision: new Date(),
      proximaRevision: addDays(new Date(), 365), // +12 months simplistic
      estado: "vigente",
      responsable,
      frecuencia,
      historial: [{ version: "v1.0", fecha: new Date(), autor: responsable, cambio: "Creación inicial" }]
    });
    setIsAddOpen(false);
    setNombre("");
    setResponsable("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Documentos</h1>
          <p className="text-muted-foreground mt-1">Gestión del registro documental ISO 9001 y LEC.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0"><Plus className="w-4 h-4 mr-2" /> Agregar documento</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar nuevo documento</DialogTitle>
              <DialogDescription>
                Cargá los datos del nuevo documento para el registro.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Documento</Label>
                <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={categoria} onValueChange={(v: any) => setCategoria(v)}>
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
                <Input id="responsable" value={responsable} onChange={(e) => setResponsable(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frecuencia">Frecuencia de Revisión</Label>
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
              <Button type="submit" className="w-full">Guardar Documento</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar documento..." 
                className="w-full pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="shrink-0"><Filter className="w-4 h-4 mr-2" /> Filtrar</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-t">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Versión</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Próxima Revisión</th>
                  <th className="px-4 py-3 font-medium">Responsable</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocs.length > 0 ? (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {doc.nombre}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.categoria}</td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.version}</td>
                      <td className="px-4 py-3">
                        <Badge 
                          variant={doc.estado === 'vigente' ? 'default' : doc.estado === 'por_vencer' ? 'secondary' : 'destructive'}
                          className={
                            doc.estado === 'vigente' ? 'bg-success hover:bg-success text-success-foreground' : 
                            doc.estado === 'por_vencer' ? 'bg-warning hover:bg-warning text-warning-foreground' : ''
                          }
                        >
                          {doc.estado === 'vigente' ? 'Vigente' : doc.estado === 'por_vencer' ? 'Por vencer' : 'Vencido'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(doc.proximaRevision)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{doc.responsable}</td>
                      <td className="px-4 py-3 text-right">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDoc(doc)}>
                              <Eye className="w-4 h-4 mr-1" /> Ver
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                            {selectedDoc && selectedDoc.id === doc.id && (
                              <>
                                <SheetHeader className="mb-6">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline">{selectedDoc.categoria}</Badge>
                                    <Badge 
                                      className={
                                        selectedDoc.estado === 'vigente' ? 'bg-success hover:bg-success text-success-foreground' : 
                                        selectedDoc.estado === 'por_vencer' ? 'bg-warning hover:bg-warning text-warning-foreground' : 'bg-destructive'
                                      }
                                    >
                                      {selectedDoc.estado}
                                    </Badge>
                                  </div>
                                  <SheetTitle className="text-2xl">{selectedDoc.nombre}</SheetTitle>
                                  <SheetDescription>
                                    Versión actual: {selectedDoc.version}
                                  </SheetDescription>
                                </SheetHeader>
                                
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Responsable</p>
                                      <p className="text-sm flex items-center gap-1.5"><User className="w-4 h-4 text-muted-foreground"/> {selectedDoc.responsable}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Frecuencia</p>
                                      <p className="text-sm flex items-center gap-1.5"><Clock className="w-4 h-4 text-muted-foreground"/> {selectedDoc.frecuencia}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Última Revisión</p>
                                      <p className="text-sm flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-muted-foreground"/> {formatDate(selectedDoc.ultimaRevision)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground mb-1">Próxima Revisión</p>
                                      <p className="text-sm flex items-center gap-1.5"><CalendarIcon className="w-4 h-4 text-muted-foreground"/> {formatDate(selectedDoc.proximaRevision)}</p>
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                      <Tag className="w-4 h-4" /> Vinculaciones
                                    </h4>
                                    <div className="space-y-2">
                                      {selectedDoc.clausulasIso.length > 0 && (
                                        <div>
                                          <p className="text-xs text-muted-foreground mb-1">Cláusulas ISO 9001</p>
                                          <div className="flex flex-wrap gap-1">
                                            {selectedDoc.clausulasIso.map(c => (
                                              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {selectedDoc.requisitoLec && (
                                        <div className="mt-2">
                                          <p className="text-xs text-muted-foreground mb-1">Requisito LEC</p>
                                          <Badge variant="outline" className="text-xs bg-sidebar-accent/10 border-sidebar-primary/20 text-sidebar-primary">{selectedDoc.requisitoLec}</Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-sm font-semibold">Historial de Versiones</h4>
                                      <Button variant="outline" size="sm" className="h-7 text-xs">
                                        <UploadCloud className="w-3 h-3 mr-1" /> Nueva Versión
                                      </Button>
                                    </div>
                                    <div className="space-y-3">
                                      {selectedDoc.historial.map((h, i) => (
                                        <div key={i} className="text-sm border-l-2 border-muted pl-3 py-1">
                                          <div className="flex items-baseline justify-between mb-0.5">
                                            <span className="font-medium">{h.version}</span>
                                            <span className="text-xs text-muted-foreground">{formatDate(h.fecha)}</span>
                                          </div>
                                          <p className="text-muted-foreground text-xs">{h.cambio}</p>
                                          <p className="text-xs mt-1 italic">— {h.autor}</p>
                                        </div>
                                      ))}
                                      {selectedDoc.historial.length === 0 && (
                                        <p className="text-xs text-muted-foreground">Sin historial registrado.</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
                          </SheetContent>
                        </Sheet>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No se encontraron documentos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}