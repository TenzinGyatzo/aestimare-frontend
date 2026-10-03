<template>
  <div class="max-w-3xl lg:max-w-7xl mx-auto py-2 sm:py-4">
    <div v-if="cotizacion?.branding?.razonSocial" class="mb-4">
      <p class="text-sm font-semibold text-gray-700">
        {{ cotizacion.branding.razonSocial }}
      </p>
    </div>
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div class="flex items-center gap-3">
        <img
          v-if="cotizacion"
          :src="displayLogoSrc"
          :alt="displayLogoAlt"
          class="w-16 object-contain"
          @error="onLogoError"
        />
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
          Detalle de Cotización
        </h1>
      </div>
      <div v-if="cotizacion" class="sm:text-right">
        <p class="text-sm font-medium text-gray-500">Folio</p>
        <p class="text-lg font-mono font-bold text-medical-blue-600">
          {{ cotizacion.folio }}
        </p>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-6 rounded-lg bg-red-50 p-4 border border-red-200"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Mensaje de éxito -->
    <div
      v-if="successMessage"
      class="mb-6 rounded-lg bg-green-50 p-4 border border-green-200"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        </div>
      </div>
    </div>

    <BaseSectionLoader
      v-if="isLoading && !cotizacion"
      message="Cargando información de tu cotización..."
    />

    <div v-else-if="cotizacion" class="space-y-6">
      <!-- Banner de Estado -->
      <div
        :class="getEstadoBannerClass(cotizacion.estado)"
        class="rounded-xl border shadow-sm p-6"
      >
        <div
          class="flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div class="flex items-center gap-5">
            <div
              :class="getEstadoIconClass(cotizacion.estado)"
              class="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center shadow-inner"
            >
              <svg
                v-if="cotizacion.estado === 'vigente'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="cotizacion.estado === 'aceptada'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="cotizacion.estado === 'vencida'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="cotizacion.estado === 'rechazada'"
                class="w-8 h-8"
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
              <svg
                v-else-if="cotizacion.estado === 'cancelada'"
                class="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium opacity-80 mb-0.5">Estado actual</p>
              <h3
                :class="getEstadoTextClass(cotizacion.estado)"
                class="text-2xl font-bold"
              >
                {{ getEstadoLabel(cotizacion.estado) }}
              </h3>
              <p class="text-xs opacity-70 mt-1">
                {{ getEstadoSublabel(cotizacion) }}
              </p>
            </div>
          </div>

          <div
            v-if="canRespond"
            class="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
          >
            <BaseButtonLoader
              variant="primary"
              size="lg"
              :disabled="isProcessing"
              :loading="isProcessing"
              custom-class="bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-md font-bold px-8"
              @click="prepareAceptar"
            >
              Aceptar Cotización
            </BaseButtonLoader>
            <BaseButtonLoader
              variant="danger"
              size="lg"
              :disabled="isProcessing"
              :loading="isProcessing"
              custom-class="shadow-md font-bold px-8"
              @click="showRechazarConfirm = true"
            >
              Rechazar
            </BaseButtonLoader>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Columna Izquierda: Información -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Detalles Generales -->
          <div class="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
            <div
              class="flex items-center justify-between mb-6 pb-4 border-b border-gray-50"
            >
              <h2 class="text-xl font-bold text-gray-800">
                Resumen del Servicio
              </h2>
              <button
                @click="handleDownloadPDF"
                class="inline-flex items-center text-medical-blue-600 hover:text-medical-blue-800 font-medium transition-colors"
                title="Descargar versión PDF"
              >
                <svg
                  class="w-5 h-5 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Descargar PDF
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p
                  class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1"
                >
                  Empresa / Cliente
                </p>
                <p class="text-gray-900 font-medium">
                  {{ cotizacion.nombreEmpresa || 'No especificada' }}
                </p>
              </div>
              <div>
                <p
                  class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1"
                >
                  Contacto Solicitante
                </p>
                <p class="text-gray-900 font-medium">
                  {{ cotizacion.nombreContacto || 'No especificado' }}
                </p>
              </div>
              <div v-if="cotizacion.telefonoContacto">
                <p
                  class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1"
                >
                  Teléfono
                </p>
                <p class="text-gray-900 font-medium">
                  {{ cotizacion.telefonoContacto }}
                </p>
              </div>
              <div>
                <p
                  class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1"
                >
                  Vigencia
                </p>
                <p class="text-gray-900 font-medium">
                  {{
                    cotizacion.sinVigencia || !cotizacion.fechaVencimiento
                      ? '—'
                      : formatDate(cotizacion.fechaVencimiento)
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Servicios Cotizados -->
          <div
            class="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden"
          >
            <div class="p-6 pb-2 border-b border-gray-50 bg-gray-50/50">
              <h2 class="text-lg font-bold text-gray-800">
                Servicios Detallados
              </h2>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-100">
                <thead class="bg-gray-50/80">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Servicio
                    </th>
                    <th
                      class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider"
                    >
                      Cant.
                    </th>
                    <th
                      class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[7.5rem]"
                    >
                      P. Unitario
                    </th>
                    <th
                      class="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[8.5rem]"
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 bg-white">
                  <tr
                    v-for="(item, index) in cotizacion.items"
                    :key="index"
                    class="hover:bg-medical-blue-50/30 transition-colors"
                  >
                    <td class="px-6 py-4">
                      <p class="text-sm font-bold text-gray-900">
                        {{ item.nombre }}
                      </p>
                      <p
                        v-if="item.descripcion"
                        class="text-xs text-gray-500 mt-1 line-clamp-5 italic"
                      >
                        {{ item.descripcion }}
                      </p>
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-gray-600 text-center font-medium"
                    >
                      {{ item.cantidad }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-gray-600 text-right whitespace-nowrap"
                    >
                      {{ formatCurrency(item.precioUnitario) }}
                    </td>
                    <td
                      class="px-6 py-4 text-sm text-gray-900 text-right font-bold whitespace-nowrap"
                    >
                      {{ formatCurrency(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Totales -->
        <div class="space-y-6">
          <div
            class="bg-white shadow-md border border-medical-blue-100 rounded-xl p-6 sticky top-6"
          >
            <h2
              class="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2"
            >
              Resumen de Pago
            </h2>
            <div class="space-y-4">
              <div
                v-if="agregarIva"
                class="flex justify-between items-center py-2"
              >
                <span class="text-gray-500 font-medium">Subtotal</span>
                <span class="text-gray-900 font-bold">{{
                  formatCurrency(cotizacion.total)
                }}</span>
              </div>
              <div
                v-if="agregarIva"
                class="flex justify-between items-center py-2"
              >
                <span class="text-gray-500 font-medium">I.V.A (16%)</span>
                <span class="text-gray-900 font-bold">{{
                  formatCurrency(iva)
                }}</span>
              </div>
              <div :class="agregarIva ? 'pt-4 border-t-2 border-gray-50' : ''">
                <div class="flex justify-between items-center">
                  <span class="text-medical-blue-600 font-black text-lg"
                    >TOTAL</span
                  >
                  <span class="text-medical-blue-700 font-black text-2xl">{{
                    formatCurrency(agregarIva ? grandTotal : cotizacion.total)
                  }}</span>
                </div>
              </div>
            </div>

            <div
              v-if="canRespond"
              class="mt-8 pt-6 border-t border-gray-50 space-y-4"
            >
              <p class="text-xs text-center text-gray-500 font-medium italic">
                Al aceptar esta cotización, confirmas tu solicitud para los
                servicios listados.
              </p>
              <BaseButtonLoader
                variant="primary"
                full-width
                :disabled="isProcessing"
                :loading="isProcessing"
                custom-class="bg-medical-blue-600 hover:bg-medical-blue-700 h-12 text-lg shadow-lg font-bold"
                @click="prepareAceptar"
              >
                Confirmar Aceptación
              </BaseButtonLoader>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <ConfirmationModal
      :show="showRechazarConfirm"
      title="Rechazar Cotización"
      message="¿Estás seguro de que deseas rechazar esta cotización? Esta acción no se puede deshacer."
      confirm-text="Sí, rechazar"
      type="danger"
      @confirm="handleRechazar"
      @cancel="showRechazarConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { publicApiService } from '../services/public-api.service';
import ConfirmationModal from '../components/common/ConfirmationModal.vue';
import {
  downloadCotizacionPDF,
  resolvePublicUrl,
} from '../utils/pdfHelper';
import { pdfOptsFromDetalle } from '../utils/pdfOptsFromDetalle';
import { hasBancariosUtiles } from '../utils/bancarios.util';
import logoFallback from '../assets/logos/aestimare-logo-fallback.png';
import BaseSectionLoader from '../components/base/BaseSectionLoader.vue';
import BaseButtonLoader from '../components/base/BaseButtonLoader.vue';
import type {
  CotizacionDetalleDto,
  PublicCotizacionResponse,
} from '../types/backend';
import { formatMoney as formatCurrency } from '../utils/currency';

const route = useRoute();
const token = route.params.token as string;

const cotizacion = ref<PublicCotizacionResponse | null>(null);
const isLoading = ref(true);
const isProcessing = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const logoLoadFailed = ref(false);

const showRechazarConfirm = ref(false);

watch(
  () => cotizacion.value?.branding?.logoUrl,
  () => {
    logoLoadFailed.value = false;
  },
);

const displayLogoSrc = computed(() => {
  if (logoLoadFailed.value) return logoFallback;
  const url = cotizacion.value?.branding?.logoUrl?.trim();
  if (url) return resolvePublicUrl(url);
  return logoFallback;
});

const displayLogoAlt = computed(
  () => cotizacion.value?.branding?.razonSocial?.trim() || 'Aestimare',
);

function onLogoError() {
  if (!logoLoadFailed.value) logoLoadFailed.value = true;
}

function publicErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { status?: number; data?: { message?: string | string[] } };
  };
  const status = e.response?.status;
  const raw = e.response?.data?.message;
  const msg = Array.isArray(raw) ? raw.join(', ') : raw;
  if (status === 401 || status === 410) {
    return msg || 'Este enlace ha expirado y ya no es válido.';
  }
  if (status === 404) {
    return msg || 'Este enlace no es válido o la cotización no existe.';
  }
  if (status === 400) {
    return msg || 'No se puede responder esta cotización en su estado actual.';
  }
  return msg || fallback;
}

const canRespond = computed(() => {
  const c = cotizacion.value;
  if (!c || c.estado !== 'vigente' || successMessage.value) return false;
  if (c.sinVigencia || !c.fechaVencimiento) return true;
  const due = Date.parse(c.fechaVencimiento);
  if (Number.isNaN(due)) return false;
  return due >= Date.now();
});

const fetchCotizacion = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    cotizacion.value = await publicApiService.getCotizacionByToken(token);
    if (cotizacion.value?.estado === 'aceptada') {
      successMessage.value = 'Esta cotización ya fue aceptada.';
    } else if (cotizacion.value?.estado === 'rechazada') {
      successMessage.value = 'Esta cotización ya fue rechazada.';
    }
  } catch (err: unknown) {
    console.error('Error al cargar cotización:', err);
    cotizacion.value = null;
    error.value = publicErrorMessage(
      err,
      'Hubo un problema al cargar la cotización.',
    );
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (token) {
    fetchCotizacion();
  } else {
    error.value = 'Enlace de acceso no proporcionado.';
    isLoading.value = false;
  }
});

/** Ausente o true = desglose 16 %. Solo false deja un solo TOTAL. */
const agregarIva = computed(() => cotizacion.value?.agregarIva !== false);
const iva = computed(() => (cotizacion.value?.total || 0) * 0.16);
const grandTotal = computed(() => (cotizacion.value?.total || 0) + iva.value);

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

const prepareAceptar = async () => {
  if (isProcessing.value) return;
  try {
    isProcessing.value = true;
    error.value = null;
    successMessage.value = null;

    const updated = await publicApiService.aceptarCotizacionByToken(token);
    cotizacion.value = updated;

    successMessage.value = updated.alreadyResponded
      ? 'Esta cotización ya había sido aceptada.'
      : '¡Cotización aceptada con éxito! Te contactaremos pronto.';
  } catch (err: unknown) {
    error.value = publicErrorMessage(err, 'Error al aceptar la cotización.');
  } finally {
    isProcessing.value = false;
  }
};

const handleRechazar = async () => {
  if (isProcessing.value) return;
  try {
    isProcessing.value = true;
    error.value = null;
    successMessage.value = null;
    showRechazarConfirm.value = false;

    const updated = await publicApiService.rechazarCotizacionByToken(token);
    cotizacion.value = updated;

    successMessage.value = updated.alreadyResponded
      ? 'Esta cotización ya había sido rechazada.'
      : 'Has rechazado la cotización.';
  } catch (err: unknown) {
    error.value = publicErrorMessage(err, 'Error al rechazar la cotización.');
  } finally {
    isProcessing.value = false;
  }
};

/** Adapta DTO público al shape que espera pdfHelper (sin exigir JWT). */
function toPdfShape(c: PublicCotizacionResponse): CotizacionDetalleDto {
  return {
    _id: 'public',
    folio: c.folio,
    clienteId: '',
    emailContacto: c.emailContacto || '',
    total: c.total,
    moneda: c.moneda || 'MXN',
    estado: (c.estado as CotizacionDetalleDto['estado']) || 'vigente',
    fechaCreacion: c.fechaCreacion,
    fechaVencimiento: c.fechaVencimiento,
    sinVigencia: c.sinVigencia,
    nombreEmpresa: c.nombreEmpresa,
    nombreContacto: c.nombreContacto,
    telefonoContacto: c.telefonoContacto,
    cargoContacto: c.cargoContacto,
    incluirDescripciones: c.incluirDescripciones === true,
    incluirImagenesPdf: c.incluirImagenesPdf === true,
    incluirDatosBancarios: c.incluirDatosBancarios === true,
    agregarIva: c.agregarIva !== false,
    plantillasSnapshot: c.plantillasSnapshot,
    items: (c.items || []).map((it) => {
      const tipoSnapshot =
        it.tipoSnapshot === 'producto' || it.tipoSnapshot === 'servicio'
          ? it.tipoSnapshot
          : it.imagenUrl
            ? ('producto' as const)
            : undefined;
      return {
        servicioId: it.servicioId || '',
        nombreServicioSnapshot: it.nombre,
        descripcionServicioSnapshot: it.descripcion,
        cantidad: it.cantidad,
        precioUnitarioSnapshot: it.precioUnitario,
        subtotal: it.subtotal,
        ...(tipoSnapshot ? { tipoSnapshot } : {}),
      };
    }),
  };
}

const handleDownloadPDF = async () => {
  if (!cotizacion.value) return;
  try {
    const c = cotizacion.value;
    const detalle = toPdfShape(c);
    // imagenUrl es proyección pública live → mapa (AD-22), no campo en ItemCotizacion.
    const opts = pdfOptsFromDetalle({
      items: (c.items || []).map((it) => ({
        servicioId: it.servicioId || '',
        nombreServicioSnapshot: it.nombre,
        precioUnitarioSnapshot: it.precioUnitario,
        cantidad: it.cantidad,
        subtotal: it.subtotal,
        imagenUrl: it.imagenUrl,
      })),
    });
    await downloadCotizacionPDF(detalle, {
      branding: c.branding,
      ...(hasBancariosUtiles(c.bancarios) ? { bancarios: c.bancarios } : {}),
      ...opts,
    });
  } catch (err) {
    console.error('Error al descargar PDF:', err);
    alert('No se pudo generar el PDF en este momento.');
  }
};

const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    vigente: 'Vigente',
    aceptada: 'Aceptada',
    vencida: 'Vencida',
    rechazada: 'Rechazada',
    cancelada: 'Cancelada',
  };
  return labels[estado] || estado;
};

const getEstadoSublabel = (cot: PublicCotizacionResponse | null) => {
  if (!cot) return '';
  if (cot.estado === 'vigente') {
    if (cot.sinVigencia || !cot.fechaVencimiento) return 'Sin vigencia';
    return `Vence el: ${formatDate(cot.fechaVencimiento)}`;
  }
  if (cot.estado === 'aceptada')
    return `Aceptada el: ${formatDate(cot.fechaAceptacion)}`;
  if (cot.estado === 'rechazada')
    return `Rechazada el: ${formatDate(cot.fechaRechazo)}`;
  if (cot.estado === 'vencida')
    return `Expiró el: ${formatDate(cot.fechaVencimiento)}`;
  if (cot.estado === 'cancelada') return 'Oferta retirada';
  return '';
};

const getEstadoBannerClass = (estado: string) => {
  const classes: any = {
    vigente: 'bg-blue-50 border-blue-200 text-blue-800',
    aceptada: 'bg-green-50 border-green-200 text-green-800',
    vencida: 'bg-orange-50 border-orange-200 text-orange-800',
    rechazada: 'bg-red-50 border-red-200 text-red-800',
    cancelada: 'bg-slate-50 border-slate-200 text-slate-800',
  };
  return classes[estado] || 'bg-gray-50 border-gray-200';
};

const getEstadoIconClass = (estado: string) => {
  const classes: any = {
    vigente: 'bg-blue-100 text-blue-600',
    aceptada: 'bg-green-100 text-green-600',
    vencida: 'bg-orange-100 text-orange-600',
    rechazada: 'bg-red-100 text-red-600',
    cancelada: 'bg-slate-100 text-slate-700',
  };
  return classes[estado] || 'bg-gray-100 text-gray-600';
};

const getEstadoTextClass = (estado: string) => {
  const classes: any = {
    vigente: 'text-blue-700',
    aceptada: 'text-green-700',
    vencida: 'text-orange-700',
    rechazada: 'text-red-700',
    cancelada: 'text-slate-700',
  };
  return classes[estado] || 'text-gray-700';
};
</script>
