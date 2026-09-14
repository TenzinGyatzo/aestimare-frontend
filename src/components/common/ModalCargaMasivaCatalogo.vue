<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-carga-masiva-titulo"
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
            id="modal-carga-masiva-titulo"
            class="text-xl font-bold text-gray-900 sm:text-2xl"
          >
            Carga masiva
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Sube un Excel para registrar productos y servicios del tenant.
          </p>
        </div>
        <button
          type="button"
          class="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
          aria-label="Cerrar"
          :disabled="isBusy"
          @click="cerrar"
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

      <div class="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        <template v-if="fase === 'carga'">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              class="w-full sm:w-auto rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              :disabled="isBusy"
              @click="descargarPlantilla"
            >
              Descargar plantilla
            </button>
            <p class="text-xs text-gray-500">
              .xlsx · máximo 500 filas y 2 MB · sin imágenes
            </p>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            class="sr-only"
            :disabled="isBusy"
            @change="onFileSelected"
          />

          <div
            role="button"
            :tabindex="isBusy ? -1 : 0"
            class="flex min-h-[10rem] flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-medical-blue-500"
            :class="[
              isBusy ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
              isDragOver
                ? 'border-medical-blue-500 bg-medical-blue-50'
                : 'border-gray-300 bg-gray-50/50 hover:border-medical-blue-400 hover:bg-medical-blue-50/40',
            ]"
            @click="abrirSelector"
            @keydown.enter.prevent="abrirSelector"
            @keydown.space.prevent="abrirSelector"
            @dragenter.prevent="onDragEnter"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="onDrop"
          >
            <p class="text-sm font-medium text-gray-700">
              {{
                isBusy
                  ? 'Importando archivo…'
                  : isDragOver
                    ? 'Suelta el archivo para cargarlo'
                    : archivo
                      ? archivo.name
                      : 'Arrastra un archivo .xlsx o haz clic para elegir'
              }}
            </p>
            <p v-if="archivo && !isBusy" class="mt-1 text-xs text-gray-500">
              Listo para importar
            </p>
          </div>

          <div
            v-if="fileError"
            class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {{ fileError }}
          </div>
        </template>

        <template v-else>
          <div class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p class="text-sm font-medium text-gray-900">
              {{ resumenTexto }}
            </p>
            <p
              v-if="resultado && resultado.skippedEmpty"
              class="mt-1 text-xs text-gray-500"
            >
              {{ resultado.skippedEmpty }} fila(s) vacía(s) omitida(s).
            </p>
          </div>

          <div
            v-if="resultado && resultado.errors.length"
            class="overflow-x-auto rounded-lg border border-gray-200"
          >
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left font-medium text-gray-600">
                    Fila
                  </th>
                  <th class="px-3 py-2 text-left font-medium text-gray-600">
                    Nombre
                  </th>
                  <th class="px-3 py-2 text-left font-medium text-gray-600">
                    Código
                  </th>
                  <th class="px-3 py-2 text-left font-medium text-gray-600">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr
                  v-for="err in resultado.errors"
                  :key="`${err.row}-${err.nombre}-${err.error}`"
                >
                  <td class="px-3 py-2 text-gray-700">{{ err.row }}</td>
                  <td class="px-3 py-2 text-gray-900">
                    {{ err.nombre || '—' }}
                  </td>
                  <td class="px-3 py-2 text-gray-700">
                    {{ err.codigo || '—' }}
                  </td>
                  <td class="px-3 py-2 text-red-700">{{ err.error }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </div>

      <div
        class="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-100 px-4 py-4 sm:flex-row sm:justify-end sm:px-6"
      >
        <button
          v-if="fase === 'carga'"
          type="button"
          class="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          :disabled="isBusy"
          @click="cerrar"
        >
          Cancelar
        </button>
        <button
          v-if="fase === 'carga'"
          type="button"
          class="rounded-md bg-medical-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-medical-blue-700 disabled:opacity-60"
          :disabled="isBusy || !archivo"
          @click="subir"
        >
          {{ isBusy ? 'Importando…' : 'Importar' }}
        </button>
        <button
          v-if="fase === 'resultado'"
          type="button"
          class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click="volverACarga"
        >
          Cargar otro archivo
        </button>
        <button
          v-if="fase === 'resultado' && resultado?.reporteBase64"
          type="button"
          class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          @click="descargarReporte"
        >
          Descargar reporte
        </button>
        <button
          v-if="fase === 'resultado'"
          type="button"
          class="rounded-md bg-medical-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-medical-blue-700"
          @click="cerrar"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
  downloadCatalogoImportPlantilla,
  downloadCatalogoImportReporte,
  importCatalogo,
  type CatalogoImportResult,
} from '../../services/admin-api.service';
import { useModalDismiss } from '../../composables/useModalDismiss';
import { extractError } from '../../utils/extractError';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  close: [];
  imported: [created: number];
}>();

const fase = ref<'carga' | 'resultado'>('carga');
const archivo = ref<File | null>(null);
const fileError = ref<string | null>(null);
const resultado = ref<CatalogoImportResult | null>(null);
const isBusy = ref(false);
const isDragOver = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
let dragDepth = 0;

const { onBackdropPointerDown, onBackdropPointerUp, onBackdropPointerCancel } =
  useModalDismiss(() => {
    if (!isBusy.value) cerrar();
  }, () => props.show);

const resumenTexto = computed(() => {
  const r = resultado.value;
  if (!r) return '';
  if (r.created === 0 && r.failed === 0) {
    return 'No hay filas para importar';
  }
  const ok =
    r.created === 1 ? 'Se registró 1 ítem' : `Se registraron ${r.created} ítems`;
  if (!r.failed) return `${ok}.`;
  const bad =
    r.failed === 1 ? '1 fila no se pudo registrar' : `${r.failed} filas no se pudieron registrar`;
  return `${ok}. ${bad}.`;
});

watch(
  () => props.show,
  (open) => {
    if (open) resetEstado();
  },
);

function resetEstado() {
  fase.value = 'carga';
  archivo.value = null;
  fileError.value = null;
  resultado.value = null;
  isBusy.value = false;
  isDragOver.value = false;
  dragDepth = 0;
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function cerrar() {
  if (isBusy.value) return;
  emit('close');
}

function volverACarga() {
  resetEstado();
}

function abrirSelector() {
  if (isBusy.value) return;
  fileInputRef.value?.click();
}

function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) setArchivo(file);
  input.value = '';
}

function setArchivo(file: File) {
  fileError.value = null;
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    fileError.value = 'Solo se aceptan archivos .xlsx';
    archivo.value = null;
    return;
  }
  if (file.size > 2_000_000) {
    fileError.value = 'El archivo no puede superar 2MB';
    archivo.value = null;
    return;
  }
  archivo.value = file;
}

function onDragEnter() {
  if (isBusy.value) return;
  dragDepth += 1;
  isDragOver.value = true;
}

function onDragOver() {
  if (isBusy.value) return;
  isDragOver.value = true;
}

function onDragLeave() {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) isDragOver.value = false;
}

function onDrop(event: DragEvent) {
  dragDepth = 0;
  isDragOver.value = false;
  if (isBusy.value) return;
  const files = event.dataTransfer?.files;
  if (!files?.length) return;
  if (files.length !== 1) {
    fileError.value = 'Sube un solo archivo .xlsx';
    archivo.value = null;
    return;
  }
  const dropped = files.item(0);
  if (!dropped) return;
  setArchivo(dropped);
}

async function descargarPlantilla() {
  fileError.value = null;
  try {
    await downloadCatalogoImportPlantilla();
  } catch (err) {
    fileError.value =
      err instanceof Error && err.message
        ? err.message
        : extractError(err, 'No se pudo descargar la plantilla');
  }
}

async function subir() {
  if (!archivo.value || isBusy.value) return;
  isBusy.value = true;
  fileError.value = null;
  try {
    const data = await importCatalogo(archivo.value);
    resultado.value = data;
    fase.value = 'resultado';
    if (data.created > 0) emit('imported', data.created);
  } catch (err) {
    fileError.value = extractError(err, 'No se pudo importar el archivo');
  } finally {
    isBusy.value = false;
  }
}

function descargarReporte() {
  const base64 = resultado.value?.reporteBase64;
  if (!base64) return;
  try {
    downloadCatalogoImportReporte(base64);
  } catch {
    fileError.value = 'No se pudo generar el reporte';
  }
}
</script>
