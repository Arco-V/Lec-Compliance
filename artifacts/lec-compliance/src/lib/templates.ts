import type { Documento } from "@/store/useStore";

export type CampoTipo = "text" | "textarea" | "number" | "select" | "rating" | "date";

export interface CampoTemplate {
  key: string;
  label: string;
  tipo: CampoTipo;
  placeholder?: string;
  opciones?: string[];
  obligatorio?: boolean;
  ayuda?: string;
}

export interface PlantillaDoc {
  key: string;
  nombre: string;
  descripcion: string;
  campos: CampoTemplate[];
}

const RATING_OPTS = ["1", "2", "3", "4", "5"];

export const PLANTILLAS: PlantillaDoc[] = [
  {
    key: "evaluacion-desempeno",
    nombre: "Evaluación de desempeño",
    descripcion: "Evaluación periódica de un colaborador.",
    campos: [
      { key: "empleado", label: "Empleado evaluado", tipo: "text", obligatorio: true },
      { key: "puesto", label: "Puesto", tipo: "text" },
      { key: "periodo", label: "Período evaluado", tipo: "text", placeholder: "Ej.: Q1 2026" },
      { key: "calidad", label: "Calidad del trabajo (1-5)", tipo: "rating", opciones: RATING_OPTS, obligatorio: true },
      { key: "objetivos", label: "Cumplimiento de objetivos (1-5)", tipo: "rating", opciones: RATING_OPTS, obligatorio: true },
      { key: "equipo", label: "Trabajo en equipo (1-5)", tipo: "rating", opciones: RATING_OPTS },
      { key: "iniciativa", label: "Iniciativa y autonomía (1-5)", tipo: "rating", opciones: RATING_OPTS },
      { key: "logros", label: "Principales logros", tipo: "textarea" },
      { key: "mejora", label: "Áreas de mejora", tipo: "textarea" },
      { key: "plan", label: "Plan de acción acordado", tipo: "textarea" },
      { key: "evaluador", label: "Evaluador", tipo: "text", obligatorio: true },
      { key: "observaciones", label: "Observaciones", tipo: "textarea" },
    ],
  },
  {
    key: "capacitacion",
    nombre: "Registro de capacitación",
    descripcion: "Resumen de una actividad de capacitación realizada.",
    campos: [
      { key: "curso", label: "Curso o tema", tipo: "text", obligatorio: true },
      { key: "modalidad", label: "Modalidad", tipo: "select", opciones: ["Presencial", "Virtual", "Mixta"] },
      { key: "horas", label: "Horas totales", tipo: "number" },
      { key: "instructor", label: "Instructor / proveedor", tipo: "text" },
      { key: "participantes", label: "Participantes", tipo: "textarea", placeholder: "Listá los nombres separados por coma" },
      { key: "objetivos", label: "Objetivos de aprendizaje", tipo: "textarea" },
      { key: "resultados", label: "Resultados / evaluación", tipo: "textarea" },
      { key: "proximos", label: "Próximos pasos", tipo: "textarea" },
    ],
  },
  {
    key: "procedimiento",
    nombre: "Procedimiento",
    descripcion: "Procedimiento operativo o de gestión.",
    campos: [
      { key: "alcance", label: "Alcance", tipo: "textarea", obligatorio: true },
      { key: "responsables", label: "Responsables", tipo: "textarea" },
      { key: "pasos", label: "Pasos clave", tipo: "textarea", obligatorio: true, placeholder: "1. ...\n2. ...\n3. ..." },
      { key: "riesgos", label: "Riesgos identificados", tipo: "textarea" },
      { key: "controles", label: "Controles aplicados", tipo: "textarea" },
      { key: "cambios", label: "Cambios respecto a versión anterior", tipo: "textarea", obligatorio: true },
    ],
  },
  {
    key: "politica",
    nombre: "Política",
    descripcion: "Política organizacional.",
    campos: [
      { key: "proposito", label: "Propósito", tipo: "textarea", obligatorio: true },
      { key: "alcance", label: "Alcance", tipo: "textarea", obligatorio: true },
      { key: "compromisos", label: "Compromisos", tipo: "textarea" },
      { key: "roles", label: "Roles y responsabilidades", tipo: "textarea" },
      { key: "aprobador", label: "Aprobado por", tipo: "text", obligatorio: true },
      { key: "cambios", label: "Cambios respecto a versión anterior", tipo: "textarea" },
    ],
  },
  {
    key: "manual",
    nombre: "Manual",
    descripcion: "Manual del sistema o proceso.",
    campos: [
      { key: "secciones", label: "Secciones modificadas", tipo: "textarea", obligatorio: true },
      { key: "resumen", label: "Resumen de cambios", tipo: "textarea", obligatorio: true },
      { key: "aprobador", label: "Aprobado por", tipo: "text", obligatorio: true },
    ],
  },
  {
    key: "exportaciones",
    nombre: "Registro de exportación",
    descripcion: "Resumen de operaciones de exportación.",
    campos: [
      { key: "periodo", label: "Período", tipo: "text", placeholder: "Ej.: Marzo 2026", obligatorio: true },
      { key: "cliente", label: "Cliente principal", tipo: "text" },
      { key: "destino", label: "País de destino", tipo: "text" },
      { key: "monto", label: "Monto total (USD)", tipo: "number" },
      { key: "operaciones", label: "Detalle de operaciones", tipo: "textarea" },
      { key: "observaciones", label: "Observaciones", tipo: "textarea" },
    ],
  },
  {
    key: "generico",
    nombre: "Actualización genérica",
    descripcion: "Plantilla por defecto para actualizar cualquier documento.",
    campos: [
      { key: "motivo", label: "Motivo de la actualización", tipo: "textarea", obligatorio: true },
      { key: "cambios", label: "Resumen de cambios", tipo: "textarea", obligatorio: true },
      { key: "responsable", label: "Responsable de la actualización", tipo: "text", obligatorio: true },
    ],
  },
];

const PLANTILLAS_INDEX = Object.fromEntries(PLANTILLAS.map((p) => [p.key, p]));

function splitFolder(nombre: string) {
  const idx = nombre.indexOf("/");
  if (idx === -1) return { carpeta: "", titulo: nombre };
  return { carpeta: nombre.slice(0, idx).trim(), titulo: nombre.slice(idx + 1).trim() };
}

export function getPlantillaForDoc(doc: Documento): PlantillaDoc {
  const { carpeta, titulo } = splitFolder(doc.nombre);
  const c = carpeta.toLowerCase();
  const t = titulo.toLowerCase();
  if (c.startsWith("evaluaciones de desempe") || t.includes("evaluación de desempeño"))
    return PLANTILLAS_INDEX["evaluacion-desempeno"];
  if (c.startsWith("capacitaciones") || t.includes("capacitación") || t.includes("capacitaciones"))
    return PLANTILLAS_INDEX["capacitacion"];
  if (c.startsWith("procedimientos")) return PLANTILLAS_INDEX["procedimiento"];
  if (c.startsWith("políticas") || c.startsWith("politicas")) return PLANTILLAS_INDEX["politica"];
  if (c.startsWith("manuales")) return PLANTILLAS_INDEX["manual"];
  if (c.startsWith("exportaciones")) return PLANTILLAS_INDEX["exportaciones"];
  return PLANTILLAS_INDEX["generico"];
}

/** Pre-fill values from the most recent versioned data (if any), plus auto-fields. */
export function getInitialDatos(doc: Documento): Record<string, string> {
  const last = [...doc.historial]
    .reverse()
    .find((h) => h.datos && Object.keys(h.datos).length > 0);
  const base: Record<string, string> = { ...(last?.datos ?? {}) };

  const { titulo } = splitFolder(doc.nombre);
  const plantilla = getPlantillaForDoc(doc);

  // Auto-fill empleado for evaluación de desempeño from titulo
  if (plantilla.key === "evaluacion-desempeno" && !base.empleado) {
    const m = titulo.match(/-\s*(.+)$/);
    if (m) base.empleado = m[1].trim();
  }
  if (!base.responsable) base.responsable = doc.responsable;
  if (!base.evaluador && plantilla.key === "evaluacion-desempeno") base.evaluador = doc.responsable;
  if (!base.aprobador && (plantilla.key === "politica" || plantilla.key === "manual"))
    base.aprobador = doc.responsable;

  return base;
}

export function bumpVersion(version: string): string {
  const m = version.match(/^v?(\d+)\.(\d+)$/);
  if (!m) return version + ".1";
  const major = parseInt(m[1], 10);
  const minor = parseInt(m[2], 10);
  return `v${major}.${minor + 1}`;
}

export function renderArchivo(
  doc: Documento,
  plantilla: PlantillaDoc,
  datos: Record<string, string>,
  nuevaVersion: string,
  fecha: Date,
): string {
  const { titulo } = splitFolder(doc.nombre);
  const lines: string[] = [];
  lines.push(`# ${titulo}`);
  lines.push("");
  lines.push(`Plantilla: ${plantilla.nombre}`);
  lines.push(`Versión: ${nuevaVersion}`);
  lines.push(`Fecha: ${fecha.toLocaleDateString("es-AR")}`);
  lines.push(`Responsable: ${doc.responsable}`);
  if (doc.requisitoLec) lines.push(`Requisito LEC: ${doc.requisitoLec}`);
  if (doc.clausulasIso.length > 0)
    lines.push(`Cláusulas ISO 9001: ${doc.clausulasIso.join(", ")}`);
  lines.push("");
  lines.push("---");
  lines.push("");
  plantilla.campos.forEach((c) => {
    const v = (datos[c.key] ?? "").toString().trim();
    lines.push(`## ${c.label}`);
    lines.push(v.length > 0 ? v : "_(sin completar)_");
    lines.push("");
  });
  return lines.join("\n");
}

export function downloadArchivo(filename: string, content: string) {
  const safe = filename.replace(/[\\/:*?"<>|]+/g, "_");
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = safe.endsWith(".md") ? safe : `${safe}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
