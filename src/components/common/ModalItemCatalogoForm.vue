<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center bg-black/50 p-3 sm:p-4"
    :class="overlayClass"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="'modal-item-titulo'"
    :aria-hidden="mostrarVisorImagen ? true : undefined"
    :inert="mostrarVisorImagen"
    @pointerdown="onBackdropPointerDown"
    @pointerup="onBackdropPointerUp"
    @pointercancel="onBackdropPointerCancel"
  >
    <div
      class="flex w-full max-w-3xl max-h-[min(90vh,880px)] flex-col overflow-hidden rounded-xl bg-white shadow-xl"
    >
      <div
        class="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6"
      >
        <div class="min-w-0">
          <h2
            id="modal-item-titulo"
            class="text-xl font-bold text-gray-900 sm:text-2xl"
          >
            {{ tituloModalItem }}
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            {{ subtituloModalItem }}
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          aria-label="Cerrar"
          :disabled="isSubmitting"
          @click="solicitarCerrarModal"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
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

      <form
        class="flex min-h-0 flex-1 flex-col"
        @submit.prevent="guardarServicio"
      >
        <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div class="sm:col-span-8">
              <label
                for="nombre-item-catalogo"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                Nombre <span class="text-red-500">*</span>
              </label>
              <input
                id="nombre-item-catalogo"
                ref="nombreInputRef"
                v-model="formulario.nombre"
                type="text"
                required
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :placeholder="placeholderNombre"
                :disabled="isSubmitting"
              />
            </div>
            <div class="sm:col-span-4">
              <label
                for="codigo-item-catalogo"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                {{ labelCodigoItem }}
              </label>
              <input
                id="codigo-item-catalogo"
                v-model="formulario.codigo"
                type="text"
                maxlength="64"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :placeholder="placeholderCodigo"
                :disabled="isSubmitting"
              />
              <p class="mt-1 text-xs text-gray-500">{{ ayudaCodigoItem }}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
            <div class="sm:col-span-8">
              <label
                for="categoriaId-item-catalogo"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                Categoría <span class="text-red-500">*</span>
              </label>
              <div
                v-if="!catalogoFormListo"
                class="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
              >
                Cargando categorías…
              </div>
              <div
                v-else-if="categorias.length === 0 && !categoriaHuerfanaForm"
                class="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              >
                No hay categorías activas en esta administración.
                <router-link
                  v-if="showCategoryAdminLink"
                  to="/admin/categorias"
                  class="font-medium text-medical-blue-700 underline hover:text-medical-blue-900"
                >
                  Gestionar categorías
                </router-link>
              </div>
              <template v-else>
                <select
                  id="categoriaId-item-catalogo"
                  v-model="formulario.categoriaId"
                  required
                  class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                  :disabled="isSubmitting"
                >
                  <option disabled value="">Selecciona una categoría</option>
                  <option
                    v-if="categoriaHuerfanaForm"
                    :value="categoriaHuerfanaForm.id"
                  >
                    {{ categoriaHuerfanaForm.label }}
                  </option>
                  <option
                    v-for="cat in categorias"
                    :key="cat._id"
                    :value="cat._id"
                  >
                    {{ cat.codigo }} — {{ cat.nombre }}
                  </option>
                </select>
                <p
                  v-if="categoriaHuerfanaForm"
                  class="mt-1 text-xs text-amber-800"
                >
                  La categoría actual no está activa o no aparece en el
                  catálogo. Elige una categoría activa para guardar.
                </p>
              </template>
            </div>
            <div class="sm:col-span-4">
              <label
                for="precioUnitario-item-catalogo"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                Precio unitario <span class="text-red-500">*</span>
              </label>
              <div
                class="flex overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-medical-blue-500"
              >
                <span
                  class="flex items-center bg-gray-50 px-3 text-sm text-gray-500"
                  aria-hidden="true"
                  >$</span
                >
                <input
                  id="precioUnitario-item-catalogo"
                  v-model="precioInput"
                  type="number"
                  step="any"
                  min="0"
                  required
                  class="w-full border-0 px-3 py-2 focus:outline-none focus:ring-0"
                  placeholder="0.00"
                  :disabled="isSubmitting"
                  @blur="onPrecioBlur"
                />
              </div>
              <p v-if="precioError" class="mt-1 text-xs text-red-600">
                {{ precioError }}
              </p>
            </div>
          </div>

          <div
            class="grid grid-cols-1 gap-4"
            :class="esProductoForm ? 'lg:grid-cols-12 lg:items-stretch' : ''"
          >
            <div :class="esProductoForm ? 'flex flex-col lg:col-span-7' : ''">
              <label
                for="descripcion-item-catalogo"
                class="mb-1 block text-sm font-medium text-gray-700"
              >
                Descripción
              </label>
              <textarea
                id="descripcion-item-catalogo"
                v-model="formulario.descripcion"
                :rows="esProductoForm ? 5 : 3"
                class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :class="
                  esProductoForm
                    ? 'h-[8.5rem] min-h-[8.5rem] max-h-[8.5rem] resize-none'
                    : 'min-h-[5.5rem]'
                "
                :placeholder="placeholderDescripcion"
                :disabled="isSubmitting"
              ></textarea>
            </div>

            <div v-if="esProductoForm" class="flex flex-col lg:col-span-5">
              <span class="mb-1 block text-sm font-medium text-gray-700">
                Imagen (opcional)
              </span>
              <input
                id="imagen-producto-item-catalogo"
                ref="imagenInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                class="sr-only"
                tabindex="-1"
                :disabled="isSubmitting"
                @change="onImagenSelected"
              />

              <div
                v-if="!imagenPreviewUrl"
                role="button"
                :tabindex="isSubmitting ? -1 : 0"
                class="flex h-[8.5rem] min-h-[8.5rem] max-h-[8.5rem] flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-3 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
                :class="[
                  isSubmitting
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer',
                  isDragOver
                    ? 'border-medical-blue-500 bg-medical-blue-50'
                    : 'border-gray-300 bg-gray-50/50 hover:border-medical-blue-400 hover:bg-medical-blue-50/40',
                ]"
                :aria-disabled="isSubmitting"
                @click="abrirSelectorImagen"
                @keydown.enter.prevent="abrirSelectorImagen"
                @keydown.space.prevent="abrirSelectorImagen"
                @dragenter.prevent="onDragEnter"
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onDropImagen"
              >
                <template v-if="isDragOver">
                  <p class="text-sm font-medium text-gray-700">
                    Suelta la imagen para cargarla
                  </p>
                </template>
                <template v-else>
                  <p class="text-sm font-medium leading-snug text-gray-700">
                    Arrastra una imagen aquí
                  </p>
                  <p class="text-sm leading-snug text-gray-700">
                    o haz clic para seleccionarla
                  </p>
                </template>
                <p class="mt-1.5 text-xs text-gray-500">
                  PNG, JPG o WebP · máximo 1 MB
                </p>
              </div>

              <div
                v-else
                class="flex h-[8.5rem] min-h-[8.5rem] max-h-[8.5rem] items-center gap-3 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3"
                @dragenter.prevent="onDragEnter"
                @dragover.prevent="onDragOver"
                @dragleave.prevent="onDragLeave"
                @drop.prevent="onDropImagen"
              >
                <button
                  ref="imagenThumbRef"
                  type="button"
                  class="flex h-[104px] w-[104px] shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded border border-gray-200 bg-white transition-colors hover:border-medical-blue-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-medical-blue-500 disabled:cursor-default"
                  aria-label="Ver imagen ampliada"
                  :disabled="isSubmitting"
                  @click="abrirVisorImagen"
                >
                  <img
                    :src="imagenPreviewUrl"
                    alt="Vista previa del producto"
                    class="h-full w-full object-contain"
                  />
                </button>
                <div class="min-w-0 flex-1">
                  <p
                    class="line-clamp-2 text-xs font-medium leading-snug text-gray-800"
                  >
                    {{ imagenNombreMostrar }}
                  </p>
                  <p
                    v-if="imagenTamanoMostrar"
                    class="mt-0.5 text-xs text-gray-500"
                  >
                    {{ imagenTamanoMostrar }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <button
                      type="button"
                      class="text-xs font-medium text-medical-blue-700 hover:text-medical-blue-900"
                      :disabled="isSubmitting"
                      @click="abrirSelectorImagen"
                    >
                      Cambiar imagen
                    </button>
                    <button
                      type="button"
                      class="text-xs font-medium text-red-600 hover:text-red-700"
                      :disabled="isSubmitting"
                      @click="marcarEliminarImagen"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
              <p v-if="imagenError" class="mt-1 text-xs text-red-600">
                {{ imagenError }}
              </p>
            </div>
          </div>

          <div class="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-3">
            <ToggleSwitch
              id="disponible-catalogo-item"
              v-model="formulario.activo"
              :disabled="isSubmitting"
            >
              Disponible en el catálogo
            </ToggleSwitch>
            <p class="mt-1 pl-[3.25rem] text-xs text-gray-500">
              Puede utilizarse en nuevas cotizaciones.
            </p>
          </div>

          <div
            v-if="!modoEdicion && allowMultiTenant && isAdminSistema"
            class="space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3"
          >
            <p class="text-sm font-medium text-gray-800">
              Crear en administración(es)
            </p>
            <p class="text-xs text-gray-500">
              Cada administración recibe un registro independiente. Las
              ediciones posteriores no se sincronizan.
            </p>
            <div
              v-for="t in tenantsDisponibles"
              :key="t._id"
              class="flex items-center gap-2"
            >
              <input
                :id="`tenant-destino-item-${t._id}`"
                v-model="tenantIdsDestino"
                type="checkbox"
                class="h-4 w-4 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                :value="t._id"
                :disabled="isSubmitting"
              />
              <label
                :for="`tenant-destino-item-${t._id}`"
                class="text-sm text-gray-700"
                >{{ t.nombre }}</label
              >
            </div>
          </div>

          <div
            v-if="errorCrear"
            class="rounded-lg border border-red-200 bg-red-50 p-3"
          >
            <p class="text-sm text-red-800">{{ errorCrear }}</p>
          </div>
        </div>

        <div
          class="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 bg-white px-4 py-3 sm:flex-row sm:justify-end sm:gap-3 sm:px-6"
        >
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
            :disabled="isSubmitting"
            @click="solicitarCerrarModal"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="w-full rounded-md bg-medical-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-medical-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              :disabled="
                isSubmitting ||
                !catalogoFormListo ||
                (!modoEdicion && categorias.length === 0) ||
                (modoEdicion &&
                  !!categoriaHuerfanaForm &&
                  categorias.length === 0)
              "
          >
            <span v-if="isSubmitting">Guardando...</span>
            <span v-else>{{ labelBotonGuardar }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>

  <ConfirmationModal
    :show="mostrarConfirmDescartar"
    title="¿Descartar cambios?"
    message="Hay cambios sin guardar. Si cierras ahora, se perderán."
    type="warning"
    confirm-text="Descartar"
    cancel-text="Seguir editando"
    @confirm="confirmarDescartarModal"
    @cancel="mostrarConfirmDescartar = false"
  />

  <div
    v-if="show && mostrarVisorImagen && imagenPreviewUrl"
    class="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Vista ampliada de la imagen del producto"
    @pointerdown="onVisorBackdropPointerDown"
    @pointerup="onVisorBackdropPointerUp"
    @pointercancel="onVisorBackdropPointerCancel"
  >
    <button
      ref="visorCerrarRef"
      type="button"
      class="absolute right-4 top-4 rounded-md bg-black/40 p-2 text-white transition-colors hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
      aria-label="Cerrar vista ampliada"
      @click="cerrarVisorImagen"
    >
      <svg
        class="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
    <img
      :src="imagenPreviewUrl"
      alt="Imagen ampliada del producto"
      class="max-h-[min(85vh,720px)] max-w-full object-contain"
      @click.stop
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import {
  createServicio,
  createServicioMulti,
  deleteServicioImagen,
  getCategoriasServicio,
  getTenants,
  updateServicio,
  uploadServicioImagen,
  type CreateServicioPayload,
  type UpdateServicioPayload,
} from '../../services/admin-api.service';
import type {
  CategoriaServicioCatalogo,
  Servicio,
  Tenant,
  TipoItemCatalogo,
} from '../../types/backend';
import ConfirmationModal from './ConfirmationModal.vue';
import ToggleSwitch from './ToggleSwitch.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import { useAuthStore } from '../../store/auth';
import { API_BASE_URL } from '../../config/api';
import { extractError } from '../../utils/extractError';

const MAX_IMAGEN_BYTES = 1_000_000;
const ALLOWED_IMAGEN_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

type ServicioFormState = Omit<
  CreateServicioPayload,
  'categoriaId' | 'precioUnitario' | 'activo'
> & {
  categoriaId: string;
  precioUnitario: number | '';
  activo: boolean;
};

type FormSnapshot = {
  nombre: string;
  descripcion: string;
  precio: string;
  categoriaId: string;
  codigo: string;
  activo: boolean;
  tenants: string;
  imagenKey: string;
  eliminarImagen: boolean;
};

const props = withDefaults(
  defineProps<{
    show: boolean;
    createTipo?: TipoItemCatalogo;
    servicio?: Servicio | null;
    allowMultiTenant?: boolean;
    overlayClass?: string;
    showCategoryAdminLink?: boolean;
  }>(),
  {
    createTipo: 'servicio',
    servicio: null,
    allowMultiTenant: true,
    overlayClass: 'z-50',
    showCategoryAdminLink: true,
  },
);

const emit = defineEmits<{
  close: [];
  saved: [servicio: Servicio, message: string];
}>();

const authStore = useAuthStore();
const isAdminSistema = computed(() => authStore.isAdminSistema);

const categorias = ref<CategoriaServicioCatalogo[]>([]);
const isSubmitting = ref(false);
const errorCrear = ref<string | null>(null);
const precioError = ref<string | null>(null);
const imagenError = ref<string | null>(null);
const mostrarConfirmDescartar = ref(false);
const formSnapshot = ref<FormSnapshot | null>(null);
const nombreInputRef = ref<HTMLInputElement | null>(null);
const tenantsDisponibles = ref<Tenant[]>([]);
const tenantIdsDestino = ref<string[]>([]);
const catalogoFormListo = ref(false);

const formulario = ref<ServicioFormState>(emptyForm('servicio'));

const modoEdicion = computed(() => !!props.servicio?._id);
const servicioEditando = computed(() => props.servicio ?? null);

function emptyForm(tipo: TipoItemCatalogo): ServicioFormState {
  return {
    nombre: '',
    descripcion: '',
    precioUnitario: '',
    categoriaId: '',
    tipo,
    codigo: '',
    moneda: 'MXN',
    activo: true,
  };
}

function labelTipoDe(tipo?: TipoItemCatalogo): string {
  if (tipo === 'producto') return 'Producto';
  if (tipo === 'servicio') return 'Servicio';
  return '';
}

const precioInput = computed({
  get: () =>
    formulario.value.precioUnitario === ''
      ? ''
      : String(formulario.value.precioUnitario),
  set: (raw: string) => {
    precioError.value = null;
    if (raw === '' || raw === null || raw === undefined) {
      formulario.value.precioUnitario = '';
      return;
    }
    const n = Number(raw);
    formulario.value.precioUnitario = Number.isFinite(n) ? n : '';
  },
});

const labelTipoForm = computed(
  () => labelTipoDe(formulario.value.tipo) || 'Servicio',
);

const esProductoForm = computed(() => formulario.value.tipo === 'producto');

const tituloModalItem = computed(() => {
  const t = labelTipoForm.value.toLowerCase();
  return modoEdicion.value ? `Editar ${t}` : `Nuevo ${t}`;
});

const subtituloModalItem = computed(() =>
  esProductoForm.value
    ? 'Registra la información comercial del producto.'
    : 'Registra la información comercial del servicio.',
);

const labelBotonGuardar = computed(() => {
  if (modoEdicion.value) return 'Guardar cambios';
  return esProductoForm.value ? 'Guardar producto' : 'Guardar servicio';
});

const placeholderNombre = computed(() =>
  esProductoForm.value
    ? 'Ej. Equipo de climatización'
    : 'Ej. Mantenimiento Preventivo',
);

const placeholderCodigo = computed(() =>
  esProductoForm.value ? 'Ej. MSI-12K-220' : 'Ej. MANT-PREV-01',
);

const labelCodigoItem = computed(() =>
  esProductoForm.value
    ? 'Código o SKU (opcional)'
    : 'Código del servicio (opcional)',
);

const placeholderDescripcion = computed(() =>
  esProductoForm.value
    ? 'Descripción detallada del producto'
    : 'Descripción detallada del servicio',
);

const imagenPendiente = ref<File | null>(null);
const imagenLocalPreview = ref<string | null>(null);
const imagenInputRef = ref<HTMLInputElement | null>(null);
const eliminarImagenPendiente = ref(false);
const mostrarVisorImagen = ref(false);
const imagenThumbRef = ref<HTMLButtonElement | null>(null);
const visorCerrarRef = ref<HTMLButtonElement | null>(null);
const isDragOver = ref(false);
let dragDepth = 0;

function publicAssetPreviewUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const apiBase = API_BASE_URL.replace(/\/api\/?$/, '');
  if (apiBase.startsWith('http')) return `${apiBase}${path}`;
  return path;
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

const imagenPreviewUrl = computed(() => {
  if (imagenLocalPreview.value) return imagenLocalPreview.value;
  if (!esProductoForm.value || eliminarImagenPendiente.value) return null;
  return publicAssetPreviewUrl(servicioEditando.value?.imagenUrl);
});

const imagenNombreMostrar = computed(() => {
  if (imagenPendiente.value) return imagenPendiente.value.name;
  const url = servicioEditando.value?.imagenUrl;
  if (!url || eliminarImagenPendiente.value) return 'Imagen actual';
  const base = url.split('?')[0]?.split('/').pop();
  return base || 'Imagen actual';
});

const imagenTamanoMostrar = computed(() => {
  if (!imagenPendiente.value) return '';
  return formatBytes(imagenPendiente.value.size);
});

function clearImagenPendiente() {
  imagenPendiente.value = null;
  if (imagenLocalPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(imagenLocalPreview.value);
  }
  imagenLocalPreview.value = null;
  if (imagenInputRef.value) imagenInputRef.value.value = '';
}

function resetImagenState() {
  clearImagenPendiente();
  eliminarImagenPendiente.value = false;
  imagenError.value = null;
  mostrarVisorImagen.value = false;
  isDragOver.value = false;
  dragDepth = 0;
}

watch(imagenPreviewUrl, (url) => {
  if (!url) mostrarVisorImagen.value = false;
});

function acceptImagenFile(file: File): boolean {
  const mime = (file.type.split(';')[0] ?? '').trim().toLowerCase();
  const extOk = /\.(png|jpe?g|webp)$/i.test(file.name || '');
  if (mime ? !ALLOWED_IMAGEN_TYPES.has(mime) : !extOk) {
    imagenError.value = 'Tipo de imagen no permitido (use PNG, JPG o WebP)';
    return false;
  }
  if (file.size <= 0) {
    imagenError.value = 'El archivo de imagen está vacío';
    return false;
  }
  if (file.size > MAX_IMAGEN_BYTES) {
    imagenError.value = 'La imagen no puede superar 1 MB';
    return false;
  }
  imagenError.value = null;
  if (imagenLocalPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(imagenLocalPreview.value);
  }
  imagenPendiente.value = file;
  imagenLocalPreview.value = URL.createObjectURL(file);
  eliminarImagenPendiente.value = false;
  return true;
}

function onImagenSelected(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  if (!acceptImagenFile(file) && imagenInputRef.value) {
    imagenInputRef.value.value = '';
  }
}

function abrirSelectorImagen() {
  if (isSubmitting.value) return;
  imagenInputRef.value?.click();
}

function onDragEnter() {
  if (isSubmitting.value) return;
  dragDepth += 1;
  isDragOver.value = true;
}

function onDragOver() {
  if (isSubmitting.value) return;
  isDragOver.value = true;
}

function onDragLeave() {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) isDragOver.value = false;
}

function onDropImagen(ev: DragEvent) {
  dragDepth = 0;
  isDragOver.value = false;
  if (isSubmitting.value) return;
  const file = ev.dataTransfer?.files?.[0];
  if (!file) return;
  acceptImagenFile(file);
}

function onGlobalDragEnd() {
  dragDepth = 0;
  isDragOver.value = false;
}

async function abrirVisorImagen() {
  if (!imagenPreviewUrl.value || isSubmitting.value) return;
  mostrarVisorImagen.value = true;
  await nextTick();
  visorCerrarRef.value?.focus();
}

function cerrarVisorImagen() {
  if (!mostrarVisorImagen.value) return;
  mostrarVisorImagen.value = false;
  void nextTick(() => imagenThumbRef.value?.focus());
}

function marcarEliminarImagen() {
  if (isSubmitting.value) return;
  mostrarVisorImagen.value = false;
  clearImagenPendiente();
  eliminarImagenPendiente.value = true;
  imagenError.value = null;
}

function onPrecioBlur() {
  if (formulario.value.precioUnitario === '') return;
  const n = Number(formulario.value.precioUnitario);
  if (!Number.isFinite(n) || n < 0) {
    precioError.value = 'Ingresa un precio válido (mínimo 0)';
  }
}

const ayudaCodigoItem = 'Identificador interno opcional.';

function imagenPendingKey(): string {
  const f = imagenPendiente.value;
  if (!f) return '';
  return `${f.name}|${f.size}|${f.lastModified}`;
}

function captureFormSnapshot(): FormSnapshot {
  return {
    nombre: formulario.value.nombre,
    descripcion: formulario.value.descripcion || '',
    precio: String(formulario.value.precioUnitario),
    categoriaId: formulario.value.categoriaId,
    codigo: formulario.value.codigo || '',
    activo: formulario.value.activo !== false,
    tenants: [...tenantIdsDestino.value].sort().join(','),
    imagenKey: imagenPendingKey(),
    eliminarImagen: eliminarImagenPendiente.value,
  };
}

function isFormDirty(): boolean {
  const snap = formSnapshot.value;
  if (!snap) return false;
  const cur = captureFormSnapshot();
  return (
    cur.nombre !== snap.nombre ||
    cur.descripcion !== snap.descripcion ||
    cur.precio !== snap.precio ||
    cur.categoriaId !== snap.categoriaId ||
    cur.codigo !== snap.codigo ||
    cur.activo !== snap.activo ||
    cur.tenants !== snap.tenants ||
    cur.imagenKey !== snap.imagenKey ||
    cur.eliminarImagen !== snap.eliminarImagen
  );
}

async function focusNombreInput() {
  await nextTick();
  nombreInputRef.value?.focus();
}

const categoriaHuerfanaForm = computed(() => {
  const id = formulario.value.categoriaId?.trim();
  if (!id) return null;
  if (categorias.value.some((c) => c._id === id)) return null;
  return { id, label: 'Categoría no disponible (elige otra)' };
});

function hydrateCreate() {
  const tipo =
    props.createTipo === 'producto' || props.createTipo === 'servicio'
      ? props.createTipo
      : 'servicio';
  resetImagenState();
  formulario.value = emptyForm(tipo);
  const active = authStore.activeTenantId;
  tenantIdsDestino.value = active ? [active] : [];
  errorCrear.value = null;
  precioError.value = null;
  mostrarConfirmDescartar.value = false;
  formSnapshot.value = captureFormSnapshot();
  void focusNombreInput();
}

function hydrateEdit(servicio: Servicio) {
  resetImagenState();
  const tipoValido =
    servicio.tipo === 'producto' || servicio.tipo === 'servicio';
  formulario.value = {
    nombre: servicio.nombre,
    descripcion: servicio.descripcion || '',
    precioUnitario:
      servicio.precioUnitario === undefined || servicio.precioUnitario === null
        ? ''
        : servicio.precioUnitario,
    categoriaId: servicio.categoriaId || '',
    tipo: tipoValido ? servicio.tipo : 'servicio',
    codigo: servicio.codigo || '',
    moneda: 'MXN',
    activo: servicio.activo !== undefined ? servicio.activo : true,
  };
  errorCrear.value = tipoValido
    ? null
    : 'Este registro no tenía un tipo válido; se guardará como Servicio.';
  precioError.value = null;
  mostrarConfirmDescartar.value = false;
  formSnapshot.value = captureFormSnapshot();
  void focusNombreInput();
}

function resetLocalState() {
  isSubmitting.value = false;
  errorCrear.value = null;
  precioError.value = null;
  mostrarConfirmDescartar.value = false;
  mostrarVisorImagen.value = false;
  formSnapshot.value = null;
  catalogoFormListo.value = false;
  resetImagenState();
  formulario.value = emptyForm('servicio');
  tenantIdsDestino.value = [];
}

const forceCerrarModal = () => {
  resetLocalState();
  emit('close');
};

const solicitarCerrarModal = () => {
  if (isSubmitting.value) return;
  if (mostrarVisorImagen.value) {
    cerrarVisorImagen();
    return;
  }
  if (mostrarConfirmDescartar.value) return;
  if (isFormDirty()) {
    mostrarConfirmDescartar.value = true;
    return;
  }
  forceCerrarModal();
};

const confirmarDescartarModal = () => {
  mostrarConfirmDescartar.value = false;
  forceCerrarModal();
};

const modalItemAbierto = computed(
  () => props.show && !mostrarVisorImagen.value,
);

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(solicitarCerrarModal, modalItemAbierto);

const {
  onBackdropPointerDown: onVisorBackdropPointerDown,
  onBackdropPointerUp: onVisorBackdropPointerUp,
  onBackdropPointerCancel: onVisorBackdropPointerCancel,
} = useModalDismiss(cerrarVisorImagen, mostrarVisorImagen);

async function cargarCategorias() {
  try {
    const res = await getCategoriasServicio({ limit: 100 });
    categorias.value = res.data || [];
  } catch (err: unknown) {
    console.error('Error al cargar categorías:', err);
    categorias.value = [];
    errorCrear.value = extractError(
      err,
      'No fue posible cargar las categorías',
    );
  }
}

async function cargarTenantsSiAplica() {
  const esCreate = !props.servicio?._id;
  if (!props.allowMultiTenant || !authStore.isAdminSistema || !esCreate) {
    tenantsDisponibles.value = [];
    return;
  }
  try {
    const tenants = await getTenants();
    tenantsDisponibles.value = tenants.filter(
      (t) => t.activo !== false && t._id,
    );
  } catch (err) {
    console.error('Error al cargar tenants:', err);
    errorCrear.value = extractError(
      err,
      'No se pudieron cargar las administraciones destino',
    );
  }
}

const guardarServicio = async () => {
  const nombre = formulario.value.nombre.trim();
  if (!nombre) {
    errorCrear.value = `Debe proporcionar el nombre del ${labelTipoForm.value.toLowerCase()}`;
    return;
  }
  if (
    formulario.value.precioUnitario === '' ||
    !Number.isFinite(Number(formulario.value.precioUnitario)) ||
    Number(formulario.value.precioUnitario) < 0
  ) {
    precioError.value = 'Ingresa un precio válido (mínimo 0)';
    errorCrear.value = null;
    return;
  }
  const precioUnitario = Number(formulario.value.precioUnitario);
  precioError.value = null;

  if (esProductoForm.value && imagenError.value) {
    errorCrear.value = imagenError.value;
    return;
  }

  if (!formulario.value.categoriaId) {
    errorCrear.value =
      categorias.value.length === 0
        ? 'Crea al menos una categoría antes de agregar ítems'
        : 'Debe seleccionar una categoría';
    return;
  }
  const categoriaEnCatalogo = categorias.value.some(
    (c) => c._id === formulario.value.categoriaId,
  );
  if (!modoEdicion.value && !categoriaEnCatalogo) {
    errorCrear.value =
      categorias.value.length === 0
        ? 'Crea al menos una categoría antes de agregar ítems'
        : 'Debe seleccionar una categoría activa del catálogo';
    return;
  }
  if (modoEdicion.value && !categoriaEnCatalogo) {
    errorCrear.value =
      'La categoría actual no está disponible. Elige una categoría activa';
    return;
  }
  if (modoEdicion.value && !servicioEditando.value?._id) {
    errorCrear.value =
      'No se puede actualizar: falta el identificador del registro';
    return;
  }
  mostrarVisorImagen.value = false;
  isSubmitting.value = true;
  errorCrear.value = null;

  try {
    const codigoTrim = formulario.value.codigo?.trim() || '';
    const fileToUpload =
      formulario.value.tipo === 'producto' ? imagenPendiente.value : null;
    const shouldDeleteImagen =
      formulario.value.tipo === 'producto' &&
      modoEdicion.value &&
      eliminarImagenPendiente.value &&
      !fileToUpload;

    let saved: Servicio | null = null;
    let message = '';

    if (modoEdicion.value) {
      const id = servicioEditando.value!._id!;
      const payload: UpdateServicioPayload = {
        nombre,
        descripcion: formulario.value.descripcion?.trim() || '',
        precioUnitario,
        categoriaId: formulario.value.categoriaId,
        tipo: formulario.value.tipo,
        codigo: codigoTrim,
        moneda: 'MXN',
        activo: formulario.value.activo,
      };
      saved = await updateServicio(id, payload);
      if (shouldDeleteImagen) {
        saved = await deleteServicioImagen(id);
      } else if (fileToUpload) {
        saved = await uploadServicioImagen(id, fileToUpload);
      }
      message = `${labelTipoForm.value} actualizado.`;
    } else if (props.allowMultiTenant && isAdminSistema.value) {
      const ids = [...new Set(tenantIdsDestino.value.filter(Boolean))];
      if (ids.length < 1) {
        errorCrear.value = 'Selecciona al menos una administración destino';
        return;
      }
      const result = await createServicioMulti({
        nombre,
        descripcion: formulario.value.descripcion?.trim() || undefined,
        precioUnitario,
        categoriaId: formulario.value.categoriaId,
        tipo: formulario.value.tipo,
        ...(codigoTrim ? { codigo: codigoTrim } : {}),
        moneda: 'MXN',
        activo: formulario.value.activo,
        tenantIds: ids,
      });
      const activeId = authStore.activeTenantId;
      const target =
        result.created.find((c) => String(c.tenantId) === String(activeId)) ||
        result.created[0];
      if (fileToUpload && target?._id) {
        saved = await uploadServicioImagen(target._id, fileToUpload);
      } else {
        saved = target ?? null;
      }
      const nombres = ids
        .map(
          (id) =>
            tenantsDisponibles.value.find((t) => t._id === id)?.nombre || id,
        )
        .join(' y ');
      message =
        result.created.length > 1
          ? `${labelTipoForm.value} creado en ${nombres}. El listado muestra la administración activa.`
          : `${labelTipoForm.value} creado.`;
    } else {
      saved = await createServicio({
        nombre,
        descripcion: formulario.value.descripcion?.trim() || undefined,
        precioUnitario,
        categoriaId: formulario.value.categoriaId,
        tipo: formulario.value.tipo,
        ...(codigoTrim ? { codigo: codigoTrim } : {}),
        moneda: 'MXN',
        activo: formulario.value.activo,
      });
      if (fileToUpload && saved._id) {
        saved = await uploadServicioImagen(saved._id, fileToUpload);
      }
      message = `${labelTipoForm.value} creado.`;
    }

    if (!saved) {
      errorCrear.value = `No fue posible guardar el ${labelTipoForm.value.toLowerCase()}`;
      return;
    }
    resetLocalState();
    emit('saved', saved, message);
    emit('close');
  } catch (err: unknown) {
    console.error('Error al guardar ítem de catálogo:', err);
    errorCrear.value = extractError(
      err,
      `No fue posible guardar el ${labelTipoForm.value.toLowerCase()}`,
    );
  } finally {
    isSubmitting.value = false;
  }
};

watch(
  () => props.show,
  async (open) => {
    window.removeEventListener('dragend', onGlobalDragEnd);
    if (!open) {
      resetLocalState();
      return;
    }
    window.addEventListener('dragend', onGlobalDragEnd);
    catalogoFormListo.value = false;
    if (props.servicio?._id) hydrateEdit(props.servicio);
    else hydrateCreate();
    await Promise.all([cargarCategorias(), cargarTenantsSiAplica()]);
    catalogoFormListo.value = true;
  },
);

onUnmounted(() => {
  window.removeEventListener('dragend', onGlobalDragEnd);
});
</script>
