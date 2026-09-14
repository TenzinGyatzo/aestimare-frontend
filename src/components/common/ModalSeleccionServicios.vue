<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300"
    :inert="altaAbierta"
    @pointerdown="onBackdropPointerDown"
    @pointerup="onBackdropPointerUp"
    @pointercancel="onBackdropPointerCancel"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
      @click.stop
    >
      <div
        class="px-4 sm:px-6 py-3 sm:py-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2 bg-white"
      >
        <div>
          <h3 class="text-lg sm:text-xl font-bold text-gray-900">
            Catálogo
          </h3>
          <p class="text-xs text-gray-500 mt-0.5">
            Selecciona ítems y ajusta la cantidad de cada uno
          </p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="px-3 py-1.5 rounded-md border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors font-medium text-sm"
            @click="abrirAlta('servicio')"
          >
            + Servicio
          </button>
          <button
            type="button"
            class="px-3 py-1.5 rounded-md border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors font-medium text-sm"
            @click="abrirAlta('producto')"
          >
            + Producto
          </button>
        <button
          type="button"
          @click="cerrar"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          aria-label="Cerrar"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        </div>
      </div>

      <div
        class="px-4 sm:px-6 pt-1.5 sm:pt-3 pb-2 sm:pb-3 border-b border-gray-100"
      >
        <div
          class="overflow-x-auto"
          role="tablist"
          aria-label="Categorías de servicio"
        >
          <div class="inline-grid grid-flow-col auto-cols-[2.75rem] gap-1">
            <button
              type="button"
              role="tab"
              :aria-selected="!categoriaIdFiltro"
              aria-label="Todas las categorías"
              title="Todas las categorías"
              :disabled="loadingCategorias"
              class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis disabled:opacity-60 disabled:pointer-events-none"
              :class="
                !categoriaIdFiltro
                  ? 'bg-medical-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              "
              @click="selectCategoria('')"
            >
              Todas
            </button>
            <button
              v-for="cat in categorias"
              :key="cat._id"
              type="button"
              role="tab"
              :aria-selected="categoriaIdFiltro === cat._id"
              :aria-label="cat.nombre"
              :title="cat.nombre"
              :disabled="loadingCategorias"
              class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis disabled:opacity-60 disabled:pointer-events-none"
              :class="
                categoriaIdFiltro === cat._id
                  ? 'bg-medical-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              "
              @click="selectCategoria(cat._id)"
            >
              {{ cat.codigo }}
            </button>
          </div>
        </div>
      </div>

      <div class="px-4 sm:px-6 py-2 sm:py-4 bg-gray-50/50 border-b border-gray-100">
        <div class="flex flex-row sm:items-center gap-3">
          <div class="relative flex-1 min-w-0">
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por nombre…"
              class="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm bg-white border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-blue-500 focus:border-transparent transition-all shadow-sm"
            />
            <div
              class="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div class="shrink-0 min-w-[7.5rem]">
            <label for="filtro-tipo-modal-catalogo" class="sr-only"
              >Tipo</label
            >
            <select
              id="filtro-tipo-modal-catalogo"
              v-model="tipoFiltro"
              class="w-full rounded-lg sm:rounded-xl border border-gray-200 bg-white text-sm px-2 sm:px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-medical-blue-500 shadow-sm"
              @change="onTipoFiltroChange"
            >
              <option value="">Todos</option>
              <option value="servicio">Servicio</option>
              <option value="producto">Producto</option>
            </select>
          </div>
          <div
            class="hidden sm:flex items-center gap-1 shrink-0"
            role="group"
            aria-label="Orden del catálogo"
          >
            <span class="text-[11px] text-gray-400 hidden sm:inline">Orden:</span>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-semibold transition-colors"
              :class="
                ordenActivo === 'creacion'
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              "
              @click="setOrden('creacion')"
            >
              Creación
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-semibold transition-colors"
              :class="
                ordenActivo === 'nombre_asc'
                  ? 'bg-gray-200 text-gray-800'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              "
              @click="setOrden('nombre_asc')"
            >
              A-Z
            </button>
          </div>
        </div>
      </div>

      <div
        class="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 custom-scrollbar"
      >
        <div
          v-if="loadingCatalogo || loadingCategorias"
          class="flex flex-col items-center justify-center py-12 gap-3 text-gray-400"
        >
          <svg
            class="animate-spin h-8 w-8 text-medical-blue-500"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <span class="font-medium">Cargando catálogo...</span>
        </div>

        <div
          v-else-if="categoriasCargadas && categorias.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <p class="text-gray-900 font-bold">No hay categorías activas</p>
          <p class="text-sm text-gray-500 max-w-xs mx-auto mt-1">
            Crea categorías en administración para organizar y filtrar el
            catálogo.
          </p>
          <router-link
            to="/admin/categorias"
            class="mt-3 text-sm font-bold text-medical-blue-600 hover:text-medical-blue-700 underline"
            @click="cerrar"
          >
            Gestionar categorías
          </router-link>
        </div>

        <div
          v-else-if="catalogo.length === 0"
          class="flex flex-col items-center justify-center py-12 text-center"
        >
          <p class="text-gray-900 font-bold">No se encontraron resultados</p>
          <p class="text-sm text-gray-500 max-w-xs mx-auto mt-1">
            Prueba otro término de búsqueda, tipo o categoría.
          </p>
        </div>

        <div v-else class="space-y-2 sm:space-y-3">
          <label
            v-for="servicio in catalogo"
            :key="servicio._id"
            :data-catalogo-id="servicio._id"
            class="group flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 border border-gray-100 bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-medical-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
            :class="{
              'border-medical-blue-300 bg-medical-blue-50/40': isSelected(
                servicio._id || '',
              ),
            }"
          >
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <input
                type="checkbox"
                class="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                :checked="isSelected(servicio._id || '')"
                @change="toggleServicio(servicio._id || '')"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <h4
                    class="font-bold text-gray-800 leading-tight group-hover:text-medical-blue-700 transition-colors"
                  >
                    {{ servicio.nombre || 'Sin nombre' }}
                  </h4>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                    :class="claseTipoDe(servicio.tipo)"
                    :title="labelTipoDe(servicio.tipo)"
                  >
                    {{ codigoTipoDe(servicio.tipo) }}
                  </span>
                  <span
                    class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 text-gray-600"
                    :title="labelCategoriaDe(servicio.categoriaId)"
                  >
                    {{ codigoCategoriaDe(servicio.categoriaId) }}
                  </span>
                </div>
                <p
                  v-if="servicio.descripcion"
                  class="text-sm text-gray-500 line-clamp-2 sm:line-clamp-1 mb-2"
                >
                  {{ servicio.descripcion }}
                </p>
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-medical-blue-50 text-medical-blue-700 border border-medical-blue-100"
                >
                  {{ formatMoney(Number(servicio.precioUnitario || 0)) }}
                </span>
              </div>
            </div>
            <div
              v-if="isSelected(servicio._id || '')"
              class="flex items-center justify-between sm:justify-end gap-3 sm:pl-2 sm:border-l sm:border-medical-blue-100"
              @click.prevent.stop
            >
              <span
                class="text-[10px] font-bold uppercase tracking-wide text-gray-400 sm:hidden"
                >Cantidad</span
              >
              <QuantitySelector
                :model-value="cantidadDe(servicio._id || '')"
                @update:model-value="
                  (value) => setCantidad(servicio._id || '', value)
                "
              />
            </div>
          </label>
        </div>
      </div>

      <div
        class="px-4 sm:px-6 py-3 sm:py-5 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm"
      >
        <div class="flex flex-row items-center justify-between gap-2 mb-2 sm:mb-4">
          <div
            class="text-[11px] sm:text-sm font-semibold text-gray-500 tracking-widest leading-tight"
          >
            {{ seleccionadosCount }} servicio(s) seleccionado(s)
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end sm:items-center sm:gap-3">
          <div class="flex gap-2 sm:contents">
            <button
              type="button"
              @click="cerrar"
              class="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 active:scale-95 transition-all font-bold text-sm shadow-sm sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              @click="aplicarSeleccion(false)"
              :disabled="!puedeAplicar"
              class="flex-1 sm:flex-none px-4 sm:px-5 py-2 sm:py-2.5 bg-white border border-medical-blue-200 text-medical-blue-700 rounded-xl hover:bg-medical-blue-50 active:scale-95 transition-all font-bold text-sm shadow-sm disabled:opacity-50 disabled:pointer-events-none sm:order-2"
            >
              Aplicar
            </button>
          </div>
          <button
            type="button"
            @click="aplicarSeleccion(true)"
            :disabled="!puedeContinuar"
            class="w-full sm:w-auto sm:ml-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-medical-green-500 text-white rounded-xl hover:bg-medical-green-600 active:scale-95 transition-all font-bold text-sm sm:text-base shadow-lg shadow-medical-green-100 disabled:opacity-50 disabled:pointer-events-none sm:order-3"
          >
            Aplicar y continuar
          </button>
        </div>
      </div>
    </div>
  </div>

  <ModalItemCatalogoForm
    :show="altaAbierta"
    :create-tipo="altaTipo"
    :allow-multi-tenant="false"
    overlay-class="z-[60]"
    :show-category-admin-link="false"
    @close="altaAbierta = false"
    @saved="onItemCreado"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import QuantitySelector from './QuantitySelector.vue';
import ModalItemCatalogoForm from './ModalItemCatalogoForm.vue';
import type {
  CategoriaServicioCatalogo,
  Servicio,
  TipoItemCatalogo,
} from '../../types/backend';
import {
  getCategoriasServicio,
  getServicios,
  type ServicioOrden,
} from '../../services/admin-api.service';
import { formatMoney } from '../../utils/currency';

interface Props {
  isOpen: boolean;
  isLoading?: boolean;
  serviciosYaSeleccionados: Record<string, number>;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
});

const emit = defineEmits<{
  close: [];
  'agregar-servicios': [
    cantidades: Record<string, number>,
    servicios: Servicio[],
    continuar: boolean,
  ];
}>();

const busqueda = ref('');
const ordenActivo = ref<ServicioOrden>('creacion');
/** Filtro de tab: '' = Todas; ObjectId string = categoría activa. */
const categoriaIdFiltro = ref('');
/** Filtro UX-DR4: '' = Todos; servicio | producto. */
const tipoFiltro = ref<'servicio' | 'producto' | ''>('');
/** Cantidades editables en esta sesión del modal (solo IDs con qty > 0). */
const cantidadesModal = ref<Record<string, number>>({});
const catalogo = ref<Servicio[]>([]);
const loadingCatalogo = ref(false);
const loadingCategorias = ref(false);
/** Cache de servicios vistos (para merge al wizard aunque salgan del filtro) */
const serviciosVistos = ref<Map<string, Servicio>>(new Map());
const categorias = ref<CategoriaServicioCatalogo[]>([]);
const categoriasCargadas = ref(false);
const altaAbierta = ref(false);
const altaTipo = ref<TipoItemCatalogo>('servicio');

const categoriaById = computed(() => {
  const map = new Map<string, CategoriaServicioCatalogo>();
  for (const cat of categorias.value) {
    if (cat._id) map.set(cat._id, cat);
  }
  return map;
});

function codigoCategoriaDe(categoriaId?: string): string {
  if (!categoriaId) return '—';
  return categoriaById.value.get(categoriaId)?.codigo || '—';
}

function labelCategoriaDe(categoriaId?: string): string {
  if (!categoriaId) return '';
  return categoriaById.value.get(categoriaId)?.nombre || '';
}

function codigoTipoDe(tipo?: string): string {
  if (tipo === 'producto') return 'PROD';
  if (tipo === 'servicio') return 'SERV';
  return '—';
}

function claseTipoDe(tipo?: string): string {
  if (tipo === 'producto') return 'bg-amber-50 text-amber-800';
  if (tipo === 'servicio') return 'bg-sky-50 text-sky-800';
  return 'bg-gray-100 text-gray-600';
}

function labelTipoDe(tipo?: string): string {
  if (tipo === 'producto') return 'Producto';
  if (tipo === 'servicio') return 'Servicio';
  return '';
}

function onTipoFiltroChange() {
  if (props.isOpen) void fetchCatalogo();
}

let fetchSeq = 0;
let catSeq = 0;
let busquedaTimer: ReturnType<typeof setTimeout> | null = null;

function snapshotCantidadesIniciales(): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [id, q] of Object.entries(props.serviciosYaSeleccionados)) {
    if (q > 0) next[id] = q;
  }
  return next;
}

async function ensureCategorias(force = false) {
  if (categoriasCargadas.value && !force) return;
  const seq = ++catSeq;
  loadingCategorias.value = true;
  if (force) categorias.value = [];
  try {
    const res = await getCategoriasServicio({ limit: 100 });
    if (seq !== catSeq) return;
    categorias.value = res.data || [];
    categoriasCargadas.value = true;
    // Si el filtro apunta a categoría ya no activa / ausente → Todas
    if (
      categoriaIdFiltro.value &&
      !categorias.value.some((c) => c._id === categoriaIdFiltro.value)
    ) {
      categoriaIdFiltro.value = '';
      if (props.isOpen) void fetchCatalogo();
    }
  } catch {
    if (seq !== catSeq) return;
    categorias.value = [];
    // No latchar éxito: reabrir el modal puede reintentar
    categoriasCargadas.value = false;
  } finally {
    if (seq === catSeq) loadingCategorias.value = false;
  }
}

function selectCategoria(categoriaId: string) {
  if (categoriaIdFiltro.value === categoriaId) return;
  categoriaIdFiltro.value = categoriaId;
  if (props.isOpen) void fetchCatalogo();
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      cantidadesModal.value = snapshotCantidadesIniciales();
      busqueda.value = '';
      ordenActivo.value = 'creacion';
      categoriaIdFiltro.value = '';
      tipoFiltro.value = '';
      altaAbierta.value = false;
      // Re-cargar mapa de badges/tabs (retry tras error + refresh tras cambios Admin)
      void ensureCategorias(true);
      void fetchCatalogo();
    } else {
      altaAbierta.value = false;
    }
  },
);

function setOrden(orden: ServicioOrden) {
  if (ordenActivo.value === orden) return;
  ordenActivo.value = orden;
  if (props.isOpen) void fetchCatalogo();
}

watch(busqueda, () => {
  if (!props.isOpen) return;
  if (busquedaTimer) clearTimeout(busquedaTimer);
  busquedaTimer = setTimeout(() => {
    void fetchCatalogo();
  }, 300);
});

async function fetchCatalogo() {
  const seq = ++fetchSeq;
  loadingCatalogo.value = true;
  try {
    const all: Servicio[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await getServicios({
        activo: true,
        page,
        limit: 100,
        orden: ordenActivo.value,
        nombre: busqueda.value.trim() || undefined,
        categoriaId: categoriaIdFiltro.value || undefined,
        tipo: tipoFiltro.value || undefined,
      });
      if (seq !== fetchSeq) return;
      all.push(...(res.data || []));
      totalPages = res.totalPages || 1;
      page += 1;
    } while (page <= totalPages);
    if (seq !== fetchSeq) return;
    catalogo.value = all;
    for (const s of all) {
      if (s._id) serviciosVistos.value.set(s._id, s);
    }
  } catch {
    if (seq !== fetchSeq) return;
    catalogo.value = [];
  } finally {
    if (seq === fetchSeq) loadingCatalogo.value = false;
  }
}

const seleccionadosCount = computed(
  () => Object.values(cantidadesModal.value).filter((q) => q > 0).length,
);

const puedeAplicar = computed(() => {
  if (seleccionadosCount.value > 0) return true;
  return Object.values(props.serviciosYaSeleccionados).some((q) => q > 0);
});

/** Continuar exige al menos un servicio seleccionado (desbloquea paso 3). */
const puedeContinuar = computed(() => seleccionadosCount.value > 0);

const isSelected = (id: string) => (cantidadesModal.value[id] || 0) > 0;

const cantidadDe = (id: string) => cantidadesModal.value[id] || 0;

const toggleServicio = (id: string) => {
  if (!id) return;
  const next = { ...cantidadesModal.value };
  if ((next[id] || 0) > 0) {
    delete next[id];
  } else {
    const ya = props.serviciosYaSeleccionados[id];
    next[id] = ya && ya > 0 ? ya : 1;
  }
  cantidadesModal.value = next;
};

const setCantidad = (id: string, cantidad: number) => {
  if (!id) return;
  const q = Math.max(0, Math.floor(Number(cantidad) || 0));
  const next = { ...cantidadesModal.value };
  if (q <= 0) delete next[id];
  else next[id] = q;
  cantidadesModal.value = next;
};

const aplicarSeleccion = (continuar: boolean) => {
  if (altaAbierta.value) return;
  const serviciosParaAgregar: Record<string, number> = {
    ...cantidadesModal.value,
  };
  // Desmarcar los que ya no están seleccionados → qty 0
  Object.keys(props.serviciosYaSeleccionados).forEach((id) => {
    if (
      !(id in serviciosParaAgregar) &&
      (props.serviciosYaSeleccionados[id] ?? 0) > 0
    ) {
      serviciosParaAgregar[id] = 0;
    }
  });
  const serviciosEmit: Servicio[] = [];
  Object.keys(cantidadesModal.value).forEach((id) => {
    if ((cantidadesModal.value[id] || 0) <= 0) return;
    const s = serviciosVistos.value.get(id);
    if (s) serviciosEmit.push(s);
  });
  emit('agregar-servicios', serviciosParaAgregar, serviciosEmit, continuar);
  cerrar();
};

const cerrar = () => {
  if (altaAbierta.value) return;
  busqueda.value = '';
  emit('close');
};

function abrirAlta(tipo: TipoItemCatalogo) {
  if (altaAbierta.value) return;
  altaTipo.value = tipo;
  altaAbierta.value = true;
}

function itemEstaActivo(item: Servicio): boolean {
  return item.activo !== false;
}

async function onItemCreado(item: Servicio) {
  altaAbierta.value = false;
  if (!itemEstaActivo(item) || !item._id) {
    void fetchCatalogo();
    return;
  }
  busqueda.value = '';
  if (tipoFiltro.value && tipoFiltro.value !== item.tipo) {
    tipoFiltro.value =
      item.tipo === 'producto' || item.tipo === 'servicio' ? item.tipo : '';
  }
  if (categoriaIdFiltro.value && categoriaIdFiltro.value !== item.categoriaId) {
    categoriaIdFiltro.value = item.categoriaId || '';
  }
  await fetchCatalogo();
  if (!catalogo.value.some((s) => s._id === item._id)) {
    tipoFiltro.value =
      item.tipo === 'producto' || item.tipo === 'servicio' ? item.tipo : '';
    categoriaIdFiltro.value = item.categoriaId || '';
    await fetchCatalogo();
  }
  if (!catalogo.value.some((s) => s._id === item._id)) {
    catalogo.value = [item, ...catalogo.value];
  }
  serviciosVistos.value.set(item._id, item);
  setCantidad(item._id, 1);
  await nextTick();
  const row = document.querySelector(
    `[data-catalogo-id="${item._id}"]`,
  ) as HTMLElement | null;
  row?.scrollIntoView({ block: 'nearest' });
}

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(cerrar, () => props.isOpen && !altaAbierta.value);
</script>
