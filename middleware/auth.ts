export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware during SSR
  if (process.server) return
  
  const protectedRoutes = ['/dashboard', '/coach/dashboard', '/staff/dashboard', '/admin/dashboard', '/complete-profile']
  const isDashboardRoute = protectedRoutes.some(route => to.path.startsWith(route))
  
  // Early return for public routes - no middleware logic needed
  if (!isDashboardRoute) {
    console.log('🌍 Middleware: Ruta pública, saltando middleware:', to.path)
    return
  }
  
  // Only execute middleware logic for protected routes
  console.log('🛡️ Middleware: Ruta protegida detectada:', to.path)
  
  // Check if already in redirect process
  const isAlreadyRedirecting = localStorage.getItem('therepzone_redirecting') === 'true'
  if (isAlreadyRedirecting) {
    console.log('⏳ Middleware: Redirección en proceso, saltando middleware')
    return
  }
  
  // Check if user has completed auth flow successfully in this session
  const hasCompletedAuthFlow = sessionStorage.getItem('therepzone_auth_completed') === 'true'
  const isSameSession = sessionStorage.getItem('therepzone_current_path') === to.path
  
  if (hasCompletedAuthFlow && isSameSession) {
    console.log('✅ Middleware: Usuario ya completó flujo de auth en esta sesión, saltando')
    // Ensure loading is disabled for completed auth flow
    const { setLoading } = useGlobalLoading()
    setLoading(false)
    return
  }
  
    const { user, isLoggedIn } = useAuth()
    const { userProfile, getDashboardRoute, ensureProfileLoaded } = useUserRole()
    const { setLoading, authChecked, profileLoaded } = useGlobalLoading()
    
    console.log('🛡️ Middleware: Verificando acceso a:', to.path)
    console.log('🔍 Estado actual - User:', !!user.value, 'isLoggedIn:', isLoggedIn.value, 'authChecked:', authChecked.value, 'profileLoaded:', profileLoaded.value)
    
    // If user is already authenticated and profile is loaded, skip heavy middleware logic
    if (isLoggedIn.value && authChecked.value && profileLoaded.value && userProfile.value) {
      console.log('✅ Usuario ya autenticado y perfil cargado, acceso directo')
      // Quick check if user is on correct dashboard
      const correctRoute = getDashboardRoute()
      if (to.path === correctRoute || to.path.startsWith(correctRoute)) {
        console.log('✅ Usuario en dashboard correcto, permitiendo acceso directo')
        return
      } else {
        console.log('🔄 Usuario en dashboard incorrecto, redirigiendo a:', correctRoute)
        return navigateTo(correctRoute)
      }
    }
    
    // Only proceed if we're on client side
    if (process.client) {
      setLoading(true, 'Verificando autenticación...')
      
      // Safety timeout to ensure loading doesn't stay forever
      const safetyTimeout = setTimeout(() => {
        console.log('⚠️ Safety timeout: desactivando loading después de 8 segundos')
        setLoading(false)
      }, 8000)
      
      // Wait for Firebase to check auth state (max 2 seconds)
      let attempts = 0
      const maxAttempts = 10 // 2 seconds
      
      while (!authChecked.value && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 200))
        attempts++
        if (attempts <= 3) {
          setLoading(true, 'Conectando con Firebase...')
        } else if (attempts <= 7) {
          setLoading(true, 'Verificando credenciales...')
        } else {
          setLoading(true, 'Finalizando autenticación...')
        }
        console.log('⏳ Esperando verificación de auth...', attempts)
      }
      
      console.log('🔍 Después de esperar - User:', !!user.value, 'isLoggedIn:', isLoggedIn.value)
      
      // If still not logged in after waiting, redirect to login
      if (!isLoggedIn.value) {
        console.log('❌ Usuario no autenticado después de verificar')
        console.log('❌ Redirigiendo desde', to.path, 'hacia /login')
        
        // Clear auth flow completion flags
        sessionStorage.removeItem('therepzone_auth_completed')
        sessionStorage.removeItem('therepzone_current_path')
        
        clearTimeout(safetyTimeout)
        setLoading(false)
        return navigateTo('/login')
      }
      
      // User is logged in, now load profile and redirect if needed
      console.log('✅ Usuario autenticado, verificando perfil...')
      
      try {
        // For complete-profile page, just ensure user is logged in
        if (to.path.startsWith('/complete-profile')) {
          console.log('📝 Middleware: Accediendo a complete-profile')
          console.log('📝 Usuario en complete-profile:', !!user.value, user.value?.email)
          setLoading(true, 'Cargando formulario de perfil...')
          // Disable loading after a short delay to let the page render
          setTimeout(() => {
            clearTimeout(safetyTimeout)
            setLoading(false)
          }, 100)
          return
        }
        
        // For dashboard routes, ensure profile is loaded and check completion
        if (!profileLoaded.value || !userProfile.value) {
          console.log('🔄 Cargando perfil para dashboard...')
          setLoading(true, 'Cargando tu perfil...')
          await ensureProfileLoaded()
        } else {
          console.log('✅ Perfil ya cargado, continuando...')
        }
        
        // Check if user profile is complete (only for clients accessing dashboards)
        if (userProfile.value?.role === 'client' && !userProfile.value?.profileCompleted) {
          console.log('⚠️ Perfil de cliente incompleto, redirigiendo a completar perfil')
          setLoading(true, 'Perfil incompleto, redirigiendo...')
          setTimeout(() => {
            clearTimeout(safetyTimeout)
            setLoading(false)
          }, 100)
          return navigateTo('/complete-profile')
        }
        
        // Get the correct dashboard route based on user profile
        const correctRoute = getDashboardRoute()
        console.log('🎯 Dashboard correcto para usuario:', correctRoute)
        
        // If user is not on the correct dashboard, redirect
        if (to.path !== correctRoute && !to.path.startsWith(correctRoute)) {
          console.log('🔄 Redirigiendo de', to.path, 'a', correctRoute)
          setLoading(true, 'Preparando tu dashboard...')
          setTimeout(() => {
            clearTimeout(safetyTimeout)
            setLoading(false)
          }, 100)
          return navigateTo(correctRoute)
        }
        
        // User is on correct route, allow navigation
        console.log('✅ Usuario en ruta correcta:', to.path)
        
        // Mark auth flow as completed for this session
        sessionStorage.setItem('therepzone_auth_completed', 'true')
        sessionStorage.setItem('therepzone_current_path', to.path)
        
        // Clear any remaining redirect flags and disable loading immediately
        console.log('🔄 Limpiando flags y desactivando loading')
        localStorage.removeItem('therepzone_redirecting')
        clearTimeout(safetyTimeout)
        setLoading(false)
        
        // Additional safety: ensure loading is disabled after a short delay
        setTimeout(() => {
          setLoading(false)
        }, 500)
        
      } catch (error) {
        console.error('❌ Error loading profile:', error)
        console.log('⚠️ Error cargando perfil, asumiendo rol de cliente')
        setLoading(true, 'Redirigiendo a dashboard...')
        setTimeout(() => {
          clearTimeout(safetyTimeout)
          setLoading(false)
        }, 100)
        if (to.path !== '/dashboard') {
          return navigateTo('/dashboard')
        } else {
          // If already on dashboard but had error, just disable loading
          setTimeout(() => {
            clearTimeout(safetyTimeout)
            setLoading(false)
          }, 100)
        }
      }
    }
}) 