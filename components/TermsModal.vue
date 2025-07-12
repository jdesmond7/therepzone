<template>
  <transition name="modal-fade" @after-leave="emit('closed')">
    <div v-if="showBg" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur transition-all duration-600 modal-bg" />
      <transition name="modal-slide" @after-leave="showModalContent = false">
        <div v-if="showModalContent" class="relative bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-content">
          <div class="p-8 overflow-y-auto flex-1 text-slate-200 text-base leading-relaxed space-y-10">
            <slot name="header">
              <h2 class="text-3xl font-extrabold mb-6 text-white">Términos y Condiciones de Uso</h2>
            </slot>
            <div class="prose prose-invert max-w-none text-base leading-relaxed">
              <slot name="terms"></slot>
            </div>
            <slot name="privacyHeader">
              <h2 class="text-3xl font-extrabold mb-6 text-white">AVISO DE PRIVACIDAD</h2>
            </slot>
            <div class="prose prose-invert max-w-none text-base leading-relaxed">
              <slot name="privacy"></slot>
            </div>
          </div>
          <div class="p-6 border-t border-slate-700 flex flex-col gap-4">
            <slot name="footer">
              <label class="flex items-center gap-2 text-slate-200 text-lg leading-relaxed select-none cursor-pointer">
                <RoundedCheckbox v-model="accepted" />
                He leído y acepto los Términos y Condiciones y el Aviso de Privacidad.
              </label>
              <div class="flex justify-end gap-2">
                <AppButtonSecondary @click="closeModal('cancel')">Cancelar</AppButtonSecondary>
                <AppButtonPrimary :disabled="!accepted" @click="closeModal('save')">Aceptar</AppButtonPrimary>
              </div>
            </slot>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onUnmounted } from 'vue'
import RoundedCheckbox from '~/components/RoundedCheckbox.vue'
import AppButtonPrimary from '~/components/AppButtonPrimary.vue'
import AppButtonSecondary from '~/components/AppButtonSecondary.vue'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['cancel', 'save', 'closed', 'scrollTo'])
const accepted = ref(false)

// Controla el montaje del modal (contenido)
const showModalContent = ref(false)
const showBg = ref(false)
let showTimeout: ReturnType<typeof setTimeout> | null = null
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let bgTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => props.show, (val) => {
  if (val) {
    if (hideTimeout) clearTimeout(hideTimeout)
    if (bgTimeout) clearTimeout(bgTimeout)
    showBg.value = true
    showTimeout = setTimeout(() => {
      showModalContent.value = true
      accepted.value = false // Solo resetear cuando se abre
    }, 300)
  } else {
    // No resetear accepted aquí para que no se desmarque al guardar
    if (showTimeout) clearTimeout(showTimeout)
    if (showModalContent.value) {
      // Slide-out del modal primero
      showModalContent.value = false
      // Fade del fondo a la mitad de la animación del modal
      bgTimeout = setTimeout(() => {
        showBg.value = false
      }, 500)
    } else {
      showBg.value = false
    }
  }
})

onUnmounted(() => {
  if (showTimeout) clearTimeout(showTimeout)
  if (hideTimeout) clearTimeout(hideTimeout)
  if (bgTimeout) clearTimeout(bgTimeout)
})

function closeModal(action: 'cancel' | 'save') {
  // Inicia la animación de salida
  showModalContent.value = false
  // Espera a que termine la animación y luego emite el evento correspondiente
  setTimeout(() => {
    if (action === 'cancel') emit('cancel')
    if (action === 'save') emit('save', { accepted: true })
    // El evento 'closed' se emitirá automáticamente por @after-leave del <transition>
  }, 500)
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: background 0.6s cubic-bezier(0.4,0,0.2,1), backdrop-filter 0.6s cubic-bezier(0.4,0,0.2,1);
}
.modal-fade-enter-from .modal-bg,
.modal-fade-leave-to .modal-bg {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(0px);
}
.modal-fade-enter-to .modal-bg,
.modal-fade-leave-from .modal-bg {
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
}

.modal-slide-enter-active {
  transition: transform 1s cubic-bezier(0.4,0,0.2,1), opacity 1s cubic-bezier(0.4,0,0.2,1);
  transition-delay: 0s;
}
.modal-slide-leave-active {
  transition: transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s cubic-bezier(0.4,0,0.2,1);
}
.modal-slide-enter-from {
  transform: translateY(-80vh);
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
  transform: translateY(-80vh);
  opacity: 0;
}
.prose h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.prose h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 2rem;
}
.prose ol, .prose ul {
  margin-left: 1.5rem;
  font-size: 1.1em;
  line-height: 1.7;
}
.prose li {
  font-weight: 500;
  margin-bottom: 0.5em;
}
.prose strong {
  font-weight: 600;
}
</style> 