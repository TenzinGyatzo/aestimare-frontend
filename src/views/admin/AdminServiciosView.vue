<template>
  <div class="px-2 sm:px-0">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
    >
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">
        Productos y servicios
      </h1>
      <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
        <router-link
          to="/admin/categorias"
          class="w-full sm:w-auto text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
        >
          Gestionar categorías
        </router-link>
        <button
          type="button"
          class="w-full sm:w-auto text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          @click="mostrarModalCargaMasiva = true"
        >
          Carga masiva
        </button>
        <div class="flex w-full sm:w-auto gap-2">
          <button
            type="button"
            @click="abrirModalCrear('servicio')"
            class="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors font-medium text-sm"
          >
            <span class="lg:hidden">+ Servicio</span>
            <span class="hidden lg:inline">+ Agregar Servicio</span>
          </button>
          <button
            type="button"
            @click="abrirModalCrear('producto')"
            class="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors font-medium text-sm"
          >
            <span class="lg:hidden">+ Producto</span>
            <span class="hidden lg:inline">+ Agregar Producto</span>
          </button>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <div
        class="flex flex-col lg:flex-row lg:items-end gap-3 lg:gap-4"
      >
        <div class="flex-1 min-w-[180px]">
          <label
            for="filtro-nombre-servicio"
            class="block text-xs font-medium text-gray-600 mb-1"
            >Buscar por nombre</label
          >
          <input
            id="filtro-nombre-servicio"
            v-model="filters.nombre"
            type="text"
            placeholder="Buscar por nombre..."
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            @input="handleFilterChange"
          />
        </div>

        <div class="min-w-0 shrink">
          <p class="block text-xs font-medium text-gray-600 mb-1">Categoría</p>
          <div
            class="overflow-x-auto"
            role="tablist"
            aria-label="Categorías de servicio"
          >
            <div class="inline-grid grid-flow-col auto-cols-[2.75rem] gap-1">
              <button
                type="button"
                role="tab"
                :aria-selected="!filters.categoriaId"
                aria-label="Todas las categorías"
                title="Todas las categorías"
                class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                :class="
                  !filters.categoriaId
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
                :aria-selected="filters.categoriaId === cat._id"
                :aria-label="cat.nombre"
                :title="cat.nombre"
                class="w-[2.75rem] px-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors whitespace-nowrap overflow-hidden text-ellipsis"
                :class="
                  filters.categoriaId === cat._id
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

        <div class="min-w-[140px] shrink-0">
          <label
            for="filtro-tipo-servicio"
            class="block text-xs font-medium text-gray-600 mb-1"
            >Tipo</label
          >
          <select
            id="filtro-tipo-servicio"
            v-model="filters.tipo"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white"
            @change="onTipoFilterChange"
          >
            <option value="">Todos</option>
            <option value="servicio">Servicio</option>
            <option value="producto">Producto</option>
          </select>
        </div>

        <div class="min-w-[180px] shrink-0">
          <label
            for="filtro-orden-servicio"
            class="block text-xs font-medium text-gray-600 mb-1"
            >Ordenar por</label
          >
          <select
            id="filtro-orden-servicio"
            v-model="filters.orden"
            class="w-full rounded-md border-gray-300 text-sm px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-medical-blue-500 bg-white"
            @change="onOrdenChange"
          >
            <option value="creacion">Orden de creación</option>
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
          </select>
        </div>

        <div class="flex items-center pb-1 lg:pb-2 shrink-0">
          <ToggleSwitch
            id="ver-inactivos-servicios"
            v-model="verInactivos"
            @change="onVerInactivosChange"
          />
        </div>
      </div>
    </div>

    <div
      v-if="successMsg"
      class="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
    >
      {{ successMsg }}
    </div>

    <div
      v-if="actionError"
      class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      {{ actionError }}
    </div>

    <!-- Mensaje de carga -->
    <div
      v-if="!hasLoadedOnce"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">Cargando servicios...</p>
    </div>

    <!-- Contenedor de servicios (tabla y tarjetas) -->
    <template v-else>
      <div
        v-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <p class="text-red-800">{{ error }}</p>
      </div>
      <div class="relative">
        <ListLoadingOverlay v-if="isLoading" />
      <!-- Vista de tabla para pantallas grandes -->
      <div
        class="bg-white shadow-md rounded-lg overflow-hidden hidden lg:block"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 table-fixed">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="w-12 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  #
                </th>
                <th
                  class="w-[200px] max-w-[200px] px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Servicio
                </th>
                <th
                  class="w-40 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Categoría
                </th>
                <th
                  class="w-[330px] max-w-[330px] px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Descripción
                </th>
                <th
                  class="w-32 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Precio Unitario
                </th>
                <th
                  class="w-24 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="w-32 px-3 lg:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="servicios.length === 0">
                <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                  {{ emptyListMessage }}
                </td>
              </tr>
              <tr v-for="(servicio, index) in servicios" :key="servicio._id">
                <td
                  class="px-3 lg:px-4 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                  {{ rowNumber(index) }}
                </td>
                <td
                  class="w-[180px] max-w-[180px] px-3 lg:px-4 py-4 text-sm font-medium text-gray-900"
                >
                  <div class="flex items-start gap-1.5 flex-wrap">
                    <div class="break-words">{{ servicio.nombre }}</div>
                    <span
                      class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      :class="claseTipoDe(servicio.tipo)"
                      :title="labelTipoDe(servicio.tipo)"
                    >
                      {{ codigoTipoDe(servicio.tipo) }}
                    </span>
                  </div>
                </td>
                <td
                  class="px-3 lg:px-4 py-4 text-sm text-gray-700"
                  :title="labelCategoriaDe(servicio.categoriaId)"
                >
                  <div class="truncate">
                    {{ codigoCategoriaDe(servicio.categoriaId) }}
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 lg:px-4 py-4 text-sm text-gray-500 relative group"
                  v-if="servicio.descripcion && servicio.descripcion.length > 0"
                >
                  <div class="line-clamp-4 w-full break-words">
                    {{ servicio.descripcion }}
                  </div>
                  <!-- Tooltip personalizado -->
                  <div
                    class="tooltip-descripcion absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
                  >
                    <div class="whitespace-normal break-words">
                      {{ servicio.descripcion }}
                    </div>
                    <!-- Flecha del tooltip -->
                    <div
                      class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"
                    ></div>
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 lg:px-4 py-4 text-sm text-gray-500"
                  v-else
                >
                  <div class="truncate">-</div>
                </td>
                <td
                  class="px-3 lg:px-4 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {{ formatMoney(servicio.precioUnitario) }}
                </td>
                <td class="px-3 lg:px-4 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      isServicioActivo(servicio)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ isServicioActivo(servicio) ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td
                  class="px-3 lg:px-4 py-4 whitespace-nowrap text-sm font-medium"
                >
                  <div class="flex flex-col xl:flex-row gap-1 xl:gap-2">
                    <button
                      @click="abrirModalEditar(servicio)"
                      class="text-medical-blue-600 hover:text-medical-blue-900 text-left"
                    >
                      Editar
                    </button>
                    <button
                      v-if="isServicioActivo(servicio)"
                      @click="pedirDesactivar(servicio)"
                      class="text-red-600 hover:text-red-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Desactivar
                    </button>
                    <button
                      v-else
                      @click="reactivar(servicio)"
                      class="text-green-700 hover:text-green-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Reactivar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vista de tabla compacta para pantallas medianas (md a lg) -->
      <div
        class="bg-white shadow-md rounded-lg overflow-hidden hidden md:block lg:hidden"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  #
                </th>
                <th
                  class="w-[160px] max-w-[160px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Servicio
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Categoría
                </th>
                <th
                  class="w-[330px] max-w-[330px] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Descripción
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Precio
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Estado
                </th>
                <th
                  class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="servicios.length === 0">
                <td colspan="7" class="px-3 py-4 text-center text-gray-500">
                  {{ emptyListMessage }}
                </td>
              </tr>
              <tr v-for="(servicio, index) in servicios" :key="servicio._id">
                <td class="px-3 py-4 whitespace-nowrap text-xs text-gray-500">
                  {{ rowNumber(index) }}
                </td>
                <td
                  class="w-[160px] max-w-[160px] px-3 py-4 text-xs font-medium text-gray-900"
                >
                  <div class="flex items-start gap-1.5 flex-wrap">
                    <div class="break-words">{{ servicio.nombre }}</div>
                    <span
                      class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      :class="claseTipoDe(servicio.tipo)"
                      :title="labelTipoDe(servicio.tipo)"
                    >
                      {{ codigoTipoDe(servicio.tipo) }}
                    </span>
                  </div>
                </td>
                <td
                  class="px-3 py-4 text-xs text-gray-700"
                  :title="labelCategoriaDe(servicio.categoriaId)"
                >
                  <div class="truncate max-w-[100px]">
                    {{ codigoCategoriaDe(servicio.categoriaId) }}
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 py-4 text-xs text-gray-500 relative group"
                  v-if="servicio.descripcion && servicio.descripcion.length > 0"
                >
                  <div class="line-clamp-3 w-full break-words">
                    {{ servicio.descripcion }}
                  </div>
                  <!-- Tooltip personalizado -->
                  <div
                    class="tooltip-descripcion absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-56 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none"
                  >
                    <div class="whitespace-normal break-words">
                      {{ servicio.descripcion }}
                    </div>
                    <div
                      class="absolute top-full left-4 border-4 border-transparent border-t-gray-900"
                    ></div>
                  </div>
                </td>
                <td
                  class="w-[330px] max-w-[330px] px-3 py-4 text-xs text-gray-500"
                  v-else
                >
                  <div class="truncate">-</div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-xs text-gray-900">
                  {{ formatMoney(servicio.precioUnitario) }}
                </td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-1.5 py-0.5 text-xs font-medium rounded-full',
                      isServicioActivo(servicio)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800',
                    ]"
                  >
                    {{ isServicioActivo(servicio) ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-xs font-medium">
                  <div class="flex flex-col gap-1">
                    <button
                      @click="abrirModalEditar(servicio)"
                      class="text-medical-blue-600 hover:text-medical-blue-900 text-left"
                    >
                      Editar
                    </button>
                    <button
                      v-if="isServicioActivo(servicio)"
                      @click="pedirDesactivar(servicio)"
                      class="text-red-600 hover:text-red-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Desactivar
                    </button>
                    <button
                      v-else
                      @click="reactivar(servicio)"
                      class="text-green-700 hover:text-green-900 text-left disabled:opacity-50"
                      :disabled="isMutating"
                    >
                      Reactivar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Vista de tarjetas para pantallas pequeñas -->
      <div class="md:hidden space-y-4">
        <div
          v-if="servicios.length === 0"
          class="bg-white shadow-md rounded-lg p-6 text-center"
        >
          <p class="text-gray-500">{{ emptyListMessage }}</p>
        </div>
        <div
          v-for="(servicio, index) in servicios"
          :key="servicio._id"
          class="bg-white shadow-md rounded-lg p-4 space-y-3"
        >
          <!-- Encabezado de la tarjeta -->
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs text-gray-500 font-medium"
                  >#{{ rowNumber(index) }}</span
                >
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    isServicioActivo(servicio)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800',
                  ]"
                >
                  {{ isServicioActivo(servicio) ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ servicio.nombre }}
                </h3>
                <span
                  class="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                  :class="claseTipoDe(servicio.tipo)"
                  :title="labelTipoDe(servicio.tipo)"
                >
                  {{ codigoTipoDe(servicio.tipo) }}
                </span>
              </div>
              <p
                class="text-sm text-gray-600 mt-1"
                :title="labelCategoriaDe(servicio.categoriaId)"
              >
                {{ codigoCategoriaDe(servicio.categoriaId) }}
              </p>
            </div>
          </div>

          <!-- Descripción -->
          <div
            v-if="servicio.descripcion && servicio.descripcion.length > 0"
            class="text-sm text-gray-600"
          >
            <span class="font-medium text-gray-700 block mb-1"
              >Descripción:</span
            >
            <p class="text-gray-600 leading-relaxed">
              {{ servicio.descripcion }}
            </p>
          </div>

          <!-- Información adicional -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="font-medium text-gray-700">Precio:</span>
              <span class="ml-1 text-gray-900 font-semibold">
                {{ formatMoney(servicio.precioUnitario) }}
              </span>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-col gap-2 pt-2 border-t border-gray-200">
            <button
              @click="abrirModalEditar(servicio)"
              class="w-full px-4 py-2 bg-medical-blue-50 text-medical-blue-600 rounded-md hover:bg-medical-blue-100 transition-colors font-medium text-sm"
            >
              Editar
            </button>
            <button
              v-if="isServicioActivo(servicio)"
              @click="pedirDesactivar(servicio)"
              class="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium text-sm disabled:opacity-50"
              :disabled="isMutating"
            >
              Desactivar
            </button>
            <button
              v-else
              @click="reactivar(servicio)"
              class="w-full px-4 py-2 bg-green-50 text-green-800 rounded-md hover:bg-green-100 transition-colors font-medium text-sm disabled:opacity-50"
              :disabled="isMutating"
            >
              Reactivar
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="pagination.totalPages > 1"
        class="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white shadow-md rounded-lg px-4 py-3"
      >
        <p class="text-sm text-gray-600">
          Mostrando
          {{
            (pagination.page - 1) * pagination.limit +
            (servicios.length ? 1 : 0)
          }}–{{
            Math.min(
              pagination.page * pagination.limit,
              pagination.total,
            )
          }}
          de {{ pagination.total }}
        </p>
        <div class="flex gap-2">
          <button
            type="button"
            class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            :disabled="pagination.page <= 1"
            @click="prevPage"
          >
            Anterior
          </button>
          <button
            type="button"
            class="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50"
            :disabled="pagination.page >= pagination.totalPages"
            @click="nextPage"
          >
            Siguiente
          </button>
        </div>
      </div>
      </div>
    </template>

    <ModalItemCatalogoForm
      :show="mostrarModalItem"
      :create-tipo="tipoCrear"
      :servicio="servicioEditando"
      :allow-multi-tenant="true"
      @close="onCerrarModalItem"
      @saved="onItemGuardado"
    />

    <ModalCargaMasivaCatalogo
      :show="mostrarModalCargaMasiva"
      @close="mostrarModalCargaMasiva = false"
      @imported="onCargaMasivaImported"
    />

    <!-- Modal de confirmación para desactivar servicio -->
    <ConfirmationModal
      :show="mostrarConfirmDesactivar"
      title="Desactivar Servicio"
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
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  getServicios,
  deleteServicio,
  toggleServicioActivo,
  getCategoriasServicio,
  type AdminServiciosFilters,
  type ServicioOrden,
} from '../../services/admin-api.service';
import type {
  CategoriaServicioCatalogo,
  Servicio,
  TipoItemCatalogo,
} from '../../types/backend';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ModalItemCatalogoForm from '../../components/common/ModalItemCatalogoForm.vue';
import ModalCargaMasivaCatalogo from '../../components/common/ModalCargaMasivaCatalogo.vue';
import ToggleSwitch from '../../components/common/ToggleSwitch.vue';
import ListLoadingOverlay from '../../components/base/ListLoadingOverlay.vue';
import { useAuthStore } from '../../store/auth';
import { formatMoney } from '../../utils/currency';
import { extractError } from '../../utils/extractError';
import {
  boolQuery,
  compactQuery,
  queryFlag,
  queryInt,
  queryString,
  shouldResetListQueryForTenant,
} from '../../utils/listQuery';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { activeTenantId } = storeToRefs(authStore);

const ORDENES: ServicioOrden[] = ['creacion', 'nombre_asc', 'nombre_desc'];

const servicios = ref<Servicio[]>([]);
const categorias = ref<CategoriaServicioCatalogo[]>([]);
const categoriaById = computed(() => {
  const map = new Map<string, CategoriaServicioCatalogo>();
  for (const cat of categorias.value) {
    if (cat._id) map.set(cat._id, cat);
  }
  return map;
});
const isLoading = ref(false);
const hasLoadedOnce = ref(false);
const error = ref<string | null>(null);
const verInactivos = ref(false);
const successMsg = ref<string | null>(null);
const actionError = ref<string | null>(null);
const isMutating = ref(false);
let loadSeq = 0;
let categoriasLoadSeq = 0;
let filterTimeout: ReturnType<typeof setTimeout> | null = null;

const filters = ref<{
  nombre: string;
  categoriaId: string;
  tipo: '' | TipoItemCatalogo;
  orden: ServicioOrden;
  page: number;
  limit: number;
}>({
  nombre: '',
  categoriaId: '',
  tipo: '',
  orden: 'creacion',
  page: 1,
  limit: 20,
});

const pagination = ref({
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 1,
});

function isServicioActivo(servicio: Servicio): boolean {
  return servicio.activo !== false;
}

function codigoCategoriaDe(categoriaId?: string): string {
  if (!categoriaId) return '—';
  return categoriaById.value.get(categoriaId)?.codigo || '—';
}

function labelCategoriaDe(categoriaId?: string): string {
  if (!categoriaId) return '';
  const cat = categoriaById.value.get(categoriaId);
  return cat?.nombre || '';
}

function codigoTipoDe(tipo?: TipoItemCatalogo): string {
  if (tipo === 'producto') return 'PROD';
  if (tipo === 'servicio') return 'SERV';
  return '—';
}

function labelTipoDe(tipo?: TipoItemCatalogo): string {
  if (tipo === 'producto') return 'Producto';
  if (tipo === 'servicio') return 'Servicio';
  return '';
}

/** Alineado a badges SERV/PROD del cotizador (ModalSeleccionServicios). */
function claseTipoDe(tipo?: TipoItemCatalogo | string | null): string {
  if (tipo === 'producto') return 'bg-amber-50 text-amber-800';
  if (tipo === 'servicio') return 'bg-sky-50 text-sky-800';
  return 'bg-gray-100 text-gray-600';
}

const tieneFiltrosBusqueda = computed(
  () =>
    !!(
      filters.value.nombre?.trim() ||
      filters.value.categoriaId ||
      filters.value.tipo
    ),
);

const emptyListMessage = computed(() => {
  if (tieneFiltrosBusqueda.value)
    return 'No se encontraron servicios con esos filtros';
  if (verInactivos.value) return 'No hay servicios inactivos';
  return 'No hay servicios disponibles';
});

function rowNumber(index: number): number {
  return (pagination.value.page - 1) * pagination.value.limit + index + 1;
}

const mostrarModalItem = ref(false);
const tipoCrear = ref<TipoItemCatalogo>('servicio');
const servicioEditando = ref<Servicio | null>(null);

function abrirModalCrear(tipo: TipoItemCatalogo = 'servicio') {
  servicioEditando.value = null;
  tipoCrear.value = tipo;
  mostrarModalItem.value = true;
}

function abrirModalEditar(servicio: Servicio) {
  servicioEditando.value = servicio;
  mostrarModalItem.value = true;
}

function onCerrarModalItem() {
  mostrarModalItem.value = false;
  servicioEditando.value = null;
}

function onItemGuardado(_item: Servicio, message: string) {
  successMsg.value = message;
  onCerrarModalItem();
  void cargarServicios();
}

const mostrarModalCargaMasiva = ref(false);

function onCargaMasivaImported(created: number) {
  if (!mostrarModalCargaMasiva.value) return;
  successMsg.value =
    created === 1
      ? 'Se registró 1 ítem desde la carga masiva.'
      : `Se registraron ${created} ítems desde la carga masiva.`;
  void cargarServicios();
}

const mostrarConfirmDesactivar = ref(false);
const mensajeConfirmDesactivar = ref('');
const servicioADesactivar = ref<Servicio | null>(null);

/** true si la query traía `tipo` inválido/vacío y hay que limpiar la URL */
function applyQueryToState(): boolean {
  filters.value.nombre = queryString(route.query, 'nombre') ?? '';
  filters.value.categoriaId = queryString(route.query, 'categoriaId') ?? '';
  const tipo = queryString(route.query, 'tipo');
  const tipoValido = tipo === 'servicio' || tipo === 'producto';
  filters.value.tipo = tipoValido ? tipo : '';
  const orden = queryString(route.query, 'orden');
  filters.value.orden =
    orden && (ORDENES as readonly string[]).includes(orden)
      ? (orden as ServicioOrden)
      : 'creacion';
  filters.value.page = queryInt(route.query, 'page', 1);
  filters.value.limit = queryInt(route.query, 'limit', 20, { max: 100 });
  verInactivos.value = queryFlag(route.query, 'verInactivos');
  // `tipo` presente en URL pero no usable → sync para no dejar query sucia
  return tipo != null && tipo !== '' && !tipoValido;
}

async function syncQuery() {
  const next = compactQuery({
    nombre: filters.value.nombre?.trim() || undefined,
    categoriaId: filters.value.categoriaId || undefined,
    tipo: filters.value.tipo || undefined,
    orden:
      filters.value.orden !== 'creacion' ? filters.value.orden : undefined,
    page: (filters.value.page ?? 1) > 1 ? filters.value.page : undefined,
    limit:
      (filters.value.limit ?? 20) !== 20 ? filters.value.limit : undefined,
    verInactivos: boolQuery(verInactivos.value),
  });
  await router.replace({ query: next });
}

function resetFilters() {
  filters.value = {
    nombre: '',
    categoriaId: '',
    tipo: '',
    orden: 'creacion',
    page: 1,
    limit: 20,
  };
  verInactivos.value = false;
}

async function cargarCategorias() {
  const seq = ++categoriasLoadSeq;
  try {
    const res = await getCategoriasServicio({ limit: 100 });
    if (seq !== categoriasLoadSeq) return;
    categorias.value = res.data || [];
    // Si el filtro apunta a una categoría que ya no existe en el tenant, limpiarlo
    if (
      filters.value.categoriaId &&
      !categorias.value.some((c) => c._id === filters.value.categoriaId)
    ) {
      filters.value.categoriaId = '';
      // Sync inmediato: cargarServicios puede fallar después y dejar URL stale
      await syncQuery();
    }
  } catch (err: unknown) {
    if (seq !== categoriasLoadSeq) return;
    console.error('Error al cargar categorías:', err);
    categorias.value = [];
    if (filters.value.categoriaId) {
      filters.value.categoriaId = '';
      await syncQuery();
    }
    actionError.value = extractError(
      err,
      'No fue posible cargar las categorías',
    );
  }
}

const cargarServicios = async () => {
  const seq = ++loadSeq;
  isLoading.value = true;
  error.value = null;

  try {
    let page = filters.value.page ?? 1;
    const limit = filters.value.limit ?? 20;
    const activeFilters: AdminServiciosFilters = {
      page,
      limit,
      orden: filters.value.orden,
    };
    if (filters.value.nombre?.trim()) {
      activeFilters.nombre = filters.value.nombre.trim();
    }
    if (filters.value.categoriaId) {
      activeFilters.categoriaId = filters.value.categoriaId;
    }
    if (filters.value.tipo) {
      activeFilters.tipo = filters.value.tipo;
    }
    if (verInactivos.value) {
      activeFilters.activo = false;
    }

    let res = await getServicios(activeFilters);
    if (seq !== loadSeq) return;

    // Clamp: página vacía con total > 0 → última página
    if (
      res.data.length === 0 &&
      res.total > 0 &&
      res.page > res.totalPages
    ) {
      page = res.totalPages;
      filters.value.page = page;
      res = await getServicios({ ...activeFilters, page });
      if (seq !== loadSeq) return;
    }

    servicios.value = res.data;
    pagination.value = {
      total: res.total,
      page: res.page,
      limit: res.limit,
      totalPages: res.totalPages,
    };
    filters.value.page = res.total === 0 ? 1 : res.page;
    await syncQuery();
  } catch (err: any) {
    if (seq !== loadSeq) return;
    console.error('Error al cargar servicios:', err);
    error.value = extractError(err, 'No fue posible cargar los servicios');
  } finally {
    if (seq === loadSeq) {
      isLoading.value = false;
      hasLoadedOnce.value = true;
    }
  }
};

function clearFilterDebounce() {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
}

function reloadFromFilters() {
  successMsg.value = null;
  actionError.value = null;
  void (async () => {
    await syncQuery();
    await cargarServicios();
  })();
}

function handleFilterChange() {
  clearFilterDebounce();
  filterTimeout = setTimeout(() => {
    filters.value.page = 1;
    reloadFromFilters();
  }, 500);
}

function onCategoriaChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function onTipoFilterChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function selectCategoria(categoriaId: string) {
  if (filters.value.categoriaId === categoriaId) return;
  filters.value.categoriaId = categoriaId;
  onCategoriaChange();
}

function onOrdenChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function onVerInactivosChange() {
  clearFilterDebounce();
  filters.value.page = 1;
  reloadFromFilters();
}

function prevPage() {
  if ((filters.value.page ?? 1) > 1) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) - 1;
    reloadFromFilters();
  }
}

function nextPage() {
  if ((filters.value.page ?? 1) < (pagination.value.totalPages ?? 1)) {
    clearFilterDebounce();
    filters.value.page = (filters.value.page ?? 1) + 1;
    reloadFromFilters();
  }
}

/**
 * Desactiva (soft delete) o reactiva un servicio
 */
const pedirDesactivar = (servicio: Servicio) => {
  if (!servicio._id) return;
  servicioADesactivar.value = servicio;
  mensajeConfirmDesactivar.value = `¿Desactivar el servicio "${servicio.nombre}"?\n\nDejará de aparecer en el cotizador. Las cotizaciones históricas conservan su información. Puedes reactivarlo desde "Ver inactivos".`;
  mostrarConfirmDesactivar.value = true;
};

const ejecutarDesactivar = async () => {
  if (isMutating.value) {
    actionError.value =
      'Hay otra operación en curso. Espera un momento e intenta de nuevo.';
    return;
  }
  const id = servicioADesactivar.value?._id;
  if (!id) {
    mostrarConfirmDesactivar.value = false;
    return;
  }
  mostrarConfirmDesactivar.value = false;
  isMutating.value = true;
  actionError.value = null;
  try {
    await deleteServicio(id);
    successMsg.value = 'Servicio desactivado.';
    // Optimista: quitar de listado activos antes del reload
    servicios.value = servicios.value.filter((s) => s._id !== id);
    await cargarServicios();
  } catch (err: any) {
    console.error('Error al desactivar servicio:', err);
    successMsg.value = null;
    actionError.value = extractError(err, 'No se pudo desactivar el servicio');
  } finally {
    isMutating.value = false;
    servicioADesactivar.value = null;
  }
};

const reactivar = async (servicio: Servicio) => {
  if (!servicio._id || isMutating.value) return;
  isMutating.value = true;
  actionError.value = null;
  try {
    await toggleServicioActivo(servicio._id);
    successMsg.value = 'Servicio reactivado.';
    // Optimista: quitar de listado inactivos para no permitir segundo toggle
    servicios.value = servicios.value.filter((s) => s._id !== servicio._id);
    await cargarServicios();
  } catch (err: any) {
    console.error('Error al reactivar servicio:', err);
    successMsg.value = null;
    actionError.value = extractError(err, 'No se pudo reactivar el servicio');
  } finally {
    isMutating.value = false;
  }
};

watch(activeTenantId, () => {
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
  resetFilters();
  hasLoadedOnce.value = false;
  categorias.value = [];
  if (mostrarModalItem.value) onCerrarModalItem();
  mostrarModalCargaMasiva.value = false;
  mostrarConfirmDesactivar.value = false;
  servicioADesactivar.value = null;
  successMsg.value = null;
  actionError.value = null;
  void (async () => {
    await syncQuery();
    await cargarCategorias();
    await cargarServicios();
  })();
});

// Cargar datos al montar el componente
onMounted(async () => {
  if (shouldResetListQueryForTenant(activeTenantId.value)) {
    resetFilters();
  } else {
    const tipoQuerySucia = applyQueryToState();
    if (tipoQuerySucia) {
      await syncQuery();
    }
  }
  await cargarCategorias();
  await cargarServicios();
});

onUnmounted(() => {
  clearFilterDebounce();
});
</script>

<style scoped>
/* Scrollbar más sutil y casi invisible */
.scrollbar-hide::-webkit-scrollbar {
  height: 3px;
}
.scrollbar-hide::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-hide::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}
.scrollbar-hide::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Para Firefox */
.scrollbar-hide {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
}

/* Mejoras de responsividad para tablas */
@media (max-width: 1023px) {
  table {
    font-size: 0.875rem;
  }
}

/* Mejorar el comportamiento de line-clamp */
.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ocultar tooltips a partir de 1406px de ancho */
@media (min-width: 1406px) {
  .tooltip-descripcion {
    display: none !important;
  }
}
</style>
