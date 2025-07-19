<template>
  <div v-if="show" class="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-3xl font-bold text-white">
              {{ editing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio' }}
            </h3>
            <button 
              @click="$emit('cancel')"
              class="text-slate-400 hover:text-white cursor-pointer"
            >
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>
          <form @submit.prevent="$emit('save')" class="space-y-4 flex-1 flex flex-col">
            <slot />
            <div class="flex flex-col sm:flex-row gap-3 pt-4 w-full">
              <AppButtonSecondary
                @click="$emit('cancel')"
                class="flex-1"
              >
                Cancelar
              </AppButtonSecondary>
              <AppButtonPrimary
                type="submit"
                :disabled="saving"
                class="flex-1"
              >
                <span v-if="saving">Guardando...</span>
                <span v-else>{{ editing ? 'Actualizar' : 'Crear' }} Ejercicio</span>
              </AppButtonPrimary>
            </div>
          </form>
        </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
  editing: Boolean,
  saving: Boolean
})
const emit = defineEmits(['cancel', 'save', 'closed'])
</script>

<style scoped>
</style> 