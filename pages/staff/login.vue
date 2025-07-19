<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center items-center px-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <TheLogo />
        <h1 class="text-3xl font-black text-white mt-6 mb-2">Staff Access</h1>
        <p class="text-slate-400">Acceso administrativo a THEREPZONE</p>
      </div>

      <!-- Login Form -->
      <div class="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
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
              placeholder="staff@therepzone.com"
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
            <span v-else>Acceder como Staff</span>
          </AppButtonPrimary>
        </form>

        <!-- Back to regular login -->
        <div class="mt-6 pt-6 border-t border-slate-700 text-center">
          <NuxtLink 
            to="/login" 
            class="text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Volver al login regular
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const { login } = useAuth()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const result = await login(email.value, password.value)
    
    if (result.success) {
      // Check if user is staff/admin
      const { useUserRole } = await import('~/composables/useUserRole')
      const { loadUserProfile } = useUserRole()
      await loadUserProfile()
      
      // Redirect to staff dashboard
      await navigateTo('/staff/dashboard')
    } else {
      errorMessage.value = getErrorMessage(result.error || '')
    }
  } catch (error) {
    errorMessage.value = 'Error inesperado. Inténtalo de nuevo.'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}

const getErrorMessage = (error: string) => {
  if (error.includes('user-not-found')) {
    return 'Usuario no encontrado'
  } else if (error.includes('wrong-password')) {
    return 'Contraseña incorrecta'
  } else if (error.includes('invalid-email')) {
    return 'Email inválido'
  } else if (error.includes('too-many-requests')) {
    return 'Demasiados intentos. Intenta más tarde.'
  }
  return 'Error al iniciar sesión. Inténtalo de nuevo.'
}

// Meta
definePageMeta({
  layout: false,
  ssr: false
})

useHead({
  title: 'Staff Login - THEREPZONE',
  meta: [
    { name: 'description', content: 'Acceso administrativo a THEREPZONE' }
  ]
})
</script> 