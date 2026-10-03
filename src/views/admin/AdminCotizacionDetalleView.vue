<template>
  <div class="max-w-7xl mx-auto">
    <BaseBackButton class="mb-4" default-text="Volver a Cotizaciones" />

    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
      Detalle de Cotización
    </h1>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {{ error }}
    </div>

    <BaseSectionLoader
      v-if="isLoadingCotizaciones && !cotizacionDetalle"
      message="Cargando detalle de la cotización..."
    />

    <div v-else-if="cotizacionDetalle" class="space-y-4 md:space-y-6">
      <!-- Estado destacado -->
      <div
        :class="getEstadoBannerClass(cotizacionDetalle.estado)"
        class="rounded-lg border-2 shadow-lg p-4 md:p-6"
      >
        <div
          class="flex items-center justify-between flex-col md:flex-row gap-4"
        >
          <div class="flex items-center gap-4">
            <div
              :class="getEstadoIconClass(cotizacionDetalle.estado)"
              class="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center"
            >
              <svg
                v-if="cotizacionDetalle.estado === 'vigente'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'aceptada'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'vencida'"
                class="w-7 h-7 md:w-8 md:h-8"
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
                v-else-if="cotizacionDetalle.estado === 'rechazada'"
                class="w-7 h-7 md:w-8 md:h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <svg
                v-else-if="cotizacionDetalle.estado === 'cancelada'"
                class="w-7 h-7 md:w-8 md:h-8"
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
              <p class="text-xs md:text-sm font-medium opacity-75 mb-1">
                Estado de la Cotización
              </p>
              <h3
                :class="getEstadoTextClass(cotizacionDetalle.estado)"
                class="text-xl md:text-2xl lg:text-3xl font-bold"
              >
                {{ getEstadoLabel(cotizacionDetalle.estado) }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                Desde
                {{
                  formatDateTime(getEstadoTimestamp(cotizacionDetalle.estado))
                }}
              </p>
              <p
                v-if="provenanceLine"
                class="text-xs text-gray-500 mt-1 max-w-md"
                style="font-size: 0.75rem; font-weight: 400; line-height: 1.4"
              >
                {{ provenanceLine }}
              </p>
            </div>
          </div>
          <div class="flex flex-col md:items-end gap-3 w-full md:w-auto">
            <div class="text-left md:text-right">
              <p class="text-xs md:text-sm font-medium opacity-75 mb-1">
                Folio
              </p>
              <p class="text-base md:text-lg font-mono font-bold">
                {{ cotizacionDetalle.folio }}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <template v-if="cotizacionDetalle.estado === 'vigente'">
                <BaseButtonLoader
                  type="button"
                  variant="primary"
                  size="md"
                  :disabled="isProcessing"
                  :loading="isProcessing"
                  custom-class="bg-green-600 hover:bg-green-700 focus:ring-green-500 w-full sm:w-auto justify-center"
                  @click="handleAceptar"
                >
                  Aceptada
                </BaseButtonLoader>
                <BaseButtonLoader
                  type="button"
                  variant="danger"
                  size="md"
                  :disabled="isProcessing"
                  :loading="isProcessing"
                  custom-class="w-full sm:w-auto justify-center"
                  @click="handleRechazar"
                >
                  Rechazada
                </BaseButtonLoader>
              </template>
              <button
                v-if="puedeRepetir"
                type="button"
                class="w-full sm:w-auto px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                :disabled="isProcessing"
                @click="abrirRepetir"
              >
                Volver a cotizar
              </button>
              <div class="relative">
                <button
                  type="button"
                  class="w-full sm:w-auto px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  :disabled="isProcessing"
                  @click="showMasAcciones = !showMasAcciones"
                >
                  Más acciones
                  <span class="ml-1 text-gray-400">▾</span>
                </button>
                <div
                  v-if="showMasAcciones"
                  class="absolute right-0 z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <button
                    v-for="opt in otrosEstados"
                    :key="opt"
                    type="button"
                    class="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    :disabled="isProcessing"
                    @click="!isProcessing && pedirCambioEstado(opt)"
                  >
                    Marcar como {{ getEstadoLabel(opt) }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CotizacionRecordatorioBloque
        v-if="cotizacionId"
        :cotizacion-id="cotizacionId"
        :fecha-creacion="cotizacionDetalle.fechaCreacion"
        :nombre-cliente="getClienteNombre()"
      />

      <!-- Información General -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Información General
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Folio
            </label>
            <p
              class="text-sm md:text-base text-gray-900 font-mono font-semibold"
            >
              {{ cotizacionDetalle.folio }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Estado
            </label>
            <span
              :class="getEstadoBadgeClass(cotizacionDetalle.estado)"
              class="inline-block px-4 py-2 text-xs md:text-sm font-semibold rounded-lg"
            >
              {{ getEstadoLabel(cotizacionDetalle.estado) }}
            </span>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de creación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaCreacion) }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de vencimiento
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{
                cotizacionDetalle.sinVigencia ||
                !cotizacionDetalle.fechaVencimiento
                  ? '—'
                  : formatDate(cotizacionDetalle.fechaVencimiento)
              }}
            </p>
          </div>

          <div v-if="cotizacionDetalle.fechaAceptacion">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de aceptación
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaAceptacion) }}
            </p>
          </div>

          <div v-if="cotizacionDetalle.fechaRechazo">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Fecha de rechazo
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ formatDate(cotizacionDetalle.fechaRechazo) }}
            </p>
          </div>

          <div class="sm:col-span-2 lg:col-span-2">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Documento
            </label>
            <div class="flex flex-wrap items-center gap-2">
              <button
                type="button"
                @click="handlePreviewPDF"
                :disabled="isPdfBusy"
                class="inline-flex items-center px-4 py-2 border border-medical-blue-200 rounded-md shadow-sm text-sm font-medium text-medical-blue-700 bg-medical-blue-50 hover:bg-medical-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isPdfBusy ? '…' : 'Visualizar PDF' }}
              </button>
              <button
                type="button"
                @click="handleDownloadPDF"
                :disabled="isPdfBusy"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  class="-ml-1 mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Descargar PDF
              </button>
              <span
                class="hidden sm:block h-6 w-px bg-gray-200 mx-0.5"
                aria-hidden="true"
              />
              <button
                type="button"
                @click="abrirEnviarCorreo"
                :disabled="isPdfBusy || isSendingEmail"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  class="-ml-1 mr-2 h-4 w-4 text-medical-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {{ isSendingEmail ? 'Enviando…' : 'Enviar por correo' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Información del Cliente -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Información del Cliente
        </h2>

        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          <div v-if="getClienteNombre()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Empresa
            </label>
            <p class="text-sm md:text-base text-gray-900 font-medium">
              {{ getClienteNombre() }}
            </p>
          </div>

          <div v-if="getClienteRfc()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              RFC
            </label>
            <p class="text-sm md:text-base text-gray-900 font-mono uppercase">
              {{ getClienteRfc() }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Solicitante de la Cotización
            </label>
            <p
              class="text-sm md:text-base"
              :class="
                getUsuarioClienteNombre()
                  ? 'text-gray-900'
                  : 'text-gray-500 italic'
              "
            >
              {{ getUsuarioClienteNombre() || 'Sin solicitante' }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Correo del solicitante
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{
                getUsuarioClienteEmail() ||
                cotizacionDetalle.emailContacto ||
                '-'
              }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Teléfono del solicitante
            </label>
            <p class="text-sm md:text-base text-gray-900">
              {{ getUsuarioClienteTelefono() || '-' }}
            </p>
          </div>

          <div v-if="getClienteId()">
            <label
              class="block text-xs md:text-sm font-medium text-gray-500 mb-1"
            >
              Cliente
            </label>
            <router-link
              :to="{
                name: 'admin-cliente-detalle',
                params: { id: getClienteId()! },
              }"
              class="inline-flex items-center text-sm md:text-base text-medical-blue-600 hover:text-medical-blue-900 font-medium"
            >
              Ver detalle del cliente
              <svg
                class="w-4 h-4 ml-1"
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

      <!-- Mensaje flash (éxito o aviso parcial) -->
      <div
        v-if="successMessage"
        class="mb-4 rounded-md px-4 py-3 text-sm"
        :class="
          flashTone === 'warning'
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : 'bg-green-50 text-green-700'
        "
      >
        {{ successMessage }}
      </div>

      <div
        v-if="actionError"
        class="mb-4 rounded-md px-4 py-3 text-sm bg-red-50 text-red-700 border border-red-200"
        role="alert"
      >
        {{ actionError }}
      </div>

      <!-- Items de la cotización -->
      <div class="bg-white shadow-md rounded-lg p-4 md:p-6">
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Servicios Cotizados
        </h2>

        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Servicio
                </th>
                <th
                  class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Cantidad
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Precio Unitario
                </th>
                <th
                  class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                >
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="(item, index) in cotizacionDetalle.items"
                :key="index"
                class="hover:bg-gray-50 border-b border-gray-100"
              >
                <td class="px-3 py-2 text-sm text-gray-900">
                  {{ getServicioNombre(item) }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 text-center">
                  {{ item.cantidad }}
                </td>
                <td class="px-3 py-2 text-sm text-gray-900 text-right">
                  {{ formatMoney(item.precioUnitarioSnapshot) }}
                </td>
                <td
                  class="px-3 py-2 text-sm text-gray-900 text-right font-medium"
                >
                  {{ formatMoney(item.subtotal) }}
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr v-if="agregarIva" class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-900"
                >
                  Subtotal:
                </td>
                <td class="px-3 py-2 text-right font-semibold text-gray-900">
                  {{ formatMoney(cotizacionDetalle.total) }}
                </td>
              </tr>
              <tr v-if="agregarIva" class="border-t border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-sm"
                >
                  IVA:
                </td>
                <td
                  class="px-3 py-2 text-right font-semibold text-gray-900 text-sm"
                >
                  {{ formatMoney(iva) }}
                </td>
              </tr>
              <tr class="border-t-2 border-gray-200">
                <td
                  colspan="3"
                  class="px-3 py-2 text-right font-bold text-gray-900"
                >
                  Total:
                </td>
                <td
                  class="px-3 py-2 text-right font-bold text-lg text-gray-900"
                >
                  {{
                    formatMoney(
                      agregarIva ? totalConIva : cotizacionDetalle.total,
                    )
                  }}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <CotizacionNotasInternas
        v-if="cotizacionId"
        :cotizacion-id="cotizacionId"
        :notas="cotizacionDetalle.notasInternas"
        @updated="onNotasInternasUpdated"
      />

      <!-- PDF -->
      <div
        v-if="cotizacionDetalle.pdfUrl"
        class="bg-white shadow-md rounded-lg p-4 md:p-6"
      >
        <h2
          class="text-lg md:text-xl font-semibold text-gray-800 mb-4 pb-4 border-b border-gray-200"
        >
          Documento PDF
        </h2>
        <a
          :href="cotizacionDetalle.pdfUrl"
          target="_blank"
          class="inline-flex items-center px-4 py-2 bg-medical-blue-600 text-white rounded-md hover:bg-medical-blue-700 transition-colors font-medium text-sm"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Ver PDF
        </a>
      </div>
    </div>

    <div
      v-if="!isLoadingCotizaciones && !cotizacionDetalle"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">
        No se pudo cargar la información de la cotización
      </p>
    </div>

    <!-- Modal de confirmación para rechazo (banner) -->
    <ConfirmationModal
      :show="showConfirmRechazo"
      title="¿Rechazar cotización?"
      message="¿Está seguro de rechazar esta cotización? No se enviará notificación por correo."
      type="danger"
      confirm-text="Sí, rechazar"
      cancel-text="Cancelar"
      @confirm="confirmarRechazo"
      @cancel="showConfirmRechazo = false"
    />

    <!-- Confirmación Más acciones (Story 6.10) -->
    <ConfirmationModal
      :show="showConfirmEstado"
      :title="confirmEstadoTitle"
      :message="confirmEstadoMessage"
      type="warning"
      confirm-text="Sí, cambiar"
      cancel-text="Cancelar"
      @confirm="confirmarCambioEstado"
      @cancel="cancelarCambioEstado"
    />

    <!-- Story 6.17 — enviar / reenviar por correo desde detalle -->
    <ModalEnviarCotizacionCorreo
      :open="showEnviarCorreo"
      :folio="cotizacionDetalle?.folio"
      :initial-emails-para="enviarEmailsPara"
      :initial-emails-cc="enviarEmailsCc"
      :sending="isSendingEmail"
      :success="emailSendOk"
      :error="emailSendError"
      :email-credentials-configured="emailCredentialsConfigured"
      @close="cerrarEnviarCorreo"
      @send="enviarCorreoDesdeDetalle"
    />

    <!-- Story 6.12 — elegir modo de precios -->
    <div
      v-if="showRepetirModo"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repetir-modo-title"
    >
      <div
        class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm"
        @click="cerrarRepetir"
      ></div>
      <div
        class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3
          id="repetir-modo-title"
          class="text-lg font-semibold text-gray-900"
        >
          Crear una nueva cotización
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Elige cómo calcular los precios de la nueva cotización. La cotización
          original no se reescribe.
        </p>
        <div class="mt-5 flex flex-col gap-2">
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isProcessing"
            @click="elegirRepetirModo('actualizados')"
          >
            <span class="block">Precios actuales</span>
            <span class="mt-0.5 block text-xs font-normal text-gray-500">
              Usa los precios vigentes del catálogo.
            </span>
          </button>
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isProcessing"
            @click="elegirRepetirModo('originales')"
          >
            <span class="block">Precios originales</span>
            <span class="mt-0.5 block text-xs font-normal text-gray-500">
              Conserva los precios de esta cotización.
            </span>
          </button>
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isProcessing"
            @click="elegirRevisarYModificar"
          >
            <span class="block">Revisar y modificar</span>
            <span class="mt-0.5 block text-xs font-normal text-gray-500">
              Revisa los precios originales para ajustarlos
              antes de crear.
            </span>
          </button>
          <button
            type="button"
            class="mt-1 w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            :disabled="isProcessing"
            @click="cerrarRepetir"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Repetir paso 2 — destino -->
    <div
      v-if="showRepetirDestino"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repetir-destino-title"
    >
      <div
        class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm"
        @click="cerrarRepetir"
      ></div>
      <div
        class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3
          id="repetir-destino-title"
          class="text-lg font-semibold text-gray-900"
        >
          ¿Cómo desea continuar?
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Modo:
          <span class="font-medium text-gray-800">{{
            repetirModo === 'originales'
              ? 'Precios originales'
              : 'Precios actuales'
          }}</span>
        </p>
        <div
          v-if="mostrarOpcionCancelarOriginal"
          class="mt-4 rounded-md border border-gray-200 bg-gray-50 px-3 py-3"
        >
          <label
            class="flex items-start gap-2 cursor-pointer"
            :class="{ 'opacity-60 cursor-not-allowed': fuenteYaCancelada }"
          >
            <input
              v-model="repetirCancelarOriginal"
              type="checkbox"
              class="mt-0.5 rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
              :disabled="isProcessing || fuenteYaCancelada"
            />
            <span>
              <span class="block text-sm font-medium text-gray-800">
                Marcar original como cancelada
              </span>
              <span class="block text-xs text-gray-500 mt-0.5 leading-relaxed">
                La cotización actual dejará de estar vigente como oferta.
              </span>
            </span>
          </label>
        </div>
        <div class="mt-5 flex flex-col gap-4">
          <div class="space-y-1 mb-2">
            <button
              type="button"
              class="w-full rounded-md border border-medical-blue-200 bg-medical-blue-50 px-4 py-2.5 text-sm font-medium text-medical-blue-800 hover:bg-medical-blue-100 disabled:opacity-50"
              :disabled="isProcessing"
              @click="confirmarRepetirDestino(false)"
            >
              Crear ahora
            </button>
            <p class="text-xs text-gray-500 leading-relaxed text-center">
              Genera y envía por correo la cotización con folio nuevo.
            </p>
          </div>
          <div class="space-y-1">
            <button
              type="button"
              class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              :disabled="isProcessing"
              @click="confirmarRepetirDestino(true)"
            >
              Editar en cotizador
            </button>
            <p class="text-xs text-gray-500 leading-relaxed text-center">
              Revisa y modifica la cotización antes de confirmar y enviar.
            </p>
          </div>
          <button
            type="button"
            class="mt-1 w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
            :disabled="isProcessing"
            @click="volverRepetirModo"
          >
            Volver
          </button>
        </div>
      </div>
    </div>

    <!-- Story 11.2 — Toque al Repetir (un nivel) -->
    <div
      v-if="showRepetirToque"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repetir-toque-title"
    >
      <div
        class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm"
        aria-hidden="true"
        @pointerdown="onRepetirToqueBackdropDown"
        @pointerup="onRepetirToqueBackdropUp"
        @pointercancel="onRepetirToqueBackdropCancel"
      ></div>
      <div
        class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3
          id="repetir-toque-title"
          class="text-lg font-semibold text-gray-900"
        >
          ¿Quieres el mismo recordatorio en la cotización nueva?
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Si aceptas, programaremos el mismo recordatorio en la cotización
          nueva.
        </p>
        <p
          v-if="repetirToqueResumenReceta"
          class="mt-2 text-sm text-gray-600"
        >
          Cómo estaba programado:
          <span class="font-medium text-gray-800">{{
            repetirToqueResumenReceta
          }}</span>
        </p>
        <p
          v-if="repetirToqueEsFechaExacta"
          class="mt-2 text-sm text-gray-600"
        >
          La fecha anterior no se copia. Si aceptas, eliges un día nuevo.
        </p>
        <div class="mt-5 flex flex-col gap-2">
          <button
            type="button"
            class="w-full rounded-md border border-medical-blue-200 bg-medical-blue-50 px-4 py-2.5 text-sm font-medium text-medical-blue-800 hover:bg-medical-blue-100 disabled:opacity-50"
            :disabled="isProcessing"
            @click="aceptarRepetirToque"
          >
            Sí, programar el mismo recordatorio
          </button>
          <button
            type="button"
            class="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            :disabled="isProcessing"
            @click="rechazarRepetirToque"
          >
            No, solo crear la cotización
          </button>
        </div>
      </div>
    </div>

    <RecordatorioRecetaSelector
      :open="showRepetirRecetaSelector"
      mode="create"
      :zona-horaria="repetirZonaHoraria"
      :fecha-creacion="repetirFechaCreacionNueva"
      :saving="isProcessing"
      :nombre-cliente="getClienteNombre()"
      @close="cerrarRepetirRecetaSelector"
      @save="onRepetirRecetaSeleccionada"
    />

    <!-- Story 6.12 — resolver warnings (excluir / sustituir) -->
    <div
      v-if="showRepetirWarnings"
      class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="repetir-warnings-title"
    >
      <div
        class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm"
        @click="cerrarRepetir"
      ></div>
      <div
        class="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <h3
          id="repetir-warnings-title"
          class="text-lg font-semibold text-gray-900"
        >
          Servicios que requieren atención
        </h3>
        <p class="mt-2 text-sm text-gray-600">
          Omita o sustituya cada servicio antes de confirmar. Debe quedar al
          menos un ítem.
        </p>
        <ul class="mt-4 space-y-3">
          <li
            v-for="w in repetirWarnings"
            :key="`${w.index}-${w.servicioId}`"
            class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm"
          >
            <p class="font-medium text-gray-900">
              Ítem {{ w.index + 1 }} —
              {{ nombreItemFuente(w.servicioId) || w.servicioId }}
            </p>
            <p class="text-amber-800 mt-0.5">
              {{
                w.motivo === 'inactivo'
                  ? 'Servicio inactivo en el catálogo'
                  : 'Servicio no encontrado en el catálogo'
              }}
            </p>
            <label class="mt-2 flex items-center gap-2 text-gray-700">
              <input
                v-model="omitirIds[w.servicioId]"
                type="checkbox"
                class="rounded border-gray-300"
                @change="onOmitirChange(w.servicioId)"
              />
              Omitir este ítem
            </label>
            <div v-if="!omitirIds[w.servicioId]" class="mt-2">
              <label class="block text-xs text-gray-500 mb-1"
                >Sustituir por servicio activo</label
              >
              <select
                v-model="sustitucionesMap[w.servicioId]"
                class="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              >
                <option value="">— Seleccionar —</option>
                <option
                  v-for="s in serviciosActivos"
                  :key="s._id"
                  :value="s._id"
                >
                  {{ s.nombre }}
                </option>
              </select>
            </div>
          </li>
        </ul>
        <div class="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            :disabled="isProcessing"
            @click="cerrarRepetir"
          >
            Cancelar
          </button>
          <BaseButtonLoader
            type="button"
            variant="primary"
            size="sm"
            :disabled="isProcessing || !puedeConfirmarWarnings"
            :loading="isProcessing"
            @click="confirmarRepetirConResoluciones"
          >
            {{ repetirViaWizard ? 'Continuar al cotizador' : 'Crear cotización' }}
          </BaseButtonLoader>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdmin } from '../../composables/useAdmin';
import {
  downloadCotizacionPDF,
  generateCotizacionPdfBlob,
  previewCotizacionPDF,
} from '../../utils/pdfHelper';
import { pdfOptsFromDetalleAsync } from '../../utils/pdfOptsFromDetalle';
import { formatMoney } from '../../utils/currency';
import { extractError } from '../../utils/extractError';
import type { Servicio } from '../../types/backend';
import {
  enviarCorreoCotizacion,
  getCotizacionAdminById,
  getTenantConfig,
} from '../../services/admin-api.service';
import BaseBackButton from '../../components/base/BaseBackButton.vue';
import BaseSectionLoader from '../../components/base/BaseSectionLoader.vue';
import BaseButtonLoader from '../../components/base/BaseButtonLoader.vue';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ModalEnviarCotizacionCorreo from '../../components/common/ModalEnviarCotizacionCorreo.vue';
import CotizacionNotasInternas from '../../components/cotizaciones/CotizacionNotasInternas.vue';
import CotizacionRecordatorioBloque from '../../components/cotizaciones/CotizacionRecordatorioBloque.vue';
import RecordatorioRecetaSelector from '../../components/cotizaciones/RecordatorioRecetaSelector.vue';
import { useModalDismiss } from '../../composables/useModalDismiss';
import type { CotizacionDetalleDto } from '../../types/backend';

const route = useRoute();
const router = useRouter();
const {
  cotizacionDetalle,
  isLoadingCotizaciones,
  error,
  obtenerCotizacionAdmin,
  limpiarCotizacionDetalle,
  actualizarCotizacionDetalle,
} = useAdmin();

const cotizacionId = computed(() => {
  const c = cotizacionDetalle.value;
  if (!c) return '';
  return String((c as { _id?: string; id?: string })._id || (c as { id?: string }).id || route.params.id || '');
});

function onNotasInternasUpdated(cotizacion: CotizacionDetalleDto): void {
  actualizarCotizacionDetalle(cotizacion);
}

const isPdfBusy = ref(false);

// Story 6.17 — envío / reenvío por correo
const showEnviarCorreo = ref(false);
const isSendingEmail = ref(false);
const emailSendOk = ref(false);
const emailSendError = ref<string | null>(null);
const enviarEmailsPara = ref<string[]>([]);
const enviarEmailsCc = ref<string[]>([]);
/** Story 3.4 — null = desconocido; false deshabilita envío en modal. */
const emailCredentialsConfigured = ref<boolean | null>(null);

async function refreshEmailCredentialsFlag(): Promise<void> {
  try {
    const cfg = await getTenantConfig();
    emailCredentialsConfigured.value =
      typeof cfg.emailCredentialsConfigured === 'boolean'
        ? cfg.emailCredentialsConfigured
        : false;
  } catch {
    emailCredentialsConfigured.value = null;
  }
}

/** Ausente o true = desglose 16 %. Solo false deja un solo Total. */
const agregarIva = computed(
  () => cotizacionDetalle.value?.agregarIva !== false,
);

// Computed para calcular el IVA (16% del subtotal)
const iva = computed(() => {
  if (!cotizacionDetalle.value?.total) return 0;
  return cotizacionDetalle.value.total * 0.16;
});

// Computed para calcular el total con IVA
const totalConIva = computed(() => {
  if (!cotizacionDetalle.value?.total) return 0;
  return cotizacionDetalle.value.total + iva.value;
});

const ESTADOS = [
  'vigente',
  'vencida',
  'aceptada',
  'rechazada',
  'cancelada',
] as const;
type EstadoCotizacion = (typeof ESTADOS)[number];
let flashTimer: ReturnType<typeof setTimeout> | null = null;

const otrosEstados = computed(() => {
  const actual = cotizacionDetalle.value?.estado;
  return ESTADOS.filter((e) => e !== actual);
});

const provenanceLine = computed(() => {
  const c = cotizacionDetalle.value;
  if (!c?.estadoOrigen) return null;
  const whenAt = c.estadoOrigenAt || getEstadoTimestamp(c.estado);
  if (c.estadoOrigen === 'magic_link') {
    return `Respondido por el cliente · enlace público · ${formatDateTime(whenAt)}`;
  }
  if (c.estadoOrigen === 'usuario') {
    const nombre = c.estadoCambiadoPorNombre?.trim() || 'Usuario';
    return `Marcado por ${nombre} · ${formatDateTime(whenAt)}`;
  }
  if (c.estadoOrigen === 'cron') {
    return `Vencida automáticamente · ${formatDateOnly(whenAt)}`;
  }
  return null;
});

async function cargarDetallePorRuta() {
  const cotizacionId = route.params.id as string;
  if (!cotizacionId) return;
  try {
    await obtenerCotizacionAdmin(cotizacionId);
    aplicarFlashRepetirEmail();
  } catch (err) {
    console.error('Error al cargar cotización:', err);
  }
}

function aplicarFlashRepetirEmail() {
  const q = route.query.repetirEmail;
  const cancelQ = route.query.originalCancel;
  const parts: string[] = [];
  if (typeof q === 'string') {
    if (q === 'ok') {
      parts.push('Cotización creada y enviada por correo.');
    } else if (q === 'fail') {
      parts.push(
        'Cotización creada, pero no se pudo enviar el correo. Use «Enviar por correo» para reintentar.',
      );
    } else if (q === 'sin-destinatarios') {
      parts.push(
        'Cotización creada. No hay destinatarios Para para envío automático.',
      );
    }
  }
  let cancelFail = false;
  if (typeof cancelQ === 'string') {
    if (cancelQ === 'ok') {
      parts.push('La cotización original quedó marcada como cancelada.');
    } else if (cancelQ === 'fail') {
      cancelFail = true;
      const detalle =
        typeof route.query.originalCancelError === 'string'
          ? route.query.originalCancelError
          : '';
      parts.push(
        detalle
          ? `La nueva cotización se creó, pero no se pudo cancelar la original: ${detalle}`
          : 'La nueva cotización se creó, pero no se pudo cancelar la original.',
      );
    }
  }
  if (parts.length) {
    flashSuccess(parts.join(' '), cancelFail ? 'warning' : 'success');
  }
  if (typeof q === 'string' || typeof cancelQ === 'string') {
    const nextQuery = { ...route.query };
    delete nextQuery.repetirEmail;
    delete nextQuery.originalCancel;
    delete nextQuery.originalCancelError;
    void router.replace({ query: nextQuery });
  }
}

// Cargar cotización al montar; re-cargar si cambia :id (p. ej. tras Volver a cotizar)
onMounted(() => {
  void (async () => {
    await cargarDetallePorRuta();
    void refreshEmailCredentialsFlag();
    abrirVolverACotizarSiQuery();
  })();
});

watch(
  () => route.params.id,
  (next, prev) => {
    if (next && next !== prev) {
      void cargarDetallePorRuta().then(() => abrirVolverACotizarSiQuery());
    }
  },
);

watch(
  () => route.query.volverACotizar,
  (q) => {
    if (q === '1' && cotizacionDetalle.value) {
      abrirVolverACotizarSiQuery();
    }
  },
);

// Limpiar detalle al desmontar
onUnmounted(() => {
  if (flashTimer != null) {
    clearTimeout(flashTimer);
    flashTimer = null;
  }
  limpiarCotizacionDetalle();
});

function formatDate(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getClienteNombre(): string {
  if (!cotizacionDetalle.value) return '';
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null) {
    return cliente.empresa || '';
  }
  // Fallback para cotizaciones guest
  if ((cotizacionDetalle.value as any).nombreEmpresa) {
    return (cotizacionDetalle.value as any).nombreEmpresa;
  }
  return '';
}

function getClienteId(): string | null {
  if (!cotizacionDetalle.value) return null;
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null && cliente._id) {
    return cliente._id;
  }
  if (typeof cliente === 'string') {
    return cliente;
  }
  return null;
}

function getClienteRfc(): string {
  if (!cotizacionDetalle.value) return '';
  const cliente = cotizacionDetalle.value.clienteId;
  if (typeof cliente === 'object' && cliente !== null) {
    return (cliente as any).rfc || '';
  }
  return '';
}

function getUsuarioClienteNombre(): string {
  if (!cotizacionDetalle.value) return '';
  return cotizacionDetalle.value.nombreContacto?.trim() || '';
}

function getUsuarioClienteEmail(): string {
  if (!cotizacionDetalle.value) return '';
  return cotizacionDetalle.value.emailContacto || '';
}

function getUsuarioClienteTelefono(): string {
  if (!cotizacionDetalle.value) return '';
  return cotizacionDetalle.value.telefonoContacto || '';
}

function getServicioNombre(item: any): string {
  const servicio = item.servicioId;
  if (typeof servicio === 'object' && servicio !== null) {
    return (servicio as Servicio).nombre || '';
  }
  return item.nombreServicioSnapshot || 'Servicio desconocido';
}

function getEstadoLabel(estado: string): string {
  const labels: Record<string, string> = {
    vigente: 'Vigente',
    vencida: 'Vencida',
    aceptada: 'Aceptada',
    rechazada: 'Rechazada',
    cancelada: 'Cancelada',
  };
  return labels[estado] || estado;
}

function getEstadoBannerClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-50 border-green-300',
    vencida: 'bg-gray-50 border-gray-300',
    aceptada: 'bg-blue-50 border-blue-300',
    rechazada: 'bg-red-50 border-red-300',
    cancelada: 'bg-slate-50 border-slate-300',
  };
  return classes[estado] || 'bg-gray-50 border-gray-300';
}

function getEstadoIconClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-100 text-green-600',
    vencida: 'bg-gray-100 text-gray-600',
    aceptada: 'bg-blue-100 text-blue-600',
    rechazada: 'bg-red-100 text-red-600',
    cancelada: 'bg-slate-100 text-slate-700',
  };
  return classes[estado] || 'bg-gray-100 text-gray-600';
}

function getEstadoTextClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'text-green-700',
    vencida: 'text-gray-700',
    aceptada: 'text-blue-700',
    rechazada: 'text-red-700',
    cancelada: 'text-slate-700',
  };
  return classes[estado] || 'text-gray-700';
}

function getEstadoBadgeClass(estado: string): string {
  const classes: Record<string, string> = {
    vigente: 'bg-green-100 text-green-800',
    vencida: 'bg-gray-100 text-gray-800',
    aceptada: 'bg-blue-100 text-blue-800',
    rechazada: 'bg-red-100 text-red-800',
    cancelada: 'bg-slate-100 text-slate-700',
  };
  return classes[estado] || 'bg-gray-100 text-gray-800';
}

function getEstadoTimestamp(estado: string): Date | string | undefined {
  if (!cotizacionDetalle.value) return undefined;

  switch (estado) {
    case 'vigente':
      return (
        cotizacionDetalle.value.fechaEstadoVigente ||
        cotizacionDetalle.value.fechaCreacion
      );
    case 'vencida':
      return cotizacionDetalle.value.fechaEstadoVencida;
    case 'aceptada':
      return (
        cotizacionDetalle.value.fechaEstadoAceptada ||
        cotizacionDetalle.value.fechaAceptacion
      );
    case 'rechazada':
      return (
        cotizacionDetalle.value.fechaEstadoRechazada ||
        cotizacionDetalle.value.fechaRechazo
      );
    case 'cancelada':
      return cotizacionDetalle.value.fechaEstadoCancelada;
    default:
      return cotizacionDetalle.value.fechaCreacion;
  }
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Solo fecha (microcopy cron EXPERIENCE / AC4). */
function formatDateOnly(date: Date | string | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

async function handleDownloadPDF(): Promise<void> {
  if (!cotizacionDetalle.value || isPdfBusy.value) return;
  try {
    isPdfBusy.value = true;
    await downloadCotizacionPDF(
      cotizacionDetalle.value,
      await pdfOptsFromDetalleAsync(cotizacionDetalle.value),
    );
  } finally {
    isPdfBusy.value = false;
  }
}

async function handlePreviewPDF(): Promise<void> {
  if (!cotizacionDetalle.value || isPdfBusy.value) return;
  try {
    isPdfBusy.value = true;
    await previewCotizacionPDF(
      cotizacionDetalle.value,
      await pdfOptsFromDetalleAsync(cotizacionDetalle.value),
    );
  } finally {
    isPdfBusy.value = false;
  }
}

async function abrirEnviarCorreo(): Promise<void> {
  if (!cotizacionDetalle.value) return;
  const c = cotizacionDetalle.value;
  enviarEmailsPara.value = [...(c.emailsPara || [])];
  enviarEmailsCc.value = [...(c.emailsCc || [])].filter(
    (e) => !(c.emailsPara || []).includes(e),
  );
  emailSendOk.value = false;
  emailSendError.value = null;
  // Story 3.4 — resolver flag antes de abrir para no habilitar Enviar con null.
  await refreshEmailCredentialsFlag();
  showEnviarCorreo.value = true;
}

function cerrarEnviarCorreo(): void {
  if (isSendingEmail.value) return;
  showEnviarCorreo.value = false;
  emailSendOk.value = false;
  emailSendError.value = null;
}

async function enviarCorreoDesdeDetalle(payload: {
  emailsPara: string[];
  emailsCc: string[];
}): Promise<void> {
  if (!cotizacionDetalle.value || isSendingEmail.value) return;
  if (!payload.emailsPara.length) return;

  const id =
    (cotizacionDetalle.value as { _id?: string; id?: string })._id ||
    (cotizacionDetalle.value as { id?: string }).id ||
    (route.params.id as string);
  if (!id) {
    emailSendOk.value = false;
    emailSendError.value =
      'No se puede enviar: falta el identificador de la cotización.';
    return;
  }

  isSendingEmail.value = true;
  emailSendOk.value = false;
  // Mantener error previo visible hasta resultado (reintento).
  enviarEmailsPara.value = [...payload.emailsPara];
  enviarEmailsCc.value = [...payload.emailsCc];

  try {
    const blob = await generateCotizacionPdfBlob(
      cotizacionDetalle.value,
      await pdfOptsFromDetalleAsync(cotizacionDetalle.value),
    );
    await enviarCorreoCotizacion(String(id), blob, {
      emailsPara: payload.emailsPara,
      emailsCc: payload.emailsCc,
    });
    emailSendOk.value = true;
    emailSendError.value = null;
    try {
      await obtenerCotizacionAdmin(String(id));
    } catch {
      /* el envío ya fue exitoso */
    }
  } catch (sendErr: unknown) {
    emailSendOk.value = false;
    emailSendError.value = extractError(
      sendErr,
      'No se pudo enviar el correo.',
    );
  } finally {
    isSendingEmail.value = false;
  }
}

// Logic for Acceptance/Rejection + Más acciones (Story 6.10) + Repetir (6.12)
import {
  aceptarCotizacionAdmin,
  rechazarCotizacionAdmin,
  cambiarEstadoCotizacion,
  repetirCotizacion,
  previewRepetirCotizacion,
  getServicios,
  getRecordatorioCotizacion,
  type ModoPreciosRepetir,
  type RepetirCotizacionWarning,
} from '../../services/admin-api.service';
import type {
  RecetaRecordatorio,
  RecordatorioRecotizacion,
} from '../../types/backend';
import { resumenRecetaLabel, formatFechaRecordatorioLarga } from '../../utils/fecha-disparo-preview';
import { useCotizadorDraftStore } from '../../store/cotizadorDraft';

const isProcessing = ref(false);
const showConfirmRechazo = ref(false);
const showMasAcciones = ref(false);
const showConfirmEstado = ref(false);
const estadoPendiente = ref<EstadoCotizacion | null>(null);
const successMessage = ref<string | null>(null);
const actionError = ref<string | null>(null);
const flashTone = ref<'success' | 'warning'>('success');

const ESTADOS_REPETIBLES: EstadoCotizacion[] = [
  'vigente',
  'vencida',
  'aceptada',
  'rechazada',
  'cancelada',
];
const puedeRepetir = computed(() => {
  const e = cotizacionDetalle.value?.estado;
  return !!e && ESTADOS_REPETIBLES.includes(e as EstadoCotizacion);
});

const showRepetirModo = ref(false);
const showRepetirDestino = ref(false);
const showRepetirToque = ref(false);
const showRepetirRecetaSelector = ref(false);
const showRepetirWarnings = ref(false);
const repetirModo = ref<ModoPreciosRepetir | null>(null);
const repetirViaWizard = ref(false);
const repetirCancelarOriginal = ref(false);
const repetirRecordatorioOrigen = ref<RecordatorioRecotizacion | null>(null);
const repetirRearmePayload = ref<{
  rearmarRecordatorio?: boolean;
  recetaRecordatorio?: RecetaRecordatorio;
}>({});
const repetirZonaHoraria = ref<string | undefined>(undefined);
/** Ancla aniversario de la COT nueva (~ ahora al repetir). */
const repetirFechaCreacionNueva = ref<Date>(new Date());
const fuenteYaCancelada = computed(
  () => cotizacionDetalle.value?.estado === 'cancelada',
);
/** Ocultar si ya cancelada (no-op); si se prefiere disabled, el template ya lo cubre. */
const mostrarOpcionCancelarOriginal = computed(() => !fuenteYaCancelada.value);

function defaultCancelarOriginal(estado: string | undefined): boolean {
  return estado === 'vigente' || estado === 'vencida';
}
const repetirWarnings = ref<RepetirCotizacionWarning[]>([]);
const omitirIds = reactive<Record<string, boolean>>({});
const sustitucionesMap = reactive<Record<string, string>>({});
const serviciosActivos = ref<Servicio[]>([]);
const cotizadorDraftStore = useCotizadorDraftStore();

const repetirToqueResumenReceta = computed(() => {
  const rec = repetirRecordatorioOrigen.value?.receta;
  if (!rec) return '';
  if (rec.familia === 'relativo_aniversario') {
    const fecha = repetirRecordatorioOrigen.value?.fechaDisparoUtc;
    if (!fecha) return '';
    return formatFechaRecordatorioLarga(fecha, repetirZonaHoraria.value);
  }
  return resumenRecetaLabel(rec, repetirZonaHoraria.value);
});

const repetirToqueEsFechaExacta = computed(
  () => repetirRecordatorioOrigen.value?.receta.familia === 'fecha_exacta',
);

const {
  onBackdropPointerDown: onRepetirToqueBackdropDown,
  onBackdropPointerUp: onRepetirToqueBackdropUp,
  onBackdropPointerCancel: onRepetirToqueBackdropCancel,
} = useModalDismiss(rechazarRepetirToque, () => showRepetirToque.value);

const puedeConfirmarWarnings = computed(() => {
  if (!repetirWarnings.value.length) return false;
  const todosResueltos = repetirWarnings.value.every((w) => {
    if (omitirIds[w.servicioId]) return true;
    return !!sustitucionesMap[w.servicioId];
  });
  if (!todosResueltos) return false;

  // No confirmar si omitir dejaría 0 ítems (mismo criterio BE).
  const items = cotizacionDetalle.value?.items || [];
  const warningIds = new Set(repetirWarnings.value.map((w) => w.servicioId));
  const omitIds = new Set(
    repetirWarnings.value
      .filter((w) => omitirIds[w.servicioId])
      .map((w) => w.servicioId),
  );
  let restantes = 0;
  for (const it of items) {
    const sid = itemServicioId(it.servicioId);
    if (!sid) continue;
    if (omitIds.has(sid)) continue;
    if (warningIds.has(sid) && !sustitucionesMap[sid]) continue;
    restantes += 1;
  }
  return restantes >= 1;
});

function itemServicioId(
  servicioId: string | Servicio | undefined,
): string {
  if (!servicioId) return '';
  if (typeof servicioId === 'string') return servicioId;
  return String((servicioId as Servicio)._id || '');
}

function nombreItemFuente(servicioId: string): string {
  const items = cotizacionDetalle.value?.items || [];
  const hit = items.find((it) => itemServicioId(it.servicioId) === servicioId);
  return hit?.nombreServicioSnapshot || '';
}

function parseRepetirWarnings(err: unknown): RepetirCotizacionWarning[] | null {
  const data = (err as { response?: { data?: any } })?.response?.data;
  if (!data) return null;
  if (Array.isArray(data.warnings)) return data.warnings;
  if (data.message && Array.isArray(data.message.warnings)) {
    return data.message.warnings;
  }
  return null;
}

function abrirVolverACotizarSiQuery() {
  if (route.query.volverACotizar !== '1') return;
  if (!puedeRepetir.value) return;
  abrirRepetir();
  const nextQuery = { ...route.query };
  delete nextQuery.volverACotizar;
  void router.replace({ query: nextQuery });
}

function abrirRepetir() {
  if (isProcessing.value || !puedeRepetir.value) return;
  showMasAcciones.value = false;
  repetirWarnings.value = [];
  repetirModo.value = null;
  repetirViaWizard.value = false;
  repetirRecordatorioOrigen.value = null;
  repetirRearmePayload.value = {};
  repetirCancelarOriginal.value = defaultCancelarOriginal(
    cotizacionDetalle.value?.estado,
  );
  Object.keys(omitirIds).forEach((k) => delete omitirIds[k]);
  Object.keys(sustitucionesMap).forEach((k) => delete sustitucionesMap[k]);
  showRepetirDestino.value = false;
  showRepetirToque.value = false;
  showRepetirRecetaSelector.value = false;
  showRepetirModo.value = true;
}

function cerrarRepetir() {
  if (isProcessing.value) return;
  showRepetirModo.value = false;
  showRepetirDestino.value = false;
  showRepetirToque.value = false;
  showRepetirRecetaSelector.value = false;
  showRepetirWarnings.value = false;
  repetirModo.value = null;
  repetirViaWizard.value = false;
  repetirRecordatorioOrigen.value = null;
  repetirRearmePayload.value = {};
  repetirWarnings.value = [];
  Object.keys(omitirIds).forEach((k) => delete omitirIds[k]);
  Object.keys(sustitucionesMap).forEach((k) => delete sustitucionesMap[k]);
}

function recordatorioRequiereToque(
  rec: RecordatorioRecotizacion | null,
): rec is RecordatorioRecotizacion {
  return rec?.estado === 'programado' || rec?.estado === 'disparado';
}

async function ensureRepetirZonaHoraria() {
  if (repetirZonaHoraria.value !== undefined) return;
  try {
    const cfg = await getTenantConfig();
    repetirZonaHoraria.value = cfg.zonaHoraria;
  } catch {
    repetirZonaHoraria.value = undefined;
  }
}

async function fetchRecordatorioOrigen(): Promise<RecordatorioRecotizacion | null> {
  if (!cotizacionDetalle.value?._id) return null;
  try {
    return await getRecordatorioCotizacion(String(cotizacionDetalle.value._id));
  } catch (err) {
    const status = (err as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) return null;
    throw err;
  }
}

function elegirRepetirModo(modo: ModoPreciosRepetir) {
  repetirModo.value = modo;
  showRepetirModo.value = false;
  showRepetirDestino.value = true;
}

function elegirRevisarYModificar() {
  if (isProcessing.value) return;
  repetirModo.value = 'originales';
  repetirCancelarOriginal.value = false;
  showRepetirModo.value = false;
  confirmarRepetirDestino(true);
}

function volverRepetirModo() {
  if (isProcessing.value) return;
  showRepetirDestino.value = false;
  showRepetirModo.value = true;
}

function confirmarRepetirDestino(viaWizard: boolean) {
  if (!repetirModo.value || isProcessing.value) return;
  repetirViaWizard.value = viaWizard;
  if (viaWizard) {
    repetirRearmePayload.value = {};
    void ejecutarRepetirAccion({ modoPrecios: repetirModo.value });
    return;
  }
  void iniciarRepetirCrearAhora();
}

async function iniciarRepetirCrearAhora() {
  if (!repetirModo.value || isProcessing.value) return;
  isProcessing.value = true;
  actionError.value = null;
  try {
    repetirFechaCreacionNueva.value = new Date();
    await ensureRepetirZonaHoraria();
    const rec = await fetchRecordatorioOrigen();
    if (recordatorioRequiereToque(rec)) {
      repetirRecordatorioOrigen.value = rec;
      showRepetirDestino.value = false;
      showRepetirToque.value = true;
      isProcessing.value = false;
      return;
    }
    repetirRearmePayload.value = {};
    isProcessing.value = false;
    await ejecutarRepetirAccion({ modoPrecios: repetirModo.value });
  } catch (error) {
    actionError.value = extractError(
      error,
      'No se pudo consultar el recordatorio de la cotización origen.',
    );
    isProcessing.value = false;
  }
}

function aceptarRepetirToque() {
  if (isProcessing.value || !repetirModo.value || !repetirRecordatorioOrigen.value) {
    return;
  }
  if (repetirRecordatorioOrigen.value.receta.familia === 'fecha_exacta') {
    showRepetirToque.value = false;
    showRepetirRecetaSelector.value = true;
    return;
  }
  repetirRearmePayload.value = { rearmarRecordatorio: true };
  showRepetirToque.value = false;
  void ejecutarRepetirAccion({ modoPrecios: repetirModo.value });
}

function rechazarRepetirToque() {
  if (isProcessing.value) return;
  if (!repetirModo.value) {
    showRepetirToque.value = false;
    return;
  }
  repetirRearmePayload.value = { rearmarRecordatorio: false };
  showRepetirToque.value = false;
  void ejecutarRepetirAccion({ modoPrecios: repetirModo.value });
}

function cerrarRepetirRecetaSelector() {
  if (isProcessing.value) return;
  showRepetirRecetaSelector.value = false;
  showRepetirToque.value = true;
}

function onRepetirRecetaSeleccionada(receta: RecetaRecordatorio) {
  if (!repetirModo.value) return;
  repetirRearmePayload.value = {
    rearmarRecordatorio: true,
    recetaRecordatorio: receta,
  };
  showRepetirRecetaSelector.value = false;
  void ejecutarRepetirAccion({ modoPrecios: repetirModo.value });
}

function onOmitirChange(servicioId: string) {
  if (omitirIds[servicioId]) {
    sustitucionesMap[servicioId] = '';
  }
}

async function loadServiciosActivos() {
  try {
    const res = await getServicios({
      activo: true,
      page: 1,
      limit: 100,
      orden: 'nombre_asc',
    });
    serviciosActivos.value = res.data || [];
  } catch (e) {
    console.error('Error al cargar servicios para sustituir:', e);
    serviciosActivos.value = [];
  }
}

async function enviarCorreoTrasRepetir(
  nueva: CotizacionDetalleDto,
): Promise<'ok' | 'fail' | 'sin-destinatarios'> {
  const para = [...(nueva.emailsPara || [])];
  const cc = [...(nueva.emailsCc || [])].filter((e) => !para.includes(e));
  if (!para.length) return 'sin-destinatarios';

  const id = String(
    (nueva as { _id?: string; id?: string })._id ||
      (nueva as { id?: string }).id ||
      '',
  );
  if (!id) return 'fail';

  try {
    let detalle: CotizacionDetalleDto = nueva;
    try {
      detalle = await getCotizacionAdminById(id);
    } catch {
      /* usar respuesta de repetir como fallback para PDF */
    }
    const blob = await generateCotizacionPdfBlob(
      detalle,
      await pdfOptsFromDetalleAsync(detalle),
    );
    await enviarCorreoCotizacion(id, blob, {
      emailsPara: para,
      emailsCc: cc,
    });
    return 'ok';
  } catch (e) {
    console.error('Error al enviar correo tras repetir:', e);
    return 'fail';
  }
}

async function ejecutarRepetirAccion(payload: {
  modoPrecios: ModoPreciosRepetir;
  omitirServicioIds?: string[];
  sustituciones?: Array<{ fromServicioId: string; toServicioId: string }>;
  cancelarOriginal?: boolean;
  rearmarRecordatorio?: boolean;
  recetaRecordatorio?: RecetaRecordatorio;
}) {
  if (!cotizacionDetalle.value || isProcessing.value) return;
  isProcessing.value = true;
  successMessage.value = null;
  actionError.value = null;
  const fuenteId = cotizacionDetalle.value._id;
  const fuenteFolio = cotizacionDetalle.value.folio || '';
  const cancelarOriginal =
    payload.cancelarOriginal ??
    (mostrarOpcionCancelarOriginal.value && repetirCancelarOriginal.value);
  const requestPayload = {
    ...repetirRearmePayload.value,
    ...payload,
    ...(cancelarOriginal ? { cancelarOriginal: true } : {}),
  };
  try {
    if (repetirViaWizard.value) {
      const preview = await previewRepetirCotizacion(fuenteId, requestPayload);
      showRepetirModo.value = false;
      showRepetirDestino.value = false;
      showRepetirToque.value = false;
      showRepetirRecetaSelector.value = false;
      showRepetirWarnings.value = false;
      cotizadorDraftStore.setDraft({
        sourceCotizacionId: String(fuenteId),
        sourceFolio: fuenteFolio,
        modoPrecios: requestPayload.modoPrecios,
        cancelarOriginal,
        draft: preview,
      });
      await router.push({ name: 'admin-cotizacion-nueva' });
      return;
    }

    const result = await repetirCotizacion(fuenteId, requestPayload);
    const nueva = result.cotizacion;
    const emailResult = await enviarCorreoTrasRepetir(nueva);
    showRepetirModo.value = false;
    showRepetirDestino.value = false;
    showRepetirToque.value = false;
    showRepetirRecetaSelector.value = false;
    showRepetirWarnings.value = false;
    const query: Record<string, string> = { repetirEmail: emailResult };
    if (cancelarOriginal) {
      if (result.originalCancelada) {
        query.originalCancel = 'ok';
      } else {
        query.originalCancel = 'fail';
        if (result.originalCancelacionError) {
          query.originalCancelError = result.originalCancelacionError.slice(
            0,
            180,
          );
        }
      }
    }
    await router.push({
      name: 'admin-cotizacion-detalle',
      params: { id: nueva._id },
      query,
    });
  } catch (error) {
    const warnings = parseRepetirWarnings(error);
    if (warnings?.length) {
      isProcessing.value = false;
      repetirModo.value = requestPayload.modoPrecios;
      repetirWarnings.value = warnings;
      for (const w of warnings) {
        if (omitirIds[w.servicioId] === undefined) {
          omitirIds[w.servicioId] = false;
        }
        if (sustitucionesMap[w.servicioId] === undefined) {
          sustitucionesMap[w.servicioId] = '';
        }
      }
      showRepetirModo.value = false;
      showRepetirDestino.value = false;
      showRepetirToque.value = false;
      showRepetirRecetaSelector.value = false;
      showRepetirWarnings.value = true;
      await loadServiciosActivos();
      return;
    }
    console.error('Error al repetir cotización:', error);
    actionError.value = extractError(
      error,
      'Ocurrió un error al crear la nueva cotización.',
    );
  } finally {
    isProcessing.value = false;
  }
}

async function confirmarRepetirConResoluciones() {
  if (!repetirModo.value || !puedeConfirmarWarnings.value) return;
  const omitirServicioIds = repetirWarnings.value
    .filter((w) => omitirIds[w.servicioId])
    .map((w) => w.servicioId);
  const sustituciones = repetirWarnings.value
    .filter(
      (w): w is typeof w & { servicioId: string } =>
        !omitirIds[w.servicioId] && !!sustitucionesMap[w.servicioId],
    )
    .map((w) => ({
      fromServicioId: w.servicioId,
      toServicioId: sustitucionesMap[w.servicioId]!,
    }));
  await ejecutarRepetirAccion({
    modoPrecios: repetirModo.value,
    omitirServicioIds,
    sustituciones,
  });
}

const confirmEstadoTitle = computed(() =>
  estadoPendiente.value
    ? `¿Marcar como ${getEstadoLabel(estadoPendiente.value)}?`
    : '¿Cambiar estado?',
);
const confirmEstadoMessage = computed(() => {
  if (estadoPendiente.value === 'vigente') {
    return 'Se marcará como vigente y se extenderá la fecha de vencimiento según la vigencia del tenant. No se enviará notificación por correo.';
  }
  return 'Se actualizará el estado de la cotización. No se enviará notificación por correo.';
});

function flashSuccess(
  msg: string,
  tone: 'success' | 'warning' = 'success',
) {
  flashTone.value = tone;
  successMessage.value = msg;
  if (flashTimer != null) clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    successMessage.value = null;
    flashTimer = null;
  }, 5000);
}

async function reloadDetalleAfterMutation(id: string): Promise<boolean> {
  try {
    await obtenerCotizacionAdmin(id);
    return true;
  } catch (reloadErr) {
    console.error('Estado persistido; fallo al recargar detalle:', reloadErr);
    return false;
  }
}

async function handleAceptar() {
  if (!cotizacionDetalle.value || isProcessing.value) return;

  showMasAcciones.value = false;
  isProcessing.value = true;
  successMessage.value = null;
  actionError.value = null;
  const id = cotizacionDetalle.value._id;
  try {
    await aceptarCotizacionAdmin(id, {});
    const reloaded = await reloadDetalleAfterMutation(id);
    flashSuccess(
      reloaded
        ? 'Estado actualizado a Aceptada.'
        : 'Estado actualizado a Aceptada. Recarga la página para ver el detalle.',
    );
  } catch (error) {
    console.error('Error al aceptar cotización:', error);
    actionError.value = extractError(
      error,
      'Ocurrió un error al aceptar la cotización.',
    );
  } finally {
    isProcessing.value = false;
  }
}

async function handleRechazar() {
  if (!cotizacionDetalle.value) return;
  showConfirmRechazo.value = true;
}

async function confirmarRechazo() {
  if (!cotizacionDetalle.value || isProcessing.value) return;
  showConfirmRechazo.value = false;

  isProcessing.value = true;
  successMessage.value = null;
  actionError.value = null;
  const id = cotizacionDetalle.value._id;
  try {
    await rechazarCotizacionAdmin(id);
    const reloaded = await reloadDetalleAfterMutation(id);
    flashSuccess(
      reloaded
        ? 'Estado actualizado a Rechazada.'
        : 'Estado actualizado a Rechazada. Recarga la página para ver el detalle.',
    );
  } catch (error) {
    console.error('Error al rechazar cotización:', error);
    actionError.value = extractError(
      error,
      'Ocurrió un error al rechazar la cotización.',
    );
  } finally {
    isProcessing.value = false;
  }
}

function pedirCambioEstado(estado: EstadoCotizacion) {
  if (isProcessing.value) return;
  showMasAcciones.value = false;
  estadoPendiente.value = estado;
  showConfirmEstado.value = true;
}

function cancelarCambioEstado() {
  showConfirmEstado.value = false;
  estadoPendiente.value = null;
}

async function confirmarCambioEstado() {
  if (!cotizacionDetalle.value || !estadoPendiente.value || isProcessing.value) {
    return;
  }
  const destino = estadoPendiente.value;
  showConfirmEstado.value = false;
  estadoPendiente.value = null;

  isProcessing.value = true;
  successMessage.value = null;
  actionError.value = null;
  const id = cotizacionDetalle.value._id;
  try {
    await cambiarEstadoCotizacion(id, destino);
    const reloaded = await reloadDetalleAfterMutation(id);
    const label = getEstadoLabel(destino);
    flashSuccess(
      reloaded
        ? `Estado actualizado a ${label}.`
        : `Estado actualizado a ${label}. Recarga la página para ver el detalle.`,
    );
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    actionError.value = extractError(
      error,
      'Ocurrió un error al cambiar el estado.',
    );
  } finally {
    isProcessing.value = false;
  }
}
</script>
