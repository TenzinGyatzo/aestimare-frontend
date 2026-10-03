<template>
  <div class="max-w-7xl mx-auto px-2 sm:px-0">
    <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
      Configuración
    </h1>
    <p class="text-gray-600 mb-6">
      Parámetros de la administración activa. Puede editar branding, remitente,
      notificaciones, opciones predeterminadas de cotización y datos bancarios.
    </p>

    <div
      v-if="isLoading"
      class="bg-white shadow-md rounded-lg p-8 text-center"
    >
      <p class="text-gray-500">Cargando configuración…</p>
    </div>

    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      role="alert"
    >
      <p class="text-red-800">{{ error }}</p>
    </div>

    <template v-else-if="config">
      <div class="bg-white shadow-md rounded-lg p-6 space-y-4 mb-6">
        <div>
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Administración activa
          </p>
          <p class="text-lg font-semibold text-gray-900 mt-1">
            {{ tenantLabel }}
          </p>
          <p class="text-sm text-gray-500 mt-1 font-mono">
            tenantId: {{ config.tenantId }}
          </p>
        </div>
      </div>

      <form
        class="bg-white shadow-md rounded-lg p-6 space-y-5 mb-6"
        @submit.prevent="guardarBranding"
      >
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Branding y datos legales
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Se usan en PDF y superficies del tenant. Distinto del remitente SMTP
            de cotizaciones (sección siguiente).
          </p>
        </div>

        <div
          v-if="formError"
          class="bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ formError }}</p>
        </div>
        <div
          v-if="formSuccess"
          class="bg-green-50 border border-green-200 rounded-lg p-3"
          role="status"
        >
          <p class="text-sm text-green-800">{{ formSuccess }}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-gray-700">Razón social</span>
            <input
              v-model="form.razonSocial"
              type="text"
              maxlength="200"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">RFC</span>
            <input
              v-model="form.rfc"
              type="text"
              maxlength="20"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Teléfono</span>
            <input
              v-model="form.telefono"
              type="text"
              maxlength="40"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block sm:col-span-2">
            <span class="text-sm font-medium text-gray-700">Domicilio</span>
            <input
              v-model="form.domicilio"
              type="text"
              maxlength="500"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Email de contacto</span>
            <input
              v-model="form.emailContacto"
              type="email"
              maxlength="120"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label class="block">
            <span class="text-sm font-medium text-gray-700">Sitio web</span>
            <input
              v-model="form.sitioWeb"
              type="text"
              maxlength="200"
              placeholder="ejemplo.com"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>

        <div class="border-t border-gray-100 pt-4 space-y-3">
          <p class="text-sm font-medium text-gray-700">Logo</p>
          <div class="flex flex-wrap items-center gap-4">
            <div
              class="w-24 h-24 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="logoPreviewUrl"
                :src="logoPreviewUrl"
                alt="Logo del tenant"
                class="max-w-full max-h-full object-contain"
              />
              <span v-else class="text-xs text-gray-400 text-center px-2"
                >Sin logo</span
              >
            </div>
            <div class="flex flex-col gap-2">
              <input
                ref="logoInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="text-sm text-gray-600 disabled:opacity-50"
                :disabled="isBusy"
                @change="onLogoSelected"
              />
              <p class="text-xs text-gray-500">PNG, JPEG o WebP · máx. 1MB</p>
              <button
                v-if="config.branding?.logoUrl"
                type="button"
                class="text-sm text-red-600 hover:text-red-800 self-start disabled:opacity-50"
                :disabled="isBusy"
                @click="eliminarLogo"
              >
                Eliminar logo
              </button>
            </div>
          </div>
          <p v-if="logoError" class="text-sm text-red-700">{{ logoError }}</p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="isBusy"
          >
            {{ isSaving ? 'Guardando…' : 'Guardar branding' }}
          </button>
        </div>
      </form>

      <form
        class="bg-white shadow-md rounded-lg p-6 space-y-5 mb-6"
        @submit.prevent="guardarEmail"
      >
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Remitente, notificaciones y correo outbound
          </h2>
          <p class="text-sm text-gray-500 mt-1">
            Cuenta Gmail + contraseña de aplicación para envío, remitente From
            de cotizaciones y correos adicionales de aviso (Epic 6). La lista
            de notificaciones puede quedar vacía.
          </p>
        </div>

        <div
          v-if="emailFormError"
          class="bg-red-50 border border-red-200 rounded-lg p-3"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ emailFormError }}</p>
        </div>
        <div
          v-if="emailFormSuccess"
          class="bg-green-50 border border-green-200 rounded-lg p-3"
          role="status"
        >
          <p class="text-sm text-green-800">{{ emailFormSuccess }}</p>
        </div>

        <div class="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-medium text-gray-800"
              >Credenciales de envío (Gmail)</span
            >
            <span
              v-if="emailCredentialsConfigured"
              class="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
            >
              Configurado
            </span>
            <span
              v-else
              class="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900"
            >
              Sin configurar
            </span>
          </div>
          <label class="block">
            <span class="text-sm font-medium text-gray-700"
              >Cuenta Gmail</span
            >
            <input
              v-model="emailForm.emailUser"
              type="email"
              maxlength="120"
              autocomplete="username"
              placeholder="cotizaciones@tudominio.com"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onEmailFormEdited"
            />
          </label>
          <div v-if="!emailCredentialsConfigured || showRotatePass">
            <label class="block">
              <span class="text-sm font-medium text-gray-700"
                >Contraseña de aplicación</span
              >
              <input
                v-model="emailForm.emailPass"
                type="password"
                maxlength="200"
                autocomplete="new-password"
                placeholder="xxxx xxxx xxxx xxxx"
                class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                :disabled="isBusy"
                @input="onEmailFormEdited"
              />
              <span class="mt-1 block text-xs text-gray-500"
                >Use una contraseña de aplicación de Google, no la contraseña
                normal de la cuenta. Tras guardar no se vuelve a mostrar.</span
              >
            </label>
            <button
              v-if="emailCredentialsConfigured && showRotatePass"
              type="button"
              class="mt-2 text-sm text-gray-600 underline hover:text-gray-900 disabled:opacity-50"
              :disabled="isBusy"
              @click="cancelarRotarPass"
            >
              Cancelar rotación
            </button>
          </div>
          <div v-else class="flex flex-wrap items-center gap-3">
            <p class="text-sm text-gray-600">
              Contraseña de aplicación guardada (oculta).
            </p>
            <button
              type="button"
              class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50"
              :disabled="isBusy"
              @click="iniciarRotarPass"
            >
              Rotar contraseña
            </button>
          </div>
        </div>

        <label class="block">
          <span class="text-sm font-medium text-gray-700"
            >Correo remitente (From)</span
          >
          <input
            v-model="emailForm.emailRemitente"
            type="email"
            maxlength="120"
            placeholder="cotizaciones@ames.example"
            class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            :disabled="isBusy"
            @input="onEmailFormEdited"
          />
          <span class="mt-1 block text-xs text-gray-500"
            >Vacío = usar EMAIL_FROM del entorno. No es el email de contacto del
            branding.</span
          >
        </label>

        <div>
          <span class="text-sm font-medium text-gray-700"
            >Correos adicionales de notificación</span
          >
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="(addr, idx) in emailForm.correosNotificacion"
              :key="addr"
              class="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-800"
            >
              {{ addr }}
              <button
                type="button"
                class="text-gray-500 hover:text-red-600 disabled:opacity-50"
                :disabled="isBusy"
                :aria-label="`Quitar ${addr}`"
                @click="quitarNotificacion(idx)"
              >
                ×
              </button>
            </span>
            <span
              v-if="emailForm.correosNotificacion.length === 0"
              class="text-sm text-gray-400"
              >Ninguno (lista vacía)</span
            >
          </div>
          <div class="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              v-model="notifDraft"
              type="email"
              maxlength="120"
              placeholder="ops@ames.example"
              class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @keydown.enter.prevent="agregarNotificacion"
            />
            <button
              type="button"
              class="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              :disabled="isBusy"
              @click="agregarNotificacion"
            >
              Agregar
            </button>
          </div>
          <p v-if="notifDraftError" class="mt-1 text-sm text-red-700">
            {{ notifDraftError }}
          </p>
          <p class="mt-1 text-xs text-gray-500">Máx. 20 correos. Enter o Agregar.</p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="isBusy"
          >
            {{ isSavingEmail ? 'Guardando…' : 'Guardar email' }}
          </button>
        </div>
      </form>

      <form
        class="bg-white shadow rounded-lg p-6 space-y-4 mb-6"
        @submit.prevent="onSaveVigencia"
      >
        <div>
          <h2 class="text-lg font-medium text-gray-900">
            Opciones predeterminadas de cotización
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Define qué información se incluirá inicialmente al crear una
            cotización. Estas opciones podrán modificarse en cada cotización.
          </p>
        </div>

        <div
          v-if="vigenciaFormError"
          class="rounded-md bg-red-50 border border-red-200 px-4 py-3"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ vigenciaFormError }}</p>
        </div>
        <div
          v-if="vigenciaFormSuccess"
          class="rounded-md bg-green-50 border border-green-200 px-4 py-3"
          role="status"
        >
          <p class="text-sm text-green-800">{{ vigenciaFormSuccess }}</p>
        </div>

        <!-- Desc | Img / Bancarios | IVA / Vigencia -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
          >
            <input
              v-model="vbForm.defaultIncluirDescripciones"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :disabled="isBusy"
              @change="onVigenciaFormEdited"
            />
            <span>
              <span class="block text-sm font-medium text-gray-800"
                >Mostrar descripciones</span
              >
              <span class="block text-xs text-gray-500 mt-0.5"
                >Muestra la descripción detallada de cada concepto en pantalla y
                en el PDF.</span
              >
            </span>
          </label>
          <label
            class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
          >
            <input
              v-model="vbForm.defaultIncluirImagenesPdf"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :disabled="isBusy"
              @change="onVigenciaFormEdited"
            />
            <span>
              <span class="block text-sm font-medium text-gray-800"
                >Mostrar imágenes de productos</span
              >
              <span class="block text-xs text-gray-500 mt-0.5"
                >Muestra las imágenes disponibles de los productos
                en el PDF.</span
              >
            </span>
          </label>
          <label
            class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
          >
            <input
              v-model="vbForm.defaultIncluirDatosBancarios"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :disabled="isBusy"
              @change="onVigenciaFormEdited"
            />
            <span>
              <span class="block text-sm font-medium text-gray-800"
                >Incluir datos bancarios</span
              >
              <span class="block text-xs text-gray-500 mt-0.5"
                >Incluye los datos bancarios configurados en el PDF.</span
              >
            </span>
          </label>
          <label
            class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
          >
            <input
              v-model="vbForm.defaultAgregarIva"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :disabled="isBusy"
              @change="onVigenciaFormEdited"
            />
            <span>
              <span class="block text-sm font-medium text-gray-800"
                >Agregar IVA</span
              >
              <span class="block text-xs text-gray-500 mt-0.5"
                >Desglosa el IVA al 16 % en las cotizaciones nuevas. Se puede
                cambiar en cada cotización.</span
              >
            </span>
          </label>
          <label
            class="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
          >
            <input
              v-model="vbForm.defaultUsarVigencia"
              type="checkbox"
              class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              :disabled="isBusy"
              @change="onVigenciaFormEdited"
            />
            <span>
              <span class="block text-sm font-medium text-gray-800"
                >Usar vigencia</span
              >
              <span class="block text-xs text-gray-500 mt-0.5"
                >Las cotizaciones nuevas inician con vigencia en días (se puede
                desactivar por cotización).</span
              >
            </span>
          </label>
        </div>

        <div
          class="border-t border-gray-100 pt-4"
          :class="{ 'opacity-50': !vbForm.defaultUsarVigencia }"
        >
          <label
            for="config-vigencia-dias"
            class="block text-sm font-medium text-gray-700"
            >Vigencia default (días)</label
          >
          <input
            id="config-vigencia-dias"
            v-model.number="vbForm.vigenciaDefaultDias"
            type="number"
            min="1"
            max="365"
            step="1"
            class="mt-1 block w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed"
            :disabled="isBusy || !vbForm.defaultUsarVigencia"
            @input="onVigenciaFormEdited"
          />
          <p class="mt-1 text-xs text-gray-500">
            Días de vigencia al crear cotizaciones sin fecha explícita (1–365).
          </p>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="isBusy"
          >
            {{ isSavingVigencia ? 'Guardando…' : 'Guardar opciones' }}
          </button>
        </div>
      </form>

      <form
        class="bg-white shadow rounded-lg p-6 space-y-4"
        @submit.prevent="onSaveBancarios"
      >
        <div>
          <h2 class="text-lg font-medium text-gray-900">Datos Bancarios</h2>
          <p class="mt-1 text-sm text-gray-500">
            Contenido de la página bancaria del PDF (el toggle sigue siendo por
            cotización).
          </p>
        </div>

        <div
          v-if="bancariosFormError"
          class="rounded-md bg-red-50 border border-red-200 px-4 py-3"
          role="alert"
        >
          <p class="text-sm text-red-800">{{ bancariosFormError }}</p>
        </div>
        <div
          v-if="bancariosFormSuccess"
          class="rounded-md bg-green-50 border border-green-200 px-4 py-3"
          role="status"
        >
          <p class="text-sm text-green-800">{{ bancariosFormSuccess }}</p>
        </div>

        <div class="border border-gray-100 rounded-md p-4 space-y-3">
          <p class="text-sm font-medium text-gray-700">Logotipo del banco</p>
          <div class="flex flex-wrap items-center gap-4">
            <div
              class="w-24 h-24 rounded border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="bankLogoPreviewUrl"
                :src="bankLogoPreviewUrl"
                alt="Logo del banco"
                class="max-w-full max-h-full object-contain"
              />
              <span v-else class="text-xs text-gray-400 text-center px-2"
                >Sin logo</span
              >
            </div>
            <div class="flex flex-col gap-2">
              <input
                ref="bankLogoInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                class="text-sm text-gray-600 disabled:opacity-50"
                :disabled="isBusy"
                @change="onBankLogoSelected"
              />
              <p class="text-xs text-gray-500">PNG, JPEG o WebP · máx. 1MB</p>
              <button
                v-if="config.bancarios?.logoUrl"
                type="button"
                class="text-sm text-red-600 hover:text-red-800 self-start disabled:opacity-50"
                :disabled="isBusy"
                @click="eliminarBankLogo"
              >
                Eliminar logo del banco
              </button>
            </div>
          </div>
          <p v-if="bankLogoError" class="text-sm text-red-700">
            {{ bankLogoError }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label
              for="config-bancarios-titular"
              class="block text-sm font-medium text-gray-700"
              >Titular</label
            >
            <input
              id="config-bancarios-titular"
              v-model="vbForm.titular"
              type="text"
              maxlength="200"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onBancariosFormEdited"
            />
          </div>
          <div>
            <label
              for="config-bancarios-banco"
              class="block text-sm font-medium text-gray-700"
              >Banco</label
            >
            <input
              id="config-bancarios-banco"
              v-model="vbForm.banco"
              type="text"
              maxlength="120"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onBancariosFormEdited"
            />
          </div>
          <div>
            <label
              for="config-bancarios-cuenta"
              class="block text-sm font-medium text-gray-700"
              >No. de cuenta</label
            >
            <input
              id="config-bancarios-cuenta"
              v-model="vbForm.cuenta"
              type="text"
              maxlength="40"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onBancariosFormEdited"
            />
          </div>
          <div class="sm:col-span-2">
            <label
              for="config-bancarios-clabe"
              class="block text-sm font-medium text-gray-700"
              >CLABE</label
            >
            <input
              id="config-bancarios-clabe"
              v-model="vbForm.clabe"
              type="text"
              maxlength="20"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onBancariosFormEdited"
            />
          </div>
          <div class="sm:col-span-2">
            <label
              for="config-bancarios-domicilio"
              class="block text-sm font-medium text-gray-700"
              >Domicilio (opcional)</label
            >
            <input
              id="config-bancarios-domicilio"
              v-model="vbForm.domicilio"
              type="text"
              maxlength="500"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onBancariosFormEdited"
            />
          </div>
          <div>
            <label
              for="config-bancarios-rfc"
              class="block text-sm font-medium text-gray-700"
              >RFC (opcional)</label
            >
            <input
              id="config-bancarios-rfc"
              v-model="vbForm.rfc"
              type="text"
              maxlength="20"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onBancariosFormEdited"
            />
          </div>
          <div>
            <label
              for="config-bancarios-email"
              class="block text-sm font-medium text-gray-700"
              >Email para recibir comprobantes de pago</label
            >
            <input
              id="config-bancarios-email"
              v-model="vbForm.email"
              type="email"
              maxlength="120"
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              :disabled="isBusy"
              @input="onBancariosFormEdited"
            />
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button
            type="submit"
            class="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            :disabled="isBusy"
          >
            {{ isSavingBancarios ? 'Guardando…' : 'Guardar datos bancarios' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import {
  deleteTenantBankLogo,
  deleteTenantLogo,
  getTenantConfig,
  getTenants,
  updateTenantBranding,
  updateTenantEmailConfig,
  updateTenantVigenciaBancarios,
  uploadTenantBankLogo,
  uploadTenantLogo,
} from '../../services/admin-api.service';
import type { Tenant, TenantConfigResponse } from '../../types/backend';
import { useAuthStore } from '../../store/auth';
import { API_BASE_URL } from '../../config/api';
import { extractError as extractErrorBase } from '../../utils/extractError';

const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref<string | null>(null);
const config = ref<TenantConfigResponse | null>(null);
const tenants = ref<Tenant[]>([]);

const form = reactive({
  razonSocial: '',
  rfc: '',
  domicilio: '',
  telefono: '',
  emailContacto: '',
  sitioWeb: '',
});

const emailForm = reactive({
  emailRemitente: '',
  correosNotificacion: [] as string[],
  emailUser: '',
  emailPass: '',
});
const emailCredentialsConfigured = ref(false);
const showRotatePass = ref(false);
const notifDraft = ref('');
const notifDraftError = ref<string | null>(null);

const vbForm = reactive({
  vigenciaDefaultDias: 30,
  /** Draft visual: ausente en tenant → true sugerido; al guardar se persiste boolean. */
  defaultIncluirDatosBancarios: true,
  defaultIncluirDescripciones: true,
  defaultIncluirImagenesPdf: true,
  defaultUsarVigencia: true,
  defaultAgregarIva: true,
  titular: '',
  banco: '',
  cuenta: '',
  clabe: '',
  domicilio: '',
  rfc: '',
  email: '',
});

const isSaving = ref(false);
const isSavingLogo = ref(false);
const isSavingBankLogo = ref(false);
const isSavingEmail = ref(false);
const isSavingVigencia = ref(false);
const isSavingBancarios = ref(false);
const formError = ref<string | null>(null);
const formSuccess = ref<string | null>(null);
const emailFormError = ref<string | null>(null);
const emailFormSuccess = ref<string | null>(null);
const vigenciaFormError = ref<string | null>(null);
const vigenciaFormSuccess = ref<string | null>(null);
const bancariosFormError = ref<string | null>(null);
const bancariosFormSuccess = ref<string | null>(null);
const logoError = ref<string | null>(null);
const bankLogoError = ref<string | null>(null);
const logoInputRef = ref<HTMLInputElement | null>(null);
const bankLogoInputRef = ref<HTMLInputElement | null>(null);

const isBusy = computed(
  () =>
    isSaving.value ||
    isSavingLogo.value ||
    isSavingBankLogo.value ||
    isSavingEmail.value ||
    isSavingVigencia.value ||
    isSavingBancarios.value,
);

const MAX_LOGO_BYTES = 1_000_000;
const ALLOWED_LOGO_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
]);

/** Tenant efectivo: selector (admin_sistema) o JWT (admin_tenant). */
const effectiveTenantId = computed(() => {
  if (authStore.isAdminSistema) {
    return authStore.activeTenantId || '';
  }
  if (authStore.isAdminTenant) {
    return authStore.user?.tenantId || '';
  }
  return '';
});

const tenantLabel = computed(() => {
  const tid = effectiveTenantId.value || config.value?.tenantId || '';
  if (!tid) return 'Sin administración seleccionada';
  const match = tenants.value.find((t) => t._id === tid);
  const matchNombre = match?.nombre?.trim();
  const matchClave = match?.clave?.trim();
  if (matchNombre && matchClave) return `${matchNombre} (${matchClave})`;
  if (matchNombre) return matchNombre;
  if (matchClave) return matchClave;
  // Sin catálogo usable (admin_tenant / AD-16): identidad desde tenant-config
  // Solo si coincide con el tenant efectivo (evita label stale al cambiar selector).
  if (
    config.value?.tenantId != null &&
    String(config.value.tenantId) === String(tid)
  ) {
    const nombre = config.value.tenantNombre?.trim();
    const clave = config.value.tenantClave?.trim();
    if (nombre && clave) return `${nombre} (${clave})`;
    if (nombre) return nombre;
    if (clave) return clave;
  }
  return tid.length > 6 ? `…${tid.slice(-6)}` : tid;
});

/** URL pública de asset en /uploads con cache-bust por updatedAt. */
function publicAssetPreviewUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  const bust = config.value?.updatedAt
    ? `?v=${encodeURIComponent(config.value.updatedAt)}`
    : '';
  if (path.startsWith('http')) {
    return path.includes('?') ? path : `${path}${bust}`;
  }
  const apiBase = API_BASE_URL.replace(/\/api\/?$/, '');
  if (apiBase.startsWith('http')) return `${apiBase}${path}${bust}`;
  return `${path}${bust}`;
}

/** Resuelve URL pública del logo de branding (proxy /uploads en dev). */
const logoPreviewUrl = computed(() =>
  publicAssetPreviewUrl(config.value?.branding?.logoUrl),
);

const bankLogoPreviewUrl = computed(() =>
  publicAssetPreviewUrl(config.value?.bancarios?.logoUrl),
);

function fillBrandingFromConfig(cfg: TenantConfigResponse) {
  const b = cfg.branding || {};
  form.razonSocial = b.razonSocial || '';
  form.rfc = b.rfc || '';
  form.domicilio = b.domicilio || '';
  form.telefono = b.telefono || '';
  form.emailContacto = b.emailContacto || '';
  form.sitioWeb = b.sitioWeb || '';
}

function fillEmailFromConfig(cfg: TenantConfigResponse) {
  emailForm.emailRemitente = cfg.emailRemitente || '';
  emailForm.correosNotificacion = [...(cfg.correosNotificacion || [])];
  emailForm.emailUser = cfg.emailUser || '';
  emailForm.emailPass = '';
  emailCredentialsConfigured.value = Boolean(cfg.emailCredentialsConfigured);
  showRotatePass.value = false;
}

function iniciarRotarPass() {
  showRotatePass.value = true;
  emailForm.emailPass = '';
  emailFormSuccess.value = null;
}

function cancelarRotarPass() {
  showRotatePass.value = false;
  emailForm.emailPass = '';
  notifDraftError.value = null;
}

function fillVbFromConfig(cfg: TenantConfigResponse) {
  applyVigenciaFromConfig(cfg);
  applyBancariosFromConfig(cfg);
}

function applyVigenciaFromConfig(cfg: TenantConfigResponse) {
  vbForm.vigenciaDefaultDias =
    typeof cfg.vigenciaDefaultDias === 'number' ? cfg.vigenciaDefaultDias : 30;
  vbForm.defaultIncluirDatosBancarios =
    typeof cfg.defaultIncluirDatosBancarios === 'boolean'
      ? cfg.defaultIncluirDatosBancarios
      : true;
  vbForm.defaultIncluirDescripciones =
    typeof cfg.defaultIncluirDescripciones === 'boolean'
      ? cfg.defaultIncluirDescripciones
      : true;
  vbForm.defaultIncluirImagenesPdf =
    typeof cfg.defaultIncluirImagenesPdf === 'boolean'
      ? cfg.defaultIncluirImagenesPdf
      : true;
  vbForm.defaultUsarVigencia =
    typeof cfg.defaultUsarVigencia === 'boolean'
      ? cfg.defaultUsarVigencia
      : true;
  vbForm.defaultAgregarIva =
    typeof cfg.defaultAgregarIva === 'boolean' ? cfg.defaultAgregarIva : true;
}

function applyBancariosFromConfig(cfg: TenantConfigResponse) {
  const b = cfg.bancarios || {};
  vbForm.titular = b.titular || '';
  vbForm.banco = b.banco || '';
  vbForm.cuenta = b.cuenta || '';
  vbForm.clabe = b.clabe || '';
  vbForm.domicilio = b.domicilio || '';
  vbForm.rfc = b.rfc || '';
  vbForm.email = b.email || '';
}

function fillFormFromConfig(cfg: TenantConfigResponse) {
  fillBrandingFromConfig(cfg);
  fillEmailFromConfig(cfg);
  fillVbFromConfig(cfg);
}

function onEmailFormEdited() {
  emailFormSuccess.value = null;
  notifDraftError.value = null;
}

function onVigenciaFormEdited() {
  vigenciaFormSuccess.value = null;
}

function onBancariosFormEdited() {
  bancariosFormSuccess.value = null;
}

function mapConfigError(err: unknown, fallback: string): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 400) {
    return extractErrorBase(
      err,
      'Datos inválidos o falta seleccionar administración (X-Tenant-Id).',
    );
  }
  if (status === 403) {
    return extractErrorBase(err, 'No tiene permiso para esta operación.');
  }
  return extractErrorBase(err, fallback);
}

async function cargar() {
  isLoading.value = true;
  error.value = null;
  config.value = null;
  formError.value = null;
  formSuccess.value = null;
  emailFormError.value = null;
  emailFormSuccess.value = null;
  vigenciaFormError.value = null;
  vigenciaFormSuccess.value = null;
  bancariosFormError.value = null;
  bancariosFormSuccess.value = null;
  logoError.value = null;
  bankLogoError.value = null;
  notifDraftError.value = null;

  const requestedTenantId = effectiveTenantId.value;
  if (!requestedTenantId) {
    error.value = authStore.isAdminSistema
      ? 'Seleccione una administración en el pie del menú para ver su configuración.'
      : 'No hay administración asignada a su usuario.';
    isLoading.value = false;
    return;
  }

  try {
    // GET /tenants solo admin_sistema (AD-16). admin_tenant: nunca.
    const tenantsPromise = authStore.isAdminSistema
      ? getTenants().catch(() => [] as Tenant[])
      : Promise.resolve([] as Tenant[]);

    const [cfg, t] = await Promise.all([getTenantConfig(), tenantsPromise]);
    if (effectiveTenantId.value !== requestedTenantId) {
      return;
    }
    config.value = cfg;
    tenants.value = t;
    fillFormFromConfig(cfg);
  } catch (e) {
    if (effectiveTenantId.value !== requestedTenantId) {
      return;
    }
    error.value = mapConfigError(e, 'No se pudo cargar la configuración');
  } finally {
    // Siempre liberar spinner (también si el tenant cambió mid-await y salimos early).
    isLoading.value = false;
  }
}

async function guardarBranding() {
  if (isBusy.value) return;
  formError.value = null;
  formSuccess.value = null;
  isSaving.value = true;
  try {
    const updated = await updateTenantBranding({
      razonSocial: form.razonSocial,
      rfc: form.rfc,
      domicilio: form.domicilio,
      telefono: form.telefono,
      emailContacto: form.emailContacto,
      sitioWeb: form.sitioWeb,
    });
    config.value = updated;
    fillBrandingFromConfig(updated);
    formSuccess.value = 'Branding guardado correctamente.';
  } catch (e) {
    formError.value = mapConfigError(e, 'No se pudo guardar el branding');
  } finally {
    isSaving.value = false;
  }
}

async function onLogoSelected(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  logoError.value = null;
  formSuccess.value = null;

  const mime = ((file.type || '').split(';')[0] ?? '').trim().toLowerCase();
  if (!ALLOWED_LOGO_TYPES.has(mime)) {
    logoError.value = 'Tipo de imagen no permitido (use PNG, JPEG o WebP).';
    if (logoInputRef.value) logoInputRef.value.value = '';
    return;
  }
  if (file.size > MAX_LOGO_BYTES) {
    logoError.value = 'El logo no puede superar 1MB.';
    if (logoInputRef.value) logoInputRef.value.value = '';
    return;
  }

  if (isBusy.value) {
    if (logoInputRef.value) logoInputRef.value.value = '';
    return;
  }

  isSavingLogo.value = true;
  try {
    const updated = await uploadTenantLogo(file);
    config.value = updated;
    formSuccess.value = 'Logo actualizado.';
  } catch (e) {
    logoError.value = mapConfigError(e, 'No se pudo subir el logo');
  } finally {
    isSavingLogo.value = false;
    if (logoInputRef.value) logoInputRef.value.value = '';
  }
}

async function eliminarLogo() {
  if (isBusy.value) return;
  logoError.value = null;
  formSuccess.value = null;
  isSavingLogo.value = true;
  try {
    const updated = await deleteTenantLogo();
    config.value = updated;
    formSuccess.value = 'Logo eliminado.';
  } catch (e) {
    logoError.value = mapConfigError(e, 'No se pudo eliminar el logo');
  } finally {
    isSavingLogo.value = false;
  }
}

async function guardarEmail() {
  if (isBusy.value) return;
  emailFormError.value = null;
  emailFormSuccess.value = null;
  notifDraftError.value = null;

  // Incorporar borrador pendiente (Enter/Agregar olvidado)
  if (notifDraft.value.trim()) {
    agregarNotificacion();
    if (notifDraftError.value) return;
  }

  const emailUser = emailForm.emailUser.trim().toLowerCase();
  const emailPass = emailForm.emailPass;
  const previousUser = (config.value?.emailUser || '').trim().toLowerCase();
  const userChanged = Boolean(emailUser) && emailUser !== previousUser;
  const wantsPass =
    Boolean(emailPass.trim()) &&
    (!emailCredentialsConfigured.value ||
      showRotatePass.value ||
      userChanged);

  if (wantsPass && !emailUser && !emailCredentialsConfigured.value) {
    emailFormError.value =
      'Indique la cuenta Gmail junto con la contraseña de aplicación.';
    return;
  }
  if (
    emailCredentialsConfigured.value &&
    userChanged &&
    !emailPass.trim()
  ) {
    showRotatePass.value = true;
    emailFormError.value =
      'Para cambiar la cuenta Gmail indique también la contraseña de aplicación.';
    return;
  }
  if (
    emailCredentialsConfigured.value &&
    showRotatePass.value &&
    !emailPass.trim()
  ) {
    emailFormError.value =
      'Ingrese la nueva contraseña de aplicación o cancele la rotación.';
    return;
  }
  if (!emailCredentialsConfigured.value && emailUser && !emailPass.trim()) {
    emailFormError.value =
      'Para configurar el envío indique también la contraseña de aplicación.';
    return;
  }

  isSavingEmail.value = true;
  try {
    const payload: {
      emailRemitente: string;
      correosNotificacion: string[];
      emailUser?: string;
      emailPass?: string;
    } = {
      emailRemitente: emailForm.emailRemitente.trim().toLowerCase(),
      correosNotificacion: [...emailForm.correosNotificacion],
    };
    if (emailUser) payload.emailUser = emailUser;
    if (wantsPass && emailPass.trim()) payload.emailPass = emailPass;

    const updated = await updateTenantEmailConfig(payload);
    config.value = updated;
    fillEmailFromConfig(updated);
    emailFormSuccess.value = 'Configuración de email guardada.';
  } catch (e) {
    emailFormError.value = mapConfigError(
      e,
      'No se pudo guardar la configuración de email',
    );
  } finally {
    isSavingEmail.value = false;
  }
}

async function onBankLogoSelected(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  bankLogoError.value = null;
  bancariosFormSuccess.value = null;

  const mime = ((file.type || '').split(';')[0] ?? '').trim().toLowerCase();
  if (!ALLOWED_LOGO_TYPES.has(mime)) {
    bankLogoError.value =
      'Tipo de imagen no permitido (use PNG, JPEG o WebP).';
    if (bankLogoInputRef.value) bankLogoInputRef.value.value = '';
    return;
  }
  if (file.size > MAX_LOGO_BYTES) {
    bankLogoError.value = 'El logo no puede superar 1MB.';
    if (bankLogoInputRef.value) bankLogoInputRef.value.value = '';
    return;
  }

  if (isBusy.value) {
    if (bankLogoInputRef.value) bankLogoInputRef.value.value = '';
    return;
  }

  isSavingBankLogo.value = true;
  try {
    const updated = await uploadTenantBankLogo(file);
    config.value = updated;
    bancariosFormSuccess.value = 'Logo del banco actualizado.';
  } catch (e) {
    bankLogoError.value = mapConfigError(e, 'No se pudo subir el logo del banco');
  } finally {
    isSavingBankLogo.value = false;
    if (bankLogoInputRef.value) bankLogoInputRef.value.value = '';
  }
}

async function eliminarBankLogo() {
  if (isBusy.value) return;
  bankLogoError.value = null;
  bancariosFormSuccess.value = null;
  isSavingBankLogo.value = true;
  try {
    const updated = await deleteTenantBankLogo();
    config.value = updated;
    bancariosFormSuccess.value = 'Logo del banco eliminado.';
  } catch (e) {
    bankLogoError.value = mapConfigError(
      e,
      'No se pudo eliminar el logo del banco',
    );
  } finally {
    isSavingBankLogo.value = false;
  }
}

async function onSaveVigencia() {
  if (isBusy.value) return;
  vigenciaFormError.value = null;
  vigenciaFormSuccess.value = null;

  const days = Number(vbForm.vigenciaDefaultDias);
  if (vbForm.defaultUsarVigencia) {
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      vigenciaFormError.value = 'La vigencia debe ser un entero entre 1 y 365.';
      return;
    }
  }

  isSavingVigencia.value = true;
  try {
    const payload: Parameters<typeof updateTenantVigenciaBancarios>[0] = {
      defaultIncluirDatosBancarios: vbForm.defaultIncluirDatosBancarios,
      defaultIncluirDescripciones: vbForm.defaultIncluirDescripciones,
      defaultIncluirImagenesPdf: vbForm.defaultIncluirImagenesPdf,
      defaultUsarVigencia: vbForm.defaultUsarVigencia,
      defaultAgregarIva: vbForm.defaultAgregarIva,
    };
    if (Number.isInteger(days) && days >= 1 && days <= 365) {
      payload.vigenciaDefaultDias = days;
    }
    const updated = await updateTenantVigenciaBancarios(payload);
    config.value = updated;
    applyVigenciaFromConfig(updated);
    vigenciaFormSuccess.value = 'Opciones predeterminadas guardadas.';
  } catch (e) {
    vigenciaFormError.value = mapConfigError(
      e,
      'No se pudieron guardar las opciones predeterminadas',
    );
  } finally {
    isSavingVigencia.value = false;
  }
}

async function onSaveBancarios() {
  if (isBusy.value) return;
  bancariosFormError.value = null;
  bancariosFormSuccess.value = null;

  isSavingBancarios.value = true;
  try {
    const updated = await updateTenantVigenciaBancarios({
      bancarios: {
        titular: vbForm.titular.trim(),
        banco: vbForm.banco.trim(),
        cuenta: vbForm.cuenta.trim(),
        clabe: vbForm.clabe.trim(),
        domicilio: vbForm.domicilio.trim(),
        rfc: vbForm.rfc.trim(),
        email: vbForm.email.trim().toLowerCase(),
      },
    });
    config.value = updated;
    applyBancariosFromConfig(updated);
    bancariosFormSuccess.value = 'Datos bancarios guardados.';
  } catch (e) {
    bancariosFormError.value = mapConfigError(
      e,
      'No se pudo guardar los datos bancarios',
    );
  } finally {
    isSavingBancarios.value = false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function agregarNotificacion() {
  onEmailFormEdited();
  const raw = notifDraft.value.trim().toLowerCase();
  if (!raw) {
    notifDraftError.value = 'Escriba un correo para agregar.';
    return;
  }
  if (!EMAIL_RE.test(raw)) {
    notifDraftError.value = 'Correo inválido.';
    return;
  }
  if (emailForm.correosNotificacion.length >= 20) {
    notifDraftError.value = 'Máximo 20 correos.';
    return;
  }
  if (emailForm.correosNotificacion.includes(raw)) {
    notifDraftError.value = 'Ese correo ya está en la lista.';
    return;
  }
  emailForm.correosNotificacion.push(raw);
  notifDraft.value = '';
  notifDraftError.value = null;
}

function quitarNotificacion(idx: number) {
  onEmailFormEdited();
  emailForm.correosNotificacion.splice(idx, 1);
}

// admin_sistema: al cambiar selector, recargar config del tenant activo.
// (AdminLayout remonta por viewKey; el watch cubre el caso sin remount.)
watch(
  () => authStore.activeTenantId,
  () => {
    if (!authStore.isAdminSistema) return;
    void cargar();
  },
);

onMounted(() => {
  void cargar();
});
</script>
