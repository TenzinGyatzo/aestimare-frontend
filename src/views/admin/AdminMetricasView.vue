<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-6">Métricas de Uso</h1>

    <!-- Mensaje de error -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <!-- Filtros -->
    <div class="mb-6 space-y-4">
      <!-- Filtros por periodo + tipo (Story 7.2 / UX-DR7) -->
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 class="text-sm font-medium text-gray-700 mb-3">
          Filtros
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label
              for="fechaDesde"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Inicial
            </label>
            <input
              id="fechaDesde"
              v-model="fechaDesde"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-medical-blue-500 focus:border-medical-blue-500"
              @change="aplicarFiltros"
            />
          </div>
          <div>
            <label
              for="fechaHasta"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha Final
            </label>
            <input
              id="fechaHasta"
              v-model="fechaHasta"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-medical-blue-500 focus:border-medical-blue-500"
              @change="aplicarFiltros"
            />
          </div>
          <div>
            <label
              for="filtroTipo"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de ítem
            </label>
            <select
              id="filtroTipo"
              v-model="filtroTipo"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-medical-blue-500 focus:border-medical-blue-500"
              @change="aplicarFiltros"
            >
              <option value="">Todos</option>
              <option value="producto">Producto</option>
              <option value="servicio">Servicio</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              Aplica a catálogo, tops y desglose
            </p>
          </div>
          <div>
            <button
              @click="limpiarFiltros"
              class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Sección Clientes -->
      <div>
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Clientes</h2>
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="overflow-y-auto max-h-[306px]">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    #
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Empresa
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    RFC
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Última Cotización
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Total COT
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="isLoading">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    Cargando métricas de clientes...
                  </td>
                </tr>
                <tr v-else-if="metricasClientes.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="(cliente, index) in metricasClientes"
                  :key="cliente.clienteId"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    {{ cliente.empresa || '-' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500 uppercase">
                    {{ cliente.rfc }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{
                      cliente.fechaUltimaCotizacion
                        ? formatDate(cliente.fechaUltimaCotizacion)
                        : '-'
                    }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{ cliente.totalCotizaciones }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sección Catálogo (ítems tipados — Story 7.1) -->
      <div>
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Catálogo</h2>
        <div class="bg-white shadow-md rounded-lg overflow-hidden">
          <div class="overflow-y-auto max-h-[306px]">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    #
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Ítem
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Precio Unitario
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    Veces Contratado
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-if="isLoading">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    Cargando métricas del catálogo...
                  </td>
                </tr>
                <tr v-else-if="metricasServicios.length === 0">
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
                <tr
                  v-else
                  v-for="(servicio, index) in metricasServicios"
                  :key="servicio.servicioId"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ index + 1 }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span>{{ servicio.nombreServicio }}</span>
                      <span
                        class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        :class="claseTipoDe(servicio.tipoSnapshot)"
                        :title="labelTipoDe(servicio.tipoSnapshot)"
                      >
                        {{ codigoTipoDe(servicio.tipoSnapshot) }}
                      </span>
                    </div>
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium"
                  >
                    {{ formatMoney(servicio.precioUnitario) }}
                  </td>
                  <td
                    class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {{ servicio.vecesContratado }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Sección Resumen Ejecutivo -->
    <div class="mt-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Resumen Ejecutivo
      </h2>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-4"
      >
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Emitidas</h3>
          <p class="text-2xl font-semibold text-gray-900">
            <span
              v-if="isLoading"
              class="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 align-middle"
              aria-label="Cargando"
            />
            <template v-else>
              {{ metricasTotales?.cotizacionesEmitidas ?? metricasTotales?.cotizacionesTotales ?? '-' }}
            </template>
          </p>
          <p class="text-xs text-gray-500 mt-1">En el periodo filtrado</p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Aceptadas</h3>
          <p class="text-2xl font-semibold text-gray-900">
            <span
              v-if="isLoading"
              class="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 align-middle"
              aria-label="Cargando"
            />
            <template v-else>
              {{ metricasTotales?.cotizacionesAceptadas ?? '-' }}
            </template>
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Rechazadas</h3>
          <p class="text-2xl font-semibold text-gray-900">
            <span
              v-if="isLoading"
              class="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 align-middle"
              aria-label="Cargando"
            />
            <template v-else>
              {{ metricasTotales?.cotizacionesRechazadas ?? '-' }}
            </template>
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Hoy</h3>
          <p class="text-2xl font-semibold text-gray-900">
            <span
              v-if="isLoading"
              class="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 align-middle"
              aria-label="Cargando"
            />
            <template v-else>
              {{ metricasTotales?.cotizacionesHoy ?? '-' }}
            </template>
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Este mes</h3>
          <p class="text-2xl font-semibold text-gray-900">
            <span
              v-if="isLoading"
              class="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 align-middle"
              aria-label="Cargando"
            />
            <template v-else>
              {{ metricasTotales?.cotizacionesMes ?? '-' }}
            </template>
          </p>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">Este año</h3>
          <p class="text-2xl font-semibold text-gray-900">
            <span
              v-if="isLoading"
              class="inline-block h-8 w-16 animate-pulse rounded bg-gray-200 align-middle"
              aria-label="Cargando"
            />
            <template v-else>
              {{ metricasTotales?.cotizacionesAnio ?? '-' }}
            </template>
          </p>
        </div>
      </div>
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
      >
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Mayor Solicitante
          </h3>
          <template v-if="isLoading">
            <p class="text-lg font-semibold text-gray-900">
              <span
                class="inline-block h-6 w-28 animate-pulse rounded bg-gray-200 align-middle"
                aria-label="Cargando"
              />
            </p>
          </template>
          <template v-else>
            <p
              v-if="metricasTotales?.mayorSolicitante"
              class="text-lg font-semibold text-gray-900"
            >
              {{
                metricasTotales.mayorSolicitante.empresa ||
                metricasTotales.mayorSolicitante.rfc ||
                '-'
              }}
            </p>
            <p v-else class="text-lg font-semibold text-gray-900">-</p>
            <p
              v-if="metricasTotales?.mayorSolicitante"
              class="text-xs text-gray-500 mt-1"
            >
              {{ metricasTotales.mayorSolicitante.totalCotizaciones }}
              cotizaciones
            </p>
          </template>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Cliente más activo del mes
          </h3>
          <template v-if="isLoading">
            <p class="text-lg font-semibold text-gray-900">
              <span
                class="inline-block h-6 w-28 animate-pulse rounded bg-gray-200 align-middle"
                aria-label="Cargando"
              />
            </p>
          </template>
          <template v-else>
            <p
              v-if="metricasTotales?.clienteMasActivoMes"
              class="text-lg font-semibold text-gray-900"
            >
              {{
                metricasTotales.clienteMasActivoMes.empresa ||
                metricasTotales.clienteMasActivoMes.rfc ||
                '-'
              }}
            </p>
            <p v-else class="text-lg font-semibold text-gray-900">-</p>
            <p
              v-if="metricasTotales?.clienteMasActivoMes"
              class="text-xs text-gray-500 mt-1"
            >
              {{ metricasTotales.clienteMasActivoMes.totalCotizaciones }}
              cotizaciones este mes
            </p>
          </template>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Ítem más contratado
          </h3>
          <template v-if="isLoading">
            <p class="text-lg font-semibold text-gray-900">
              <span
                class="inline-block h-6 w-28 animate-pulse rounded bg-gray-200 align-middle"
                aria-label="Cargando"
              />
            </p>
          </template>
          <template v-else>
            <p class="text-lg font-semibold text-gray-900">
              {{ metricasTotales?.servicioMasSolicitado?.nombreServicio || '-' }}
            </p>
            <p
              v-if="metricasTotales?.servicioMasSolicitado"
              class="text-xs text-gray-500"
            >
              {{ metricasTotales.servicioMasSolicitado.vecesSolicitado }} veces
            </p>
          </template>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Ítem más rentable
          </h3>
          <template v-if="isLoading">
            <p class="text-lg font-semibold text-gray-900">
              <span
                class="inline-block h-6 w-28 animate-pulse rounded bg-gray-200 align-middle"
                aria-label="Cargando"
              />
            </p>
          </template>
          <template v-else>
            <p class="text-lg font-semibold text-gray-900">
              {{ metricasTotales?.servicioMasRentable?.nombreServicio || '-' }}
            </p>
            <p
              v-if="metricasTotales?.servicioMasRentable"
              class="text-xs text-gray-500"
            >
              {{ formatMoney(metricasTotales.servicioMasRentable.ingresosTotales) }}
            </p>
          </template>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Tasa de conversión
          </h3>
          <template v-if="isLoading">
            <p class="text-lg font-semibold text-gray-900">
              <span
                class="inline-block h-6 w-16 animate-pulse rounded bg-gray-200 align-middle"
                aria-label="Cargando"
              />
            </p>
          </template>
          <template v-else>
            <p class="text-lg font-semibold text-gray-900">
              {{
                metricasTotales?.tasaConversion !== undefined &&
                ofertasValidasConversion > 0
                  ? (metricasTotales.tasaConversion * 100).toFixed(1) + '%'
                  : metricasTotales?.tasaConversion === 0
                    ? '0.0%'
                    : '-'
              }}
            </p>
            <p
              v-if="metricasTotales?.cotizacionesEmitidas !== undefined"
              class="text-xs text-gray-500 mt-1"
            >
              Ofertas: {{ ofertasValidasConversion }} - Aceptadas: {{ metricasTotales.cotizacionesAceptadas ?? 0 }} 
            </p>
          </template>
        </div>
        <div class="bg-white shadow-md rounded-lg p-6">
          <h3 class="text-sm font-medium text-gray-500 mb-2">
            Ingresos totales
          </h3>
          <p class="text-lg font-semibold text-gray-900">
            <span
              v-if="isLoading"
              class="inline-block h-6 w-24 animate-pulse rounded bg-gray-200 align-middle"
              aria-label="Cargando"
            />
            <template v-else>
              {{
                metricasTotales
                  ? formatMoney(metricasTotales.ingresosTotales)
                  : '-'
              }}
            </template>
          </p>
          <p class="text-xs text-gray-500 mt-1">No incluye IVA</p>
          <!-- FR63 / UX-DR7 — desglose por línea (tipoSnapshot); Sin tipo solo si > 0 -->
          <ul
            v-if="!isLoading && desgloseVisible"
            class="mt-3 space-y-1 text-xs text-gray-600 border-t border-gray-100 pt-2"
            aria-label="Desglose por tipo"
          >
            <li class="flex justify-between gap-2">
              <span>Producto</span>
              <span class="tabular-nums text-gray-800">
                {{ formatMoney(desglose.producto.ingresosTotales) }}
                <span class="text-gray-400"
                  >({{ desglose.producto.vecesContratado }} uds)</span
                >
              </span>
            </li>
            <li class="flex justify-between gap-2">
              <span>Servicio</span>
              <span class="tabular-nums text-gray-800">
                {{ formatMoney(desglose.servicio.ingresosTotales) }}
                <span class="text-gray-400"
                  >({{ desglose.servicio.vecesContratado }} uds)</span
                >
              </span>
            </li>
            <li
              v-if="mostrarSinTipo"
              class="flex justify-between gap-2 text-gray-500"
            >
              <span>Sin tipo</span>
              <span class="tabular-nums">
                {{ formatMoney(desglose.sinTipo.ingresosTotales) }}
                <span class="text-gray-400"
                  >({{ desglose.sinTipo.vecesContratado }} uds)</span
                >
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdmin } from '../../composables/useAdmin';
import { formatMoney } from '../../utils/currency';

// Vista de métricas admin: orquesta la carga de datos usando el composable useAdmin
// Toda la lógica de negocio está en el composable, la vista solo maneja UI

const {
  metricasClientes,
  metricasServicios,
  metricasTotales,
  isLoading,
  error,
  obtenerMetricas,
} = useAdmin();

const fechaDesde = ref<string>('');
const fechaHasta = ref<string>('');
/** '' = todos (omitir query); Story 7.2 SaaS. */
const filtroTipo = ref<'' | 'producto' | 'servicio'>('');

/** Denominador de conversión: emitidas (el BE ya excluye canceladas). */
const ofertasValidasConversion = computed(
  () => metricasTotales.value?.cotizacionesEmitidas ?? 0,
);

const emptyBucket = () => ({ ingresosTotales: 0, vecesContratado: 0 });

/** Desglose por línea (AD-22); ceros si el BE aún no envía el campo. */
const desglose = computed(() => {
  const d = metricasTotales.value?.desglosePorTipo;
  return {
    producto: { ...emptyBucket(), ...(d?.producto ?? {}) },
    servicio: { ...emptyBucket(), ...(d?.servicio ?? {}) },
    sinTipo: { ...emptyBucket(), ...(d?.sinTipo ?? {}) },
  };
});

const desgloseVisible = computed(() => !!metricasTotales.value?.desglosePorTipo);

const mostrarSinTipo = computed(() => {
  const s = desglose.value.sinTipo;
  return s.ingresosTotales > 0 || s.vecesContratado > 0;
});

function codigoTipoDe(tipo?: string | null): string {
  if (tipo === 'producto') return 'PROD';
  if (tipo === 'servicio') return 'SERV';
  return '—';
}

function labelTipoDe(tipo?: string | null): string {
  if (tipo === 'producto') return 'Producto';
  if (tipo === 'servicio') return 'Servicio';
  return 'Sin tipo';
}

function claseTipoDe(tipo?: string | null): string {
  if (tipo === 'producto') return 'bg-amber-50 text-amber-800';
  if (tipo === 'servicio') return 'bg-sky-50 text-sky-800';
  return 'bg-gray-100 text-gray-600';
}

/**
 * Construye los filtros actuales y aplica las métricas
 */
const aplicarFiltros = async () => {
  try {
    const filters: {
      fechaDesde?: string;
      fechaHasta?: string;
      tipo?: 'producto' | 'servicio';
    } = {};

    // Filtros por fecha
    if (fechaDesde.value) {
      // Crear fecha en hora local (no UTC) para evitar problemas de zona horaria
      // fechaDesde.value viene en formato "YYYY-MM-DD"
      const dateParts = fechaDesde.value.split('-').map(Number);
      if (
        dateParts.length === 3 &&
        dateParts[0] &&
        dateParts[1] &&
        dateParts[2]
      ) {
        const [year, month, day] = dateParts;
        const fechaDesdeDate = new Date(year, month - 1, day, 0, 0, 0, 0); // month - 1 porque Date usa 0-11
        filters.fechaDesde = fechaDesdeDate.toISOString();
      }
    }

    if (fechaHasta.value) {
      // Crear fecha en hora local (no UTC) para evitar problemas de zona horaria
      // fechaHasta.value viene en formato "YYYY-MM-DD"
      const dateParts = fechaHasta.value.split('-').map(Number);
      if (
        dateParts.length === 3 &&
        dateParts[0] &&
        dateParts[1] &&
        dateParts[2]
      ) {
        const [year, month, day] = dateParts;
        const fechaHastaDate = new Date(year, month - 1, day, 23, 59, 59, 999); // month - 1 porque Date usa 0-11
        filters.fechaHasta = fechaHastaDate.toISOString();
      }
    }

    if (filtroTipo.value === 'producto' || filtroTipo.value === 'servicio') {
      filters.tipo = filtroTipo.value;
    }

    // Recargar métricas con los filtros aplicados
    await obtenerMetricas(filters);
  } catch (err) {
    console.error('Error al aplicar filtros:', err);
  }
};

/**
 * Limpia fechas + tipo (Todos)
 */
const limpiarFiltros = async () => {
  fechaDesde.value = '';
  fechaHasta.value = '';
  filtroTipo.value = '';
  await aplicarFiltros();
};

onMounted(async () => {
  try {
    await aplicarFiltros();
  } catch (err) {
    // El error ya está manejado en el store/composable
  }
});

// Formatear fecha para mostrar
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
/* Scrollbar sutil y casi invisible */
.scrollbar-sutil::-webkit-scrollbar {
  height: 3px;
}
.scrollbar-sutil::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-sutil::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.scrollbar-sutil::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Para Firefox */
.scrollbar-sutil {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}
</style>
