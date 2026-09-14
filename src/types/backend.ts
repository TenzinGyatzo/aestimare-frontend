/**
 * Tipos TypeScript alineados con los DTOs y schemas del backend
 * Estos tipos representan las estructuras de datos que se intercambian con la API
 */

/** Tenant AMES (Story 1.2) */
export interface Tenant {
  _id?: string;
  nombre: string;
  clave: string;
  activo?: boolean;
  /** ISO — inventario plataforma (Story 4.2) */
  createdAt?: string;
}

/** Totales CRM del dashboard home (Story 7.3) */
export interface DashboardEntityTotals {
  clientes: number;
  contactos: number;
  usuarios: number;
  servicios: number;
}

/** Branding / datos legales por tenant (Story 2.2) */
export interface TenantBranding {
  logoUrl?: string;
  razonSocial?: string;
  rfc?: string;
  domicilio?: string;
  telefono?: string;
  emailContacto?: string;
  sitioWeb?: string;
}

/** Datos bancarios por tenant (Story 2.4 / 2.5) */
export interface TenantBancarios {
  /** Logo del banco (≠ branding.logoUrl) */
  logoUrl?: string;
  titular?: string;
  banco?: string;
  cuenta?: string;
  clabe?: string;
  domicilio?: string;
  rfc?: string;
  email?: string;
}

/** Configuración por tenant (Stories 2.1–2.5 + 3.2). Nunca incluye emailSecretEnc. */
export interface TenantConfigResponse {
  _id: string;
  tenantId: string;
  /** Nombre del tenant efectivo (para label sin GET /tenants). */
  tenantNombre?: string;
  /** Clave del tenant efectivo (para label sin GET /tenants). */
  tenantClave?: string;
  branding?: TenantBranding;
  emailRemitente?: string;
  correosNotificacion?: string[];
  /** Cuenta Gmail SMTP (FR-55). */
  emailUser?: string;
  /** true si hay app password cifrada en servidor. */
  emailCredentialsConfigured?: boolean;
  vigenciaDefaultDias?: number;
  bancarios?: TenantBancarios;
  /**
   * Preferencias opcionales al crear cotización nueva.
   * Ausente/null = sin configurar (el cotizador usa `true`).
   * `false` es valor explícito (≠ ausencia).
   */
  defaultIncluirDatosBancarios?: boolean | null;
  defaultIncluirDescripciones?: boolean | null;
  defaultIncluirImagenesPdf?: boolean | null;
  /** Preferencia «usar vigencia» al crear; ausente/null ≠ false. */
  defaultUsarVigencia?: boolean | null;
  /** IANA TZ del tenant (Story 9.1 / AD-30). */
  zonaHoraria?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tipo para un servicio médico
/** Discriminador catálogo unificado (AD-19 / FR-58 / Story 6.1). */
export type TipoItemCatalogo = 'servicio' | 'producto';

export interface Servicio {
  _id?: string;
  tenantId?: string;
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  /** Categoría dinámica del tenant (Story 5.3 / AD-20). */
  categoriaId: string;
  /** Discriminador servicio | producto (Story 6.1). */
  tipo: TipoItemCatalogo;
  /** Código interno opcional único por tenant (Story 6.2 / AD-21). */
  codigo?: string;
  /** Imagen de producto (Story 8.1 / AD-23); path relativo `/uploads/catalogo/...`. */
  imagenUrl?: string;
  moneda?: string;
  activo?: boolean;
}

/** Sección plantilla PDF JSON v1 (Story 5.1 / AD-6). TipTap doc en 5.3. */
export type SeccionPlantilla =
  | {
      id: string;
      tipo: 'richtext';
      titulo?: string;
      cuerpo: { text: string; doc?: Record<string, unknown> };
    }
  | {
      id: string;
      tipo: 'tabla';
      titulo?: string;
      encabezados: string[];
      filas: string[][];
    };

/** Plantilla PDF maestra por tenant (Story 5.2 / FR-47). */
export interface Plantilla {
  _id?: string;
  tenantId?: string;
  nombre: string;
  claveSeed?: string;
  schemaVersion?: number;
  secciones: SeccionPlantilla[];
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Categoría dinámica de catálogo por tenant (Story 5.2 / AD-20).
 */
export interface CategoriaServicioCatalogo {
  _id: string;
  tenantId?: string;
  nombre: string;
  /** 2–3 chars, uppercase en BE */
  codigo: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedCategoriasServicioResponse {
  data: CategoriaServicioCatalogo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipo para un cliente
export interface Cliente {
  _id?: string;
  tenantId?: string;
  empresa: string;
  /** Nombre fiscal opcional (Story 3.5). */
  razonSocial?: string;
  rfc?: string;
  activo?: boolean;
  /** Contactos activos del cliente (listado CRM). */
  totalContactos?: number;
  /** Cotizaciones del cliente excluyendo canceladas (listado CRM). */
  totalCotizaciones?: number;
}

/** Contacto CRM de un cliente (Story 3.3). Sin login. */
export interface Contacto {
  _id?: string;
  tenantId?: string;
  clienteId?: string;
  nombre: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
  activo?: boolean;
}

// Tipo para un item dentro de una cotización
export interface ItemCotizacion {
  servicioId: string;
  nombreServicioSnapshot?: string;
  descripcionServicioSnapshot?: string;
  precioUnitarioSnapshot?: number;
  cantidad: number;
  subtotal: number;
  /** AD-22 / Story 6.4 — opcional en lectura (líneas legacy). */
  tipoSnapshot?: 'servicio' | 'producto';
  codigoSnapshot?: string;
}

// Tipo para una cotización completa
export interface Cotizacion {
  _id?: string;
  tenantId?: string;
  folio: string;
  clienteId: string;
  emailContacto: string;
  items: ItemCotizacion[];
  total: number;
  moneda?: string;
  fechaCreacion: Date;
  fechaVencimiento?: Date;
  sinVigencia?: boolean;
  estado: 'vigente' | 'vencida';
  pdfUrl?: string;
}

// Tipo para crear una cotización pública (sin autenticación)
export interface CreatePublicCotizacionDto {
  empresa?: string;
  nombreContacto?: string;
  correo: string;
  telefono?: string;
  items: Array<{
    servicioId: string;
    cantidad: number;
  }>;
}

/** DTO público magic link (Story 6.9) — sin token/tenant/emails. */
export interface PublicCotizacionItem {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  /** Id de catálogo (mapa imágenes PDF). */
  servicioId?: string;
  /** AD-22 — gate imágenes PDF. */
  tipoSnapshot?: 'servicio' | 'producto';
  /** Proyección live desde Servicio (AD-22); no persistido en línea. */
  imagenUrl?: string;
}

export interface PublicCotizacionBranding {
  razonSocial?: string;
  logoUrl?: string;
}

export interface PublicCotizacionResponse {
  folio: string;
  estado: 'vigente' | 'vencida' | 'aceptada' | 'rechazada' | 'cancelada' | string;
  total: number;
  moneda: string;
  fechaCreacion: string;
  fechaVencimiento?: string;
  sinVigencia?: boolean;
  fechaAceptacion?: string;
  fechaRechazo?: string;
  nombreEmpresa?: string;
  nombreContacto?: string;
  telefonoContacto?: string;
  /** Story 6.16 — snapshot correo para PDF guest */
  emailContacto?: string;
  /** Story 6.16 — snapshot cargo CRM para PDF */
  cargoContacto?: string;
  /** Flags PDF (AD-26) — paridad guest con correo creación. */
  incluirDescripciones?: boolean;
  incluirImagenesPdf?: boolean;
  incluirDatosBancarios?: boolean;
  plantillasSnapshot?: Array<{
    plantillaId: string;
    nombreSnapshot: string;
    schemaVersion: number;
    secciones: SeccionPlantilla[];
  }>;
  items: PublicCotizacionItem[];
  branding?: PublicCotizacionBranding;
  /** Solo si incluirDatosBancarios + útiles (guest PDF sin JWT). */
  bancarios?: TenantBancarios;
  alreadyResponded?: boolean;
}

// Tipo para un usuario del sistema
export type AmesRole = 'operativo' | 'admin_tenant' | 'admin_sistema';

export interface User {
  _id: string;
  email: string;
  nombre: string;
  rol: AmesRole;
  /** Alineado al rol (compat); preferir `rol`. */
  tipoUsuario: AmesRole;
  /** Fijo para operativo y admin_tenant; ausente en admin_sistema (AD-11). */
  tenantId?: string;
  activo?: boolean;
}

// Tipo para la respuesta del login
export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ConfidentialityAgreementSection {
  title: string;
  body: string;
}

export interface ConfidentialityStatus {
  required: boolean;
  accepted: boolean;
  currentVersion: string;
  agreementText?: string;
  footerConsent?: string;
  intro?: string;
  sections?: ConfidentialityAgreementSection[];
  declaration?: string;
}

export interface ConfidentialityAcceptance {
  userId?: string;
  tenantId?: string;
  acceptedAt?: string;
  ip?: string;
  version: string;
  agreementText?: string;
  source?: string;
}

// Tipo para métricas de clientes
export interface ClientMetricDto {
  clienteId: string;
  empresa?: string;
  rfc: string;
  fechaUltimaCotizacion?: Date;
  totalCotizaciones: number;
}

// Tipo para métricas de servicios
export interface ServiceMetricDto {
  servicioId: string;
  nombreServicio: string;
  precioUnitario: number;
  vecesContratado: number;
  /** AD-22 / Story 7.1 tipado — null/undefined = legacy sin tipoSnapshot. */
  tipoSnapshot?: 'producto' | 'servicio' | null;
}

/** Bucket de desglose por tipoSnapshot (líneas aceptadas). Story 7.1 SaaS. */
export interface TipoBucketDto {
  ingresosTotales: number;
  vecesContratado: number;
}

export interface DesglosePorTipoDto {
  producto: TipoBucketDto;
  servicio: TipoBucketDto;
  sinTipo: TipoBucketDto;
}

// Tipo para cliente solicitante en métricas totales
export interface ClienteSolicitanteDto {
  clienteId: string;
  empresa?: string;
  rfc: string;
  totalCotizaciones: number;
}

// Tipo para servicio solicitado en métricas totales
export interface ServicioSolicitadoDto {
  servicioId: string;
  nombreServicio: string;
  vecesSolicitado: number;
}

// Tipo para servicio rentable en métricas totales
export interface ServicioRentableDto {
  servicioId: string;
  nombreServicio: string;
  ingresosTotales: number;
}

// Tipo para métricas totales
export interface TotalsMetricDto {
  mayorSolicitante?: ClienteSolicitanteDto;
  clienteMasActivoMes?: ClienteSolicitanteDto;
  servicioMasSolicitado?: ServicioSolicitadoDto;
  servicioMasRentable?: ServicioRentableDto;
  cotizacionesHoy: number;
  cotizacionesMes: number;
  cotizacionesAnio: number;
  cotizacionesTotales: number;
  /** Emitidas = match del periodo sin canceladas (= cotizacionesTotales). */
  cotizacionesEmitidas: number;
  cotizacionesAceptadas: number;
  cotizacionesRechazadas: number;
  /** Count dedicado; no entra en emitidas ni en tasaConversion. */
  cotizacionesCanceladas?: number;
  /** aceptadas / emitidas (emitidas ya excluye canceladas) */
  tasaConversion: number;
  ingresosTotales: number;
  /** FR63 / AD-22 — desglose por línea; opcional en clients viejos. */
  desglosePorTipo?: DesglosePorTipoDto;
}

// Tipo para un item de cotización en la lista
export interface CotizacionListItemDto {
  id: string;
  folio: string;
  fecha: Date;
  montoTotal: number;
  empresa?: string;
  nombreSolicitante?: string;
  /** Nombre del usuario AMES que creó/envió (o email de fallback). */
  creadoPorNombre?: string;
  /** RFC del cliente CRM (vacío en guest). */
  rfc?: string;
  estado: string;
  pdfUrl?: string;
  fechaAceptacion?: Date;
  fechaRechazo?: Date;
}

// Tipo para respuesta paginada de cotizaciones
export interface PaginatedCotizacionesResponseDto {
  data: CotizacionListItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Nota interna de cotización (solo visible para usuarios AMES). */
export interface NotaInternaCotizacion {
  _id: string;
  texto: string;
  autorUserId: string;
  autorNombre: string;
  createdAt: string;
  updatedAt?: string;
}

// Tipo para el detalle completo de una cotización (con campos poblados)
export interface CotizacionDetalleDto {
  _id: string;
  tenantId?: string;
  folio: string;
  clienteId: string | Cliente; // Puede ser string o objeto Cliente poblado
  emailContacto: string;
  items: Array<{
    servicioId: string | Servicio; // Puede ser string o objeto Servicio poblado
    nombreServicioSnapshot: string;
    descripcionServicioSnapshot?: string;
    precioUnitarioSnapshot: number;
    cantidad: number;
    subtotal: number;
    /** AD-22 / Story 6.4 — opcional en lectura (líneas legacy). */
    tipoSnapshot?: 'servicio' | 'producto';
    codigoSnapshot?: string;
  }>;
  total: number;
  moneda?: string;
  fechaCreacion: Date | string;
  fechaVencimiento?: Date | string;
  /** Story 6.15 */
  sinVigencia?: boolean;
  estado:
    | 'vigente'
    | 'vencida'
    | 'aceptada'
    | 'rechazada'
    | 'cancelada'
    | 'en_proceso'
    | 'completada';
  fechaAceptacion?: Date | string;
  fechaRechazo?: Date | string;
  fechaEstadoVigente?: Date | string;
  fechaEstadoVencida?: Date | string;
  fechaEstadoAceptada?: Date | string;
  fechaEstadoRechazada?: Date | string;
  fechaEstadoCancelada?: Date | string;
  /** Story 6.9/6.10 — origen del último cambio de estado */
  estadoOrigen?: 'magic_link' | 'usuario' | 'cron' | string;
  estadoOrigenAt?: Date | string;
  estadoCambiadoPorNombre?: string;
  /** Story 6.13 — creador AMES (no exponer en DTO público). */
  creadoPorUserId?: string;
  creadoPorEmail?: string;
  pdfUrl?: string;
  nombreEmpresa?: string;
  nombreContacto?: string;
  telefonoContacto?: string;
  /** Story 6.16 — snapshot cargo CRM para PDF */
  cargoContacto?: string;
  incluirDatosBancarios?: boolean;
  /** Si false, el PDF omite la columna de descripción (default true). */
  incluirDescripciones?: boolean;
  /** Story 8.2 / AD-26 — PDF puede incluir imágenes de producto (render en 8.3). */
  incluirImagenesPdf?: boolean;
  /** Destinatarios Para (Story 6.6). */
  emailsPara?: string[];
  /** Destinatarios CC (Story 6.6). */
  emailsCc?: string[];
  /** Snapshots de plantillas (Story 6.5). Orden = páginas tras el cuerpo. */
  plantillasSnapshot?: Array<{
    plantillaId: string;
    nombreSnapshot: string;
    schemaVersion: number;
    secciones: SeccionPlantilla[];
  }>;
  /** Notas internas del equipo AMES. No expuestas al cliente. */
  notasInternas?: NotaInternaCotizacion[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/** Story 9.1/9.2 — familias canónicas de Receta. */
export type FamiliaReceta =
  | 'relativo_hoy'
  | 'relativo_aniversario'
  | 'fecha_exacta';

export type PresetRelativoHoy =
  | '1_mes'
  | '3_meses'
  | '6_meses'
  | '11_meses'
  | '1_ano'
  | '2_anos';

export type PresetRelativoAniversario =
  | '2_semanas_antes'
  | '1_mes_antes'
  | '2_meses_antes';

export type EstadoRecordatorio =
  | 'programado'
  | 'disparado'
  | 'cancelado'
  | 'cerrado';

export interface RecetaRecordatorio {
  familia: FamiliaReceta;
  preset?: string;
  /** Date-only YYYY-MM-DD en body; ISO Date en response. */
  fechaExacta?: string | Date;
}

export interface UpsertRecordatorioPayload {
  receta: RecetaRecordatorio;
}

export interface RecordatorioRecotizacion {
  _id?: string;
  tenantId?: string;
  cotizacionId?: string;
  estado: EstadoRecordatorio;
  receta: RecetaRecordatorio;
  fechaDisparoUtc: string | Date;
  everDisparado: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/** Story 10.2 / AD-35 — fila canónica de recordatorio disparado. */
export interface RecordatorioDisparadoItem {
  recordatorioId: string;
  cotizacionId: string;
  folio: string;
  identidad: string | null;
  fechaDisparo: string | Date;
  recetaResumen: string;
  nombreContacto?: string | null;
  telefonoContacto?: string | null;
  emailContacto?: string | null;
  fechaCreacion?: string | Date | null;
}

export interface RecordatoriosDisparadosResponse {
  items: RecordatorioDisparadoItem[];
}

/** Evento de auditoría de seguridad (append-only). */
export interface AuditActorSnapshot {
  email?: string;
  nombre?: string;
  rol?: string;
}

export interface AuditEvent {
  _id: string;
  tenantId?: string;
  actorId?: string;
  actorSnapshot: AuditActorSnapshot;
  timestamp: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  result: string;
  payload?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export interface PaginatedAuditEventsResponse {
  data: AuditEvent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminAuditFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  actorId?: string;
  actionType?: string;
  resourceType?: string;
  resourceId?: string;
  result?: 'success' | 'failure';
  includePlatform?: boolean;
  page?: number;
  limit?: number;
}
