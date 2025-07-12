// Composable for user role management
import { useUsers, type User } from './firestore'

export const useUserRole = () => {
  const { user } = useAuth()
  const { setProfileLoaded, setLoading } = useGlobalLoading()
  
  const userProfile = ref<User | null>(null)
  const isLoading = ref(false)

  // Computed properties for role checking
  const isClient = computed(() => userProfile.value?.role === 'client')
  const isCoach = computed(() => userProfile.value?.role === 'coach')
  const isAdmin = computed(() => userProfile.value?.role === 'admin')

  // Load user profile from Firestore
  const loadUserProfile = async () => {
    if (!user.value?.uid) {
      setProfileLoaded(false)
      return
    }

    isLoading.value = true
    // NO manejar el loading global aquí - el middleware se encarga
    
    try {
      const { getUserById } = useUsers()
      const result = await getUserById(user.value.uid)
      
      if (result.success && result.user) {
        userProfile.value = result.user
        setProfileLoaded(true)
        console.log('✅ Perfil de usuario cargado:', result.user.role)
      } else {
        console.error('❌ Error loading user profile:', result.error)
        userProfile.value = null
        setProfileLoaded(false)
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      setProfileLoaded(false)
    } finally {
      isLoading.value = false
      // NO stopping global loading aquí
    }
  }

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    if (isCoach.value) return '/coach/dashboard'
    if (isAdmin.value) return '/admin/dashboard'
    return '/dashboard' // Default client dashboard
  }

  // Watch for user changes - pero NO cargar automáticamente el perfil
  // El middleware se encargará de cargar el perfil cuando sea necesario
  watch(user, (newUser) => {
    if (!newUser?.uid) {
      userProfile.value = null
      setProfileLoaded(false)
    }
    // No auto-cargar perfil aquí - el middleware lo hará cuando sea necesario
  }, { immediate: true })

  // Force load profile when needed (called by middleware)
  const ensureProfileLoaded = async () => {
    console.log('🔄 ensureProfileLoaded called. User:', user.value?.uid, 'Profile:', !!userProfile.value)
    if (user.value?.uid && !userProfile.value) {
      console.log('📋 Loading profile for user:', user.value.uid)
      await loadUserProfile()
    } else if (!user.value?.uid) {
      console.log('❌ No user UID available')
    } else {
      console.log('✅ Profile already loaded:', userProfile.value?.role)
    }
  }

  const clearUserProfile = () => {
    userProfile.value = null
    setProfileLoaded(false)
  }

  return {
    userProfile: readonly(userProfile),
    isLoading: readonly(isLoading),
    isClient,
    isCoach,
    isAdmin,
    loadUserProfile,
    ensureProfileLoaded,
    getDashboardRoute,
    clearUserProfile,
  }
} 