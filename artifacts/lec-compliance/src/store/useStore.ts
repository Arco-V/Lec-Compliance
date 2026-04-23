import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, subDays } from 'date-fns';

export type DocStatus = 'vigente' | 'por_vencer' | 'vencido';

export interface Documento {
  id: string;
  nombre: string;
  categoria: 'ISO 9001' | 'LEC' | 'Interno';
  clausulasIso: string[];
  requisitoLec?: string;
  version: string;
  ultimaRevision: Date;
  proximaRevision: Date;
  estado: DocStatus;
  responsable: string;
  frecuencia: string;
  historial: { version: string; fecha: Date; autor: string; cambio: string; datos?: Record<string, string>; archivo?: string }[];
}

export interface Alerta {
  id: string;
  tipo: 'CRITICO' | 'ADVERTENCIA' | 'INFO' | 'OK';
  descripcion: string;
  afectado: string;
  fecha: Date;
  leida: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'Admin' | 'Editor' | 'Viewer';
  avatar?: string;
}

export interface Preferencias {
  diasAvisoVencimiento: number;
}

export interface Actividad {
  id: string;
  tipo: 'I+D' | 'Capacitación';
  nombre: string;
  fecha: Date;
  monto: number;
  proveedor: string;
  certificadoAdjunto?: string;
}

export interface FacturaE {
  id: string;
  cliente: string;
  monto: number;
  fecha: Date;
}

export type AuditoriaTipo = 'Interna' | 'Externa' | 'Seguimiento';
export type AuditoriaEstado = 'Programada' | 'En curso' | 'Completada';

export interface ChecklistItem {
  id: string;
  clausula: string;
  descripcion: string;
  cubierto: boolean;
}

export interface Hallazgo {
  id: string;
  severidad: 'Mayor' | 'Menor' | 'Observación';
  descripcion: string;
}

export interface Auditoria {
  id: string;
  titulo: string;
  fecha: Date;
  tipo: AuditoriaTipo;
  alcance: string[];
  responsable: string;
  estado: AuditoriaEstado;
  checklist: ChecklistItem[];
  hallazgos: Hallazgo[];
  notas: string;
}

export interface Empresa {
  nombre: string;
  cuit: string;
  tamano: 'Micro' | 'Pequeña' | 'Mediana' | 'Grande';
  fechaInscripcionLec: Date;
  certificadora: string;
  empleados: number;
}

interface LecState {
  empresa: Empresa;
  documentos: Documento[];
  alertas: Alerta[];
  capacitacion: { invertido: number; requerido: number };
  exportaciones: { monto: number; facturacionTotal: number };
  usuarios: Usuario[];
  preferencias: Preferencias;
  actividades: Actividad[];
  facturas: FacturaE[];
  auditorias: Auditoria[];
  setEmpresa: (empresa: Partial<Empresa>) => void;
  addAuditoria: (a: Omit<Auditoria, 'id' | 'checklist' | 'hallazgos' | 'estado' | 'notas'> & { checklist?: ChecklistItem[]; estado?: AuditoriaEstado; notas?: string }) => void;
  updateAuditoria: (id: string, data: Partial<Auditoria>) => void;
  deleteAuditoria: (id: string) => void;
  toggleChecklistItem: (auditoriaId: string, itemId: string) => void;
  addHallazgo: (auditoriaId: string, h: Omit<Hallazgo, 'id'>) => void;
  addDocumento: (doc: Omit<Documento, 'id'>) => void;
  updateDocumento: (id: string, doc: Partial<Documento>) => void;
  deleteDocumento: (id: string) => void;
  markAlertaLeida: (id: string) => void;
  updateCapacitacion: (data: Partial<{ invertido: number; requerido: number }>) => void;
  updateExportaciones: (data: Partial<{ monto: number; facturacionTotal: number }>) => void;
  addUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  updatePreferencias: (preferencias: Partial<Preferencias>) => void;
  addActividad: (actividad: Omit<Actividad, 'id'>) => void;
  addFactura: (factura: Omit<FacturaE, 'id'>) => void;
  getScore: () => number;
}

const today = new Date();

const mockDocumentos: Documento[] = [
  {
    id: '1',
    nombre: 'Políticas/Política de Calidad',
    categoria: 'ISO 9001',
    clausulasIso: ['5.1', '5.2'],
    version: 'v2.1',
    ultimaRevision: subDays(today, 200),
    proximaRevision: addDays(today, 165),
    estado: 'vigente',
    responsable: 'Juan García',
    frecuencia: '12 meses',
    historial: [{ version: 'v2.1', fecha: subDays(today, 200), autor: 'Juan García', cambio: 'Actualización anual' }]
  },
  {
    id: '2',
    nombre: 'Manuales/Manual de Procesos',
    categoria: 'ISO 9001',
    clausulasIso: ['4.4', '8.1'],
    version: 'v3.0',
    ultimaRevision: subDays(today, 340),
    proximaRevision: addDays(today, 25),
    estado: 'por_vencer',
    responsable: 'María Fernández',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '3',
    nombre: 'Capacitaciones/Registro de Capacitaciones 2024',
    categoria: 'LEC',
    clausulasIso: ['7.2'],
    requisitoLec: 'Capacitación',
    version: 'v1.0',
    ultimaRevision: subDays(today, 400),
    proximaRevision: subDays(today, 35),
    estado: 'vencido',
    responsable: 'Lucía Romero',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '4',
    nombre: 'Políticas/Política de Seguridad de la Información',
    categoria: 'ISO 9001',
    clausulasIso: ['5.1'],
    version: 'v1.2',
    ultimaRevision: subDays(today, 90),
    proximaRevision: addDays(today, 275),
    estado: 'vigente',
    responsable: 'Juan García',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '5',
    nombre: 'Manuales/Manual del SGC',
    categoria: 'ISO 9001',
    clausulasIso: ['4.3', '4.4'],
    version: 'v2.0',
    ultimaRevision: subDays(today, 150),
    proximaRevision: addDays(today, 215),
    estado: 'vigente',
    responsable: 'María Fernández',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '6',
    nombre: 'Evaluaciones de desempeño/Evaluación de desempeño - García A.',
    categoria: 'Interno',
    clausulasIso: ['7.2'],
    version: 'v1.0',
    ultimaRevision: subDays(today, 60),
    proximaRevision: addDays(today, 305),
    estado: 'vigente',
    responsable: 'Lucía Romero',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '7',
    nombre: 'Evaluaciones de desempeño/Evaluación de desempeño - Pérez M.',
    categoria: 'Interno',
    clausulasIso: ['7.2'],
    version: 'v1.0',
    ultimaRevision: subDays(today, 380),
    proximaRevision: subDays(today, 15),
    estado: 'vencido',
    responsable: 'Lucía Romero',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '8',
    nombre: 'Evaluaciones de desempeño/Evaluación de desempeño - López R.',
    categoria: 'Interno',
    clausulasIso: ['7.2'],
    version: 'v1.0',
    ultimaRevision: subDays(today, 300),
    proximaRevision: addDays(today, 65),
    estado: 'vigente',
    responsable: 'Lucía Romero',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '9',
    nombre: 'Capacitaciones/Plan de Capacitación 2026',
    categoria: 'LEC',
    clausulasIso: ['7.2'],
    requisitoLec: 'Capacitación',
    version: 'v1.0',
    ultimaRevision: subDays(today, 30),
    proximaRevision: addDays(today, 335),
    estado: 'vigente',
    responsable: 'Lucía Romero',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '10',
    nombre: 'Procedimientos/Control de documentos',
    categoria: 'ISO 9001',
    clausulasIso: ['7.5'],
    version: 'v1.4',
    ultimaRevision: subDays(today, 120),
    proximaRevision: addDays(today, 245),
    estado: 'vigente',
    responsable: 'María Fernández',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '11',
    nombre: 'Procedimientos/Acciones correctivas',
    categoria: 'ISO 9001',
    clausulasIso: ['10.2'],
    version: 'v1.1',
    ultimaRevision: subDays(today, 350),
    proximaRevision: addDays(today, 15),
    estado: 'por_vencer',
    responsable: 'Juan García',
    frecuencia: '12 meses',
    historial: []
  },
  {
    id: '12',
    nombre: 'Exportaciones/Registro de operaciones de exportación',
    categoria: 'LEC',
    clausulasIso: [],
    requisitoLec: 'Exportaciones',
    version: 'v1.0',
    ultimaRevision: subDays(today, 45),
    proximaRevision: addDays(today, 320),
    estado: 'vigente',
    responsable: 'Juan García',
    frecuencia: '12 meses',
    historial: []
  }
];

const ISO_CLAUSE_TITLES: Record<string, string> = {
  '4': 'Contexto de la organización',
  '5': 'Liderazgo',
  '6': 'Planificación',
  '7': 'Apoyo',
  '8': 'Operación',
  '9': 'Evaluación del desempeño',
  '10': 'Mejora',
};

const ISO_EVIDENCE_BY_CLAUSE: Record<string, string[]> = {
  '4': ['Análisis de contexto interno y externo', 'Mapeo de partes interesadas', 'Alcance del SGC documentado'],
  '5': ['Política de Calidad firmada y vigente', 'Roles y responsabilidades asignados', 'Acta de revisión por la dirección'],
  '6': ['Matriz de riesgos y oportunidades', 'Objetivos de calidad medibles', 'Plan de acción de objetivos'],
  '7': ['Plan de capacitación del personal', 'Registros de competencias', 'Listado de equipos calibrados'],
  '8': ['Procedimientos operativos vigentes', 'Registros de control de proveedores', 'Trazabilidad de productos/servicios'],
  '9': ['Indicadores de desempeño actualizados', 'Encuestas de satisfacción de cliente', 'Programa de auditorías internas'],
  '10': ['Registro de acciones correctivas', 'Análisis de causa raíz', 'Plan de mejora continua'],
};

export function generateChecklistForClauses(clauses: string[]): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  clauses.forEach((c) => {
    const evidencias = ISO_EVIDENCE_BY_CLAUSE[c] ?? [];
    evidencias.forEach((descripcion, idx) => {
      items.push({
        id: `${c}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        clausula: `${c}. ${ISO_CLAUSE_TITLES[c] ?? ''}`.trim(),
        descripcion,
        cubierto: false,
      });
    });
  });
  return items;
}

const mockAuditorias: Auditoria[] = [
  {
    id: 'a1',
    titulo: 'Auditoría interna Q2 — Procesos operativos',
    fecha: addDays(today, 12),
    tipo: 'Interna',
    alcance: ['7', '8', '9'],
    responsable: 'María Fernández',
    estado: 'Programada',
    checklist: generateChecklistForClauses(['7', '8', '9']),
    hallazgos: [],
    notas: 'Foco en trazabilidad y control de proveedores.',
  },
  {
    id: 'a2',
    titulo: 'Auditoría externa de recertificación ISO 9001',
    fecha: addDays(today, 47),
    tipo: 'Externa',
    alcance: ['4', '5', '6', '7', '8', '9', '10'],
    responsable: 'Lucía Romero',
    estado: 'Programada',
    checklist: generateChecklistForClauses(['4', '5', '6', '7', '8', '9', '10']),
    hallazgos: [],
    notas: 'Auditoría de IRAM. Preparar paquete de evidencias.',
  },
  {
    id: 'a3',
    titulo: 'Seguimiento de hallazgos Q1',
    fecha: subDays(today, 18),
    tipo: 'Seguimiento',
    alcance: ['10'],
    responsable: 'Juan García',
    estado: 'Completada',
    checklist: generateChecklistForClauses(['10']).map((c) => ({ ...c, cubierto: true })),
    hallazgos: [
      { id: 'h1', severidad: 'Menor', descripcion: 'Falta evidencia de cierre en 2 acciones correctivas.' },
    ],
    notas: 'Cerrado con plan de acción al 30/03.',
  },
];

const mockAlertas: Alerta[] = [
  { id: '1', tipo: 'CRITICO', descripcion: 'Registro de Capacitaciones vencido', afectado: 'Registro de Capacitaciones 2024', fecha: subDays(today, 35), leida: false },
  { id: '2', tipo: 'ADVERTENCIA', descripcion: 'Manual de Procesos próximo a vencer', afectado: 'Manual de Procesos', fecha: subDays(today, 2), leida: false },
  { id: '3', tipo: 'INFO', descripcion: 'Nueva actualización de requisitos LEC publicada', afectado: 'Sistema', fecha: subDays(today, 1), leida: false },
];

export const useStore = create<LecState>()(
  persist(
    (set, get) => ({
      empresa: {
        nombre: 'TechSoft SRL',
        cuit: '30-71234567-8',
        tamano: 'Pequeña',
        fechaInscripcionLec: new Date('2023-03-15'),
        certificadora: 'IRAM',
        empleados: 38
      },
      documentos: mockDocumentos,
      alertas: mockAlertas,
      capacitacion: { invertido: 180000, requerido: 200000 },
      exportaciones: { monto: 15000000, facturacionTotal: 100000000 },
      usuarios: [
        { id: '1', nombre: 'Admin User', email: 'admin@empresa.com.ar', rol: 'Admin' }
      ],
      preferencias: { diasAvisoVencimiento: 30 },
      actividades: [],
      facturas: [],
      auditorias: mockAuditorias,

      addAuditoria: (a) => set((state) => ({
        auditorias: [
          ...state.auditorias,
          {
            ...a,
            id: Math.random().toString(36).slice(2, 11),
            estado: a.estado ?? 'Programada',
            checklist: a.checklist ?? generateChecklistForClauses(a.alcance),
            hallazgos: [],
            notas: a.notas ?? '',
          },
        ],
      })),

      updateAuditoria: (id, data) => set((state) => ({
        auditorias: state.auditorias.map((a) => a.id === id ? { ...a, ...data } : a),
      })),

      deleteAuditoria: (id) => set((state) => ({
        auditorias: state.auditorias.filter((a) => a.id !== id),
      })),

      toggleChecklistItem: (auditoriaId, itemId) => set((state) => ({
        auditorias: state.auditorias.map((a) => a.id !== auditoriaId ? a : {
          ...a,
          checklist: a.checklist.map((c) => c.id === itemId ? { ...c, cubierto: !c.cubierto } : c),
        }),
      })),

      addHallazgo: (auditoriaId, h) => set((state) => ({
        auditorias: state.auditorias.map((a) => a.id !== auditoriaId ? a : {
          ...a,
          hallazgos: [...a.hallazgos, { ...h, id: Math.random().toString(36).slice(2, 9) }],
        }),
      })),

      setEmpresa: (empresaData) => set((state) => ({ empresa: { ...state.empresa, ...empresaData } })),
      
      addDocumento: (docData) => set((state) => ({ 
        documentos: [...state.documentos, { ...docData, id: Math.random().toString(36).substr(2, 9) }] 
      })),

      updateDocumento: (id, docData) => set((state) => ({
        documentos: state.documentos.map(d => d.id === id ? { ...d, ...docData } : d)
      })),

      deleteDocumento: (id) => set((state) => ({
        documentos: state.documentos.filter(d => d.id !== id)
      })),

      markAlertaLeida: (id) => set((state) => ({
        alertas: state.alertas.map(a => a.id === id ? { ...a, leida: true } : a)
      })),

      updateCapacitacion: (data) => set((state) => ({
        capacitacion: { ...state.capacitacion, ...data }
      })),

      updateExportaciones: (data) => set((state) => ({
        exportaciones: { ...state.exportaciones, ...data }
      })),

      addUsuario: (usuario) => set((state) => ({
        usuarios: [...state.usuarios, { ...usuario, id: Math.random().toString(36).substr(2, 9) }]
      })),

      updatePreferencias: (pref) => set((state) => ({
        preferencias: { ...state.preferencias, ...pref }
      })),

      addActividad: (actividad) => set((state) => ({
        actividades: [...state.actividades, { ...actividad, id: Math.random().toString(36).substr(2, 9) }]
      })),

      addFactura: (factura) => set((state) => ({
        facturas: [...state.facturas, { ...factura, id: Math.random().toString(36).substr(2, 9) }]
      })),

      getScore: () => {
        const state = get();
        const vigentes = state.documentos.filter(d => d.estado === 'vigente').length;
        const total = state.documentos.length;
        return total === 0 ? 0 : Math.round((vigentes / total) * 100);
      }
    }),
    {
      name: 'lec-compliance-storage',
      version: 2,
    }
  )
);
