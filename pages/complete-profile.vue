<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex justify-center px-4 pt-20 pb-20 relative">
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
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <span class="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-solid"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuth } from '~/composables/firebase'
import { useGlobalLoading } from '~/composables/useGlobalLoading'

const { user } = useAuth()
const { setLoading, isLoading } = useGlobalLoading()

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
      pendingRegistration.value.userRole as 'athlete' | 'coach'
    )
    if (!result.success) {
      setLoading(false)
      // Set error in form instead of alert
      if (userInfoFormRef.value) {
        userInfoFormRef.value.setFieldError('general', 'Error creando usuario: ' + (result.error || ''))
        userInfoFormRef.value.setLoading(false)
      }
      return
    }
    if (!result.user) {
      setLoading(false)
      if (userInfoFormRef.value) {
        userInfoFormRef.value.setFieldError('general', 'Error: No se pudo crear el usuario en Firebase Auth')
        userInfoFormRef.value.setLoading(false)
      }
      return
    }

    // 2. Guardar perfil y consentimiento en Firestore
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

    // Determinar qué colección usar basado en el rol
    if (pendingRegistration.value.userRole === 'coach') {
      // Para coaches, usar la colección coaches
      const { useCoaches } = await import('~/composables/coaches')
      const { createCoach } = useCoaches()
      
      // Generar UID custom para el coach
      const { generateUniqueCustomUid } = await import('~/utils/custom-uid-generator')
      const customUid = await generateUniqueCustomUid({
        role: 'coach',
        firstName: userData.firstName,
        lastName: userData.lastName,
        authUid: result.user.uid
      })
      
      const coachData = {
        uid: customUid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        email: pendingRegistration.value.email,
        phone: userData.phone,
        profileImageUrl: profilePhotoUrl || userData.profilePhoto || '',
        authUid: result.user.uid,
        role: 'coach',
        // Campos adicionales del perfil
        nickname: userData.nickname,
        birthDate: userData.birthDate,
        gender: userData.gender,
        country: userData.country,
        city: userData.city,
        howDidYouHearAboutUs: userData.howDidYouHearAboutUs,
        startDate: new Date().toISOString(),
        profileCompleted: true
      }
      
      console.log('🔄 [complete-profile] Creating coach with data:', {
        uid: customUid,
        role: 'coach',
        email: pendingRegistration.value.email,
        authUid: result.user.uid
      })
      
      const createResult = await createCoach(coachData)
      if (!createResult.success) {
        throw new Error('Error creating coach in Firestore: ' + createResult.error)
      }
      
      console.log('✅ [complete-profile] Coach created successfully with role: coach')
    } else {
      // Para atletas, usar la colección athletes
      const { useAthletes } = await import('~/composables/athletes')
      const { createAthlete } = useAthletes()
      
      const athleteData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        email: pendingRegistration.value.email,
        phone: userData.phone,
        profileImageUrl: profilePhotoUrl || userData.profilePhoto || '',
        authUid: result.user.uid,
        role: 'athlete',
        // Campos adicionales del perfil
        nickname: userData.nickname,
        birthDate: userData.birthDate,
        gender: userData.gender,
        country: userData.country,
        city: userData.city,
        howDidYouHearAboutUs: userData.howDidYouHearAboutUs,
        startDate: new Date().toISOString(),
        profileCompleted: true,
        assignedWorkouts: []
      }
      
      const createResult = await createAthlete(athleteData)
      if (!createResult.success) {
        throw new Error('Error creating athlete in Firestore: ' + createResult.error)
      }
    }
    
    // 3. Limpiar localStorage
    localStorage.removeItem('pending_registration')
    
    // 4. Marcar sesión como completada para evitar redirección al login
    sessionStorage.setItem('therepzone_auth_completed', 'true')
    
    // 5. Determinar la ruta correcta basada en el rol del registro
    let dashboardRoute = '/athlets/dashboard' // default
    if (pendingRegistration.value.userRole === 'coach') {
      dashboardRoute = '/coach/dashboard'
      console.log('🎯 [complete-profile] Coach registrado - redirigiendo a:', dashboardRoute)
    } else {
      dashboardRoute = '/athlets/dashboard'
      console.log('🎯 [complete-profile] Atleta registrado - redirigiendo a:', dashboardRoute)
    }
    
    sessionStorage.setItem('therepzone_current_path', dashboardRoute)
    
    // 6. Mostrar mensaje de éxito y redirigir
    setLoading(true, '¡Perfil completado! Redirigiendo...')
    setTimeout(async () => {
      setLoading(false)
      console.log('🚀 [complete-profile] Navegando a:', dashboardRoute)
      await navigateTo(dashboardRoute)
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