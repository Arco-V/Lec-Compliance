import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Files, 
  Bell, 
  Settings,
  ShieldCheck
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documentos", label: "Documentos", icon: FileText },
  { href: "/requisitos-lec", label: "Requisitos LEC", icon: CheckSquare },
  { href: "/evidencias", label: "Evidencias", icon: Files },
  { href: "/alertas", label: "Alertas", icon: Bell },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const score = useStore((state) => state.getScore());
  const empresa = useStore((state) => state.empresa);

  const scoreColor = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen fixed top-0 left-0 border-r border-sidebar-border shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-lg leading-tight">LEC Compliance</h1>
            <p className="text-xs text-sidebar-foreground/70">{empresa.nombre}</p>
          </div>
        </div>

        <div className="bg-sidebar-accent/50 rounded-lg p-4 mb-8 border border-sidebar-accent border-opacity-50">
          <p className="text-xs text-sidebar-foreground/70 mb-1 uppercase tracking-wider font-semibold">Score de Cumplimiento</p>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", scoreColor)}>{score}%</span>
            <span className="text-xs text-sidebar-foreground/50">/ 100%</span>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 text-xs text-sidebar-foreground/40">
        <p>LEC Compliance Pro</p>
        <p>v1.0.0-beta</p>
      </div>
    </aside>
  );
}
