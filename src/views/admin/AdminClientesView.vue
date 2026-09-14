<template>
  <div class="max-w-7xl mx-auto">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
    >
      <h1 class="text-2xl md:text-3xl font-bold text-gray-900">Clientes</h1>
      <button
        type="button"
        class="inline-flex items-center justify-center px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors text-sm font-medium"
        @click="abrirNuevo"
      >
        Nuevo cliente
      </button>
    </div>

    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <div
      v-if="actionError"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ actionError }}
    </div>

    <div
      v-if="successMsg"
      class="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {{ successMsg }}
    </div>

    <!-- Filtros -->
    <div class="mb-4 md:mb-6 bg-white shadow-md rounded-lg p-4 md:p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <input
            v-model="filters.empresa"
            type="text"
            placeholder="Nombre comercial"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="handleFilterChange"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Razón Social
          </label>
          <input
            v-model="filters.razonSocial"
            type="text"
            placeholder="Buscar por razón social..."
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="handleFilterChange"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            RFC
          </label>
          <input
            v-model="filters.rfc"
            type="text"
            placeholder="Ej. ABC010101AB1"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500 uppercase"
            @input="handleFilterChange"
          />
        </div>
        <div class="flex items-center pb-1 shrink-0">
          <ToggleSwitch
            id="ver-inactivos"
            v-model="verInactivos"
            @change="onVerInactivosChange"
          />
        </div>
      </div>
    </div>

    <BaseSectionLoader
      v-if="!hasLoadedOnce"
      message="Cargando clientes..."
    />

    <div v-else class="relative">
      <ListLoadingOverlay v-if="isLoadingClientes" />
      <div
        v-if="clientesAgrupados.length === 0"
        class="bg-white shadow-md rounded-lg p-6 md:p-8 text-center"
      >
        <p class="text-sm md:text-base text-gray-500 mb-4">
          {{ emptyStateMessage }}
        </p>
        <button
          v-if="!verInactivos && !tieneFiltrosBusqueda"
          type="button"
          class="inline-flex items-center px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 text-sm font-medium"
          @click="abrirNuevo"
        >
          Crear primer cliente
        </button>
      </div>

      <div
        v-else
        class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
      >
        <div
          v-for="grupo in clientesAgrupados"
          :key="grupo.clienteId"
          class="bg-white shadow-md rounded-lg overflow-hidden min-w-0"
        >
          <div
            class="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 bg-gray-50 border-b border-gray-200"
          >
            <div class="min-w-0">
              <div class="mb-2 sm:mb-3">
                <span
                  class="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words"
                >
                  {{ grupo.empresa || 'Sin nombre' }}
                </span>
              </div>
              <div
                v-if="grupo.razonSocial"
                class="text-xs sm:text-sm text-gray-600 break-words mb-1"
              >
                {{ grupo.razonSocial }}
              </div>
              <div
                class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2"
              >
                <span
                  v-if="grupo.rfc"
                  class="text-xs sm:text-sm text-gray-600 break-all font-mono uppercase"
                >
                  {{ grupo.rfc }}
                </span>
                <span
                  v-if="grupo.activo !== false"
                  class="inline-block px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
                >
                  Activo
                </span>
                <span
                  v-else
                  class="inline-block px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800"
                >
                  Inactivo
                </span>
              </div>
              <div
                class="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600"
              >
                <span class="font-medium">Contactos:</span>
                <span class="ml-1 font-semibold text-gray-900">{{
                  grupo.totalContactos || 0
                }}</span>
                <span class="mx-2 text-gray-400">·</span>
                <span class="font-medium">Cotizaciones:</span>
                <span class="ml-1 font-semibold text-gray-900">{{
                  grupo.totalCotizaciones || 0
                }}</span>
              </div>
            </div>
            <div
              class="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2"
            >
              <button
                type="button"
                class="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium"
                @click="abrirEditar(grupo)"
              >
                Editar
              </button>
              <button
                v-if="grupo.activo !== false"
                type="button"
                class="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
                :disabled="isMutating"
                @click="pedirDesactivar(grupo)"
              >
                Desactivar
              </button>
              <button
                v-else
                type="button"
                class="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-green-200 text-green-800 bg-green-50 rounded-md hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50"
                :disabled="isMutating"
                @click="reactivar(grupo)"
              >
                Reactivar
              </button>
              <router-link
                :to="{
                  name: 'admin-cliente-detalle',
                  params: { id: grupo.clienteId },
                }"
                class="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                Ver detalle
                <svg
                  class="w-4 h-4 ml-1 sm:ml-2 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="clientesPagination.totalPages > 1"
        class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white shadow-md rounded-lg px-4 py-3"
      >
        <p class="text-sm text-gray-600">
          Mostrando
          {{
            (clientesPagination.page - 1) * clientesPagination.limit +
            (clientesAgrupados.length ? 1 : 0)
          }}–{{
            Math.min(
              clientesPagination.page * clientesPagination.limit,
              clientesPagination.total,
            )
          }}
          de {{ clientesPagination.total }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            :disabled="clientesPagination.page <= 1"
            @click="prevPage"
          >
            Anterior
          </button>
          <button
            type="button"
            class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            :disabled="clientesPagination.page >= clientesPagination.totalPages"
            @click="nextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal crear/editar -->
    <ModalClienteForm
      :show="mostrarModal"
      :modo-edicion="modoEdicion"
      :initial="formulario"
      :form-error="formError"
      :is-submitting="isSubmitting"
      @close="cerrarModal"
      @submit="onModalClienteSubmit"
    />

    <ConfirmationModal
      :show="mostrarConfirmDesactivar"
      title="Desactivar cliente"
      :message="mensajeConfirmDesactivar"
      type="danger"
      confirm-text="Desactivar"
      cancel-text="Cancelar"
      @confirm="ejecutarDesactivar"
      @cancel="mostrarConfirmDesactivar = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAdmin } from '../../composables/useAdmin';
import {
  createCliente,
  updateCliente,
  deleteCliente,
  toggleClienteActivo,
  type AdminClientesFilters,
} from '../../services/admin-api.service';
import type { Cliente } from '../../types/backend';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import ListLoadingOverlay from '../../components/base/ListLoadingOverlay.vue';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ToggleSwitch from '../../components/common/ToggleSwitch.vue';
import ModalClienteForm from '../../components/common/ModalClienteForm.vue';
import type { ClienteFormFields } from '../../components/common/ModalClienteForm.vue';
import { extractError } from '../../utils/extractError';
import {
  boolQuery,
  compactQuery,
  queryFlag,
  queryInt,
  queryString,
  shouldResetListQueryForTenant,
} from '../../utils/listQuery';
import { useAuthStore } from '../../store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { activeTenantId } = storeToRefs(authStore);

const {
  clientes,
  clientesPagination,
  isLoadingClientes,
  error,
  obtenerClientes,
} = useAdmin();

const filters = ref<AdminClientesFilters>({
  empresa: '',
  razonSocial: '',
  rfc: '',
  page: 1,
  limit: 20,
});
const verInactivos = ref(false);
const hasLoadedOnce = ref(false);

const successMsg = ref<string | null>(null);
const actionError = ref<string | null>(null);
const isMutating = ref(false);
const mostrarModal = ref(false);
const modoEdicion = ref(false);
const clienteEditandoId = ref<string | null>(null);
const isSubmitting = ref(false);
const formError = ref<string | null>(null);
const formulario = ref({ empresa: '', razonSocial: '', rfc: '' });

const mostrarConfirmDesactivar = ref(false);
const clienteADesactivar = ref<{ clienteId: string; empresa?: string } | null>(
  null,
);
const mensajeConfirmDesactivar = computed(() => {
  const nombre = clienteADesactivar.value?.empresa || 'este cliente';
  return `¿Desactivar «${nombre}»? No aparecerá al crear cotizaciones; el histórico se conserva.`;
});

let filterTimeout: ReturnType<typeof setTimeout> | null = null;

function applyQueryToState() {
  filters.value.empresa = queryString(route.query, 'empresa') ?? '';
  filters.value.razonSocial = queryString(route.query, 'razonSocial') ?? '';
  filters.value.rfc = queryString(route.query, 'rfc') ?? '';
  filters.value.page = queryInt(route.query, 'page', 1);
  filters.value.limit = queryInt(route.query, 'limit', 20, { max: 100 });
  verInactivos.value = queryFlag(route.query, 'verInactivos');
}

async function syncQuery() {
  const next = compactQuery({
    empresa: filters.value.empresa?.trim() || undefined,
    razonSocial: filters.value.razonSocial?.trim() || undefined,
    rfc: filters.value.rfc?.trim() || undefined,
    page: (filters.value.page ?? 1) > 1 ? filters.value.page : undefined,
    limit:
      (filters.value.limit ?? 20) !== 20 ? filters.value.limit : undefined,
    verInactivos: boolQuery(verInactivos.value),
  });
  await router.replace({ query: next });
}

function resetFilters() {
  filters.value = {
    empresa: '',
    razonSocial: '',
    rfc: '',
    page: 1,
    limit: 20,
  };
  verInactivos.value = false;
}

function handleFilterChange() {
  if (filterTimeout) clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
    filters.value.page = 1;
    void (async () => {
      await syncQuery();
      await loadClientes();
    })();
  }, 500);
}

function onVerInactivosChange() {
  filters.value.page = 1;
  void (async () => {
    await syncQuery();
    await loadClientes();
  })();
}

async function loadClientes() {
  try {
    const activeFilters: AdminClientesFilters = {
      page: filters.value.page ?? 1,
      limit: filters.value.limit ?? 20,
    };
    if (filters.value.empresa) activeFilters.empresa = filters.value.empresa;
    if (filters.value.razonSocial)
      activeFilters.razonSocial = filters.value.razonSocial;
    if (filters.value.rfc) activeFilters.rfc = filters.value.rfc;
    if (verInactivos.value) {
      activeFilters.activo = false;
    }
    await obtenerClientes(activeFilters);
    // Sync tras clamp de página en store
    filters.value.page = clientesPagination.value.page;
    hasLoadedOnce.value = true;
    await syncQuery();
  } catch (err) {
    console.error('Error al cargar clientes:', err);
    hasLoadedOnce.value = true;
  }
}

const tieneFiltrosBusqueda = computed(
  () =>
    !!(
      filters.value.empresa?.trim() ||
      filters.value.razonSocial?.trim() ||
      filters.value.rfc?.trim()
    ),
);

const emptyStateMessage = computed(() => {
  if (tieneFiltrosBusqueda.value) {
    return 'No se encontraron clientes con esos filtros';
  }
  if (verInactivos.value) return 'No hay clientes inactivos';
  return 'No se encontraron clientes';
});

function prevPage() {
  if ((filters.value.page ?? 1) > 1) {
    filters.value.page = (filters.value.page ?? 1) - 1;
    void (async () => {
      await syncQuery();
      await loadClientes();
    })();
  }
}

function nextPage() {
  if (
    (filters.value.page ?? 1) < (clientesPagination.value.totalPages ?? 1)
  ) {
    filters.value.page = (filters.value.page ?? 1) + 1;
    void (async () => {
      await syncQuery();
      await loadClientes();
    })();
  }
}

const clientesAgrupados = computed(() => {
  const grupos = new Map<
    string,
    {
      clienteId: string;
      empresa?: string;
      razonSocial?: string;
      rfc?: string;
      activo?: boolean;
      totalContactos?: number;
      totalCotizaciones?: number;
    }
  >();

  clientes.value.forEach((cliente: Cliente) => {
    const clienteId = cliente._id || '';
    if (!grupos.has(clienteId)) {
      grupos.set(clienteId, {
        clienteId,
        empresa: cliente.empresa,
        razonSocial: cliente.razonSocial,
        rfc: cliente.rfc,
        activo: cliente.activo,
        totalContactos: cliente.totalContactos,
        totalCotizaciones: cliente.totalCotizaciones,
      });
    }
  });

  return Array.from(grupos.values());
});

function abrirNuevo() {
  modoEdicion.value = false;
  clienteEditandoId.value = null;
  formulario.value = { empresa: '', razonSocial: '', rfc: '' };
  formError.value = null;
  successMsg.value = null;
  mostrarModal.value = true;
}

function abrirEditar(grupo: {
  clienteId: string;
  empresa?: string;
  razonSocial?: string;
  rfc?: string;
}) {
  modoEdicion.value = true;
  clienteEditandoId.value = grupo.clienteId;
  formulario.value = {
    empresa: grupo.empresa || '',
    razonSocial: grupo.razonSocial || '',
    rfc: grupo.rfc || '',
  };
  formError.value = null;
  successMsg.value = null;
  mostrarModal.value = true;
}

function cerrarModal() {
  mostrarModal.value = false;
  formError.value = null;
  isSubmitting.value = false;
}

function pedirDesactivar(grupo: { clienteId: string; empresa?: string }) {
  clienteADesactivar.value = grupo;
  mostrarConfirmDesactivar.value = true;
}

async function ejecutarDesactivar() {
  const id = clienteADesactivar.value?.clienteId;
  mostrarConfirmDesactivar.value = false;
  if (!id || isMutating.value) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await deleteCliente(id);
    successMsg.value = 'Cliente desactivado.';
    await loadClientes();
  } catch (e) {
    successMsg.value = null;
    actionError.value = extractError(e, 'No se pudo desactivar');
  } finally {
    isMutating.value = false;
  }
}

async function reactivar(grupo: { clienteId: string }) {
  if (isMutating.value) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await toggleClienteActivo(grupo.clienteId);
    successMsg.value = 'Cliente reactivado.';
    await loadClientes();
  } catch (e) {
    successMsg.value = null;
    actionError.value = extractError(e, 'No se pudo reactivar');
  } finally {
    isMutating.value = false;
  }
}

async function onModalClienteSubmit(fields: ClienteFormFields) {
  const empresa = fields.empresa.trim();
  if (!empresa) {
    formError.value = 'Debe proporcionar el nombre de la empresa';
    return;
  }

  isSubmitting.value = true;
  formError.value = null;
  try {
    const rfc = fields.rfc.trim().toUpperCase();
    const razonSocial = fields.razonSocial.trim();
    formulario.value = { empresa, razonSocial, rfc };
    if (modoEdicion.value && clienteEditandoId.value) {
      await updateCliente(clienteEditandoId.value, {
        empresa,
        razonSocial,
        rfc,
      });
      successMsg.value = 'Cliente actualizado.';
    } else {
      await createCliente({
        empresa,
        ...(razonSocial ? { razonSocial } : {}),
        ...(rfc ? { rfc } : {}),
      });
      successMsg.value = 'Cliente creado.';
      filters.value = {
        empresa: '',
        razonSocial: '',
        rfc: '',
        page: 1,
        limit: 20,
      };
      verInactivos.value = false;
    }
    cerrarModal();
    await loadClientes();
  } catch (e) {
    formError.value = extractError(e, 'No se pudo guardar el cliente');
  } finally {
    isSubmitting.value = false;
  }
}

watch(activeTenantId, () => {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
  resetFilters();
  hasLoadedOnce.value = false;
  void (async () => {
    await syncQuery();
    await loadClientes();
  })();
});

onMounted(() => {
  if (shouldResetListQueryForTenant(activeTenantId.value)) {
    resetFilters();
  } else {
    applyQueryToState();
  }
  void loadClientes();
});

onUnmounted(() => {
  if (filterTimeout) clearTimeout(filterTimeout);
});
</script>
