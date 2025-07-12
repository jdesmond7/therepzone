<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/">
          <TheLogo />
        </NuxtLink>
      </div>
      <!-- Register Form -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
        <!-- Tabs -->
        <div class="mb-6">
          <div class="flex w-full rounded-lg bg-slate-900 border border-slate-600 p-1">
            <button
              type="button"
              @click="selectedTab = 0"
              :class="[
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                selectedTab === 0 
                  ? 'text-white bg-orange-600 border border-orange-600' 
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              ATLETA
            </button>
            <button
              type="button"
              @click="selectedTab = 1"
              :class="[
                'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
                selectedTab === 1 
                  ? 'text-white bg-orange-600 border border-orange-600' 
                  : 'text-slate-400 hover:text-slate-200'
              ]"
            >
              COACH
            </button>
          </div>
        </div>

        <!-- Dynamic Title and Description -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-black text-white text-center mb-2">
            {{ selectedTab === 0 ? 'ÚNETE A THEREPZONE' : 'ÚNETE COMO COACH A THEREPZONE' }}
          </h1>
          <p class="text-slate-400 text-center">
            {{ selectedTab === 0 
              ? 'Crea tu cuenta y comienza tu transformación'
              : 'Comparte tu experiencia, guía a otros y ayuda a formar atletas de alto rendimiento.'
            }}
          </p>
        </div>

        <form @submit.prevent="onPreRegister" class="space-y-6">
          <!-- Error message -->
          <div v-if="errorMessage" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p class="text-red-400 text-sm">{{ errorMessage }}</p>
          </div>

          <!-- Success message -->
          <div v-if="successMessage" class="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p class="text-green-400 text-sm">{{ successMessage }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-bold text-white mb-2">
              CORREO ELECTRÓNICO
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent email-input"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-white mb-2">
              CONTRASEÑA
            </label>
            <PasswordInput
              id="password"
              v-model="password"
              autocomplete="off"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              placeholder="••••••••"
              required
              minlength="6"
            />
            <p class="text-xs text-slate-400 mt-1">Mínimo 6 caracteres</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-bold text-white mb-2">
              CONFIRMAR CONTRASEÑA
            </label>
            <PasswordInput
              id="confirmPassword"
              v-model="confirmPassword"
              autocomplete="off"
              class="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
          >
            <UIcon 
              v-if="isLoading" 
              name="i-heroicons-arrow-path" 
              class="w-6 h-6 animate-spin" 
            />
            <span v-else>CREAR CUENTA</span>
          </button>
        </form>

        <div class="mt-6 text-center space-y-3">
          <p class="text-slate-400">
            ¿Ya tienes cuenta? 
            <NuxtLink to="/login" class="text-orange-600 hover:text-orange-500 font-bold">
              Inicia sesión
            </NuxtLink>
          </p>
          <NuxtLink to="/" class="text-slate-400 hover:text-white transition-colors block">
            ← Volver al inicio
          </NuxtLink>
        </div>
      </div>
    </div>
    <TermsModal
      :show="showTermsModal"
      @cancel="showTermsModal = false"
      @save="onAcceptTerms"
    >
      <template #terms>
        <div class="prose prose-invert max-w-none text-sm">
          <p>Bienvenido a THEREPZONE. Al registrarte o utilizar nuestra plataforma, aceptas los siguientes términos y condiciones. Por favor, léelos cuidadosamente.</p>
          <br>
          <h2 class="text-md font-bold">1. Aceptación de los términos</h2>
          <p class="text-sm text-slate-400">Al acceder o utilizar THEREPZONE, aceptas quedar vinculado por estos términos. Si no estás de acuerdo con alguno de ellos, por favor no uses la plataforma.</p>
          <br>
          <h2 class="text-md font-bold">2. Descripción del servicio</h2>
          <p class="text-sm text-slate-400">THEREPZONE es una plataforma digital que permite a usuarios llevar el registro de sus entrenamientos, rutinas, métricas físicas y comunicación con coaches.</p>
          <br>
          <h2 class="text-md font-bold">3. Registro de usuarios</h2>
          <p class="text-sm text-slate-400">Los usuarios deben proporcionar información veraz y mantenerla actualizada. Los coaches serán responsables de la gestión de sus atletas dentro de la plataforma.</p>
          <br>
          <h2 class="text-md font-bold">4. Uso adecuado</h2>
          <p class="text-sm text-slate-400">Los usuarios se comprometen a utilizar THEREPZONE únicamente con fines lícitos y respetando a otros miembros de la comunidad. Se prohíbe el uso de la plataforma para fines fraudulentos o inapropiados.</p>
          <br>
          <h2 class="text-md font-bold">5. Propiedad intelectual</h2>
          <p class="text-sm text-slate-400">Todo el contenido generado por THEREPZONE (diseños, código, marca, ilustraciones, etc.) es propiedad exclusiva de la empresa y está protegido por derechos de autor.</p>
          <br>
          <h2 class="text-md font-bold">6. Planes y precios</h2>
          <p class="text-sm text-slate-400"p>THEREPZONE podrá ofrecer versiones gratuitas y de pago. El uso de ciertas funcionalidades avanzadas podrá requerir una suscripción o tarifa mensual, ya sea por coach o por atleta.</p>
          <br>
          <h2 class="text-md font-bold">7. Cancelación y eliminación de cuentas</h2>
          <p class="text-sm text-slate-400">Los usuarios pueden solicitar la eliminación de su cuenta en cualquier momento. THEREPZONE se reserva el derecho de suspender o cancelar cuentas que incumplan estos términos.</p>
          <br>
          <h2 class="text-md font-bold">8. Modificaciones</h2>
          <p class="text-sm text-slate-400">THEREPZONE se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor al ser publicadas en la plataforma.</p>
        </div>
      </template>
      <template #privacy>
        <div class="prose prose-invert max-w-none text-sm">
          <p>THEREPZONE está comprometido con la protección de los datos personales de sus usuarios, en cumplimiento con las leyes aplicables de protección de datos.</p>
          <br>
          <h2 class="text-md font-bold">1. Responsable del tratamiento</h2>
          <p class="text-sm text-slate-400">El responsable del tratamiento de los datos es THEREPZONE (nombre comercial). Para dudas o solicitudes relacionadas con tu información personal, puedes contactarnos al correo: contacto@therepzone.com.</p>
          <br>
          <h2 class="text-md font-bold">2. Datos recabados</h2>
          <p class="text-sm text-slate-400">Recabamos los siguientes datos personales: Nombre, Correo electrónico, Información física básica (edad, peso, estatura, métricas de entrenamiento), Información de conexión y uso (fecha de registro, rutinas, historial)</p>
          <br>
          <h2 class="text-md font-bold">3. Finalidad del tratamiento</h2>
          <p class="text-sm text-slate-400">Tus datos se utilizarán para: Crear y gestionar tu cuenta, Mostrar tu progreso y métricas, Facilitar la comunicación con coaches (si aplica), Mejorar el funcionamiento de la plataforma</p>
          <br>
          <h2 class="text-md font-bold">4. Conservación de datos</h2>
          <p class="text-sm text-slate-400">Los datos se conservarán mientras mantengas tu cuenta activa o hasta que solicites su eliminación.</p>
          <br>
          <h2 class="text-md font-bold">5. Compartición de datos</h2>
          <p class="text-sm text-slate-400">Tus datos no serán compartidos con terceros sin tu consentimiento, salvo obligación legal o requerimiento de autoridades.</p>
          <br>
          <h2 class="text-md font-bold">6. Seguridad</h2>
          <p class="text-sm text-slate-400">Hemos implementado medidas técnicas y administrativas para proteger tus datos contra accesos no autorizados, pérdidas o alteraciones.</p>
          <br>
          <h2 class="text-md font-bold">7. Derechos ARCO</h2>
          <p class="text-sm text-slate-400">Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales. Para ejercer estos derechos, escríbenos a contacto@therepzone.com.</p>
          <br>
          <h2 class="text-md font-bold">8. Cambios al aviso</h2>
          <p class="text-sm text-slate-400">Cualquier modificación a este aviso será publicada en la plataforma.</p>
          <br>
          <br>
          <p class="text-xs text-center">Última actualización: Julio 2025</p>
        </div>
      </template>
    </TermsModal>
  </div>
</template>

<script setup lang="ts">
// Register page for THEREPZONE
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedTab = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Computed property to get user role based on selected tab
const userRole = computed(() => {
  return selectedTab.value === 0 ? 'client' : 'coach'
})

const { register } = useAuth()

import TermsModal from '~/components/TermsModal.vue'
import { Timestamp } from 'firebase/firestore'

const showTermsModal = ref(false)
let pendingRegisterData = null

function onPreRegister() {
  // Validaciones previas
  if (!email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres'
    return
  }
  // Guardar datos y mostrar modal
  pendingRegisterData = {
    email: email.value,
    password: password.value,
    userRole: userRole.value
  }
  showTermsModal.value = true
}

async function onAcceptTerms() {
  if (!pendingRegisterData) return
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    // Guardar datos en localStorage en vez de crear usuario
    localStorage.setItem('pending_registration', JSON.stringify({
      email: pendingRegisterData.email,
      password: pendingRegisterData.password,
      userRole: pendingRegisterData.userRole,
      consent: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version: 'v1.0'
      }
    }))
    isLoading.value = false
    showTermsModal.value = false
    // Redirigir a complete-profile
    await navigateTo('/complete-profile', { replace: true })
  } catch (error) {
    errorMessage.value = 'Error inesperado. Inténtalo de nuevo.'
    isLoading.value = false
    showTermsModal.value = false
  }
}

const getErrorMessage = (error: string) => {
  if (error.includes('email-already-in-use')) {
    return 'Ya existe una cuenta con este email'
  } else if (error.includes('invalid-email')) {
    return 'Email inválido'
  } else if (error.includes('weak-password')) {
    return 'La contraseña es muy débil'
  } else if (error.includes('too-many-requests')) {
    return 'Demasiados intentos. Intenta más tarde.'
  }
  return 'Error al crear la cuenta. Inténtalo de nuevo.'
}

// Disable SSR for Firebase compatibility
definePageMeta({
  ssr: false
})

useHead({
  title: 'Registrarse - THEREPZONE',
  meta: [
    { name: 'description', content: 'Crea tu cuenta en THEREPZONE' }
  ]
})
</script>

<style scoped>
/* Estilos para mantener el diseño personalizado cuando el navegador autocompleta el email */
.email-input:-webkit-autofill,
.email-input:-webkit-autofill:hover,
.email-input:-webkit-autofill:focus,
.email-input:-webkit-autofill:active {
  -webkit-box-shadow: 0 0 0 30px rgb(15 23 42) inset !important; /* bg-slate-900 */
  -webkit-text-fill-color: rgb(255 255 255) !important; /* text-white */
  border: 1px solid rgb(71 85 105) !important; /* border-slate-600 */
  border-radius: 0.5rem !important; /* rounded-lg */
  transition: background-color 5000s ease-in-out 0s;
}

.email-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 30px rgb(15 23 42) inset, 0 0 0 2px rgb(234 88 12) !important; /* focus ring orange-600 */
  border-color: transparent !important;
}

/* Para otros navegadores */
.email-input:autofill {
  background-color: rgb(15 23 42) !important; /* bg-slate-900 */
  color: rgb(255 255 255) !important; /* text-white */
  border: 1px solid rgb(71 85 105) !important; /* border-slate-600 */
}
</style> 