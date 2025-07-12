// Dropdown Manager - Ensures only one dropdown is open at a time
const openDropdownId = ref<string | null>(null)

export const useDropdownManager = () => {
  const generateDropdownId = () => {
    return `dropdown-${Math.random().toString(36).substr(2, 9)}`
  }

  const registerDropdown = (id: string) => {
    // Called when a dropdown wants to open
    const isCurrentlyOpen = openDropdownId.value === id
    
    // Close any other dropdown that might be open
    if (openDropdownId.value && openDropdownId.value !== id) {
      openDropdownId.value = null
    }
    
    // Toggle this dropdown
    openDropdownId.value = isCurrentlyOpen ? null : id
    
    return !isCurrentlyOpen
  }

  const closeDropdown = (id: string) => {
    if (openDropdownId.value === id) {
      openDropdownId.value = null
    }
  }

  const isDropdownOpen = (id: string) => {
    return computed(() => openDropdownId.value === id)
  }

  const closeAllDropdowns = () => {
    openDropdownId.value = null
  }

  return {
    generateDropdownId,
    registerDropdown,
    closeDropdown,
    isDropdownOpen,
    closeAllDropdowns
  }
} 