/**
 * Hidrata AdminCotizadorView desde preview de repetir cotización.
 */

import type { Ref } from 'vue';
import type { RepetirCotizacionPreviewDto } from '../services/admin-api.service';
import type { Cliente, Contacto, Servicio } from '../types/backend';
import type { ItemOverrideFields } from '../components/cotizador/TablaServiciosCotizador.vue';

export type CotizadorHydrateContext = {
  draft: RepetirCotizacionPreviewDto;
  clientes: Ref<Cliente[]>;
  contactos: Ref<Contacto[]>;
  clienteId: Ref<string>;
  contactoId: Ref<string>;
  identidadConfirmada: Ref<boolean>;
  cotizarSinCliente: Ref<boolean>;
  cotizarSinContacto: Ref<boolean>;
  datosCliente: Ref<{
    empresa: string;
    nombreContacto: string;
    correo: string;
    telefono: string;
    cargo: string;
  }>;
  cantidadesPorServicio: Ref<Record<string, number>>;
  itemOverrides: Ref<Record<string, ItemOverrideFields>>;
  catalogBaseline: Ref<Record<string, ItemOverrideFields>>;
  serviciosDisponibles: Ref<Servicio[]>;
  sinVigencia: Ref<boolean>;
  vigenciaDias: Ref<number>;
  emailsPara: Ref<string[]>;
  emailsCc: Ref<string[]>;
  incluirDatosBancarios: Ref<boolean>;
  mostrarDescripciones: Ref<boolean>;
  incluirImagenesPdf: Ref<boolean>;
  agregarIva: Ref<boolean>;
  /** Fallback cuando el draft no trae el flag (cotización antigua). */
  tenantDefaultIncluirDatosBancarios?: boolean;
  tenantDefaultIncluirDescripciones?: boolean;
  tenantDefaultIncluirImagenesPdf?: boolean;
  plantillasSeleccionadasIds: Ref<string[]>;
  plantillaSnapshots: Ref<
    Record<string, { nombre: string; secciones: import('../types/backend').SeccionPlantilla[] }>
  >;
  cargarContactos: (clienteId: string) => Promise<void>;
  actualizarCantidad: (servicioId: string, cantidad: number) => void;
  vigenciaDefaultDias: number;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function resolveFlag(
  saved: boolean | null | undefined,
  tenantDefault: boolean | null | undefined,
): boolean {
  if (typeof saved === 'boolean') return saved;
  if (typeof tenantDefault === 'boolean') return tenantDefault;
  return true;
}

function mergeServicioStub(
  disponibles: Servicio[],
  servicioId: string,
  item: RepetirCotizacionPreviewDto['items'][number],
): Servicio[] {
  if (disponibles.some((s) => s._id === servicioId)) {
    return disponibles;
  }
  // Preview no trae categoría; omitir campo (no usar '' — ObjectId inválido)
  const stub = {
    _id: servicioId,
    nombre: item.nombre?.trim() || 'Servicio',
    descripcion: item.descripcion?.trim() || '',
    precioUnitario: item.precioUnitario ?? 0,
    activo: true,
  } as Servicio;
  return [...disponibles, stub];
}

/** Aplica preview repetir al estado del wizard (tras cargar catálogos base). */
export async function hydrateCotizadorFromDraft(
  ctx: CotizadorHydrateContext,
): Promise<void> {
  const { draft } = ctx;

  // UI positiva: usarVigencia = !sinVigencia; ausente → usar vigencia (ON)
  ctx.sinVigencia.value = draft.sinVigencia === true;
  ctx.vigenciaDias.value = ctx.vigenciaDefaultDias;
  ctx.emailsPara.value = [...(draft.emailsPara || [])];
  ctx.emailsCc.value = [...(draft.emailsCc || [])].filter(
    (e) => !ctx.emailsPara.value.includes(e),
  );
  // Bases: saved ?? tenant ?? true (nunca pisar con availability)
  ctx.incluirDatosBancarios.value = resolveFlag(
    draft.incluirDatosBancarios,
    ctx.tenantDefaultIncluirDatosBancarios,
  );
  ctx.mostrarDescripciones.value = resolveFlag(
    draft.incluirDescripciones,
    ctx.tenantDefaultIncluirDescripciones,
  );
  ctx.incluirImagenesPdf.value = resolveFlag(
    draft.incluirImagenesPdf,
    ctx.tenantDefaultIncluirImagenesPdf,
  );
  // Fuente sin campo → encendido. No usa default de tenant.
  ctx.agregarIva.value = draft.agregarIva !== false;

  ctx.plantillasSeleccionadasIds.value = (draft.plantillas || []).map(
    (p) => p.plantillaId,
  );
  const snaps: CotizadorHydrateContext['plantillaSnapshots']['value'] = {};
  for (const p of draft.plantillas || []) {
    if (p.nombre && p.secciones) {
      snaps[p.plantillaId] = {
        nombre: p.nombre,
        secciones: p.secciones,
      };
    }
  }
  ctx.plantillaSnapshots.value = snaps;

  let disponibles = [...ctx.serviciosDisponibles.value];
  const overrides: Record<string, ItemOverrideFields> = {};
  const baseline: Record<string, ItemOverrideFields> = {};

  for (const item of draft.items || []) {
    const sid = item.servicioId;
    if (!sid) continue;
    disponibles = mergeServicioStub(disponibles, sid, item);
    ctx.actualizarCantidad(sid, item.cantidad);
    const o: ItemOverrideFields = {
      nombre: item.nombre?.trim() || '',
      descripcion: item.descripcion?.trim() || '',
      precioUnitario: item.precioUnitario ?? 0,
    };
    overrides[sid] = { ...o };
    baseline[sid] = { ...o };
  }
  ctx.serviciosDisponibles.value = disponibles;
  ctx.itemOverrides.value = overrides;
  ctx.catalogBaseline.value = baseline;

  const hasCliente = !!draft.clienteId?.trim();
  ctx.cotizarSinCliente.value = !hasCliente;
  ctx.cotizarSinContacto.value = !hasCliente;

  ctx.datosCliente.value = {
    empresa: draft.nombreEmpresa?.trim() || '',
    nombreContacto: draft.nombreContacto?.trim() || '',
    correo: draft.emailContacto?.trim() || '',
    telefono: draft.telefonoContacto?.trim() || '',
    cargo: draft.cargoContacto?.trim() || '',
  };

  ctx.clienteId.value = '';
  ctx.contactoId.value = '';
  ctx.contactos.value = [];

  if (hasCliente && draft.clienteId) {
    ctx.clienteId.value = draft.clienteId;
    ctx.cotizarSinCliente.value = false;
    await ctx.cargarContactos(draft.clienteId);

    const emailNorm = draft.emailContacto
      ? normalizeEmail(draft.emailContacto)
      : '';
    const matched = emailNorm
      ? ctx.contactos.value.find(
          (c) => normalizeEmail(c.correo || '') === emailNorm,
        )
      : undefined;

    if (matched?._id) {
      ctx.contactoId.value = matched._id;
      ctx.cotizarSinContacto.value = false;
      ctx.datosCliente.value.nombreContacto =
        matched.nombre || ctx.datosCliente.value.nombreContacto;
      ctx.datosCliente.value.correo =
        matched.correo || ctx.datosCliente.value.correo;
      ctx.datosCliente.value.telefono =
        matched.telefono || ctx.datosCliente.value.telefono;
      ctx.datosCliente.value.cargo =
        matched.cargo || ctx.datosCliente.value.cargo;
    } else if (draft.nombreContacto || draft.emailContacto) {
      ctx.cotizarSinContacto.value = true;
    } else {
      ctx.cotizarSinContacto.value = false;
    }

    const c = ctx.clientes.value.find((x) => x._id === draft.clienteId);
    if (c?.empresa) {
      ctx.datosCliente.value.empresa = c.empresa;
    }
  } else {
    ctx.cotizarSinContacto.value = true;
  }

  ctx.identidadConfirmada.value = true;
}
