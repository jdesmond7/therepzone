<template>
  <transition name="modal-fade" @after-leave="$emit('closed')">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all duration-500" @click.self="$emit('cancel')" />
      <transition name="modal-slide">
        <div v-if="show" class="relative bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-white">
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
              <button
                type="button"
                @click="$emit('cancel')"
                class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer w-full"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 cursor-pointer w-full"
              >
                <span v-if="saving">Guardando...</span>
                <span v-else>{{ editing ? 'Actualizar' : 'Crear' }} Ejercicio</span>
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>
  </transition>
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
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: background 0.5s cubic-bezier(0.4,0,0.2,1), backdrop-filter 0.5s cubic-bezier(0.4,0,0.2,1);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(0px);
}
.modal-fade-enter-to,
.modal-fade-leave-from {
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(6px);
}
.modal-slide-enter-active {
  transition: transform 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.7s cubic-bezier(0.4,0,0.2,1);
}
.modal-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1);
}
.modal-slide-enter-from {
  transform: translateY(-60vh);
  opacity: 0;
}
.modal-slide-enter-to {
  transform: translateY(0);
  opacity: 1;
}
.modal-slide-leave-from {
  transform: translateY(0);
  opacity: 1;
}
.modal-slide-leave-to {
  transform: translateY(-60vh);
  opacity: 0;
}
</style> 