<template>
  <div class="max-w-7xl mx-auto p-5 animate-in fade-in duration-700">
    <div class="text-center mb-10">
      <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight">
        Cotizador
      </h1>
      <p class="mt-2 text-gray-500 text-lg">
        Identidad flexible e ítems del catálogo — solicitante y envío opcionales.
      </p>
    </div>

    <div
      v-if="avisoCancelacionOriginal"
      class="mb-4 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800"
      role="status"
    >
      {{ avisoCancelacionOriginal }}
    </div>

    <div
      v-if="repetirBannerVisible"
      class="mb-6 rounded-xl border border-medical-blue-200 bg-medical-blue-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      role="status"
    >
      <p class="text-sm text-medical-blue-900">
        Basado en la cotización
        <span class="font-semibold font-mono">{{ repetirSourceFolio }}</span>
        ({{ repetirModoLabel }}).
        Revise y modifique antes de confirmar.
        <span v-if="repetirCancelarOriginal" class="block mt-1 text-slate-700">
          Al crear, la original se marcará como cancelada.
        </span>
      </p>
      <div class="flex items-center gap-2 shrink-0">
        <router-link
          v-if="repetirSourceId"
          :to="{
            name: 'admin-cotizacion-detalle',
            params: { id: repetirSourceId },
          }"
          class="text-sm font-medium text-medical-blue-700 hover:text-medical-blue-900 underline"
        >
          Ver fuente
        </router-link>
        <button
          type="button"
          class="text-sm text-medical-blue-700 hover:text-medical-blue-900 px-2 py-1"
          @click="cerrarRepetirBanner"
        >
          Cerrar
        </button>
      </div>
    </div>

    <!-- PASO 1: Identidad (gated — Story 6.14) -->
    <div
      class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6"
    >
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
          :class="
            identidadConfirmada
              ? 'bg-green-100 text-green-700'
              : 'bg-medical-blue-100 text-medical-blue-700'
          "
        >
          <svg
            v-if="identidadConfirmada"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span v-else>1</span>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-800">Cliente y solicitante</h2>
          <p class="text-sm text-gray-500">
            Indica para quién se prepara la cotización. Ambos datos son
            opcionales.
          </p>
        </div>
      </div>

      <div
        class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 items-start"
      >
        <!-- Cliente -->
        <div class="min-w-0 flex flex-col gap-2">
          <h3 class="text-sm font-bold text-gray-800">Cliente</h3>

          <div
            class="inline-flex w-full rounded-xl border border-gray-200 bg-gray-100 p-1"
            role="radiogroup"
            aria-label="Modo de cliente"
            @keydown="onClienteModoKeydown"
          >
            <button
              type="button"
              role="radio"
              :aria-checked="!cotizarSinCliente"
              :tabindex="cotizarSinCliente ? -1 : 0"
              class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue-400 focus-visible:ring-offset-1"
              :class="
                !cotizarSinCliente
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              "
              @click="setClienteModo(false)"
            >
              Guardado
            </button>
            <button
              type="button"
              role="radio"
              :aria-checked="cotizarSinCliente"
              :tabindex="cotizarSinCliente ? 0 : -1"
              class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue-400 focus-visible:ring-offset-1"
              :class="
                cotizarSinCliente
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              "
              @click="setClienteModo(true)"
            >
              Solo esta cotización
            </button>
          </div>

          <div v-if="!cotizarSinCliente" class="space-y-1.5">
            <SearchCombobox
              input-id="clienteCrm"
              label="Cliente"
              hide-label
              :model-value="clienteId"
              :items="clienteComboboxItems"
              placeholder="Buscar cliente por nombre o RFC…"
              :loading="loadingClientes"
              empty-no-items="No encontramos clientes con esa búsqueda."
              empty-no-match="No encontramos clientes con esa búsqueda."
              action-label="* Registrar nuevo cliente"
              clear-aria-label="Quitar cliente"
              @update:model-value="onClienteSeleccionado"
              @action="abrirModalCliente"
            />
            <div
              v-if="clienteSeleccionado"
              class="text-sm leading-snug text-gray-800"
            >
              <p class="font-semibold">{{ clienteSeleccionado.empresa }}</p>
              <p
                v-if="clienteSeleccionado.rfc"
                class="text-xs text-gray-500 mt-0.5"
              >
                RFC: {{ clienteSeleccionado.rfc }}
              </p>
            </div>
          </div>

          <div v-else class="space-y-1.5">
            <label
              for="empresaGuest"
              class="text-sm font-medium text-gray-600"
              >Nombre del cliente (opcional)</label
            >
            <input
              id="empresaGuest"
              v-model="datosCliente.empresa"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
              placeholder="Ej. Transportes del Norte"
            />
            <p class="text-xs text-gray-500 leading-relaxed">
              Se utilizará únicamente en esta cotización y no se guardará en
              Clientes.
            </p>
          </div>
        </div>

        <!-- Solicitante -->
        <div class="min-w-0 flex flex-col gap-2">
          <h3 class="text-sm font-bold text-gray-800">Solicitante</h3>

          <div>
            <div
              class="inline-flex w-full rounded-xl border p-1"
              :class="
                cotizarSinCliente
                  ? 'border-gray-200 bg-gray-50 opacity-60'
                  : 'border-gray-200 bg-gray-100'
              "
              role="radiogroup"
              aria-label="Modo de solicitante"
              :aria-disabled="cotizarSinCliente || undefined"
              :aria-describedby="
                cotizarSinCliente ? 'solicitante-modo-locked-help' : undefined
              "
              @keydown="onContactoModoKeydown"
            >
              <button
                type="button"
                role="radio"
                :aria-checked="!cotizarSinContacto"
                :aria-disabled="cotizarSinCliente || undefined"
                :disabled="cotizarSinCliente"
                :tabindex="contactoModoTabIndex(false)"
                class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed"
                :class="
                  cotizarSinCliente
                    ? 'text-gray-400'
                    : !cotizarSinContacto
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-600 hover:text-gray-800'
                "
                @click="setContactoModo(false)"
              >
                Guardado
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="cotizarSinContacto"
                :aria-disabled="cotizarSinCliente || undefined"
                :disabled="cotizarSinCliente"
                :tabindex="contactoModoTabIndex(true)"
                class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-medical-blue-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed"
                :class="
                  cotizarSinCliente
                    ? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                    : cotizarSinContacto
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                      : 'text-gray-600 hover:text-gray-800'
                "
                @click="setContactoModo(true)"
              >
                Solo esta cotización
              </button>
            </div>
            <p
              v-if="cotizarSinCliente"
              id="solicitante-modo-locked-help"
              class="sr-only"
            >
              Con un cliente solo para esta cotización, el solicitante también
              queda en este modo.
            </p>
          </div>

          <div v-if="!cotizarSinContacto" class="space-y-1.5">
            <SearchCombobox
              input-id="contactoCrm"
              label="Solicitante"
              hide-label
              :model-value="contactoId"
              :items="contactoComboboxItems"
              :disabled="!clienteId"
              placeholder="Buscar solicitante por nombre, correo o teléfono…"
              :loading="loadingContactos"
              disabled-placeholder="Selecciona primero un cliente guardado para ver sus contactos."
              empty-no-items="Este cliente todavía no tiene contactos guardados."
              empty-no-match="No encontramos solicitantes con esa búsqueda."
              action-label="* Registrar nuevo contacto"
              clear-aria-label="Quitar solicitante"
              @update:model-value="onContactoSeleccionado"
              @action="abrirModalContacto"
            />
            <div
              v-if="contactoSeleccionado"
              class="text-sm leading-snug text-gray-800"
            >
              <p class="font-semibold">{{ contactoSeleccionado.nombre }}</p>
              <p
                v-if="contactoConfirmacionSecundaria"
                class="text-xs text-gray-500 mt-0.5 break-words"
              >
                <a
                  v-if="contactoSeleccionado.correo"
                  class="text-medical-blue-700 hover:underline"
                  :href="`mailto:${contactoSeleccionado.correo}`"
                >{{ contactoSeleccionado.correo }}</a
                ><template v-if="contactoSeleccionado.correo && contactoSeleccionado.telefono">
                  ·
                </template><template v-if="contactoSeleccionado.telefono">{{
                  contactoSeleccionado.telefono
                }}</template>
              </p>
            </div>
          </div>

          <div v-else class="space-y-1.5">
            <label
              for="solicitanteGuest"
              class="text-sm font-medium text-gray-600"
              >Nombre del solicitante (opcional)</label
            >
            <input
              id="solicitanteGuest"
              v-model="datosCliente.nombreContacto"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-medical-blue-400 focus:bg-white transition-all outline-none text-gray-700 shadow-sm"
              placeholder="Ej. Laura Martínez"
            />
            <p class="text-xs text-gray-500 leading-relaxed">
              Se utilizará únicamente en esta cotización y no se guardará entre
              los contactos del cliente.
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          class="px-6 py-2.5 rounded-xl bg-medical-blue-600 text-white text-sm font-bold hover:bg-medical-blue-500 shadow-sm"
          @click="confirmarIdentidad"
        >
          {{ identidadConfirmada ? 'Actualizar identidad' : 'Continuar' }}
        </button>
      </div>
    </div>

    <!-- PASO 2: Servicios -->
    <div
      ref="pasoServiciosEl"
      class="mb-10 scroll-mt-6 transition-all duration-700"
      :class="[
        !identidadConfirmada
          ? 'opacity-40 grayscale pointer-events-none blur-[1px]'
          : 'opacity-100',
      ]"
    >
      <TablaServiciosCotizador
        :servicios-seleccionados="serviciosEnLista"
        :cantidades-por-servicio="cantidadesPorServicio"
        :item-overrides="itemOverrides"
        :is-loading="isLoadingServicios"
        :mostrar-descripciones="mostrarDescripciones"
        :descripciones-disponibles="descripcionesDisponibles"
        :agregar-iva="agregarIva"
        @update:mostrar-descripciones="setMostrarDescripciones($event)"
        @abrir-modal="abrirModal"
        @actualizar-cantidad="actualizarCantidad"
        @eliminar-servicio="eliminarServicio"
        @actualizar-override="onActualizarOverride"
      />
    </div>

    <!-- PASO 3: Opciones + guardar (requiere identidad + ≥1 servicio) -->
    <div
      ref="pasoOpcionesEl"
      class="scroll-mt-6 transition-all duration-700"
      :class="[
        !identidadConfirmada || !tieneServiciosValidos
          ? 'opacity-40 grayscale pointer-events-none blur-[1px]'
          : 'opacity-100',
      ]"
    >
      <div
        class="mb-10 bg-white rounded-2xl shadow-md border border-gray-100 p-6"
      >
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 bg-medical-blue-100 text-medical-blue-700"
          >
            <span>3</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">Opciones adicionales</h2>
            <p class="text-sm text-gray-500">
              Plantillas, bancarios, destinatarios y vigencia.
            </p>
          </div>
        </div>

        <!-- Plantillas PDF (Story 6.5) -->
        <div class="mb-6">
          <h3 class="text-sm font-bold text-gray-800 mb-2">
            Plantillas adicionales
          </h3>
          <p class="text-xs text-gray-500 mb-3">
            Opcional. Se agregan al PDF en el orden de la lista de abajo.
          </p>
          <div
            v-if="isLoadingPlantillas"
            class="text-sm text-gray-500 py-2"
          >
            Cargando plantillas…
          </div>
          <div
            v-else-if="errorPlantillas"
            class="text-sm text-red-700 py-2 rounded-xl border border-red-200 bg-red-50 px-3"
            role="alert"
          >
            {{ errorPlantillas }}
          </div>
          <div
            v-else-if="plantillasDisponibles.length === 0"
            class="text-sm text-gray-500 py-2 rounded-xl border border-dashed border-gray-200 px-3"
          >
            No hay plantillas activas. Puedes continuar sin plantillas.
          </div>
          <div v-else class="space-y-4">
            <!-- Catálogo: agregar primero -->
            <div v-if="plantillasParaAgregar.length > 0">
              <h4 class="text-xs font-bold uppercase tracking-wide text-gray-600 mb-2">
                Disponibles
              </h4>
              <ul class="space-y-2">
                <li
                  v-for="p in plantillasParaAgregar"
                  :key="p._id"
                  class="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-gray-200 bg-white"
                >
                  <span class="flex-1 min-w-[12rem] text-sm font-medium text-gray-800">{{
                    p.nombre
                  }}</span>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-bold rounded-xl bg-medical-blue-600 text-white hover:bg-medical-blue-700"
                    :aria-label="`Agregar ${p.nombre} al PDF`"
                    @click="agregarPlantilla(p)"
                  >
                    Agregar
                  </button>
                </li>
              </ul>
            </div>
            <p
              v-else-if="plantillasEnOrdenPdf.length > 0"
              class="text-[11px] text-gray-500"
            >
              Todas las plantillas activas ya están en el PDF.
            </p>

            <!-- Orden real de páginas en el PDF -->
            <div
              v-if="plantillasEnOrdenPdf.length > 0"
              class="rounded-2xl border border-medical-blue-200 bg-medical-blue-50/40 p-3"
            >
              <h4 class="text-xs font-bold uppercase tracking-wide text-medical-blue-800 mb-2">
                En el PDF
              </h4>
              <ol class="space-y-2" aria-label="Orden de plantillas en el PDF">
                <li
                  v-for="(item, index) in plantillasEnOrdenPdf"
                  :key="item.id"
                  class="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-medical-blue-100 bg-white"
                >
                  <span
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-medical-blue-600 text-sm font-bold text-white"
                    :aria-label="`Página ${index + 1} tras el cuerpo`"
                  >
                    {{ index + 1 }}
                  </span>
                  <span class="flex-1 min-w-[10rem] text-sm font-medium text-gray-800">
                    {{ item.nombre }}
                  </span>
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="px-2 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                      :disabled="index <= 0"
                      title="Subir"
                      :aria-label="`Subir ${item.nombre} en el orden del PDF`"
                      @click="moverPlantilla(item.id, -1)"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      class="px-2 py-1 text-xs font-bold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                      :disabled="index >= plantillasEnOrdenPdf.length - 1"
                      title="Bajar"
                      :aria-label="`Bajar ${item.nombre} en el orden del PDF`"
                      @click="moverPlantilla(item.id, 1)"
                    >
                      ↓
                    </button>
                  </div>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-bold rounded-xl bg-medical-blue-50 text-medical-blue-700 hover:bg-medical-blue-100"
                    :aria-label="`Personalizar ${item.nombre}`"
                    @click="abrirPersonalizarPorId(item.id)"
                  >
                    Personalizar
                  </button>
                  <button
                    type="button"
                    class="px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
                    :aria-label="`Quitar ${item.nombre} del PDF`"
                    @click="quitarPlantilla(item.id)"
                  >
                    Quitar
                  </button>
                </li>
              </ol>
            </div>
            <div
              v-else
              class="text-xs text-gray-500 py-2 px-3 rounded-xl border border-dashed border-gray-200"
            >
              Aún no hay plantillas agregadas al PDF.
            </div>
          </div>
        </div>

        <!-- Opciones: Descripciones | Imágenes / Vigencia | Bancarios -->
        <div class="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="p-4 rounded-2xl border"
            :class="
              descripcionesDisponibles
                ? 'bg-medical-blue-50/50 border-medical-blue-100 cursor-pointer'
                : 'bg-gray-50 border-gray-200 cursor-not-allowed'
            "
            role="group"
            :aria-disabled="!descripcionesDisponibles"
            @click="
              descripcionesDisponibles &&
                setMostrarDescripciones(!mostrarDescripciones)
            "
          >
            <div class="flex items-start group">
              <div class="relative shrink-0">
                <input
                  id="opt-incluir-descripciones"
                  type="checkbox"
                  class="sr-only peer"
                  :checked="displayMostrarDescripciones"
                  :disabled="!descripcionesDisponibles"
                  :aria-disabled="!descripcionesDisponibles"
                  @click.stop
                  @change="
                    setMostrarDescripciones(
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
                />
                <div
                  class="w-11 h-6 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-medical-blue-400 peer-focus-visible:ring-offset-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"
                  :class="[
                    displayMostrarDescripciones
                      ? 'bg-medical-blue-600'
                      : 'bg-gray-200',
                    descripcionesDisponibles
                      ? 'after:transition-all peer-checked:after:transition-all'
                      : 'opacity-70',
                  ]"
                ></div>
              </div>
              <div class="ml-4 min-w-0">
                <label
                  for="opt-incluir-descripciones"
                  class="block text-sm font-bold"
                  :class="
                    descripcionesDisponibles
                      ? 'text-gray-800 group-hover:text-medical-blue-700 cursor-pointer'
                      : 'text-gray-600 cursor-not-allowed'
                  "
                  @click.stop
                >
                  Incluir descripciones en el PDF
                </label>
                <p
                  class="text-xs mt-0.5"
                  :class="
                    descripcionesDisponibles
                      ? 'text-medical-blue-600/70'
                      : 'text-gray-500'
                  "
                >
                  Muestra la descripción detallada de cada concepto en pantalla y
                  en el PDF.
                </p>
                <p
                  v-if="!descripcionesDisponibles"
                  class="text-xs text-gray-500 mt-1.5"
                >
                  Los conceptos seleccionados no tienen descripciones para
                  mostrar.
                </p>
              </div>
            </div>
          </div>

          <div
            class="p-4 rounded-2xl border"
            :class="
              imagenesDisponibles
                ? 'bg-medical-blue-50/50 border-medical-blue-100 cursor-pointer'
                : 'bg-gray-50 border-gray-200 cursor-not-allowed'
            "
            role="group"
            :aria-disabled="!imagenesDisponibles"
            @click="
              imagenesDisponibles && setIncluirImagenesPdf(!incluirImagenesPdf)
            "
          >
            <div class="flex items-start group">
              <div class="relative shrink-0">
                <input
                  id="opt-incluir-imagenes"
                  type="checkbox"
                  class="sr-only peer"
                  :checked="displayIncluirImagenesPdf"
                  :disabled="!imagenesDisponibles"
                  :aria-disabled="!imagenesDisponibles"
                  @click.stop
                  @change="
                    setIncluirImagenesPdf(
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
                />
                <div
                  class="w-11 h-6 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-medical-blue-400 peer-focus-visible:ring-offset-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"
                  :class="[
                    displayIncluirImagenesPdf
                      ? 'bg-medical-blue-600'
                      : 'bg-gray-200',
                    imagenesDisponibles
                      ? 'after:transition-all peer-checked:after:transition-all'
                      : 'opacity-70',
                  ]"
                ></div>
              </div>
              <div class="ml-4 min-w-0">
                <label
                  for="opt-incluir-imagenes"
                  class="block text-sm font-bold"
                  :class="
                    imagenesDisponibles
                      ? 'text-gray-800 group-hover:text-medical-blue-700 cursor-pointer'
                      : 'text-gray-600 cursor-not-allowed'
                  "
                  @click.stop
                >
                  Incluir imágenes de producto en el PDF
                </label>
                <p
                  class="text-xs mt-0.5"
                  :class="
                    imagenesDisponibles
                      ? 'text-medical-blue-600/70'
                      : 'text-gray-500'
                  "
                >
                  Muestra las imágenes disponibles de los productos
                  en el PDF.
                </p>
                <p
                  v-if="!imagenesDisponibles"
                  class="text-xs text-gray-500 mt-1.5"
                >
                  Los productos seleccionados no tienen imágenes para mostrar.
                </p>
              </div>
            </div>
          </div>

          <div
            class="p-4 rounded-2xl border bg-medical-blue-50/50 border-medical-blue-100 cursor-pointer"
            role="group"
            @click="setUsarVigencia(!usarVigencia)"
          >
            <div class="flex items-start group">
              <div class="relative shrink-0">
                <input
                  id="opt-usar-vigencia"
                  type="checkbox"
                  class="sr-only peer"
                  :checked="usarVigencia"
                  @click.stop
                  @change="
                    setUsarVigencia(($event.target as HTMLInputElement).checked)
                  "
                />
                <div
                  class="w-11 h-6 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-medical-blue-400 peer-focus-visible:ring-offset-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:transition-all"
                  :class="usarVigencia ? 'bg-medical-blue-600' : 'bg-gray-200'"
                ></div>
              </div>
              <div class="ml-4 min-w-0">
                <label
                  for="opt-usar-vigencia"
                  class="block text-sm font-bold text-gray-800 group-hover:text-medical-blue-700 cursor-pointer"
                  @click.stop
                >
                  Usar vigencia
                </label>
                <p class="text-xs mt-0.5 text-medical-blue-600/70">
                  Incluye una fecha de vencimiento en la cotización y el PDF.
                </p>
              </div>
            </div>
          </div>

          <div
            class="p-4 rounded-2xl border"
            :class="
              bancariosUtiles
                ? 'bg-medical-blue-50/50 border-medical-blue-100 cursor-pointer'
                : 'bg-gray-50 border-gray-200 cursor-not-allowed'
            "
            role="group"
            :aria-disabled="!bancariosUtiles"
            @click="bancariosUtiles && setIncluirDatosBancarios(!incluirDatosBancarios)"
          >
            <div class="flex items-start group">
              <div class="relative shrink-0">
                <input
                  id="opt-incluir-bancarios"
                  type="checkbox"
                  class="sr-only peer"
                  :checked="displayIncluirDatosBancarios"
                  :disabled="!bancariosUtiles"
                  :aria-disabled="!bancariosUtiles"
                  @click.stop
                  @change="
                    setIncluirDatosBancarios(
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
                />
                <div
                  class="w-11 h-6 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-medical-blue-400 peer-focus-visible:ring-offset-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5"
                  :class="[
                    displayIncluirDatosBancarios
                      ? 'bg-medical-blue-600'
                      : 'bg-gray-200',
                    bancariosUtiles
                      ? 'after:transition-all peer-checked:after:transition-all'
                      : 'opacity-70',
                  ]"
                ></div>
              </div>
              <div class="ml-4 min-w-0">
                <label
                  for="opt-incluir-bancarios"
                  class="block text-sm font-bold"
                  :class="
                    bancariosUtiles
                      ? 'text-gray-800 group-hover:text-medical-blue-700 cursor-pointer'
                      : 'text-gray-600 cursor-not-allowed'
                  "
                  @click.stop
                >
                  Incluir datos bancarios en el PDF
                </label>
                <p
                  class="text-xs mt-0.5"
                  :class="
                    bancariosUtiles
                      ? 'text-medical-blue-600/70'
                      : 'text-gray-500'
                  "
                >
                  Incluye los datos bancarios configurados en el PDF.
                </p>
                <p
                  v-if="!bancariosUtiles"
                  class="text-xs text-gray-500 mt-1.5"
                >
                  No tienes datos bancarios configurados.
                  <RouterLink
                    to="/admin/configuracion"
                    class="text-medical-blue-600 underline underline-offset-2 hover:text-medical-blue-700"
                    @click.stop
                  >
                    Ir a Configuración
                  </RouterLink>
                </p>
              </div>
            </div>
          </div>

          <div
            class="p-4 rounded-2xl border bg-medical-blue-50/50 border-medical-blue-100 cursor-pointer"
            role="group"
            @click="setAgregarIva(!agregarIva)"
          >
            <div class="flex items-start group">
              <div class="relative shrink-0">
                <input
                  id="opt-agregar-iva"
                  type="checkbox"
                  class="sr-only peer"
                  :checked="agregarIva"
                  @click.stop
                  @change="
                    setAgregarIva(($event.target as HTMLInputElement).checked)
                  "
                />
                <div
                  class="w-11 h-6 rounded-full peer peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-medical-blue-400 peer-focus-visible:ring-offset-1 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:transition-all"
                  :class="agregarIva ? 'bg-medical-blue-600' : 'bg-gray-200'"
                ></div>
              </div>
              <div class="ml-4 min-w-0">
                <label
                  for="opt-agregar-iva"
                  class="block text-sm font-bold text-gray-800 group-hover:text-medical-blue-700 cursor-pointer"
                  @click.stop
                >
                  Agregar IVA
                </label>
                <p class="text-xs mt-0.5 text-medical-blue-600/70">
                  Desglosa el IVA al 16 % en la cotización y el PDF.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Días de vigencia (fuera de tarjetas; atenuado si vigencia OFF) -->
        <div
          class="mb-6 space-y-2"
          :class="{ 'opacity-50': !usarVigencia }"
        >
          <label
            for="vigenciaDias"
            class="block text-sm text-gray-700 ml-1"
            :aria-disabled="!usarVigencia"
          >
            <template v-if="usarVigencia">
              Esta cotización tendrá una vigencia de
              <input
                id="vigenciaDias"
                v-model.number="vigenciaDias"
                type="number"
                min="1"
                max="365"
                class="mx-1 w-20 inline-block px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-medical-blue-400 focus:bg-white outline-none text-gray-700 text-center font-bold"
              />
              días
            </template>
            <template v-else>
              Vigencia desactivada — no se aplicará vencimiento.
              <input
                id="vigenciaDias"
                v-model.number="vigenciaDias"
                type="number"
                min="1"
                max="365"
                disabled
                class="sr-only"
                tabindex="-1"
                aria-hidden="true"
              />
            </template>
          </label>
        </div>

        <!-- Destinatarios Para/CC (Story 6.6 / 6.15) -->
        <div class="mb-6 space-y-4">
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-gray-800">Destinatarios del correo</h3>
            <p class="text-xs text-gray-500">
              Se enviará la cotización por correo si hay al menos un destinatario indicado.
            </p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EmailChipsInput
              v-model="emailsPara"
              label="Para"
              input-id="emails-para"
              variant="para"
              :exclude="emailsCc"
              hint="Quienes reciben el PDF y el enlace. Enter agrega un correo."
            />
            <EmailChipsInput
              v-model="emailsCc"
              label="CC"
              input-id="emails-cc"
              variant="cc"
              :disabled="!hasParaDestinatarios"
              :exclude="emailsPara"
              :suggestions="correosNotificacion"
              :hint="ccHint"
            />
          </div>
          <div
            v-if="hasParaDestinatarios && contactosParaChecklist.length > 0"
            class="rounded-xl border border-gray-200 bg-white p-3 space-y-2"
          >
            <p class="text-xs font-bold text-gray-700">
              Otros contactos del cliente (CC)
            </p>
            <label
              v-for="c in contactosParaChecklist"
              :key="c._id"
              class="flex items-center gap-2 text-sm text-gray-800 cursor-pointer"
            >
              <input
                type="checkbox"
                class="rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
                :checked="isContactoEnCc(c)"
                @change="toggleContactoCc(c)"
              />
              <span>
                {{ c.nombre }}
                <span class="text-gray-500">({{ c.correo }})</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <CotizacionRecordatorioWizardBloque
        v-model="recordatorioRecetaDraft"
        :nombre-cliente="datosCliente.empresa"
      />

      <div
        v-if="recordatorioUpsertWarn"
        class="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        role="alert"
      >
        {{ recordatorioUpsertWarn }}
      </div>

      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-xl flex items-center gap-3"
      >
        <p class="font-medium">{{ error }}</p>
      </div>

      <div class="flex flex-col items-center">
        <button
          type="button"
          @click="iniciarGeneracionCotizacion"
          :disabled="isCreating || !!ultimaRespuesta || showRevisionModal"
          class="group relative px-12 py-4 bg-medical-blue-600 text-white rounded-2xl hover:bg-medical-blue-700 active:scale-95 transition-all font-extrabold text-xl shadow-2xl shadow-medical-blue-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span v-if="isCreating" class="flex items-center gap-3">
            Procesando...
          </span>
          <span v-else>Generar Cotización</span>
        </button>

        <div v-if="mensajeValidacion" class="mt-4">
          <div
            class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold border border-yellow-200 shadow-sm"
          >
            {{ mensajeValidacion }}
          </div>
        </div>
      </div>
    </div>

    <ModalSeleccionServicios
      :is-open="modalAbierto"
      :is-loading="isLoadingServicios"
      :servicios-ya-seleccionados="cantidadesPorServicio"
      @close="cerrarModalServicios"
      @agregar-servicios="agregarServiciosSeleccionados"
    />

    <ModalRevisionCotizacion
      :show="showRevisionModal"
      :sin-cliente="cotizarSinCliente"
      :empresa="datosCliente.empresa"
      :razon-social="revisionRazonSocial"
      :nombre-contacto="datosCliente.nombreContacto"
      :correo="datosCliente.correo"
      :telefono="datosCliente.telefono"
      :cargo="datosCliente.cargo"
      :items="revisionItems"
      :total-sin-iva="revisionTotalSinIva"
      :total-con-iva="revisionTotalConIva"
      :agregar-iva="agregarIva"
      :mostrar-descripciones="effectiveIncluirDescripciones"
      :incluir-datos-bancarios="effectiveIncluirDatosBancarios"
      :incluir-imagenes-pdf="effectiveIncluirImagenesPdf"
      :sin-vigencia="sinVigencia"
      :vigencia-dias="vigenciaDias"
      :vigencia-label="revisionVigenciaLabel"
      :plantillas="plantillasEnOrdenPdf"
      :emails-para="emailsPara"
      :emails-cc="emailsCc"
      :enviara-correo="emailsPara.length > 0"
      :is-pdf-busy="isPreviewPdfBusy"
      :is-confirming="isCreating"
      @cerrar="cerrarRevisionModal"
      @preview-pdf="previewPdfRevision"
      @confirmar="confirmarGeneracion"
    />

    <ModalCotizacionCreada
      :cotizacion="ultimaRespuesta"
      :mostrar-mensaje-email="true"
      :email-enviado="emailSendOk"
      :email-sending="isSendingEmail"
      :email-error="emailSendError"
      :initial-emails-para="emailsPara"
      :initial-emails-cc="emailsCc"
      :is-resend-busy="isResendingEmail"
      :email-credentials-configured="emailCredentialsConfigured"
      :recordatorio-warn="recordatorioUpsertWarn || null"
      @close="cerrarModal"
      @ver-cotizaciones="verCotizaciones"
      @ver-detalles="verDetalles"
      @reintentar="reintentarEnvioCorreo"
    />

    <ConfirmationModal
      :show="showSyncModal"
      title="¿Actualizar el catálogo con estos cambios?"
      :message="syncModalMessage"
      confirm-text="Sí, actualizar catálogo"
      cancel-text="No, solo esta cotización"
      type="warning"
      :separate-dismiss="true"
      @confirm="resolverSyncModal('sync')"
      @cancel="resolverSyncModal('no-sync')"
      @dismiss="onSyncModalDismiss"
    />

    <ConfirmationModal
      :show="showDiscardSyncModal"
      title="¿Descartar cambios?"
      message="Hay cambios inline pendientes. Si descartas, no se creará la cotización."
      confirm-text="Descartar cambios"
      cancel-text="Seguir editando"
      type="danger"
      @confirm="confirmarDescartarSync"
      @cancel="cancelarDescartarSync"
    />

    <ConfirmationModal
      :show="showConfirmTemporalModal"
      title="¿Cambiar a cliente temporal?"
      message="Se borrarán el cliente, contacto y correos seleccionados. Esta acción no se puede deshacer desde aquí."
      confirm-text="Sí, cambiar a Temporal"
      cancel-text="Cancelar"
      type="warning"
      @confirm="confirmarCambioATemporal"
      @cancel="cancelarCambioATemporal"
    />

    <!-- Personalizar plantilla (snapshot) Story 6.5 -->
    <div
      v-if="showPersonalizarModal"
      class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40"
      @pointerdown="onPersonalizarBackdropPointerDown"
      @pointerup="onPersonalizarBackdropPointerUp"
      @pointercancel="onPersonalizarBackdropPointerCancel"
    >
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-personalizar-plantilla"
        @pointerdown.stop
      >
        <div class="px-5 py-4 border-b border-gray-200">
          <h2
            id="titulo-personalizar-plantilla"
            class="text-lg font-semibold text-gray-900"
          >
            Personalizar: {{ personalizarNombre }}
          </h2>
          <p
            class="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2"
          >
            Esta edición aplica solo a esta cotización.
          </p>
        </div>
        <div class="px-5 py-4 space-y-4">
          <p v-if="errorPersonalizar" class="text-sm text-red-600">
            {{ errorPersonalizar }}
          </p>
          <PlantillaSeccionesEditor v-model="personalizarDraft" />
          <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              v-model="guardarTambienEnMaestra"
              type="checkbox"
              class="rounded border-gray-300 text-medical-blue-600 focus:ring-medical-blue-500"
            />
            Guardar también en plantilla
          </label>
          <div
            class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-gray-100"
          >
            <button
              type="button"
              class="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              :disabled="guardandoPersonalizar"
              @click="cerrarPersonalizar"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-medical-blue-600 text-white rounded-xl font-bold hover:bg-medical-blue-500 disabled:opacity-50"
              :disabled="guardandoPersonalizar"
              @click="guardarPersonalizar"
            >
              {{
                guardandoPersonalizar ? 'Guardando…' : 'Guardar y cerrar'
              }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <ModalClienteForm
      :show="mostrarModalCliente"
      :form-error="errorModalCliente"
      :is-submitting="guardandoCliente"
      @close="cerrarModalCliente"
      @submit="guardarClienteDesdeWizard"
    />

    <ModalContactoForm
      :show="mostrarModalContacto"
      :form-error="errorModalContacto"
      :is-submitting="guardandoContacto"
      @close="cerrarModalContacto"
      @submit="guardarContactoDesdeWizard"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import ModalSeleccionServicios from '../../components/common/ModalSeleccionServicios.vue';
import ModalCotizacionCreada from '../../components/common/ModalCotizacionCreada.vue';
import ModalRevisionCotizacion from '../../components/cotizador/ModalRevisionCotizacion.vue';
import ConfirmationModal from '../../components/common/ConfirmationModal.vue';
import ModalClienteForm from '../../components/common/ModalClienteForm.vue';
import type { ClienteFormFields } from '../../components/common/ModalClienteForm.vue';
import ModalContactoForm from '../../components/common/ModalContactoForm.vue';
import SearchCombobox from '../../components/common/SearchCombobox.vue';
import type { SearchComboboxItem } from '../../components/common/SearchCombobox.vue';
import type { ContactoFormFields } from '../../components/common/ModalContactoForm.vue';
import TablaServiciosCotizador from '../../components/cotizador/TablaServiciosCotizador.vue';
import type { ItemOverrideFields } from '../../components/cotizador/TablaServiciosCotizador.vue';
import PlantillaSeccionesEditor from '../../components/plantillas/PlantillaSeccionesEditor.vue';
import EmailChipsInput from '../../components/cotizador/EmailChipsInput.vue';
import CotizacionRecordatorioWizardBloque from '../../components/cotizaciones/CotizacionRecordatorioWizardBloque.vue';
import { useCotizador } from '../../composables/useCotizador';
import { useCorreosNotificacion } from '../../composables/useCorreosNotificacion';
import { useModalDismiss } from '../../composables/useModalDismiss';
import type {
  Cliente,
  Contacto,
  Plantilla,
  RecetaRecordatorio,
  SeccionPlantilla,
  Servicio,
} from '../../types/backend';
import {
  cambiarEstadoCotizacion,
  createAdminCotizacion,
  createCliente,
  createContacto,
  enviarCorreoCotizacion,
  getClientes,
  getContactos,
  getCotizacionAdminById,
  getPlantillas,
  getTenantConfig,
  updatePlantilla,
  updateServicio,
  upsertRecordatorioCotizacion,
} from '../../services/admin-api.service';
import {
  generateCotizacionPdfBlob,
  previewCotizacionPDF,
} from '../../utils/pdfHelper';
import { buildCotizacionPreviewDetalle } from '../../utils/buildCotizacionPreviewDetalle';
import { hasBancariosUtiles } from '../../utils/bancarios.util';
import type { CotizacionDetalleDto } from '../../types/backend';
import { useCotizadorDraftStore } from '../../store/cotizadorDraft';
import { hydrateCotizadorFromDraft } from '../../utils/cotizadorPrefill';
import { extractError } from '../../utils/extractError';

const router = useRouter();
const cotizadorDraftStore = useCotizadorDraftStore();
const { correosNotificacion, loadCorreosNotificacion } =
  useCorreosNotificacion();

const repetirBannerVisible = ref(false);
const repetirSourceFolio = ref('');
const repetirSourceId = ref('');
const repetirModoLabel = ref('');
const repetirCancelarOriginal = ref(false);
const avisoCancelacionOriginal = ref<string | null>(null);

function cerrarRepetirBanner() {
  repetirBannerVisible.value = false;
}

const {
  servicios,
  cantidadesPorServicio,
  incluirImagenesPdf,
  error,
  cargarServicios,
  actualizarCantidad,
  quitarServicio,
  resetSelection,
} = useCotizador();

const serviciosDisponibles = ref<Servicio[]>([]);
const isLoadingServicios = ref(false);
const modalAbierto = ref(false);

/** Valores editables por ítem (no mutan el catálogo en memoria). */
const itemOverrides = ref<Record<string, ItemOverrideFields>>({});
/** Baseline del catálogo al seleccionar — dirty de sync vs esto. */
const catalogBaseline = ref<Record<string, ItemOverrideFields>>({});
const showSyncModal = ref(false);
const showDiscardSyncModal = ref(false);
const syncModalMessage = ref('');
type SyncModalChoice = 'sync' | 'no-sync' | 'abort';
let syncModalResolve: ((choice: SyncModalChoice) => void) | null = null;

const clientes = ref<Cliente[]>([]);
const contactos = ref<Contacto[]>([]);
const clienteId = ref('');
const contactoId = ref('');
const loadingContactos = ref(false);
const loadingClientes = ref(false);

const clienteComboboxItems = computed<SearchComboboxItem[]>(() =>
  clientes.value
    .filter((c): c is Cliente & { _id: string } => Boolean(c._id))
    .map((c) => ({
      id: c._id,
      primary: c.empresa,
      secondary: c.rfc?.trim() || undefined,
      searchFields: [c.empresa, c.razonSocial, c.rfc],
    })),
);

const contactoComboboxItems = computed<SearchComboboxItem[]>(() =>
  contactos.value
    .filter((ct): ct is Contacto & { _id: string } => Boolean(ct._id))
    .map((ct) => ({
      id: ct._id,
      primary: ct.nombre,
      secondary: [ct.correo, ct.telefono].filter((v) => v?.trim()).join(' · ') || undefined,
      searchFields: [ct.nombre, ct.correo, ct.telefono],
    })),
);

const clienteSeleccionado = computed(
  () => clientes.value.find((c) => c._id && c._id === clienteId.value) ?? null,
);

const contactoSeleccionado = computed(
  () =>
    contactos.value.find((ct) => ct._id && ct._id === contactoId.value) ?? null,
);

const contactoConfirmacionSecundaria = computed(() => {
  const ct = contactoSeleccionado.value;
  if (!ct) return false;
  return Boolean(ct.correo?.trim() || ct.telefono?.trim());
});
let contactosSeq = 0;

/** Story 6.14 — gate Identidad */
const identidadConfirmada = ref(false);
const cotizarSinCliente = ref(false);
const cotizarSinContacto = ref(false);

const pasoServiciosEl = ref<HTMLElement | null>(null);
const pasoOpcionesEl = ref<HTMLElement | null>(null);

function scrollPasoIntoView(el: HTMLElement | null) {
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const datosCliente = ref({
  empresa: '',
  nombreContacto: '',
  correo: '',
  telefono: '',
  cargo: '',
});
/** Story 6.15 — N días de vigencia (reemplaza date picker). */
const vigenciaDias = ref(30);
/** Persistencia API: `sinVigencia`. UI positiva: `usarVigencia = !sinVigencia`. */
const sinVigencia = ref(false);
const usarVigencia = computed(() => !sinVigencia.value);
let vigenciaDefaultDias = 30;
/** Story 6.6 — destinatarios de correo (≠ solicitante emailContacto). */
const emailsPara = ref<string[]>([]);
const emailsCc = ref<string[]>([]);
/** Story 6.8 — resultado real del envío (envío implícito por Para en 6.15). */
const emailSendOk = ref(false);
const emailSendError = ref<string | null>(null);
/** Story 3.4 — precheck degradación sin SMTP tenant. null = aún no cargado. */
const emailCredentialsConfigured = ref<boolean | null>(null);
/** Create→send en curso (evita «Sin notificación» mid-flight). */
const isSendingEmail = ref(false);
const isResendingEmail = ref(false);
/** Bases (selected/preferidas). No pisar con availability. */
const incluirDatosBancarios = ref(true);
const mostrarDescripciones = ref(true);
/** Desglose IVA 16 %. Inicia encendido; no sigue un default de tenant. */
const agregarIva = ref(true);
/** Story 6.5 — bancarios útiles en tenant config (availability). */
const bancariosUtiles = ref(false);
/** Defaults tenant para init/reset (saved ?? tenant ?? true). */
let tenantDefaultIncluirDatosBancarios = true;
let tenantDefaultIncluirDescripciones = true;
let tenantDefaultIncluirImagenesPdf = true;
let tenantDefaultUsarVigencia = true;
const plantillasDisponibles = ref<Plantilla[]>([]);
const isLoadingPlantillas = ref(false);
const errorPlantillas = ref('');
/** Orden de IDs = orden de páginas tras el cuerpo del PDF (1-based en UI). */
const plantillasSeleccionadasIds = ref<string[]>([]);
const plantillaSnapshots = ref<
  Record<string, { nombre: string; secciones: SeccionPlantilla[] }>
>({});
const showPersonalizarModal = ref(false);
const personalizarId = ref('');
const personalizarNombre = ref('');
const personalizarDraft = ref<SeccionPlantilla[]>([]);
const guardarTambienEnMaestra = ref(false);
const errorPersonalizar = ref('');
const guardandoPersonalizar = ref(false);
const mensajeValidacion = ref('');
const isCreating = ref(false);
const ultimaRespuesta = ref<any>(null);
const recordatorioRecetaDraft = ref<RecetaRecordatorio | null>(null);
const recordatorioUpsertWarn = ref('');
const showRevisionModal = ref(false);
const isPreviewPdfBusy = ref(false);

const mostrarModalCliente = ref(false);
const guardandoCliente = ref(false);
const errorModalCliente = ref<string | null>(null);
const mostrarModalContacto = ref(false);
const guardandoContacto = ref(false);
const errorModalContacto = ref<string | null>(null);

function confirmarIdentidad() {
  const yaConfirmada = identidadConfirmada.value;
  identidadConfirmada.value = true;
  if (!yaConfirmada) {
    void nextTick(() => {
      scrollPasoIntoView(pasoServiciosEl.value);
      void abrirModal();
    });
  }
}

function clearDestinatariosIdentidad() {
  emailsPara.value = [];
  emailsCc.value = [];
}

const showConfirmTemporalModal = ref(false);

function hasIdentidadDataToLose(): boolean {
  return Boolean(
    clienteId.value ||
      contactoId.value ||
      datosCliente.value.empresa.trim() ||
      datosCliente.value.nombreContacto.trim() ||
      datosCliente.value.correo.trim() ||
      datosCliente.value.telefono.trim() ||
      datosCliente.value.cargo.trim() ||
      emailsPara.value.length > 0 ||
      emailsCc.value.length > 0,
  );
}

function applyClienteModo(temporal: boolean) {
  cotizarSinCliente.value = temporal;
  onCotizarSinClienteChange();
}

function setClienteModo(temporal: boolean) {
  if (cotizarSinCliente.value === temporal) return;
  if (temporal && hasIdentidadDataToLose()) {
    showConfirmTemporalModal.value = true;
    return;
  }
  applyClienteModo(temporal);
}

function confirmarCambioATemporal() {
  showConfirmTemporalModal.value = false;
  applyClienteModo(true);
}

function cancelarCambioATemporal() {
  showConfirmTemporalModal.value = false;
}

function setContactoModo(temporal: boolean) {
  if (cotizarSinCliente.value && !temporal) return;
  if (cotizarSinContacto.value === temporal) return;
  cotizarSinContacto.value = temporal;
  onCotizarSinContactoChange();
}

function contactoModoTabIndex(temporalOption: boolean): number {
  if (cotizarSinCliente.value) return -1;
  return cotizarSinContacto.value === temporalOption ? 0 : -1;
}

function onClienteModoKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'Home' && event.key !== 'End') {
    return;
  }
  event.preventDefault();
  const goTemporal =
    event.key === 'End' ||
    event.key === 'ArrowRight' ||
    event.key === 'ArrowDown';
  setClienteModo(goTemporal);
  void nextTick(() => {
    // Si se abrió el modal Registrado→Temporal, no robamos el foco del diálogo.
    if (showConfirmTemporalModal.value) return;
    const checked = (event.currentTarget as HTMLElement)?.querySelector(
      '[role="radio"][aria-checked="true"]',
    ) as HTMLElement | null;
    checked?.focus();
  });
}

function onContactoModoKeydown(event: KeyboardEvent) {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'Home' && event.key !== 'End') {
    return;
  }
  event.preventDefault();
  if (cotizarSinCliente.value) return;
  const goTemporal =
    event.key === 'End' ||
    event.key === 'ArrowRight' ||
    event.key === 'ArrowDown';
  setContactoModo(goTemporal);
  void nextTick(() => {
    const checked = (event.currentTarget as HTMLElement)?.querySelector(
      '[role="radio"][aria-checked="true"]',
    ) as HTMLElement | null;
    checked?.focus();
  });
}

function onClienteSeleccionado(id: string) {
  if (clienteId.value === id) return;
  clienteId.value = id;
  void onClienteChange();
}

function onContactoSeleccionado(id: string) {
  if (contactoId.value === id) return;
  contactoId.value = id;
  onContactoChange();
}

function onCotizarSinClienteChange() {
  if (cotizarSinCliente.value) {
    clienteId.value = '';
    contactoId.value = '';
    contactos.value = [];
    datosCliente.value.correo = '';
    datosCliente.value.telefono = '';
    cotizarSinContacto.value = true;
    datosCliente.value.nombreContacto = '';
    datosCliente.value.cargo = '';
    clearDestinatariosIdentidad();
  } else {
    datosCliente.value.empresa = '';
  }
}

function onCotizarSinContactoChange() {
  if (cotizarSinCliente.value) {
    cotizarSinContacto.value = true;
    return;
  }
  if (cotizarSinContacto.value) {
    contactoId.value = '';
    datosCliente.value.correo = '';
    datosCliente.value.telefono = '';
    datosCliente.value.nombreContacto = '';
    datosCliente.value.cargo = '';
    clearDestinatariosIdentidad();
  } else {
    datosCliente.value.nombreContacto = '';
    if (contactoId.value) onContactoChange();
  }
}

function abrirModalCliente() {
  errorModalCliente.value = null;
  mostrarModalCliente.value = true;
}

function cerrarModalCliente() {
  mostrarModalCliente.value = false;
  errorModalCliente.value = null;
}

async function guardarClienteDesdeWizard(fields: ClienteFormFields) {
  const empresa = fields.empresa.trim();
  if (!empresa) {
    errorModalCliente.value = 'Debe proporcionar el nombre de la empresa';
    return;
  }
  if (guardandoCliente.value) return;
  guardandoCliente.value = true;
  errorModalCliente.value = null;
  try {
    const rfc = fields.rfc.trim().toUpperCase();
    const razonSocial = fields.razonSocial.trim();
    const created = await createCliente({
      empresa,
      ...(razonSocial ? { razonSocial } : {}),
      ...(rfc ? { rfc } : {}),
    });
    const id = created?._id;
    if (!id) {
      errorModalCliente.value = 'Respuesta inválida del servidor';
      return;
    }
    if (!clientes.value.some((c) => c._id === id)) {
      clientes.value = [...clientes.value, created];
    }
    cotizarSinCliente.value = false;
    clienteId.value = id;
    try {
      await onClienteChange();
    } catch {
      datosCliente.value.empresa = created.empresa || empresa;
    }
    cerrarModalCliente();
    void cargarClientes();
  } catch (err: any) {
    const msg = err.response?.data?.message;
    errorModalCliente.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'No se pudo crear el cliente';
  } finally {
    guardandoCliente.value = false;
  }
}

function abrirModalContacto() {
  if (!clienteId.value) {
    errorModalContacto.value = 'Selecciona un cliente primero';
    return;
  }
  errorModalContacto.value = null;
  mostrarModalContacto.value = true;
}

function cerrarModalContacto() {
  mostrarModalContacto.value = false;
  errorModalContacto.value = null;
}

async function guardarContactoDesdeWizard(fields: ContactoFormFields) {
  const nombre = fields.nombre.trim();
  if (!nombre) {
    errorModalContacto.value = 'El nombre es obligatorio';
    return;
  }
  if (!clienteId.value) return;
  if (guardandoContacto.value) return;
  guardandoContacto.value = true;
  errorModalContacto.value = null;
  try {
    const correo = fields.correo.trim();
    const telefono = fields.telefono.trim();
    const cargo = fields.cargo.trim();
    const created = await createContacto(clienteId.value, {
      nombre,
      ...(correo ? { correo } : {}),
      ...(telefono ? { telefono } : {}),
      ...(cargo ? { cargo } : {}),
    });
    const id = created?._id;
    if (!id) {
      errorModalContacto.value = 'Respuesta inválida del servidor';
      return;
    }
    if (!contactos.value.some((c) => c._id === id)) {
      contactos.value = [...contactos.value, created];
    }
    cotizarSinContacto.value = false;
    contactoId.value = id;
    try {
      onContactoChange();
    } catch {
      datosCliente.value.nombreContacto = created.nombre || nombre;
      datosCliente.value.correo = created.correo || correo;
      datosCliente.value.telefono = created.telefono || telefono;
      datosCliente.value.cargo = created.cargo || cargo;
    }
    // Si la API no devolvió cargo, conservar el del formulario
    if (!(datosCliente.value.cargo || '').trim() && cargo) {
      datosCliente.value.cargo = cargo;
    }
    cerrarModalContacto();
    void cargarContactos(clienteId.value);
  } catch (err: any) {
    const msg = err.response?.data?.message;
    errorModalContacto.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'No se pudo crear el contacto';
  } finally {
    guardandoContacto.value = false;
  }
}

function clampVigenciaDias(n: number): number {
  if (!Number.isFinite(n)) return 30;
  return Math.min(365, Math.max(1, Math.trunc(n)));
}

function addDaysLocal(base: Date, days: number): Date {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function toLocalDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Date-only local → ISO (fin del día local) para el BE. */
function fechaVencimientoToIso(yyyyMmDd: string): string | undefined {
  const parts = yyyyMmDd.split('-').map(Number);
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return undefined;
  }
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day, 23, 59, 59, 999);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return undefined;
  }
  return d.toISOString();
}

function isoFromVigenciaDias(n: number): string | undefined {
  const dias = clampVigenciaDias(n);
  return fechaVencimientoToIso(
    toLocalDateInputValue(addDaysLocal(new Date(), dias)),
  );
}

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

/** True si el usuario (o hydrate repetir) ya fijó las bases; no pisar con refresh de config. */
let visualizacionBasesTouched = false;

function applyTenantVisualizacionDefaults(cfg: {
  defaultIncluirDatosBancarios?: boolean | null;
  defaultIncluirDescripciones?: boolean | null;
  defaultIncluirImagenesPdf?: boolean | null;
  defaultUsarVigencia?: boolean | null;
}) {
  tenantDefaultIncluirDatosBancarios =
    typeof cfg.defaultIncluirDatosBancarios === 'boolean'
      ? cfg.defaultIncluirDatosBancarios
      : true;
  tenantDefaultIncluirDescripciones =
    typeof cfg.defaultIncluirDescripciones === 'boolean'
      ? cfg.defaultIncluirDescripciones
      : true;
  tenantDefaultIncluirImagenesPdf =
    typeof cfg.defaultIncluirImagenesPdf === 'boolean'
      ? cfg.defaultIncluirImagenesPdf
      : true;
  tenantDefaultUsarVigencia =
    typeof cfg.defaultUsarVigencia === 'boolean'
      ? cfg.defaultUsarVigencia
      : true;
  if (visualizacionBasesTouched) return;
  incluirDatosBancarios.value = tenantDefaultIncluirDatosBancarios;
  mostrarDescripciones.value = tenantDefaultIncluirDescripciones;
  incluirImagenesPdf.value = tenantDefaultIncluirImagenesPdf;
  sinVigencia.value = !tenantDefaultUsarVigencia;
}

const cargarVigenciaDefault = async () => {
  try {
    const cfg = await getTenantConfig();
    vigenciaDefaultDias = clampVigenciaDias(
      typeof cfg.vigenciaDefaultDias === 'number'
        ? cfg.vigenciaDefaultDias
        : 30,
    );
    bancariosUtiles.value = hasBancariosUtiles(cfg.bancarios);
    applyTenantVisualizacionDefaults(cfg);
    emailCredentialsConfigured.value =
      typeof cfg.emailCredentialsConfigured === 'boolean'
        ? cfg.emailCredentialsConfigured
        : false;
  } catch {
    vigenciaDefaultDias = 30;
    bancariosUtiles.value = false;
    applyTenantVisualizacionDefaults({});
    emailCredentialsConfigured.value = null;
  }
  vigenciaDias.value = vigenciaDefaultDias;
};

function deepCloneSecciones(secciones: SeccionPlantilla[]): SeccionPlantilla[] {
  return JSON.parse(JSON.stringify(secciones)) as SeccionPlantilla[];
}

const cargarPlantillasDisponibles = async () => {
  isLoadingPlantillas.value = true;
  errorPlantillas.value = '';
  try {
    const all: Plantilla[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await getPlantillas({
        activo: true,
        page,
        limit: 100,
      });
      all.push(...res.data);
      totalPages = res.totalPages || 1;
      page += 1;
    } while (page <= totalPages);
    plantillasDisponibles.value = all;
  } catch {
    plantillasDisponibles.value = [];
    errorPlantillas.value =
      'No se pudieron cargar las plantillas. Puedes continuar sin ellas o recargar la página.';
  } finally {
    isLoadingPlantillas.value = false;
  }
};

function isPlantillaSeleccionada(id: string): boolean {
  return plantillasSeleccionadasIds.value.includes(id);
}

/** Lista numerada = orden exacto de páginas tras el cuerpo del PDF. */
const plantillasEnOrdenPdf = computed(() => {
  const byId = new Map(
    plantillasDisponibles.value
      .filter((p) => p._id)
      .map((p) => [p._id as string, p]),
  );
  return plantillasSeleccionadasIds.value.map((id) => {
    const snap = plantillaSnapshots.value[id];
    const catalog = byId.get(id);
    return {
      id,
      nombre: snap?.nombre || catalog?.nombre || 'Plantilla',
    };
  });
});

/** Catálogo de plantillas aún no incluidas en el PDF. */
const plantillasParaAgregar = computed(() =>
  plantillasDisponibles.value.filter(
    (p) => p._id && !isPlantillaSeleccionada(p._id),
  ),
);

function quitarPlantilla(id: string) {
  if (!id || !isPlantillaSeleccionada(id)) return;
  plantillasSeleccionadasIds.value = plantillasSeleccionadasIds.value.filter(
    (x) => x !== id,
  );
  const next = { ...plantillaSnapshots.value };
  delete next[id];
  plantillaSnapshots.value = next;
}

/** Solo agrega al final del orden del PDF (idempotente si ya está). */
function agregarPlantilla(p: Plantilla) {
  const id = p._id;
  if (!id || isPlantillaSeleccionada(id)) return;
  plantillasSeleccionadasIds.value = [
    ...plantillasSeleccionadasIds.value,
    id,
  ];
  if (!plantillaSnapshots.value[id]) {
    plantillaSnapshots.value = {
      ...plantillaSnapshots.value,
      [id]: {
        nombre: p.nombre,
        secciones: deepCloneSecciones(p.secciones || []),
      },
    };
  }
}

function moverPlantilla(id: string, delta: number) {
  const arr = [...plantillasSeleccionadasIds.value];
  const i = arr.indexOf(id);
  const j = i + delta;
  if (i < 0 || j < 0 || j >= arr.length) return;
  const current = arr[i];
  const neighbor = arr[j];
  if (current === undefined || neighbor === undefined) return;
  arr[i] = neighbor;
  arr[j] = current;
  plantillasSeleccionadasIds.value = arr;
}

function abrirPersonalizarPorId(id: string) {
  if (!id) return;
  const catalog = plantillasDisponibles.value.find((p) => p._id === id);
  if (!isPlantillaSeleccionada(id)) {
    if (!catalog) return;
    agregarPlantilla(catalog);
  }
  const snap =
    plantillaSnapshots.value[id] ||
    ({
      nombre: catalog?.nombre || 'Plantilla',
      secciones: deepCloneSecciones(catalog?.secciones || []),
    } as const);
  personalizarId.value = id;
  personalizarNombre.value = snap.nombre;
  personalizarDraft.value = deepCloneSecciones(snap.secciones);
  guardarTambienEnMaestra.value = false;
  errorPersonalizar.value = '';
  showPersonalizarModal.value = true;
}

function cerrarPersonalizar() {
  showPersonalizarModal.value = false;
  personalizarId.value = '';
  personalizarDraft.value = [];
  errorPersonalizar.value = '';
  guardandoPersonalizar.value = false;
}

const {
  onBackdropPointerDown: onPersonalizarBackdropPointerDown,
  onBackdropPointerUp: onPersonalizarBackdropPointerUp,
  onBackdropPointerCancel: onPersonalizarBackdropPointerCancel,
} = useModalDismiss(cerrarPersonalizar, showPersonalizarModal);

async function guardarPersonalizar() {
  const id = personalizarId.value;
  if (!id) return;
  const secciones = deepCloneSecciones(personalizarDraft.value);
  plantillaSnapshots.value = {
    ...plantillaSnapshots.value,
    [id]: {
      nombre: personalizarNombre.value,
      secciones,
    },
  };

  if (guardarTambienEnMaestra.value) {
    guardandoPersonalizar.value = true;
    errorPersonalizar.value = '';
    try {
      await updatePlantilla(id, { secciones });
      const local = plantillasDisponibles.value.find((x) => x._id === id);
      if (local) {
        local.secciones = deepCloneSecciones(secciones);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      errorPersonalizar.value = Array.isArray(msg)
        ? `Snapshot local guardado para esta cotización, pero no se pudo actualizar la plantilla maestra: ${msg.join(', ')}`
        : msg ||
          'Snapshot local guardado para esta cotización, pero no se pudo actualizar la plantilla maestra.';
      guardandoPersonalizar.value = false;
      return;
    } finally {
      guardandoPersonalizar.value = false;
    }
  }

  cerrarPersonalizar();
}

onMounted(async () => {
  vigenciaDias.value = clampVigenciaDias(vigenciaDefaultDias);
  await Promise.all([
    cargarServiciosDisponibles(),
    cargarClientes(),
    cargarVigenciaDefault(),
    cargarPlantillasDisponibles(),
    loadCorreosNotificacion(),
  ]);

  const repetirDraft = cotizadorDraftStore.consumeDraft();
  if (repetirDraft) {
    await hydrateCotizadorFromDraft({
      draft: repetirDraft.draft,
      clientes,
      contactos,
      clienteId,
      contactoId,
      identidadConfirmada,
      cotizarSinCliente,
      cotizarSinContacto,
      datosCliente,
      cantidadesPorServicio,
      itemOverrides,
      catalogBaseline,
      serviciosDisponibles,
      sinVigencia,
      vigenciaDias,
      emailsPara,
      emailsCc,
      incluirDatosBancarios,
      mostrarDescripciones,
      incluirImagenesPdf,
      agregarIva,
      tenantDefaultIncluirDatosBancarios,
      tenantDefaultIncluirDescripciones,
      tenantDefaultIncluirImagenesPdf,
      plantillasSeleccionadasIds,
      plantillaSnapshots,
      cargarContactos,
      actualizarCantidad,
      vigenciaDefaultDias,
    });
    visualizacionBasesTouched = true;
    repetirSourceFolio.value = repetirDraft.sourceFolio;
    repetirSourceId.value = repetirDraft.sourceCotizacionId;
    repetirCancelarOriginal.value = !!repetirDraft.cancelarOriginal;
    avisoCancelacionOriginal.value = null;
    repetirModoLabel.value =
      repetirDraft.modoPrecios === 'originales'
        ? 'precios originales'
        : 'precios actuales';
    repetirBannerVisible.value = true;
  }
});

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const hasParaDestinatarios = computed(() => emailsPara.value.length > 0);

const ccHint = computed(() => {
  const base = 'Copia a otros correos (requiere al menos un Para).';
  if (correosNotificacion.value.length === 0) return base;
  return `${base} Escribe para sugerir correos de notificación configurados.`;
});

const contactosParaChecklist = computed(() =>
  contactos.value.filter((c) => {
    const correo = (c.correo || '').trim();
    if (!correo || !isValidEmail(correo)) return false;
    if (c._id && c._id === contactoId.value) return false;
    // Ya en Para → no mostrar fila no-op (Story 6.6)
    if (emailsPara.value.includes(normalizeEmail(correo))) return false;
    return true;
  }),
);

function ensureInPara(correo: string) {
  const e = normalizeEmail(correo);
  if (!e || !isValidEmail(e)) return;
  if (emailsPara.value.includes(e)) return;
  if (emailsPara.value.length >= 20) return;
  emailsCc.value = emailsCc.value.filter((x) => x !== e);
  emailsPara.value = [...emailsPara.value, e];
}

function isContactoEnCc(c: Contacto): boolean {
  const e = normalizeEmail(c.correo || '');
  return !!e && emailsCc.value.includes(e);
}

function toggleContactoCc(c: Contacto) {
  const e = normalizeEmail(c.correo || '');
  if (!e || !isValidEmail(e)) return;
  if (emailsPara.value.includes(e)) return;
  if (emailsCc.value.includes(e)) {
    emailsCc.value = emailsCc.value.filter((x) => x !== e);
  } else {
    if (emailsCc.value.length >= 20) return;
    emailsCc.value = [...emailsCc.value, e];
  }
}

watch(emailsPara, (para) => {
  if (para.length === 0) {
    emailsCc.value = [];
  } else if (emailsCc.value.some((e) => para.includes(e))) {
    // Quitar de CC cualquier correo que haya pasado a Para
    emailsCc.value = emailsCc.value.filter((e) => !para.includes(e));
  }
});

watch(vigenciaDias, (n) => {
  const clamped = clampVigenciaDias(Number(n));
  if (clamped !== n) vigenciaDias.value = clamped;
});

const serviciosEnLista = computed(() =>
  serviciosDisponibles.value.filter((servicio) => {
    const id = servicio._id || '';
    return id && id in cantidadesPorServicio.value;
  }),
);

const tieneServiciosValidos = computed(() =>
  Object.values(cantidadesPorServicio.value).some((cantidad) => cantidad > 0),
);

const serviciosConCantidadValida = computed(() =>
  serviciosEnLista.value.filter(
    (servicio) => (cantidadesPorServicio.value[servicio._id || ''] || 0) > 0,
  ),
);

/** Availability — no muta bases. */
const descripcionesDisponibles = computed(() =>
  serviciosConCantidadValida.value.some((s) => {
    const id = s._id || '';
    const o = itemOverrides.value[id];
    const desc = o ? o.descripcion : s.descripcion;
    return !!(desc && String(desc).trim());
  }),
);

const imagenesDisponibles = computed(() =>
  serviciosConCantidadValida.value.some(
    (s) =>
      s.tipo === 'producto' && !!(s.imagenUrl && String(s.imagenUrl).trim()),
  ),
);

/** Display del switch: available ? base : false (sin pisar base). */
const displayIncluirDatosBancarios = computed(
  () => bancariosUtiles.value && incluirDatosBancarios.value,
);
const displayMostrarDescripciones = computed(
  () => descripcionesDisponibles.value && mostrarDescripciones.value,
);
const displayIncluirImagenesPdf = computed(
  () => imagenesDisponibles.value && incluirImagenesPdf.value,
);

/** Effective — solo preview/PDF. */
const effectiveIncluirDatosBancarios = displayIncluirDatosBancarios;
const effectiveIncluirDescripciones = displayMostrarDescripciones;
const effectiveIncluirImagenesPdf = displayIncluirImagenesPdf;

function setIncluirDatosBancarios(value: boolean) {
  if (!bancariosUtiles.value) return;
  visualizacionBasesTouched = true;
  incluirDatosBancarios.value = value;
}

function setMostrarDescripciones(value: boolean) {
  if (!descripcionesDisponibles.value) return;
  visualizacionBasesTouched = true;
  mostrarDescripciones.value = value;
}

function setIncluirImagenesPdf(value: boolean) {
  if (!imagenesDisponibles.value) return;
  visualizacionBasesTouched = true;
  incluirImagenesPdf.value = value;
}

function setAgregarIva(value: boolean) {
  agregarIva.value = value;
}

function setUsarVigencia(value: boolean) {
  visualizacionBasesTouched = true;
  sinVigencia.value = !value;
}

watch(
  cantidadesPorServicio,
  () => {
    const haySinCantidad = serviciosEnLista.value.some(
      (s) => (cantidadesPorServicio.value[s._id || ''] || 0) <= 0,
    );
    if (
      tieneServiciosValidos.value &&
      !haySinCantidad &&
      (mensajeValidacion.value.includes('servicio') ||
        mensajeValidacion.value.includes('cantidad'))
    ) {
      mensajeValidacion.value = '';
    } else if (
      tieneServiciosValidos.value &&
      mensajeValidacion.value ===
        'Selecciona al menos un servicio para continuar'
    ) {
      mensajeValidacion.value = '';
    }
  },
  { deep: true },
);

const cargarClientes = async () => {
  loadingClientes.value = true;
  try {
    const res = await getClientes({ activo: true, page: 1, limit: 100 });
    clientes.value = res.data || [];
  } catch {
    clientes.value = [];
  } finally {
    loadingClientes.value = false;
  }
};

const cargarContactos = async (id: string) => {
  const seq = ++contactosSeq;
  loadingContactos.value = true;
  try {
    const res = await getContactos(id, { activo: true, page: 1, limit: 100 });
    if (seq !== contactosSeq) return;
    contactos.value = res.data || [];
  } catch {
    if (seq !== contactosSeq) return;
    contactos.value = [];
  } finally {
    if (seq === contactosSeq) loadingContactos.value = false;
  }
};

const onClienteChange = async () => {
  contactoId.value = '';
  contactos.value = [];
  datosCliente.value.nombreContacto = '';
  datosCliente.value.correo = '';
  datosCliente.value.telefono = '';
  datosCliente.value.cargo = '';
  emailsPara.value = [];
  emailsCc.value = [];
  if (!clienteId.value) {
    datosCliente.value.empresa = '';
    return;
  }
  const c = clientes.value.find((x) => x._id === clienteId.value);
  datosCliente.value.empresa = c?.empresa || '';
  await cargarContactos(clienteId.value);
};

const onContactoChange = () => {
  if (!contactoId.value) {
    datosCliente.value.nombreContacto = '';
    datosCliente.value.correo = '';
    datosCliente.value.telefono = '';
    datosCliente.value.cargo = '';
    return;
  }
  const ct = contactos.value.find((x) => x._id === contactoId.value);
  if (!ct) return;
  datosCliente.value.nombreContacto = ct.nombre || '';
  datosCliente.value.correo = ct.correo || '';
  datosCliente.value.telefono = ct.telefono || '';
  datosCliente.value.cargo = ct.cargo || '';
  if (ct.correo && isValidEmail(ct.correo.trim())) {
    ensureInPara(ct.correo);
  }
};

const cargarServiciosDisponibles = async () => {
  isLoadingServicios.value = true;
  try {
    await cargarServicios();
    serviciosDisponibles.value = [...servicios.value];
  } catch {
    serviciosDisponibles.value = [];
  } finally {
    isLoadingServicios.value = false;
  }
};

const abrirModal = async () => {
  if (serviciosDisponibles.value.length === 0 && !isLoadingServicios.value) {
    await cargarServiciosDisponibles();
  }
  modalAbierto.value = true;
};

const cerrarModalServicios = () => {
  modalAbierto.value = false;
};

function baselineFromServicio(s: Servicio): ItemOverrideFields {
  return {
    nombre: s.nombre,
    descripcion: s.descripcion || '',
    precioUnitario: s.precioUnitario ?? 0,
  };
}

function ensureItemOverride(s: Servicio) {
  if (!s._id) return;
  if (!itemOverrides.value[s._id]) {
    const base = baselineFromServicio(s);
    itemOverrides.value[s._id] = { ...base };
    catalogBaseline.value[s._id] = { ...base };
  }
}

function onActualizarOverride(
  id: string,
  field: keyof ItemOverrideFields,
  value: string | number,
) {
  const current =
    itemOverrides.value[id] ||
    baselineFromServicio(
      serviciosDisponibles.value.find((x) => x._id === id) ||
        ({ nombre: '', precioUnitario: 0 } as Servicio),
    );
  itemOverrides.value = {
    ...itemOverrides.value,
    [id]: { ...current, [field]: value },
  };
}

type DirtySync = {
  servicioId: string;
  label: string;
  campos: string[];
  patch: {
    nombre?: string;
    descripcion?: string;
    precioUnitario?: number;
  };
};

type PendingCreate = {
  payload: Parameters<typeof createAdminCotizacion>[0];
  doSync: boolean;
  dirty: DirtySync[];
  para: string[];
  cc: string[];
  doEnviar: boolean;
};

const pendingCreate = ref<PendingCreate | null>(null);

function collectDirtySync(): DirtySync[] {
  const dirty: DirtySync[] = [];
  for (const [servicioId, cantidad] of Object.entries(
    cantidadesPorServicio.value,
  )) {
    if (cantidad <= 0) continue;
    const svc = serviciosDisponibles.value.find((x) => x._id === servicioId);
    // No abrir sync de inactivos (create BE sigue rechazando).
    if (svc?.activo === false) continue;
    const o = itemOverrides.value[servicioId];
    const b = catalogBaseline.value[servicioId];
    if (!o || !b) continue;
    const campos: string[] = [];
    const patch: DirtySync['patch'] = {};
    if (o.nombre.trim() !== b.nombre.trim()) {
      campos.push('nombre');
      patch.nombre = o.nombre.trim();
    }
    if ((o.descripcion || '').trim() !== (b.descripcion || '').trim()) {
      campos.push('descripción');
      patch.descripcion = (o.descripcion || '').trim();
    }
    if (Number(o.precioUnitario) !== Number(b.precioUnitario)) {
      campos.push('precio');
      patch.precioUnitario = Number(o.precioUnitario);
    }
    if (campos.length) {
      dirty.push({
        servicioId,
        label: o.nombre.trim() || b.nombre,
        campos,
        patch,
      });
    }
  }
  return dirty;
}

function askSyncModal(dirty: DirtySync[]): Promise<SyncModalChoice> {
  const lines = dirty.map((d) => `• ${d.label}: ${d.campos.join(', ')}`);
  syncModalMessage.value = [
    'Hubo cambios inline en uno o más ítems. ¿Deseas actualizar el catálogo del tenant con esos valores?',
    '',
    ...lines,
    '',
    'Si eliges No, solo esta cotización guardará los valores editados.',
  ].join('\n');
  showSyncModal.value = true;
  return new Promise((resolve) => {
    syncModalResolve = resolve;
  });
}

function resolverSyncModal(choice: SyncModalChoice) {
  showSyncModal.value = false;
  showDiscardSyncModal.value = false;
  const resolve = syncModalResolve;
  syncModalResolve = null;
  resolve?.(choice);
}

/** Esc/backdrop: hay cambios inline → minimodal Descartar / Seguir editando. */
function onSyncModalDismiss() {
  if (showDiscardSyncModal.value) return;
  showDiscardSyncModal.value = true;
}

function confirmarDescartarSync() {
  showDiscardSyncModal.value = false;
  resolverSyncModal('abort');
}

function cancelarDescartarSync() {
  showDiscardSyncModal.value = false;
}

const agregarServiciosSeleccionados = (
  serviciosParaAgregar: Record<string, number>,
  serviciosDelModal: Servicio[] = [],
  continuar = false,
) => {
  for (const s of serviciosDelModal) {
    if (!s._id) continue;
    if (!serviciosDisponibles.value.some((x) => x._id === s._id)) {
      serviciosDisponibles.value.push(s);
    }
    ensureItemOverride(s);
  }
  Object.entries(serviciosParaAgregar).forEach(([servicioId, cantidad]) => {
    const s = serviciosDisponibles.value.find((x) => x._id === servicioId);
    if (cantidad <= 0) {
      if (s) {
        quitarServicio(servicioId);
        const nextOverrides = { ...itemOverrides.value };
        const nextBaseline = { ...catalogBaseline.value };
        delete nextOverrides[servicioId];
        delete nextBaseline[servicioId];
        itemOverrides.value = nextOverrides;
        catalogBaseline.value = nextBaseline;
      } else {
        quitarServicio(servicioId);
      }
      return;
    }
    if (s) ensureItemOverride(s);
    actualizarCantidad(servicioId, cantidad);
  });
  if (continuar) {
    void nextTick(() => scrollPasoIntoView(pasoOpcionesEl.value));
  }
};

const eliminarServicio = (servicioId: string) => {
  quitarServicio(servicioId);
  const nextOverrides = { ...itemOverrides.value };
  const nextBaseline = { ...catalogBaseline.value };
  delete nextOverrides[servicioId];
  delete nextBaseline[servicioId];
  itemOverrides.value = nextOverrides;
  catalogBaseline.value = nextBaseline;
};

const revisionItems = computed(() =>
  serviciosConCantidadValida.value.map((s) => {
    const id = s._id || '';
    const qty = cantidadesPorServicio.value[id] || 0;
    const o = itemOverrides.value[id];
    const nombre = (o?.nombre || s.nombre).trim();
    const descripcion = (o?.descripcion || s.descripcion || '').trim();
    const precioUnitario = Number(o?.precioUnitario ?? s.precioUnitario ?? 0);
    const subtotal = precioUnitario * qty;
    return { nombre, descripcion, cantidad: qty, precioUnitario, subtotal };
  }),
);

const revisionTotalSinIva = computed(() =>
  revisionItems.value.reduce((acc, item) => acc + item.subtotal, 0),
);

const revisionTotalConIva = computed(
  () => revisionTotalSinIva.value * 1.16,
);

const revisionVigenciaLabel = computed(() => {
  if (sinVigencia.value) return '';
  const iso = isoFromVigenciaDias(vigenciaDias.value);
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

const revisionRazonSocial = computed(() => {
  if (cotizarSinCliente.value || !clienteId.value) return '';
  const c = clientes.value.find((x) => x._id === clienteId.value);
  return c?.razonSocial?.trim() || '';
});

function runValidations(): string | null {
  const correo = datosCliente.value.correo.trim();
  if (correo && !isValidEmail(correo)) {
    return 'Correo del contacto inválido';
  }

  if (!tieneServiciosValidos.value) {
    scrollPasoIntoView(pasoServiciosEl.value);
    return 'Selecciona al menos un servicio para continuar';
  }

  const hayServiciosSinCantidad = serviciosEnLista.value.some(
    (s) => (cantidadesPorServicio.value[s._id || ''] || 0) <= 0,
  );
  if (hayServiciosSinCantidad) {
    scrollPasoIntoView(pasoServiciosEl.value);
    return 'Hay servicios sin cantidad. Revísalos antes de generar la cotización.';
  }

  for (const s of serviciosConCantidadValida.value) {
    ensureItemOverride(s);
    if (s.activo === false) {
      return 'Hay servicios inactivos en la cotización. Quítalos para continuar.';
    }
    const o = s._id ? itemOverrides.value[s._id] : undefined;
    if (o && !o.nombre.trim()) {
      return 'Cada servicio debe tener un nombre (no puede quedar vacío).';
    }
  }

  if (!sinVigencia.value) {
    vigenciaDias.value = clampVigenciaDias(Number(vigenciaDias.value));
    const fechaIso = isoFromVigenciaDias(vigenciaDias.value);
    if (!fechaIso) {
      return 'Indica una vigencia en días válida (1–365)';
    }
  }

  return null;
}

function buildCreatePayload(): PendingCreate {
  const nombre = datosCliente.value.nombreContacto.trim();
  const correo = datosCliente.value.correo.trim();
  const telefono = datosCliente.value.telefono.trim();
  const cargo = datosCliente.value.cargo.trim();

  const items = Object.entries(cantidadesPorServicio.value)
    .filter(([, cantidad]) => cantidad > 0)
    .map(([servicioId, cantidad]) => {
      const o = itemOverrides.value[servicioId];
      const item: {
        servicioId: string;
        cantidad: number;
        nombre?: string;
        descripcion?: string;
        precioUnitario?: number;
      } = { servicioId, cantidad };
      if (o) {
        item.nombre = o.nombre.trim();
        item.descripcion = (o.descripcion || '').trim();
        item.precioUnitario = Number(o.precioUnitario);
      }
      return item;
    });

  const para = [...emailsPara.value];
  const cc = emailsCc.value.filter((e) => !para.includes(e));
  const doEnviar = para.length > 0;

  // Persist bases (selected), nunca effective-false por disabled temporal
  const payload: Parameters<typeof createAdminCotizacion>[0] = {
    items,
    moneda: 'MXN',
    sinVigencia: sinVigencia.value,
    enviarEmail: doEnviar,
    incluirDatosBancarios: incluirDatosBancarios.value,
    incluirDescripciones: mostrarDescripciones.value,
    incluirImagenesPdf: incluirImagenesPdf.value,
    agregarIva: agregarIva.value,
    emailsPara: para,
    emailsCc: cc,
  };
  if (!sinVigencia.value) {
    payload.fechaVencimiento = isoFromVigenciaDias(vigenciaDias.value);
  }
  if (clienteId.value) payload.clienteId = clienteId.value;
  if (datosCliente.value.empresa.trim()) {
    payload.nombreEmpresa = datosCliente.value.empresa.trim();
  }
  if (nombre) payload.nombreContacto = nombre;
  if (correo) payload.emailContacto = correo;
  if (telefono) payload.telefonoContacto = telefono;
  if (cargo) payload.cargoContacto = cargo;
  if (plantillasSeleccionadasIds.value.length > 0) {
    payload.plantillas = plantillasSeleccionadasIds.value.map((id) => {
      const snap = plantillaSnapshots.value[id];
      const item: {
        plantillaId: string;
        nombre?: string;
        secciones?: SeccionPlantilla[];
      } = { plantillaId: id };
      if (snap) {
        item.nombre = snap.nombre;
        item.secciones = snap.secciones;
      }
      return item;
    });
  }

  return {
    payload,
    doSync: false,
    dirty: [],
    para,
    cc,
    doEnviar,
  };
}

function buildPreviewDetalleInput() {
  return {
    clienteId: clienteId.value,
    clientes: clientes.value,
    datosCliente: datosCliente.value,
    cantidadesPorServicio: cantidadesPorServicio.value,
    itemOverrides: itemOverrides.value,
    serviciosDisponibles: serviciosDisponibles.value,
    sinVigencia: sinVigencia.value,
    fechaVencimientoIso: sinVigencia.value
      ? undefined
      : isoFromVigenciaDias(vigenciaDias.value),
    incluirDatosBancarios: effectiveIncluirDatosBancarios.value,
    incluirDescripciones: effectiveIncluirDescripciones.value,
    incluirImagenesPdf: effectiveIncluirImagenesPdf.value,
    agregarIva: agregarIva.value,
    plantillasSeleccionadasIds: plantillasSeleccionadasIds.value,
    plantillaSnapshots: plantillaSnapshots.value,
  };
}

/** Story 8.3 — mapa live para PDF preview (sin populate en detalle sintético). */
function buildCatalogImagenByServicioId(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const s of serviciosDisponibles.value) {
    if (s.tipo !== 'producto') continue;
    const id = s._id;
    const url = s.imagenUrl?.trim();
    if (id && url) map[id] = url;
  }
  return map;
}

function pdfOptsFromCatalog() {
  return { catalogImagenByServicioId: buildCatalogImagenByServicioId() };
}

function cerrarRevisionModal() {
  showRevisionModal.value = false;
  pendingCreate.value = null;
}

async function previewPdfRevision() {
  if (isPreviewPdfBusy.value) return;
  isPreviewPdfBusy.value = true;
  try {
    const detalle = buildCotizacionPreviewDetalle(buildPreviewDetalleInput());
    await previewCotizacionPDF(detalle, pdfOptsFromCatalog());
  } finally {
    isPreviewPdfBusy.value = false;
  }
}

const iniciarGeneracionCotizacion = async () => {
  if (ultimaRespuesta.value || isCreating.value || syncModalResolve) return;
  mensajeValidacion.value = '';
  error.value = null;

  const validationError = runValidations();
  if (validationError) {
    mensajeValidacion.value = validationError;
    return;
  }

  const dirty = collectDirtySync();
  let doSync = false;
  if (dirty.length > 0) {
    const choice = await askSyncModal(dirty);
    if (choice === 'abort') return;
    doSync = choice === 'sync';
  }

  const pending = buildCreatePayload();
  pending.doSync = doSync;
  pending.dirty = dirty;
  pendingCreate.value = pending;
  showRevisionModal.value = true;
};

const confirmarGeneracion = async () => {
  const pending = pendingCreate.value;
  if (!pending || isCreating.value) return;

  const { payload, doSync, dirty, para, cc, doEnviar } = pending;
  showRevisionModal.value = false;

  isCreating.value = true;
  emailSendOk.value = false;
  emailSendError.value = null;
  isSendingEmail.value = false;
  try {
    const response = await createAdminCotizacion(payload);
    mensajeValidacion.value = '';
    pendingCreate.value = null;

    const recetaDraft = recordatorioRecetaDraft.value;
    recordatorioUpsertWarn.value = '';
    if (recetaDraft) {
      const cotId = response._id || (response as { id?: string }).id;
      if (!cotId) {
        recordatorioUpsertWarn.value =
          'La cotización se creó, pero no se pudo programar el recordatorio.';
      } else {
        try {
          const body =
            recetaDraft.familia === 'fecha_exacta'
              ? {
                  receta: {
                    familia: 'fecha_exacta' as const,
                    fechaExacta: String(recetaDraft.fechaExacta).slice(0, 10),
                  },
                }
              : {
                  receta: {
                    familia: recetaDraft.familia,
                    preset: recetaDraft.preset,
                  },
                };
          await upsertRecordatorioCotizacion(String(cotId), body);
          recordatorioRecetaDraft.value = null;
        } catch (remErr: unknown) {
          recordatorioUpsertWarn.value = extractError(
            remErr,
            'No se pudo programar el recordatorio',
          );
        }
      }
    }

    ultimaRespuesta.value = response;

    if (repetirCancelarOriginal.value && repetirSourceId.value) {
      try {
        await cambiarEstadoCotizacion(repetirSourceId.value, 'cancelada');
        avisoCancelacionOriginal.value =
          'La cotización original quedó marcada como cancelada.';
      } catch (cancelErr: any) {
        const msg = cancelErr?.response?.data?.message;
        const detail = Array.isArray(msg)
          ? msg.join(', ')
          : typeof msg === 'string'
            ? msg
            : '';
        // Idempotente: ya cancelada (carrera o estado previo) = éxito.
        if (/ya está en estado ['"]?cancelada['"]?/i.test(String(detail))) {
          avisoCancelacionOriginal.value =
            'La cotización original quedó marcada como cancelada.';
        } else {
          avisoCancelacionOriginal.value = detail
            ? `La nueva cotización se creó, pero no se pudo cancelar la original: ${detail}`
            : 'La nueva cotización se creó, pero no se pudo cancelar la original.';
        }
      }
      repetirCancelarOriginal.value = false;
    }

    if (doSync && dirty.length > 0) {
      let synced = 0;
      try {
        for (const d of dirty) {
          await updateServicio(d.servicioId, d.patch);
          synced += 1;
          const o = itemOverrides.value[d.servicioId];
          if (o) {
            catalogBaseline.value[d.servicioId] = { ...o };
          }
          const svc = serviciosDisponibles.value.find(
            (x) => x._id === d.servicioId,
          );
          if (svc && o) {
            svc.nombre = o.nombre.trim();
            svc.descripcion = o.descripcion.trim() || undefined;
            svc.precioUnitario = Number(o.precioUnitario);
          }
        }
      } catch (syncErr: any) {
        const msg = syncErr.response?.data?.message;
        const detail = Array.isArray(msg)
          ? msg.join(', ')
          : msg || 'error desconocido';
        const failed = dirty[synced];
        error.value = failed
          ? `Cotización creada. Catálogo actualizado parcialmente (${synced}/${dirty.length}). Falló «${failed.label}»: ${detail}`
          : `Cotización creada, pero no se pudo actualizar el catálogo: ${detail}`;
      }
    }

    if (doEnviar) {
      const id = response._id || (response as any).id;
      if (!id) {
        emailSendError.value =
          'Cotización creada, pero falta el id para enviar el correo.';
      } else {
        await refreshEmailCredentialsFlag();
        if (emailCredentialsConfigured.value === false) {
          emailSendOk.value = false;
          emailSendError.value =
            'No se puede enviar: el correo del tenant no está configurado. Un administrador puede configurarlo en Configuración.';
        } else {
          isSendingEmail.value = true;
          try {
            const detalle = await loadDetalleForSend(String(id), response);
            const blob = await generateCotizacionPdfBlob(
              detalle,
              pdfOptsFromCatalog(),
            );
            await enviarCorreoCotizacion(String(id), blob, {
              emailsPara: para,
              emailsCc: cc,
            });
            emailSendOk.value = true;
            emailSendError.value = null;
          } catch (sendErr: any) {
            const msg = sendErr.response?.data?.message;
            emailSendOk.value = false;
            emailSendError.value = Array.isArray(msg)
              ? msg.join(', ')
              : msg || 'No se pudo enviar el correo.';
          } finally {
            isSendingEmail.value = false;
          }
        }
      }
    }
  } catch (err: any) {
    pendingCreate.value = pending;
    showRevisionModal.value = true;
    const msg = err.response?.data?.message;
    error.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'Error al crear la cotización. Por favor intenta de nuevo.';
  } finally {
    isCreating.value = false;
    isSendingEmail.value = false;
  }
};

async function loadDetalleForSend(
  id: string,
  fallback: CotizacionDetalleDto,
): Promise<CotizacionDetalleDto> {
  try {
    return await getCotizacionAdminById(id);
  } catch {
    return fallback;
  }
}

async function reintentarEnvioCorreo(payload: {
  emailsPara: string[];
  emailsCc: string[];
}) {
  if (!ultimaRespuesta.value || isResendingEmail.value) return;
  const id = ultimaRespuesta.value._id || (ultimaRespuesta.value as any).id;
  if (!id) {
    emailSendOk.value = false;
    emailSendError.value =
      'No se puede reenviar: falta el identificador de la cotización.';
    return;
  }
  if (!payload.emailsPara.length) return;

  await refreshEmailCredentialsFlag();
  if (emailCredentialsConfigured.value === false) {
    emailSendOk.value = false;
    emailSendError.value =
      'No se puede enviar: el correo del tenant no está configurado. Un administrador puede configurarlo en Configuración.';
    return;
  }

  isResendingEmail.value = true;
  // Mantener emailSendError para no desmontar chips / UI de reintento.
  emailsPara.value = [...payload.emailsPara];
  emailsCc.value = [...payload.emailsCc];
  try {
    const detalle = await loadDetalleForSend(
      String(id),
      ultimaRespuesta.value as CotizacionDetalleDto,
    );
    const blob = await generateCotizacionPdfBlob(
      detalle,
      pdfOptsFromCatalog(),
    );
    await enviarCorreoCotizacion(String(id), blob, {
      emailsPara: payload.emailsPara,
      emailsCc: payload.emailsCc,
    });
    emailSendOk.value = true;
    emailSendError.value = null;
  } catch (sendErr: any) {
    const msg = sendErr.response?.data?.message;
    emailSendOk.value = false;
    emailSendError.value = Array.isArray(msg)
      ? msg.join(', ')
      : msg || 'No se pudo enviar el correo.';
  } finally {
    isResendingEmail.value = false;
  }
}

const cerrarModal = () => {
  ultimaRespuesta.value = null;
  resetSelection();
  itemOverrides.value = {};
  catalogBaseline.value = {};
  datosCliente.value = {
    empresa: '',
    nombreContacto: '',
    correo: '',
    telefono: '',
    cargo: '',
  };
  clienteId.value = '';
  contactoId.value = '';
  contactos.value = [];
  identidadConfirmada.value = false;
  cotizarSinCliente.value = false;
  cotizarSinContacto.value = false;
  sinVigencia.value = !tenantDefaultUsarVigencia;
  vigenciaDias.value = clampVigenciaDias(vigenciaDefaultDias);
  emailsPara.value = [];
  emailsCc.value = [];
  emailSendOk.value = false;
  emailSendError.value = null;
  isSendingEmail.value = false;
  isResendingEmail.value = false;
  visualizacionBasesTouched = false;
  incluirDatosBancarios.value = tenantDefaultIncluirDatosBancarios;
  mostrarDescripciones.value = tenantDefaultIncluirDescripciones;
  incluirImagenesPdf.value = tenantDefaultIncluirImagenesPdf;
  agregarIva.value = true;
  plantillasSeleccionadasIds.value = [];
  plantillaSnapshots.value = {};
  showPersonalizarModal.value = false;
  showRevisionModal.value = false;
  pendingCreate.value = null;
  isPreviewPdfBusy.value = false;
  mensajeValidacion.value = '';
  serviciosDisponibles.value = [];
  cerrarRepetirBanner();
  repetirSourceId.value = '';
  repetirCancelarOriginal.value = false;
  avisoCancelacionOriginal.value = null;
  if (!recordatorioUpsertWarn.value) {
    recordatorioRecetaDraft.value = null;
  }
};

const verCotizaciones = () => {
  const needsReset = !!ultimaRespuesta.value;
  ultimaRespuesta.value = null;
  if (needsReset) cerrarModal();
  router.push({ name: 'admin-cotizaciones' });
};

const verDetalles = () => {
  if (!ultimaRespuesta.value) return;
  const cotizacionId = ultimaRespuesta.value._id || ultimaRespuesta.value.id;
  if (cotizacionId) {
    const id = String(cotizacionId);
    const query: Record<string, string> = {};
    const aviso = avisoCancelacionOriginal.value || '';
    if (aviso.includes('no se pudo cancelar')) {
      query.originalCancel = 'fail';
    } else if (aviso.includes('quedó marcada como cancelada')) {
      query.originalCancel = 'ok';
    }
    cerrarModal();
    router.push({
      name: 'admin-cotizacion-detalle',
      params: { id },
      ...(Object.keys(query).length ? { query } : {}),
    });
  }
};
</script>
