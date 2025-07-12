import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUsers } from '~/composables/firestore'
import { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword as fbUpdatePassword } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const userProfile = ref<any>(null)
  const isLoading = ref(false)

  // Unidades globales
  const unidadPesoGlobal = ref<'kg' | 'lbs'>('kg')
  const unidadEstaturaGlobal = ref<'cm' | 'in'>('cm')
  const unidadDistanciaGlobal = ref<'km' | 'mi'>('km')

  const setUnidadPeso = (unidad: 'kg' | 'lbs') => {
    unidadPesoGlobal.value = unidad
  }
  const setUnidadEstatura = (unidad: 'cm' | 'in') => {
    unidadEstaturaGlobal.value = unidad
  }
  const setUnidadDistancia = (unidad: 'km' | 'mi') => {
    unidadDistanciaGlobal.value = unidad
  }

  // Cargar perfil desde Firestore
  const loadUserProfile = async (uid: string) => {
    isLoading.value = true
    try {
      const { getUserById } = useUsers()
      console.log('[Pinia] Llamando getUserById con UID:', uid)
      const result = await getUserById(uid)
      console.log('[Pinia] Resultado de getUserById:', result)
      if (result.success && result.user) {
        userProfile.value = {
          ...result.user,
          uid: result.user.uid || result.user.authUid || null
        }
        console.log('[Pinia] userProfile.value asignado:', userProfile.value)
      }
    } finally {
      isLoading.value = false
    }
  }

  // Actualizar perfil en Firestore y en el store
  const updateUserProfile = async (uid: string, updates: any) => {
    isLoading.value = true
    try {
      const { updateUser } = useUsers()
      const result = await updateUser(uid, updates)
      if (result.success) {
        // Recargar perfil actualizado
        await loadUserProfile(uid)
      }
      return result
    } finally {
      isLoading.value = false
    }
  }

  // Cambiar contraseña del usuario autenticado
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user || !user.email) throw new Error('Usuario no autenticado')
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)
    await fbUpdatePassword(user, newPassword)
  }

  const clearUserProfile = () => {
    userProfile.value = null
  }

  return {
    userProfile, isLoading, loadUserProfile, updateUserProfile,
    unidadPesoGlobal, unidadEstaturaGlobal, unidadDistanciaGlobal,
    setUnidadPeso, setUnidadEstatura, setUnidadDistancia,
    updatePassword,
    clearUserProfile,
  }
}) 