/**
 * Servicio HTTP para el Panel de Administración AMES
 */

import httpClient from './http';
import type {
  Cliente,
  Contacto,
  Servicio,
  Plantilla,
  CategoriaServicioCatalogo,
  PaginatedCategoriasServicioResponse,
  CotizacionDetalleDto,
  PaginatedCotizacionesResponseDto,
  Tenant,
  TenantConfigResponse,
  DashboardEntityTotals,
  RecordatorioRecotizacion,
  RecordatoriosDisparadosResponse,
  UpsertRecordatorioPayload,
  PaginatedAuditEventsResponse,
  AdminAuditFilters,
} from '../types/backend';

export interface AdminClientesFilters {
  empresa?: string;
  razonSocial?: string;
  rfc?: string;
  /** Omitido = solo activos. false = inactivos. */
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedClientesResponse {
  data: Cliente[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminCotizacionesFilters {
  estado?: 'vigente' | 'vencida' | 'aceptada' | 'rechazada' | 'cancelada';
  /** Scope CRM — Story 3.7 (ficha cliente) */
  clienteId?: string;
  search?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}

export type ServicioOrden = 'creacion' | 'nombre_asc' | 'nombre_desc';

export interface AdminServiciosFilters {
  nombre?: string;
  categoriaId?: string;
  /** Filtrar por tipo servicio | producto (Story 6.1). */
  tipo?: 'servicio' | 'producto';
  activo?: boolean;
  orden?: ServicioOrden;
  page?: number;
  limit?: number;
}

export interface PaginatedServiciosResponse {
  data: Servicio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateServicioPayload {
  nombre: string;
  descripcion?: string;
  precioUnitario: number;
  categoriaId: string;
  tipo: 'servicio' | 'producto';
  /** Código interno opcional (Story 6.2). */
  codigo?: string;
  moneda?: string;
  activo?: boolean;
}

export async function getClientes(
  filters: AdminClientesFilters = {},
): Promise<PaginatedClientesResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.empresa) params.empresa = filters.empresa;
  if (filters.razonSocial) params.razonSocial = filters.razonSocial;
  if (filters.rfc) params.rfc = filters.rfc;
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedClientesResponse>(
    '/clientes',
    { params },
  );
  return data;
}

export async function getClienteById(id: string): Promise<Cliente> {
  const { data } = await httpClient.get<Cliente>(`/clientes/${id}`);
  return data;
}

export type CreateClientePayload = {
  empresa: string;
  razonSocial?: string;
  rfc?: string;
};

export type UpdateClientePayload = {
  empresa?: string;
  razonSocial?: string;
  rfc?: string;
};

/** POST cliente (Story 3.1). */
export async function createCliente(
  payload: CreateClientePayload,
): Promise<Cliente> {
  const { data } = await httpClient.post<Cliente>('/clientes', payload);
  return data;
}

/** PATCH cliente (Story 3.1). */
export async function updateCliente(
  id: string,
  payload: UpdateClientePayload,
): Promise<Cliente> {
  const { data } = await httpClient.patch<Cliente>(`/clientes/${id}`, payload);
  return data;
}

/** Soft delete (Story 3.2). */
export async function deleteCliente(id: string): Promise<Cliente> {
  const { data } = await httpClient.delete<Cliente>(`/clientes/${id}`);
  return data;
}

/** Activar / desactivar (Story 3.2). */
export async function toggleClienteActivo(id: string): Promise<Cliente> {
  const { data } = await httpClient.patch<Cliente>(
    `/clientes/${id}/toggle-activo`,
  );
  return data;
}

/* ——— Contactos CRM (Story 3.3) ——— */

export interface AdminContactosFilters {
  nombre?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedContactosResponse {
  data: Contacto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateContactoPayload = {
  nombre: string;
  correo?: string;
  telefono?: string;
  cargo?: string;
};

export type UpdateContactoPayload = {
  nombre?: string;
  /** `null` o `''` limpia el campo en el BE. */
  correo?: string | null;
  telefono?: string | null;
  cargo?: string | null;
};

export async function getContactos(
  clienteId: string,
  filters: AdminContactosFilters = {},
): Promise<PaginatedContactosResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.nombre) params.nombre = filters.nombre;
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedContactosResponse>(
    `/clientes/${clienteId}/contactos`,
    { params },
  );
  return data;
}

export async function getContactoById(
  clienteId: string,
  id: string,
): Promise<Contacto> {
  const { data } = await httpClient.get<Contacto>(
    `/clientes/${clienteId}/contactos/${id}`,
  );
  return data;
}

export async function createContacto(
  clienteId: string,
  payload: CreateContactoPayload,
): Promise<Contacto> {
  const { data } = await httpClient.post<Contacto>(
    `/clientes/${clienteId}/contactos`,
    payload,
  );
  return data;
}

export async function updateContacto(
  clienteId: string,
  id: string,
  payload: UpdateContactoPayload,
): Promise<Contacto> {
  const { data } = await httpClient.patch<Contacto>(
    `/clientes/${clienteId}/contactos/${id}`,
    payload,
  );
  return data;
}

export async function deleteContacto(
  clienteId: string,
  id: string,
): Promise<Contacto> {
  const { data } = await httpClient.delete<Contacto>(
    `/clientes/${clienteId}/contactos/${id}`,
  );
  return data;
}

export async function toggleContactoActivo(
  clienteId: string,
  id: string,
): Promise<Contacto> {
  const { data } = await httpClient.patch<Contacto>(
    `/clientes/${clienteId}/contactos/${id}/toggle-activo`,
  );
  return data;
}

export async function getCotizacionesAdmin(
  filters: AdminCotizacionesFilters = {},
): Promise<PaginatedCotizacionesResponseDto> {
  const {
    page = 1,
    limit = 10,
    estado,
    clienteId,
    search,
    fechaDesde,
    fechaHasta,
  } = filters;

  const params: any = { page, limit };
  if (estado) params.estado = estado;
  if (clienteId) params.clienteId = clienteId;
  if (search) params.search = search;
  if (fechaDesde) params.fechaDesde = fechaDesde;
  if (fechaHasta) params.fechaHasta = fechaHasta;

  const { data } = await httpClient.get<PaginatedCotizacionesResponseDto>(
    '/cotizaciones',
    { params },
  );
  return data;
}

export async function getCotizacionAdminById(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.get<CotizacionDetalleDto>(
    `/cotizaciones/${id}`,
  );
  return data;
}

export interface CreateAdminCotizacionPayload {
  clienteId?: string;
  nombreEmpresa?: string;
  nombreContacto?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  /** Story 6.16 — snapshot cargo CRM para PDF */
  cargoContacto?: string;
  items: Array<{
    servicioId: string;
    cantidad: number;
    /** Overrides de snapshot (Story 6.4) */
    nombre?: string;
    descripcion?: string;
    precioUnitario?: number;
  }>;
  moneda?: string;
  fechaVencimiento?: string;
  /** Story 6.15 — sin fecha de vencimiento. */
  sinVigencia?: boolean;
  enviarEmail?: boolean;
  /** Destinatarios Para (Story 6.6). */
  emailsPara?: string[];
  /** Destinatarios CC (Story 6.6). */
  emailsCc?: string[];
  incluirDatosBancarios?: boolean;
  /** Si false, el PDF omite la columna de descripción (default true). */
  incluirDescripciones?: boolean;
  /** Story 8.2 / AD-26 — omitido en BE → default por catálogo. */
  incluirImagenesPdf?: boolean;
  /** Plantillas ordenadas (Story 6.5). Omitido/vacío = ninguna. */
  plantillas?: Array<{
    plantillaId: string;
    nombre?: string;
    secciones?: Plantilla['secciones'];
  }>;
}

export async function createAdminCotizacion(
  payload: CreateAdminCotizacionPayload,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.post<CotizacionDetalleDto>(
    '/cotizaciones/admin',
    payload,
  );
  return data;
}

export type EnviarCorreoCotizacionOptions = {
  emailsPara?: string[];
  emailsCc?: string[];
};

/** Story 6.8 — envía PDF FE + magic link (multipart). */
export async function enviarCorreoCotizacion(
  id: string,
  pdf: Blob | File,
  options?: EnviarCorreoCotizacionOptions,
): Promise<{ ok: true; folio: string }> {
  const form = new FormData();
  const file =
    pdf instanceof File
      ? pdf
      : new File([pdf], `${id}.pdf`, { type: 'application/pdf' });
  form.append('file', file);
  if (options?.emailsPara) {
    form.append('emailsPara', JSON.stringify(options.emailsPara));
  }
  if (options?.emailsCc) {
    form.append('emailsCc', JSON.stringify(options.emailsCc));
  }
  const { data } = await httpClient.post<{ ok: true; folio: string }>(
    `/cotizaciones/${id}/enviar-correo`,
    form,
  );
  return data;
}

export interface AceptarCotizacionAdminPayload {
  // Legacy vacío: aceptación sin trabajadores (Story 1.1)
}

export async function aceptarCotizacionAdmin(
  id: string,
  payload: AceptarCotizacionAdminPayload = {},
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/admin/aceptar`,
    payload,
  );
  return data;
}

export async function rechazarCotizacionAdmin(
  id: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/admin/rechazar`,
  );
  return data;
}

/** Story 6.10 — cambio manual a cualquiera de los otros estados. */
export async function cambiarEstadoCotizacion(
  id: string,
  estado: 'vigente' | 'vencida' | 'aceptada' | 'rechazada' | 'cancelada',
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/estado`,
    { estado },
  );
  return data;
}

export type ModoPreciosRepetir = 'originales' | 'actualizados';

export type RepetirCotizacionWarning = {
  index: number;
  servicioId: string;
  motivo: 'inexistente' | 'inactivo';
};

export type RepetirCotizacionPayload = {
  modoPrecios: ModoPreciosRepetir;
  omitirServicioIds?: string[];
  sustituciones?: Array<{ fromServicioId: string; toServicioId: string }>;
  fechaVencimiento?: string;
  sinVigencia?: boolean;
  /** Si true, cancela la fuente tras crear (default false en API). */
  cancelarOriginal?: boolean;
  /** Story 11.1 / 11.2 — rearmar recordatorio en COT nueva. */
  rearmarRecordatorio?: boolean;
  /** Obligatorio si rearmar y familia fecha_exacta; opcional en desfase. */
  recetaRecordatorio?: import('../types/backend').RecetaRecordatorio;
};

export type RepetirCotizacionResponseDto = {
  cotizacion: CotizacionDetalleDto;
  originalCancelada: boolean;
  originalCancelacionError?: string;
};

export type RepetirCotizacionPreviewDto = {
  items: Array<{
    servicioId: string;
    cantidad: number;
    nombre?: string;
    descripcion?: string;
    precioUnitario?: number;
  }>;
  clienteId?: string;
  nombreEmpresa?: string;
  nombreContacto?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  cargoContacto?: string;
  emailsPara: string[];
  emailsCc: string[];
  sinVigencia: boolean;
  incluirDatosBancarios: boolean;
  incluirDescripciones: boolean;
  /** Story 8.2 / AD-26 */
  incluirImagenesPdf: boolean;
  plantillas: Array<{
    plantillaId: string;
    nombre?: string;
    secciones?: import('../types/backend').SeccionPlantilla[];
  }>;
  moneda: 'MXN';
};

/** Story 6.12 — clona cotización (precios originales o actualizados). */
export async function repetirCotizacion(
  id: string,
  payload: RepetirCotizacionPayload,
): Promise<RepetirCotizacionResponseDto> {
  const { data } = await httpClient.post<RepetirCotizacionResponseDto>(
    `/cotizaciones/${id}/repetir`,
    payload,
  );
  return data;
}

/** Preview wizard-ready sin persistir (repetir → cotizador). */
export async function previewRepetirCotizacion(
  id: string,
  payload: RepetirCotizacionPayload,
): Promise<RepetirCotizacionPreviewDto> {
  const { data } = await httpClient.post<RepetirCotizacionPreviewDto>(
    `/cotizaciones/${id}/repetir/preview`,
    payload,
  );
  return data;
}

export async function agregarNotaInternaCotizacion(
  id: string,
  payload: { texto: string },
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.post<CotizacionDetalleDto>(
    `/cotizaciones/${id}/notas-internas`,
    payload,
  );
  return data;
}

export async function actualizarNotaInternaCotizacion(
  id: string,
  notaId: string,
  payload: { texto: string },
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.patch<CotizacionDetalleDto>(
    `/cotizaciones/${id}/notas-internas/${notaId}`,
    payload,
  );
  return data;
}

export async function eliminarNotaInternaCotizacion(
  id: string,
  notaId: string,
): Promise<CotizacionDetalleDto> {
  const { data } = await httpClient.delete<CotizacionDetalleDto>(
    `/cotizaciones/${id}/notas-internas/${notaId}`,
  );
  return data;
}

/** Story 9.2 — GET recordatorio por COT. 404 = Ausente. */
export async function getRecordatorioCotizacion(
  id: string,
): Promise<RecordatorioRecotizacion> {
  const { data } = await httpClient.get<RecordatorioRecotizacion>(
    `/cotizaciones/${id}/recordatorio`,
  );
  return data;
}

/** Story 9.1/9.2 — PUT upsert Receta (sin fechaDisparoUtc del cliente). */
export async function upsertRecordatorioCotizacion(
  id: string,
  payload: UpsertRecordatorioPayload,
): Promise<RecordatorioRecotizacion> {
  const { data } = await httpClient.put<RecordatorioRecotizacion>(
    `/cotizaciones/${id}/recordatorio`,
    payload,
  );
  return data;
}

/** Story 9.1/9.2 — DELETE cancela programado → cancelado. */
export async function deleteRecordatorioCotizacion(
  id: string,
): Promise<RecordatorioRecotizacion> {
  const { data } = await httpClient.delete<RecordatorioRecotizacion>(
    `/cotizaciones/${id}/recordatorio`,
  );
  return data;
}

/** Story 10.2 — GET bandeja tenant de recordatorios disparados. */
export async function getRecordatoriosDisparados(): Promise<RecordatoriosDisparadosResponse> {
  const { data } = await httpClient.get<RecordatoriosDisparadosResponse>(
    '/cotizaciones/recordatorios/disparados',
  );
  return data;
}

/** Story 10.2 — POST cerrar recordatorio disparado. */
export async function cerrarRecordatorioDisparado(
  recordatorioId: string,
): Promise<{ estado: string }> {
  const { data } = await httpClient.post<{ estado: string }>(
    `/cotizaciones/recordatorios/${recordatorioId}/cerrar`,
  );
  return data;
}

export async function getServicios(
  filters: AdminServiciosFilters = {},
): Promise<PaginatedServiciosResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.nombre?.trim()) params.nombre = filters.nombre.trim();
  if (filters.categoriaId) params.categoriaId = filters.categoriaId;
  if (filters.tipo) params.tipo = filters.tipo;
  if (filters.activo !== undefined) params.activo = filters.activo;
  if (filters.orden) params.orden = filters.orden;

  const { data } = await httpClient.get<PaginatedServiciosResponse>(
    '/servicios',
    { params },
  );
  return data;
}

export async function createServicio(
  payload: CreateServicioPayload,
): Promise<Servicio> {
  const { data } = await httpClient.post<Servicio>('/servicios', payload);
  return data;
}

export type CatalogoImportErrorRow = {
  row: number;
  tipo: string;
  nombre: string;
  codigo: string;
  categoria: string;
  precio: string;
  descripcion: string;
  activo: string;
  error: string;
};

export type CatalogoImportResult = {
  created: number;
  failed: number;
  skippedEmpty: number;
  errors: CatalogoImportErrorRow[];
  reporteBase64?: string;
};

function triggerXlsxDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function downloadCatalogoImportPlantilla(): Promise<void> {
  const { data, headers } = await httpClient.get<Blob>(
    '/servicios/import/plantilla',
    { responseType: 'blob' },
  );
  const contentType = String(headers['content-type'] ?? data.type ?? '');
  if (contentType.includes('application/json')) {
    const text = await data.text();
    let message = 'No se pudo descargar la plantilla';
    try {
      const parsed = JSON.parse(text) as { message?: string | string[] };
      const raw = parsed.message;
      message = Array.isArray(raw) ? raw.join('. ') : raw || message;
    } catch {
      /* keep fallback */
    }
    throw new Error(message);
  }
  triggerXlsxDownload(data, 'plantilla-catalogo.xlsx');
}

export async function importCatalogo(
  file: File,
): Promise<CatalogoImportResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await httpClient.post<CatalogoImportResult>(
    '/servicios/import',
    form,
  );
  return data;
}

export function downloadCatalogoImportReporte(base64: string): void {
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error('No se pudo generar el reporte');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  triggerXlsxDownload(
    new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    'reporte-carga-catalogo.xlsx',
  );
}

export interface CreateServicioMultiPayload extends CreateServicioPayload {
  tenantIds: string[];
}

export async function createServicioMulti(
  payload: CreateServicioMultiPayload,
): Promise<{ created: Servicio[] }> {
  const { data } = await httpClient.post<{ created: Servicio[] }>(
    '/servicios/multi-tenant',
    payload,
  );
  return data;
}

export interface UpdateServicioPayload {
  nombre?: string;
  descripcion?: string;
  precioUnitario?: number;
  categoriaId?: string;
  tipo?: 'servicio' | 'producto';
  /** Enviar '' para limpiar (BE $unset). */
  codigo?: string;
  moneda?: string;
  activo?: boolean;
}

export async function updateServicio(
  id: string,
  payload: UpdateServicioPayload,
): Promise<Servicio> {
  const { data } = await httpClient.patch<Servicio>(
    `/servicios/${id}`,
    payload,
  );
  return data;
}

export async function toggleServicioActivo(id: string): Promise<Servicio> {
  const { data } = await httpClient.patch<Servicio>(
    `/servicios/${id}/toggle-activo`,
  );
  return data;
}

export async function deleteServicio(id: string): Promise<Servicio> {
  const { data } = await httpClient.delete<Servicio>(`/servicios/${id}`);
  return data;
}

/** Subir o reemplazar imagen de producto (Story 8.1 / AD-23). */
export async function uploadServicioImagen(
  id: string,
  file: File,
): Promise<Servicio> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await httpClient.post<Servicio>(
    `/servicios/${id}/imagen`,
    form,
  );
  return data;
}

/** Eliminar imagen de producto. */
export async function deleteServicioImagen(id: string): Promise<Servicio> {
  const { data } = await httpClient.delete<Servicio>(
    `/servicios/${id}/imagen`,
  );
  return data;
}

/** Filtros categorías de catálogo (Story 5.2 / AD-20). */
export interface AdminCategoriasServicioFilters {
  /** Omitido = solo activas. false = inactivas. */
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateCategoriaServicioPayload {
  nombre: string;
  codigo: string;
}

export interface UpdateCategoriaServicioPayload {
  nombre?: string;
  codigo?: string;
}

export async function getCategoriasServicio(
  filters: AdminCategoriasServicioFilters = {},
): Promise<PaginatedCategoriasServicioResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedCategoriasServicioResponse>(
    '/servicios/categorias',
    { params },
  );
  return data;
}

export async function createCategoriaServicio(
  payload: CreateCategoriaServicioPayload,
): Promise<CategoriaServicioCatalogo> {
  const { data } = await httpClient.post<CategoriaServicioCatalogo>(
    '/servicios/categorias',
    payload,
  );
  return data;
}

export async function updateCategoriaServicio(
  id: string,
  payload: UpdateCategoriaServicioPayload,
): Promise<CategoriaServicioCatalogo> {
  const { data } = await httpClient.patch<CategoriaServicioCatalogo>(
    `/servicios/categorias/${id}`,
    payload,
  );
  return data;
}

/** Soft-delete. 409 si hay ítems activos (FR57). */
export async function deleteCategoriaServicio(
  id: string,
): Promise<CategoriaServicioCatalogo> {
  const { data } = await httpClient.delete<CategoriaServicioCatalogo>(
    `/servicios/categorias/${id}`,
  );
  return data;
}

export interface AdminPlantillasFilters {
  nombre?: string;
  /** Omitido = solo activas. false = inactivas. */
  activo?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedPlantillasResponse {
  data: Plantilla[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePlantillaPayload {
  nombre: string;
  secciones: Plantilla['secciones'];
  activo?: boolean;
}

export interface UpdatePlantillaPayload {
  nombre?: string;
  secciones?: Plantilla['secciones'];
  activo?: boolean;
}

export async function getPlantillas(
  filters: AdminPlantillasFilters = {},
): Promise<PaginatedPlantillasResponse> {
  const params: Record<string, string | number | boolean> = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 20,
  };
  if (filters.nombre?.trim()) params.nombre = filters.nombre.trim();
  if (filters.activo !== undefined) params.activo = filters.activo;

  const { data } = await httpClient.get<PaginatedPlantillasResponse>(
    '/plantillas',
    { params },
  );
  return data;
}

export async function getPlantilla(id: string): Promise<Plantilla> {
  const { data } = await httpClient.get<Plantilla>(`/plantillas/${id}`);
  return data;
}

export async function createPlantilla(
  payload: CreatePlantillaPayload,
): Promise<Plantilla> {
  const { data } = await httpClient.post<Plantilla>('/plantillas', payload);
  return data;
}

export async function updatePlantilla(
  id: string,
  payload: UpdatePlantillaPayload,
): Promise<Plantilla> {
  const { data } = await httpClient.patch<Plantilla>(
    `/plantillas/${id}`,
    payload,
  );
  return data;
}

export async function togglePlantillaActivo(id: string): Promise<Plantilla> {
  const { data } = await httpClient.patch<Plantilla>(
    `/plantillas/${id}/toggle-activo`,
  );
  return data;
}

export async function deletePlantilla(id: string): Promise<Plantilla> {
  const { data } = await httpClient.delete<Plantilla>(`/plantillas/${id}`);
  return data;
}

/**
 * Inventario de tenants de plataforma (Story 4.2 / AD-16).
 * Incluye activos e inactivos. Sin X-Tenant-Id.
 * El selector Sidebar filtra activos; soporte inactivo vía Usar contexto (4.3).
 */
export async function getTenants(): Promise<Tenant[]> {
  const { data } = await httpClient.get<Tenant[]>('/tenants');
  return data;
}

/**
 * Suspender / reactivar tenant (Story 4.3 / AD-14). Idempotente.
 * Solo admin_sistema; sin X-Tenant-Id (plataforma).
 */
export async function setTenantActivo(
  id: string,
  activo: boolean,
): Promise<Tenant> {
  const { data } = await httpClient.patch<Tenant>(`/tenants/${id}/activo`, {
    activo,
  });
  return data;
}

export type OnboardTenantPayload = {
  tenant: { nombre: string; clave: string };
  admin: { nombre: string; email: string; password: string };
};

export type OnboardTenantResponse = {
  tenant: { _id: string; nombre: string; clave: string; activo: boolean };
  admin: { _id: string; email: string; nombre: string; rol: string };
  plantillasSeedCount: number;
};

/** Onboarding atómico (Story 4.1 / AD-13). Solo admin_sistema; sin X-Tenant-Id. */
export async function onboardTenant(
  payload: OnboardTenantPayload,
): Promise<OnboardTenantResponse> {
  const { data } = await httpClient.post<OnboardTenantResponse>(
    '/tenants/onboard',
    payload,
  );
  return data;
}

/** Totales CRM del tenant (Story 7.3). Operativo + admin. */
export async function getDashboardEntityTotals(): Promise<DashboardEntityTotals> {
  const { data } = await httpClient.get<DashboardEntityTotals>(
    '/dashboard/entity-totals',
  );
  return data;
}

/**
 * Configuración del tenant activo (lectura AMES; escritura admin_tenant | admin_sistema).
 * admin_sistema: interceptor envía X-Tenant-Id. admin_tenant/operativo: tenant del JWT.
 * Story 2.4 / FR42.
 */
export async function getTenantConfig(): Promise<TenantConfigResponse> {
  const { data } = await httpClient.get<TenantConfigResponse>('/tenant-config');
  return data;
}

export type UpdateTenantBrandingPayload = {
  razonSocial?: string;
  rfc?: string;
  domicilio?: string;
  telefono?: string;
  emailContacto?: string;
  sitioWeb?: string;
};

/** PATCH branding / datos legales (admin_tenant | admin_sistema). Story 2.4. */
export async function updateTenantBranding(
  payload: UpdateTenantBrandingPayload,
): Promise<TenantConfigResponse> {
  const { data } = await httpClient.patch<TenantConfigResponse>(
    '/tenant-config/branding',
    payload,
  );
  return data;
}

/** Subir o reemplazar logo (multipart). */
export async function uploadTenantLogo(
  file: File,
): Promise<TenantConfigResponse> {
  const form = new FormData();
  form.append('file', file);
  // No setear Content-Type: el interceptor + browser añaden boundary.
  const { data } = await httpClient.post<TenantConfigResponse>(
    '/tenant-config/branding/logo',
    form,
  );
  return data;
}

/** Eliminar logo del tenant activo. */
export async function deleteTenantLogo(): Promise<TenantConfigResponse> {
  const { data } = await httpClient.delete<TenantConfigResponse>(
    '/tenant-config/branding/logo',
  );
  return data;
}

/** Subir o reemplazar logo del banco (Story 2.5). */
export async function uploadTenantBankLogo(
  file: File,
): Promise<TenantConfigResponse> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await httpClient.post<TenantConfigResponse>(
    '/tenant-config/bancarios/logo',
    form,
  );
  return data;
}

/** Eliminar logo del banco. */
export async function deleteTenantBankLogo(): Promise<TenantConfigResponse> {
  const { data } = await httpClient.delete<TenantConfigResponse>(
    '/tenant-config/bancarios/logo',
  );
  return data;
}

export type UpdateTenantEmailPayload = {
  emailRemitente?: string;
  correosNotificacion?: string[];
  /** Cuenta Gmail SMTP (FR-55). */
  emailUser?: string;
  /** App password write-only; nunca vuelve en GET (Story 3.2). */
  emailPass?: string;
};

/** PATCH remitente + notificaciones + credenciales SMTP (Stories 2.3 / 3.2). */
export async function updateTenantEmailConfig(
  payload: UpdateTenantEmailPayload,
): Promise<TenantConfigResponse> {
  const { data } = await httpClient.patch<TenantConfigResponse>(
    '/tenant-config/email',
    payload,
  );
  return data;
}

export type UpdateTenantVigenciaBancariosPayload = {
  vigenciaDefaultDias?: number;
  bancarios?: {
    titular?: string;
    banco?: string;
    cuenta?: string;
    clabe?: string;
    domicilio?: string;
    rfc?: string;
    email?: string;
  };
  /** true/false configura; null limpia; omitido = no tocar. */
  defaultIncluirDatosBancarios?: boolean | null;
  defaultIncluirDescripciones?: boolean | null;
  defaultIncluirImagenesPdf?: boolean | null;
  defaultUsarVigencia?: boolean | null;
};

/** PATCH vigencia default + datos bancarios (Story 2.4). */
export async function updateTenantVigenciaBancarios(
  payload: UpdateTenantVigenciaBancariosPayload,
): Promise<TenantConfigResponse> {
  const { data } = await httpClient.patch<TenantConfigResponse>(
    '/tenant-config/vigencia-bancarios',
    payload,
  );
  return data;
}

export interface AdminUser {
  _id: string;
  email: string;
  nombre: string;
  rol: 'operativo' | 'admin_tenant' | 'admin_sistema';
  tenantId?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUsersFilters {
  activo?: boolean;
  rol?: 'operativo' | 'admin_tenant' | 'admin_sistema';
  search?: string;
}

/** UI create/edit: admin_sistema puede asignar operativo | admin_tenant | admin_sistema. */
export interface CreateUserPayload {
  email: string;
  password: string;
  nombre: string;
  rol: 'operativo' | 'admin_tenant' | 'admin_sistema';
  tenantId?: string;
}

export interface UpdateUserPayload {
  email?: string;
  password?: string;
  nombre?: string;
  rol?: 'operativo' | 'admin_tenant' | 'admin_sistema';
  tenantId?: string | null;
  activo?: boolean;
}

export async function getUsers(
  filters: AdminUsersFilters = {},
): Promise<AdminUser[]> {
  const params: Record<string, string | boolean> = {};
  if (filters.activo !== undefined) params.activo = filters.activo;
  if (filters.rol) params.rol = filters.rol;
  if (filters.search) params.search = filters.search;
  const { data } = await httpClient.get<AdminUser[]>('/users', { params });
  return data;
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<AdminUser> {
  const { data } = await httpClient.post<AdminUser>('/users', payload);
  return data;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<AdminUser> {
  const { data } = await httpClient.patch<AdminUser>(`/users/${id}`, payload);
  return data;
}

export async function deactivateUser(id: string): Promise<AdminUser> {
  const { data } = await httpClient.delete<AdminUser>(`/users/${id}`);
  return data;
}

export async function getAuditEvents(
  filters: AdminAuditFilters = {},
): Promise<PaginatedAuditEventsResponse> {
  const params: Record<string, string | number | boolean> = {};
  if (filters.fechaDesde) params.fechaDesde = filters.fechaDesde;
  if (filters.fechaHasta) params.fechaHasta = filters.fechaHasta;
  if (filters.actorId) params.actorId = filters.actorId;
  if (filters.actionType) params.actionType = filters.actionType;
  if (filters.resourceType) params.resourceType = filters.resourceType;
  if (filters.resourceId) params.resourceId = filters.resourceId;
  if (filters.result) params.result = filters.result;
  if (filters.includePlatform) params.includePlatform = true;
  params.page = filters.page ?? 1;
  params.limit = filters.limit ?? 20;
  const { data } = await httpClient.get<PaginatedAuditEventsResponse>(
    '/audit-events',
    { params },
  );
  return data;
}
