<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <!-- Login Form -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <TheLogo :vertical="true" />
        </div>
        
        <h1 class="text-3xl font-black text-white text-center mb-2">BIENVENIDO DE VUELTA</h1>
        <p class="text-slate-400 text-center mb-8">¿Listo para conquistar tu entrenamiento?</p>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Error message -->
          <div v-if="errorMessage" class="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p class="text-red-400 text-sm">{{ errorMessage }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-bold text-white mb-2">
              CORREO ELECTRÓNICO
            </label>
            <AppInput
              id="email"
              v-model="email"
              type="email"
              placeholder="tu@email.com"
              autocomplete="email"
              :disabled="isLoading"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-bold text-white mb-2">
              CONTRASEÑA
            </label>
            <PasswordInput
              id="password"
              v-model="password"
              placeholder="••••••••"
              autocomplete="off"
              :disabled="isLoading"
            />
          </div>

          <!-- Remember Me checkbox -->
          <div class="flex items-center">
            <input
              id="rememberMe"
              v-model="rememberMe"
              type="checkbox"
              class="therepzone-checkbox"
            />
            <label for="rememberMe" class="ml-2 text-sm text-slate-300">
              Recordarme (mantener sesión por 7 días)
            </label>
          </div>

          <AppButtonPrimary
            type="submit"
            :disabled="isLoading"
            fullWidth
            class="h-12"
          >
            <UIcon 
              v-if="isLoading" 
              name="i-heroicons-arrow-path" 
              class="w-6 h-6 animate-spin" 
            />
            <span v-else>Iniciar Sesión</span>
          </AppButtonPrimary>
        </form>

        <div class="mt-6 text-center space-y-3">
          <p class="text-slate-400">
            ¿No tienes cuenta? 
            <NuxtLink to="/register" class="text-orange-600 hover:text-orange-500 font-bold">
              Regístrate Aquí
            </NuxtLink>
          </p>
          <NuxtLink to="/" class="text-slate-400 hover:text-white transition-colors block">
            ← Volver al inicio
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TheLogo from '~/components/shared/TheLogo.vue'
import AppInput from '~/components/shared/AppInput.vue'
import AppButtonPrimary from '~/components/shared/AppButtonPrimary.vue'
import PasswordInput from '~/components/shared/PasswordInput.vue'

// Login page for THEREPZONE
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

// Check if user had "remember me" enabled previously
if (process.client) {
  const hadRememberMe = localStorage.getItem('therepzone_remember_me') === 'true'
  if (hadRememberMe) {
    rememberMe.value = true
  }
}

import { useUserRole } from '~/composables/useUserRole'
import { useUserStore } from '~/stores/user'
import { navigateTo } from '#app'

const { login, logout, user } = useAuth()
const { getDashboardRoute, ensureProfileLoaded, clearUserProfile: clearUserRoleProfile } = useUserRole()
const userStore = useUserStore()



const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  
  const { setLoading } = useGlobalLoading()
  
  try {
    console.log('🔄 Intentando login...')
    const result = await login(email.value, password.value, rememberMe.value)
    
    if (result.success) {
      console.log('✅ Login exitoso, iniciando redirección...')
      
      // Activar loading global inmediatamente
      console.log('🎯 Activando loading global: ¡Bienvenido de vuelta!')
      setLoading(true, '¡Bienvenido de vuelta!')
      
      // Pequeño delay para que el usuario vea la transición
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Desactivar el loading del botón para mostrar el loading global
      isLoading.value = false
      
      // Guardar flags de redirección
      if (process.client) {
        localStorage.setItem('therepzone_redirecting', 'true')
        localStorage.setItem('therepzone_login_process', 'true')
        console.log('🏷️ Flags de redirección guardados')
      }
      
      // Pequeña pausa para mostrar el mensaje de bienvenida
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Cargar el perfil del usuario para determinar la ruta correcta
      console.log('🎯 Cambiando mensaje de loading: Preparando tu dashboard...')
      setLoading(true, 'Preparando tu dashboard...')
      await ensureProfileLoaded()
      
      // Obtener la ruta del dashboard basada en el rol
      const dashboardRoute = getDashboardRoute()
      console.log('🚀 Redirigiendo al dashboard:', dashboardRoute)
      
      // Mensaje final antes de la redirección
      console.log('🎯 Mensaje final de loading: ¡Listo! Redirigiendo...')
      setLoading(true, '¡Listo! Redirigiendo...')
      
      // Pequeña pausa para mostrar el mensaje final
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Usar navigateTo para una transición más suave
      await navigateTo(dashboardRoute)
    } else {
      console.log('❌ Login falló:', result.error)
      errorMessage.value = getErrorMessage(result.error, result.code)
      isLoading.value = false
    }
  } catch (error) {
    console.error('Error inesperado en handleLogin:', error)
    errorMessage.value = 'Error inesperado. Inténtalo de nuevo.'
    isLoading.value = false
  }
}

const getErrorMessage = (error: string, code?: string) => {
  console.log('Procesando error:', { error, code })
  
  // Manejar por código de error (más preciso)
  if (code) {
    switch (code) {
      case 'auth/user-not-found':
        return 'No existe una cuenta con este email'
      case 'auth/wrong-password':
        return 'Contraseña incorrecta'
      case 'auth/invalid-email':
        return 'Email inválido'
      case 'auth/user-disabled':
        return 'Esta cuenta ha sido deshabilitada'
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Intenta más tarde.'
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet.'
      case 'auth/invalid-credential':
        return 'Credenciales inválidas. Verifica tu email y contraseña.'
      case 'auth/configuration-not-found':
        return 'Error de configuración de Firebase'
      default:
        return `Error de autenticación: ${code}`
    }
  }
  
  // Fallback para mensajes de error
  if (error.includes('user-not-found') || error.includes('user not found')) {
    return 'No existe una cuenta con este email'
  } else if (error.includes('wrong-password') || error.includes('invalid-credential')) {
    return 'Contraseña incorrecta'
  } else if (error.includes('invalid-email')) {
    return 'Email inválido'
  } else if (error.includes('too-many-requests')) {
    return 'Demasiados intentos fallidos. Intenta más tarde.'
  } else if (error.includes('network-request-failed')) {
    return 'Error de conexión. Verifica tu internet.'
  }
  
  return `Error: ${error}`
}



// Disable SSR for Firebase compatibility
definePageMeta({
  ssr: false
})

useHead({
  title: 'Acceder - THEREPZONE',
  meta: [
    { name: 'description', content: 'Accede a tu cuenta de THEREPZONE' }
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