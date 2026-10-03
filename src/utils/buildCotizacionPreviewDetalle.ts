import type { ItemOverrideFields } from '../components/cotizador/TablaServiciosCotizador.vue';
import type {
  Cliente,
  CotizacionDetalleDto,
  SeccionPlantilla,
  Servicio,
} from '../types/backend';

export type BuildPreviewDetalleInput = {
  clienteId: string;
  clientes: Cliente[];
  datosCliente: {
    empresa: string;
    nombreContacto: string;
    correo: string;
    telefono: string;
    cargo: string;
  };
  cantidadesPorServicio: Record<string, number>;
  itemOverrides: Record<string, ItemOverrideFields>;
  serviciosDisponibles: Servicio[];
  sinVigencia: boolean;
  fechaVencimientoIso?: string;
  incluirDatosBancarios: boolean;
  incluirDescripciones: boolean;
  incluirImagenesPdf: boolean;
  agregarIva: boolean;
  plantillasSeleccionadasIds: string[];
  plantillaSnapshots: Record<
    string,
    { nombre: string; secciones: SeccionPlantilla[] }
  >;
};

function displayOf(
  servicio: Servicio,
  itemOverrides: Record<string, ItemOverrideFields>,
): ItemOverrideFields {
  const id = servicio._id || '';
  const o = itemOverrides[id];
  if (o) return o;
  return {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    precioUnitario: servicio.precioUnitario ?? 0,
  };
}

/** Arma un CotizacionDetalleDto sintético para preview PDF pre-guardado. */
export function buildCotizacionPreviewDetalle(
  input: BuildPreviewDetalleInput,
): CotizacionDetalleDto {
  const items = Object.entries(input.cantidadesPorServicio)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([servicioId, cantidad]) => {
      const svc =
        input.serviciosDisponibles.find((s) => s._id === servicioId) ||
        ({
          _id: servicioId,
          nombre: 'Servicio',
          precioUnitario: 0,
        } as Servicio);
      const display = displayOf(svc, input.itemOverrides);
      const precioUnitario = Number(display.precioUnitario);
      const subtotal = precioUnitario * cantidad;
      // Story 8.3 — tipoSnapshot para live-resolve PDF (sin imagenUrl en línea).
      const tipoSnapshot =
        svc.tipo === 'producto' || svc.tipo === 'servicio'
          ? svc.tipo
          : undefined;
      return {
        servicioId,
        nombreServicioSnapshot: display.nombre.trim() || svc.nombre,
        descripcionServicioSnapshot: (display.descripcion || '').trim() || undefined,
        precioUnitarioSnapshot: precioUnitario,
        cantidad,
        subtotal,
        ...(tipoSnapshot ? { tipoSnapshot } : {}),
      };
    });

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  const clienteCatalog = input.clienteId
    ? input.clientes.find((c) => c._id === input.clienteId)
    : undefined;

  const plantillasSnapshot = input.plantillasSeleccionadasIds.map((id) => {
    const snap = input.plantillaSnapshots[id];
    return {
      plantillaId: id,
      nombreSnapshot: snap?.nombre || 'Plantilla',
      schemaVersion: 1,
      secciones: snap?.secciones || [],
    };
  });

  const nombre = input.datosCliente.nombreContacto.trim();
  const correo = input.datosCliente.correo.trim();
  const telefono = input.datosCliente.telefono.trim();
  const cargo = input.datosCliente.cargo.trim();
  const empresa = input.datosCliente.empresa.trim();

  const detalle: CotizacionDetalleDto = {
    _id: 'preview',
    folio: 'VISTA-PREVIA',
    clienteId: clienteCatalog || '',
    emailContacto: correo,
    items,
    total,
    moneda: 'MXN',
    fechaCreacion: new Date(),
    estado: 'vigente',
    sinVigencia: input.sinVigencia,
    incluirDatosBancarios: input.incluirDatosBancarios,
    incluirDescripciones: input.incluirDescripciones,
    incluirImagenesPdf: input.incluirImagenesPdf,
    agregarIva: input.agregarIva,
  };

  if (!input.sinVigencia && input.fechaVencimientoIso) {
    detalle.fechaVencimiento = input.fechaVencimientoIso;
  }
  if (empresa) detalle.nombreEmpresa = empresa;
  if (nombre) detalle.nombreContacto = nombre;
  if (telefono) detalle.telefonoContacto = telefono;
  if (cargo) detalle.cargoContacto = cargo;
  if (plantillasSnapshot.length > 0) {
    detalle.plantillasSnapshot = plantillasSnapshot;
  }

  return detalle;
}
