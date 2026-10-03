<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[105] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
    @pointerdown="onBackdropPointerDown"
    @pointerup="onBackdropPointerUp"
    @pointercancel="onBackdropPointerCancel"
  >
    <div
      class="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl h-full sm:h-auto sm:max-h-[92vh] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-revision-cotizacion"
      @pointerdown.stop
    >
      <div class="px-5 py-4 border-b border-gray-100 shrink-0">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2
              id="titulo-revision-cotizacion"
              class="text-xl font-bold text-gray-900"
            >
              Revisar cotización
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Aún no se ha guardado nada. Confirma que todo esté correcto antes
              de generar.
            </p>
          </div>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 shrink-0"
            aria-label="Volver a editar"
            @click="$emit('cerrar')"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="overflow-y-auto flex-1 px-5 py-4 space-y-5">
        <!-- Paso 1: Identidad -->
        <section class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <h3 class="text-sm font-bold text-gray-800 mb-3">1. Identidad</h3>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt class="text-gray-500">Cliente</dt>
              <dd class="font-medium text-gray-900">
                <span
                  v-if="sinCliente"
                  class="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-700"
                >
                  Sin cliente registrado
                </span>
                <span v-else>{{ displayOrDash(empresa) }}</span>
              </dd>
            </div>
            <div>
              <dt class="text-gray-500">Razón social</dt>
              <dd class="font-medium text-gray-900">
                {{
                  sinCliente ? '—' : displayOrDash(razonSocial)
                }}
              </dd>
            </div>
            <div>
              <dt class="text-gray-500">Solicitante</dt>
              <dd class="font-medium text-gray-900">
                {{ displayOrDash(nombreContacto) }}
              </dd>
            </div>
            <div>
              <dt class="text-gray-500">Correo</dt>
              <dd class="font-medium text-gray-900">
                {{ displayOrDash(correo) }}
              </dd>
            </div>
            <div>
              <dt class="text-gray-500">Teléfono</dt>
              <dd class="font-medium text-gray-900">
                {{ displayOrDash(telefono) }}
              </dd>
            </div>
            <div>
              <dt class="text-gray-500">Cargo</dt>
              <dd class="font-medium text-gray-900">
                {{ displayOrDash(cargo) }}
              </dd>
            </div>
          </dl>
        </section>

        <!-- Paso 2: Servicios -->
        <section class="rounded-xl border border-gray-200 bg-white p-4">
          <h3 class="text-sm font-bold text-gray-800 mb-3">2. Servicios</h3>
          <div class="overflow-x-auto -mx-1">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                  <th class="py-2 pr-3 font-semibold">Servicio</th>
                  <th
                    v-if="mostrarDescripciones"
                    class="py-2 pr-3 font-semibold"
                  >
                    Descripción
                  </th>
                  <th class="py-2 pr-3 font-semibold text-center w-16">Cant.</th>
                  <th class="py-2 pr-3 font-semibold text-right">P. unit.</th>
                  <th class="py-2 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(item, idx) in items" :key="idx">
                  <td class="py-2 pr-3 font-medium text-gray-900">
                    {{ item.nombre }}
                  </td>
                  <td
                    v-if="mostrarDescripciones"
                    class="py-2 pr-3 text-gray-600 max-w-[14rem] truncate"
                    :title="item.descripcion || ''"
                  >
                    {{ displayOrDash(item.descripcion) }}
                  </td>
                  <td class="py-2 pr-3 text-center text-gray-800">
                    {{ item.cantidad }}
                  </td>
                  <td class="py-2 pr-3 text-right text-gray-800 whitespace-nowrap">
                    {{ formatMoney(item.precioUnitario) }}
                  </td>
                  <td class="py-2 text-right font-semibold text-gray-900 whitespace-nowrap">
                    {{ formatMoney(item.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-200 space-y-1 text-sm">
            <template v-if="agregarIva">
              <div class="flex justify-between">
                <span class="text-gray-500">Subtotal (sin IVA)</span>
                <span class="font-semibold text-gray-900">{{
                  formatMoney(totalSinIva)
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-900 font-bold">Total con IVA</span>
                <span class="font-extrabold text-medical-blue-700">{{
                  formatMoney(totalConIva)
                }}</span>
              </div>
            </template>
            <div v-else class="flex justify-between">
              <span class="text-gray-900 font-bold">Total</span>
              <span class="font-extrabold text-medical-blue-700">{{
                formatMoney(totalSinIva)
              }}</span>
            </div>
          </div>
        </section>

        <!-- Paso 3: Opciones -->
        <section class="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
          <h3 class="text-sm font-bold text-gray-800 mb-3">
            3. Opciones y envío
          </h3>
          <dl class="space-y-3 text-sm">
            <div>
              <dt class="text-gray-500 mb-1">Plantillas en el PDF</dt>
              <dd>
                <ol
                  v-if="plantillas.length > 0"
                  class="list-decimal list-inside space-y-0.5 text-gray-800"
                >
                  <li v-for="(p, i) in plantillas" :key="i">{{ p.nombre }}</li>
                </ol>
                <span v-else class="text-gray-600">Ninguna</span>
              </dd>
            </div>
            <!-- Desc | Img / Bancarios | IVA / Vigencia -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <dt class="text-gray-500">Descripciones en PDF</dt>
                <dd class="font-medium text-gray-900">
                  {{ mostrarDescripciones ? 'Sí' : 'No' }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-500">Imágenes de producto en PDF</dt>
                <dd class="font-medium text-gray-900">
                  {{ incluirImagenesPdf ? 'Sí' : 'No' }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-500">Datos bancarios en PDF</dt>
                <dd class="font-medium text-gray-900">
                  {{ incluirDatosBancarios ? 'Sí' : 'No' }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-500">Agregar IVA</dt>
                <dd class="font-medium text-gray-900">
                  {{ agregarIva ? 'Sí' : 'No' }}
                </dd>
              </div>
              <div>
                <dt class="text-gray-500">Vigencia</dt>
                <dd class="font-medium text-gray-900">
                  {{
                    sinVigencia
                      ? 'Sin vigencia'
                      : `${vigenciaDias} días (${vigenciaLabel})`
                  }}
                </dd>
              </div>
            </div>
            <div>
              <dt class="text-gray-500 mb-1">Destinatarios</dt>
              <dd class="space-y-1">
                <p>
                  <span class="text-gray-500">Para:</span>
                  <span class="font-medium text-gray-900 ml-1">
                    {{
                      emailsPara.length > 0
                        ? emailsPara.join(', ')
                        : '—'
                    }}
                  </span>
                </p>
                <p v-if="emailsCc.length > 0">
                  <span class="text-gray-500">CC:</span>
                  <span class="font-medium text-gray-900 ml-1">{{
                    emailsCc.join(', ')
                  }}</span>
                </p>
              </dd>
            </div>
          </dl>

          <div
            class="mt-4 rounded-xl px-3 py-2.5 text-sm"
            :class="
              enviaraCorreo
                ? 'bg-medical-blue-50 border border-medical-blue-100 text-medical-blue-900'
                : 'bg-gray-100 border border-gray-200 text-gray-700'
            "
          >
            <p class="font-semibold">
              {{
                enviaraCorreo
                  ? 'Se enviará por correo'
                  : 'No se enviará correo'
              }}
            </p>
            <p v-if="enviaraCorreo" class="text-xs mt-0.5 opacity-90">
              Al confirmar, se creará la cotización y se enviará el PDF a:
              {{ emailsPara.join(', ') }}
            </p>
            <p v-else class="text-xs mt-0.5 opacity-90">
              La cotización se guardará sin notificación por correo electrónico.
            </p>
          </div>
        </section>
      </div>

      <div
        class="px-5 py-4 border-t border-gray-100 shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2"
      >
        <button
          type="button"
          class="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold"
          :disabled="isConfirming"
          @click="$emit('cerrar')"
        >
          Volver a editar
        </button>
        <button
          type="button"
          class="px-4 py-2.5 bg-white border border-medical-blue-200 text-medical-blue-700 rounded-xl hover:bg-medical-blue-50 font-semibold disabled:opacity-50"
          :disabled="isPdfBusy || isConfirming"
          @click="$emit('preview-pdf')"
        >
          {{ isPdfBusy ? 'Generando PDF…' : 'Previsualizar PDF' }}
        </button>
        <button
          type="button"
          class="px-4 py-2.5 bg-medical-blue-600 text-white rounded-xl hover:bg-medical-blue-700 font-bold disabled:opacity-50"
          :disabled="isConfirming || isPdfBusy"
          @click="$emit('confirmar')"
        >
          {{ isConfirming ? 'Generando…' : 'Confirmar y generar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useModalDismiss } from '../../composables/useModalDismiss';
import { formatMoney } from '../../utils/currency';

export type RevisionItem = {
  nombre: string;
  descripcion?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export type RevisionPlantilla = {
  nombre: string;
};

interface Props {
  show: boolean;
  sinCliente: boolean;
  empresa: string;
  razonSocial: string;
  nombreContacto: string;
  correo: string;
  telefono: string;
  cargo: string;
  items: RevisionItem[];
  totalSinIva: number;
  totalConIva: number;
  /** false = una sola fila Total igual a la suma de líneas. */
  agregarIva?: boolean;
  mostrarDescripciones: boolean;
  incluirDatosBancarios: boolean;
  incluirImagenesPdf: boolean;
  sinVigencia: boolean;
  vigenciaDias: number;
  vigenciaLabel: string;
  plantillas: RevisionPlantilla[];
  emailsPara: string[];
  emailsCc: string[];
  enviaraCorreo: boolean;
  isPdfBusy?: boolean;
  isConfirming?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  razonSocial: '',
  agregarIva: true,
  isPdfBusy: false,
  isConfirming: false,
});

const emit = defineEmits<{
  cerrar: [];
  confirmar: [];
  'preview-pdf': [];
}>();

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(() => emit('cerrar'), () => props.show);

function displayOrDash(value?: string): string {
  const t = value?.trim();
  return t || '—';
}
</script>
