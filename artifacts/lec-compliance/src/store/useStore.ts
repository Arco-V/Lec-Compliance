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
  historial: { version: string; fecha: Date; autor: string; cambio: string }[];
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
  setEmpresa: (empresa: Partial<Empresa>) => void;
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
    nombre: 'Política de Calidad',
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
    nombre: 'Manual de Procesos',
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
    nombre: 'Registro de Capacitaciones 2024',
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
  }
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
      // partial serialize to handle dates properly if needed, but keeping it simple for prototype
    }
  )
);
