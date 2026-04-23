import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Save, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Configuracion() {
  const { empresa, setEmpresa, usuarios } = useStore();
  const { toast } = useToast();
  
  // Local state for the form
  const [formData, setFormData] = useState({
    nombre: empresa.nombre,
    cuit: empresa.cuit,
    tamano: empresa.tamano,
    certificadora: empresa.certificadora,
    empleados: empresa.empleados.toString()
  });

  const handleSaveEmpresa = () => {
    setEmpresa({
      ...formData,
      empleados: Number(formData.empleados)
    });
    toast({
      title: "Configuración guardada",
      description: "Los datos de la empresa se han actualizado correctamente.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">Administrá la información de tu cuenta y los usuarios de la plataforma.</p>
      </div>

      <Tabs defaultValue="empresa">
        <TabsList className="mb-6">
          <TabsTrigger value="empresa" className="gap-2"><Building2 className="w-4 h-4" /> Datos de la Empresa</TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2"><Users className="w-4 h-4" /> Gestión de Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>
                Estos datos afectan los umbrales de cumplimiento requeridos por la Ley de Economía del Conocimiento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Razón Social</Label>
                  <Input 
                    id="nombre" 
                    value={formData.nombre} 
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuit">CUIT</Label>
                  <Input 
                    id="cuit" 
                    value={formData.cuit} 
                    onChange={(e) => setFormData({...formData, cuit: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tamano">Tamaño de Empresa (PyME)</Label>
                  <Select 
                    value={formData.tamano} 
                    onValueChange={(val: any) => setFormData({...formData, tamano: val})}
                  >
                    <SelectTrigger id="tamano">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Micro">Micro (Exportaciones req: 4%)</SelectItem>
                      <SelectItem value="Pequeña">Pequeña (Exportaciones req: 10%)</SelectItem>
                      <SelectItem value="Mediana">Mediana (Exportaciones req: 10%)</SelectItem>
                      <SelectItem value="Grande">Grande (Exportaciones req: 13%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empleados">Cantidad de Empleados</Label>
                  <Input 
                    id="empleados" 
                    type="number"
                    value={formData.empleados} 
                    onChange={(e) => setFormData({...formData, empleados: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificadora">Certificadora ISO 9001</Label>
                  <Input 
                    id="certificadora" 
                    value={formData.certificadora} 
                    onChange={(e) => setFormData({...formData, certificadora: e.target.value})} 
                  />
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-md border mt-6 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Fecha de Inscripción LEC</p>
                  <p className="font-medium">{format(empresa.fechaInscripcionLec, 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Próxima Revalidación (Bianual)</p>
                  <p className="font-medium text-primary">
                    {format(new Date(empresa.fechaInscripcionLec.getTime() + 1000 * 60 * 60 * 24 * 365 * 2), 'dd/MM/yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t p-6">
              <Button onClick={handleSaveEmpresa}><Save className="w-4 h-4 mr-2" /> Guardar Cambios</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Miembros del Equipo</CardTitle>
                <CardDescription>
                  Administrá quiénes tienen acceso a la documentación y reportes.
                </CardDescription>
              </div>
              <Button variant="outline" className="shrink-0"><Mail className="w-4 h-4 mr-2" /> Invitar Usuario</Button>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {usuarios.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-card">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary uppercase">{u.nombre.slice(0,2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground">{u.nombre}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="font-normal">{u.rol}</Badge>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">Editar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}