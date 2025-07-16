// Composable for user role management
import { useCoaches } from './coaches'
import { useAthletes } from './athletes'

export const useUserRole = () => {
  const { user } = useAuth()
  const { setProfileLoaded, setLoading } = useGlobalLoading()
  
  const userProfile = ref<any>(null)
  const isLoading = ref(false)

  // Computed properties for role checking
  const isClient = computed(() => {
    const role = userProfile.value?.role
    console.log('🔍 [useUserRole] isClient check - role:', role, 'result:', role === 'client')
    return role === 'client'
  })
  const isCoach = computed(() => {
    const role = userProfile.value?.role
    console.log('🔍 [useUserRole] isCoach check - role:', role, 'result:', role === 'coach')
    return role === 'coach'
  })
  const isAdmin = computed(() => {
    const role = userProfile.value?.role
    console.log('🔍 [useUserRole] isAdmin check - role:', role, 'result:', role === 'admin')
    return role === 'admin'
  })

  // Load user profile from the appropriate collection
  const loadUserProfile = async () => {
    if (!user.value?.uid) {
      console.log('❌ [useUserRole] No user UID available')
      setProfileLoaded(false)
      return
    }

    isLoading.value = true
    
    try {
      console.log('🔍 [useUserRole] Buscando perfil para UID:', user.value.uid)
      
      // Try to find user in coaches collection first
      const { getCoachByAuthUID } = useCoaches()
      const coachResult = await getCoachByAuthUID(user.value.uid)
      
      if (coachResult.success && coachResult.coach) {
        console.log('✅ [useUserRole] Coach encontrado:', coachResult.coach)
        console.log('📊 [useUserRole] Datos del coach:', {
          uid: coachResult.coach.uid,
          fullName: coachResult.coach.fullName,
          email: coachResult.coach.email,
          role: coachResult.coach.role
        })
        userProfile.value = coachResult.coach
        setProfileLoaded(true)
        return
      }
      
      // If not found in coaches, try athletes collection
      const { getAthleteByAuthUID } = useAthletes()
      const athleteResult = await getAthleteByAuthUID(user.value.uid)
      
      if (athleteResult.success && athleteResult.athlete) {
        console.log('✅ [useUserRole] Atleta encontrado:', athleteResult.athlete)
        console.log('📊 [useUserRole] Datos del atleta:', {
          uid: athleteResult.athlete.uid,
          fullName: athleteResult.athlete.fullName,
          email: athleteResult.athlete.email,
          role: athleteResult.athlete.role
        })
        userProfile.value = athleteResult.athlete
        setProfileLoaded(true)
        return
      }
      
      // If not found in athletes, try admins collection (future implementation)
      // For now, we'll assume it's not found
      console.log('❌ [useUserRole] Usuario no encontrado en ninguna colección')
      userProfile.value = null
      setProfileLoaded(false)
      
    } catch (error) {
      console.error('❌ [useUserRole] Error loading user profile:', error)
      userProfile.value = null
      setProfileLoaded(false)
    } finally {
      isLoading.value = false
    }
  }

  // Get dashboard route based on role
  const getDashboardRoute = () => {
    console.log('🎯 [useUserRole] getDashboardRoute called')
    console.log('📊 [useUserRole] Current userProfile:', userProfile.value)
    console.log('🔍 [useUserRole] Role checks - isCoach:', isCoach.value, 'isAdmin:', isAdmin.value, 'isClient:', isClient.value)
    
    if (isCoach.value) {
      console.log('🎯 [useUserRole] Returning /coach/dashboard for coach')
      return '/coach/dashboard'
    }
    if (isAdmin.value) {
      console.log('🎯 [useUserRole] Returning /admin/dashboard for admin')
      return '/admin/dashboard'
    }
    console.log('🎯 [useUserRole] Returning /dashboard for client/athlete')
    return '/dashboard' // Default client/athlete dashboard
  }

  // Watch for user changes
  watch(user, (newUser) => {
    if (!newUser?.uid) {
      userProfile.value = null
      setProfileLoaded(false)
    }
  }, { immediate: true })

  // Force load profile when needed (called by middleware)
  const ensureProfileLoaded = async () => {
    console.log('🔄 [useUserRole] ensureProfileLoaded called. User:', user.value?.uid, 'Profile:', !!userProfile.value)
    if (user.value?.uid && !userProfile.value) {
      console.log('📋 [useUserRole] Loading profile for user:', user.value.uid)
      await loadUserProfile()
    } else if (!user.value?.uid) {
      console.log('❌ [useUserRole] No user UID available')
    } else {
      console.log('✅ [useUserRole] Profile already loaded:', userProfile.value?.role)
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