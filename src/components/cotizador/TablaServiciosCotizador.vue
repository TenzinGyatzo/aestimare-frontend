<template>
  <div
    class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
  >
    <!-- Encabezado de la sección -->
    <div
      class="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors shrink-0"
          :class="[
            tieneServiciosValidos
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-500',
          ]"
        >
          <svg
            v-if="tieneServiciosValidos"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span v-else>2</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">{{ titulo }}</h2>
          <p class="text-sm text-gray-500">{{ subtitulo }}</p>
        </div>
      </div>
      <button
        type="button"
        :disabled="isLoading"
        class="w-full lg:w-auto px-5 py-2.5 bg-medical-green-500 text-white rounded-xl hover:bg-medical-green-600 active:scale-95 transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-medical-green-100 disabled:opacity-50"
        @click="$emit('abrir-modal')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Agregar Servicios
      </button>
    </div>

    <div
      v-if="serviciosSeleccionados.length > 0"
      class="px-6 py-3 border-b border-gray-50 bg-gray-50/40 flex flex-wrap items-center justify-between gap-3"
    >
      <div class="min-w-0">
        <p class="text-xs text-gray-500">
          Las descripciones se pueden ocultar en pantalla y en el PDF.
        </p>
        <p
          v-if="!descripcionesDisponibles"
          class="text-xs text-gray-500 mt-1"
        >
          Los conceptos seleccionados no tienen descripciones para mostrar.
        </p>
      </div>
      <label
        class="inline-flex items-center group shrink-0"
        :class="
          descripcionesDisponibles
            ? 'cursor-pointer'
            : 'cursor-not-allowed opacity-70'
        "
      >
        <div class="relative">
          <input
            type="checkbox"
            class="sr-only peer"
            :checked="descripcionesDisponibles && mostrarDescripciones"
            :disabled="!descripcionesDisponibles"
            :aria-disabled="!descripcionesDisponibles"
            @change="onToggleDescripciones($event)"
          />
          <div
            class="w-11 h-6 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-medical-blue-400 peer-focus-visible:ring-offset-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"
            :class="
              descripcionesDisponibles && mostrarDescripciones
                ? 'bg-medical-blue-600 after:transition-all peer-checked:after:transition-all'
                : 'bg-gray-200'
            "
          ></div>
        </div>
        <span
          class="ml-3 text-sm font-medium"
          :class="
            descripcionesDisponibles
              ? 'text-gray-700 group-hover:text-medical-blue-700'
              : 'text-gray-500'
          "
        >
          Mostrar descripciones
        </span>
      </label>
    </div>

    <div
      v-if="hayServiciosSinCantidad"
      class="mx-6 mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      role="status"
    >
      <svg
        class="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p>
        Hay servicios sin cantidad. Revísalos antes de generar la cotización.
      </p>
    </div>

    <!-- VISTA MOBILE / TABLET: Tarjetas (Visible solo en < lg) -->
    <div class="lg:hidden">
      <div v-if="serviciosSeleccionados.length === 0" class="p-10 text-center">
        <div class="flex flex-col items-center opacity-40">
          <svg
            class="w-16 h-16 text-gray-300 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p class="text-gray-500 font-medium">{{ textoVacio }}</p>
          <p class="text-xs text-gray-400">{{ ayudaVacia }}</p>
        </div>
      </div>

      <div v-else class="divide-y divide-gray-100">
        <div
          v-for="(servicio, index) in serviciosSeleccionados"
          :key="servicio._id"
          class="p-4 bg-white hover:bg-gray-50/50 transition-colors space-y-3"
        >
          <div class="flex items-start justify-between gap-2">
            <span class="text-xs font-bold text-gray-300 mt-1"
              >#{{ index + 1 }}</span
            >
            <button
              type="button"
              class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
              @click="$emit('eliminar-servicio', servicio._id || '')"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div>
            <label class="text-xs font-bold text-gray-400 uppercase"
              >Nombre</label
            >
            <VerticalCenterTextarea
              :model-value="displayOf(servicio).nombre"
              textarea-class="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-medical-blue-400 resize-y min-h-[4.5rem] leading-snug"
              @update:model-value="
                emitOverride(servicio._id || '', 'nombre', $event)
              "
            />
          </div>
          <div v-if="mostrarDescripciones">
            <label class="text-xs font-bold text-gray-400 uppercase"
              >Descripción</label
            >
            <VerticalCenterTextarea
              :model-value="displayOf(servicio).descripcion"
              textarea-class="mt-1 w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:ring-2 focus:ring-medical-blue-400 resize-y min-h-[4.5rem] leading-snug"
              @update:model-value="
                emitOverride(servicio._id || '', 'descripcion', $event)
              "
            />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-[minmax(0,7rem)_1fr] gap-3 sm:gap-5">
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase"
                >Precio</label
              >
              <input
                type="number"
                min="0"
                step="10"
                :value="displayOf(servicio).precioUnitario"
                class="mt-1 w-full max-w-[7rem] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-right outline-none focus:ring-2 focus:ring-medical-blue-400"
                @input="onMobilePrecio(servicio._id || '', $event)"
              />
            </div>
            <div>
              <label class="text-xs font-bold text-gray-400 uppercase"
                >Unidades</label
              >
              <div class="mt-1 flex sm:justify-start flex-col gap-1">
                <QuantitySelector
                  :model-value="cantidadesPorServicio[servicio._id || ''] || 0"
                  :invalid="cantidadInvalida(servicio)"
                  @update:model-value="
                    (value) =>
                      $emit('actualizar-cantidad', servicio._id || '', value)
                  "
                />
                <p
                  v-if="cantidadInvalida(servicio)"
                  class="text-[10px] leading-tight text-amber-700"
                >
                  Indica la cantidad o elimina el servicio
                </p>
              </div>
            </div>
          </div>
          <div
            class="flex items-center justify-between pt-2 border-t border-gray-50"
          >
            <span class="text-xs font-bold text-gray-400 uppercase"
              >Subtotal</span
            >
            <span class="text-sm font-bold text-gray-900">{{
              formatMoney(subtotalOf(servicio))
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- VISTA DESKTOP: Tabla (Visible solo en >= lg) -->
    <div class="hidden lg:block overflow-x-auto">
      <table
        class="w-full table-fixed divide-y divide-gray-100"
        :class="mostrarDescripciones ? 'min-w-[960px]' : 'min-w-[720px]'"
      >
        <thead class="bg-gray-50/50">
          <tr>
            <th
              class="w-10 px-3 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              #
            </th>
            <th
              class="w-[14rem] px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Servicio
            </th>
            <th
              v-if="mostrarDescripciones"
              class="px-3 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Descripción
            </th>
            <th
              class="w-24 pl-3 pr-5 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Precio
            </th>
            <th
              class="w-[8.75rem] pl-4 pr-2 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Unidades
            </th>
            <th
              class="w-32 px-3 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              Subtotal
            </th>
            <th
              class="w-12 px-2 py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              <span class="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-if="serviciosSeleccionados.length === 0">
            <td :colspan="mostrarDescripciones ? 7 : 6" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center opacity-40">
                <svg
                  class="w-16 h-16 text-gray-300 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p class="text-gray-500 font-medium">{{ textoVacio }}</p>
                <p class="text-xs text-gray-400">{{ ayudaVacia }}</p>
              </div>
            </td>
          </tr>
          <ServiceItemRow
            v-else
            v-for="(servicio, index) in serviciosSeleccionados"
            :key="servicio._id"
            :index="index + 1"
            :nombre="displayOf(servicio).nombre"
            :descripcion="displayOf(servicio).descripcion"
            :precio-unitario="displayOf(servicio).precioUnitario"
            :cantidad="cantidadesPorServicio[servicio._id || ''] || 0"
            :subtotal="subtotalOf(servicio)"
            :mostrar-descripcion="mostrarDescripciones"
            @update:nombre="
              (v) => emitOverride(servicio._id || '', 'nombre', v)
            "
            @update:descripcion="
              (v) => emitOverride(servicio._id || '', 'descripcion', v)
            "
            @update:precio-unitario="
              (v) => emitOverride(servicio._id || '', 'precioUnitario', v)
            "
            @update:cantidad="
              (value) => $emit('actualizar-cantidad', servicio._id || '', value)
            "
            @remove="$emit('eliminar-servicio', servicio._id || '')"
          />
        </tbody>
      </table>
    </div>

    <div
      v-if="serviciosSeleccionados.length > 0"
      class="px-4 lg:px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between gap-4"
    >
      <span class="text-sm font-bold text-gray-600">{{
        agregarIva ? 'Total (sin IVA)' : 'Total'
      }}</span>
      <span class="text-lg font-bold text-gray-900">{{
        formatMoney(totalSinIva)
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ServiceItemRow from '../common/ServiceItemRow.vue';
import VerticalCenterTextarea from '../common/VerticalCenterTextarea.vue';
import QuantitySelector from '../common/QuantitySelector.vue';
import type { Servicio } from '@/types/backend';
import { formatMoney } from '@/utils/currency';

export type ItemOverrideFields = {
  nombre: string;
  descripcion: string;
  precioUnitario: number;
};

interface Props {
  serviciosSeleccionados: Servicio[];
  cantidadesPorServicio: Record<string, number>;
  itemOverrides: Record<string, ItemOverrideFields>;
  isLoading?: boolean;
  titulo?: string;
  subtitulo?: string;
  textoVacio?: string;
  ayudaVacia?: string;
  /** Preferencia base (selected); no pisar con availability. */
  mostrarDescripciones?: boolean;
  /** Availability: hay algún concepto con descripción no vacía. */
  descripcionesDisponibles?: boolean;
  /** false = pie de una sola fila Total (suma de líneas), sin mención de IVA. */
  agregarIva?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  titulo: 'Servicios a Cotizar',
  subtitulo: 'Agrega los estudios o servicios médicos solicitados.',
  textoVacio: 'Lista de servicios vacía',
  ayudaVacia: 'Haz clic en el botón verde para comenzar a añadir items.',
  mostrarDescripciones: true,
  descripcionesDisponibles: true,
  agregarIva: true,
});

const emit = defineEmits<{
  (e: 'abrir-modal'): void;
  (e: 'actualizar-cantidad', id: string, cantidad: number): void;
  (e: 'eliminar-servicio', id: string): void;
  (e: 'update:mostrarDescripciones', value: boolean): void;
  (
    e: 'actualizar-override',
    id: string,
    field: keyof ItemOverrideFields,
    value: string | number,
  ): void;
}>();

/** Misma regla que Paso 3: solo muta la base si hay descripciones disponibles. */
function onToggleDescripciones(event: Event) {
  if (!props.descripcionesDisponibles) return;
  emit(
    'update:mostrarDescripciones',
    (event.target as HTMLInputElement).checked,
  );
}

function displayOf(servicio: Servicio): ItemOverrideFields {
  const id = servicio._id || '';
  const o = props.itemOverrides[id];
  if (o) return o;
  return {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    precioUnitario: servicio.precioUnitario ?? 0,
  };
}

function subtotalOf(servicio: Servicio): number {
  const id = servicio._id || '';
  const qty = props.cantidadesPorServicio[id] || 0;
  return displayOf(servicio).precioUnitario * qty;
}

const totalSinIva = computed(() =>
  props.serviciosSeleccionados.reduce(
    (acc, s) => acc + subtotalOf(s),
    0,
  ),
);

const tieneServiciosValidos = computed(() =>
  props.serviciosSeleccionados.some(
    (s) => (props.cantidadesPorServicio[s._id || ''] || 0) > 0,
  ),
);

const hayServiciosSinCantidad = computed(() =>
  props.serviciosSeleccionados.some(
    (s) => (props.cantidadesPorServicio[s._id || ''] || 0) <= 0,
  ),
);

function cantidadInvalida(servicio: Servicio): boolean {
  return (props.cantidadesPorServicio[servicio._id || ''] || 0) <= 0;
}

function emitOverride(
  id: string,
  field: keyof ItemOverrideFields,
  value: string | number,
) {
  if (!id) return;
  emit('actualizar-override', id, field, value);
}

function onMobilePrecio(id: string, event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  const n = Number(raw);
  emitOverride(id, 'precioUnitario', Number.isFinite(n) && n >= 0 ? n : 0);
}
</script>
