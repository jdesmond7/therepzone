<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center px-4 pt-20 pb-20">
    <div class="w-full max-w-2xl">
      <!-- User Info Form -->
      <UserInfoForm
        ref="userInfoFormRef"
        title="¡Bienvenido a THEREPZONE!"
        subtitle="Completa tu perfil para comenzar tu transformación"
        submit-button-text="Completar Perfil"
        :initial-data="{ email: userEmail }"
        @submit="handleProfileSubmit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuth } from '~/composables/firebase'
import { useGlobalLoading } from '~/composables/useGlobalLoading'

const { user } = useAuth()
const { setLoading } = useGlobalLoading()

const pendingRegistration = ref<{ email: string; password: string; userRole: string; consent: any } | null>(null)
const userInfoFormRef = ref()

onMounted(() => {
  const data = localStorage.getItem('pending_registration')
  if (data) {
    try {
      pendingRegistration.value = JSON.parse(data)
    } catch (e) {
      pendingRegistration.value = null
    }
  }
})

const userEmail = computed(() => pendingRegistration.value?.email || user.value?.email || '')

console.log('📝 Complete profile page loaded. User:', !!user.value, 'Email:', userEmail.value)

// Watch for user changes to help debug
watch(user, (newUser) => {
  console.log('👤 User state changed in complete-profile:', !!newUser, newUser?.email)
}, { immediate: true })

// Note: No manual auth check here - the global middleware handles authentication
// This prevents race conditions with Firebase Auth initialization

const handleProfileSubmit = async (userData: any) => {
  if (!pendingRegistration.value) {
    // Set error in form instead of alert
    if (userInfoFormRef.value) {
      userInfoFormRef.value.setFieldError('general', 'No se encontraron los datos de registro. Por favor, regístrate de nuevo.')
    }
    return
  }

  // Set loading on the form button
  if (userInfoFormRef.value) {
    userInfoFormRef.value.setLoading(true)
  }

  setLoading(true, 'Creando tu cuenta...')

  try {
    // 1. Crear usuario en Firebase Auth
    const { register } = useAuth()
    const result = await register(
      pendingRegistration.value.email,
      pendingRegistration.value.password,
      undefined,
      pendingRegistration.value.userRole as 'client' | 'coach'
    )
    if (!result.success && !result.partialSuccess) {
      setLoading(false)
      // Set error in form instead of alert
      if (userInfoFormRef.value) {
        userInfoFormRef.value.setFieldError('general', 'Error creando usuario: ' + (result.error || ''))
        userInfoFormRef.value.setLoading(false)
      }
      return
    }

    // 2. Guardar perfil y consentimiento en Firestore
    const { useUsers } = await import('~/composables/firestore')
    const { createUser, updateUser, getUserById } = useUsers()
    let profilePhotoUrl = ''
    if (userData.profileImageFile && result.user) {
      setLoading(true, 'Subiendo imagen de perfil...')
      const { uploadProfileImage } = useFirebaseStorage()
      const uploadResult = await uploadProfileImage(
        userData.profileImageFile,
        result.user.uid,
        userData.fullName
      )
      if (uploadResult.success) {
        profilePhotoUrl = uploadResult.url!
      }
    }
    const profileData = {
      fullName: userData.fullName,
      firstName: userData.firstName,
      lastName: userData.lastName,
      nickname: userData.nickname,
      birthDate: userData.birthDate,
      age: userData.age,
      gender: userData.gender,
      phone: userData.phone,
      profilePhoto: profilePhotoUrl || userData.profilePhoto || '',
      country: userData.country,
      city: userData.city,
      howDidYouHearAboutUs: userData.howDidYouHearAboutUs,
      startDate: new Date().toISOString(),
      profileCompleted: true,
      email: pendingRegistration.value.email,
      role: pendingRegistration.value.userRole,
      assignedWorkouts: [],
      consent: pendingRegistration.value.consent
    }
    if (!result.user) {
      setLoading(false)
      // Set error in form instead of alert
      if (userInfoFormRef.value) {
        userInfoFormRef.value.setFieldError('general', 'Error: No se pudo crear el usuario en Firebase Auth')
        userInfoFormRef.value.setLoading(false)
      }
      return
    }
    // Use the custom UID that was already generated during registration
    const customUid = result.customUid || result.user.uid
    
    // Update the user profile with complete information
    const updateResult = await updateUser(customUid, {
      ...profileData,
      role: pendingRegistration.value.userRole as 'client' | 'coach',
      authUid: result.user.uid // Store original Auth UID for reference
    })
    
    if (!updateResult.success) {
      throw new Error('Error updating user profile: ' + updateResult.error)
    }
    
    // 3. Limpiar localStorage
    localStorage.removeItem('pending_registration')
    
    // 4. Marcar sesión como completada para evitar redirección al login
    sessionStorage.setItem('therepzone_auth_completed', 'true')
    sessionStorage.setItem('therepzone_current_path', '/dashboard')
    
    // 5. Mostrar mensaje de éxito y redirigir
    setLoading(true, '¡Perfil completado! Redirigiendo...')
    
    // Keep form button loading during redirect
    setTimeout(async () => {
      // Clear global loading before navigation to prevent stuck loading
      setLoading(false)
      await navigateTo('/dashboard')
    }, 1500)
  } catch (error: any) {
    setLoading(false)
    // Set error in form instead of alert
    if (userInfoFormRef.value) {
      userInfoFormRef.value.setFieldError('general', 'Error completando el perfil: ' + (error?.message || error))
      userInfoFormRef.value.setLoading(false)
    }
  }
}

// Route is protected by global auth middleware
definePageMeta({
  ssr: false
})

useHead({
  title: 'Completar Perfil - THEREPZONE',
  meta: [
    { name: 'description', content: 'Completa tu perfil para comenzar tu transformación' }
  ]
})
</script> 