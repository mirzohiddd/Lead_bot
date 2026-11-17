<script setup>
import { watch, ref, nextTick, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  label: { type: String, default: 'Oyna' },
  size: { type: String, default: 'md' }, // md | video
  dark: { type: Boolean, default: false }
})
const emit = defineEmits(['close'])

const panel = ref(null)
let lastFocused = null
let openCount = 0

function onKey(e) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'Tab' && panel.value) {
    const f = panel.value.querySelectorAll(
      'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
    )
    if (!f.length) return
    const first = f[0]
    const last = f[f.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

function lock(on) {
  const body = document.body
  const n = Number(body.dataset.modals || 0) + (on ? 1 : -1)
  body.dataset.modals = Math.max(0, n)
  body.classList.toggle('no-scroll', n > 0)
}

watch(
  () => props.open,
  async (v) => {
    if (v) {
      lastFocused = document.activeElement
      lock(true)
      openCount++
      document.addEventListener('keydown', onKey)
      await nextTick()
      const target = panel.value?.querySelector('[autofocus], input, button')
      target?.focus({ preventScroll: true })
    } else if (openCount) {
      lock(false)
      openCount--
      document.removeEventListener('keydown', onKey)
      lastFocused?.focus?.({ preventScroll: true })
    }
  }
)

onBeforeUnmount(() => {
  if (openCount) lock(false)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" role="dialog" aria-modal="true" :aria-label="label" @click.self="emit('close')">
        <div ref="panel" class="modal__panel" :class="[`modal__panel--${size}`, { 'is-dark': dark }]">
          <button class="modal__close" type="button" aria-label="Yopish" @click="emit('close')">
            <AppIcon name="close" :size="22" />
          </button>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  background: rgba(26, 4, 9, 0.72);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.modal__panel {
  position: relative;
  width: 100%;
  max-height: 92vh;
  overflow-y: auto;
  background: var(--cream-50);
  border-radius: 26px 26px 0 0;
  padding: 34px 22px calc(26px + env(safe-area-inset-bottom));
  box-shadow: 0 -10px 60px rgba(0, 0, 0, 0.35);
}

.modal__panel--md {
  max-width: 480px;
}

.modal__panel--video {
  max-width: 960px;
  padding: 0;
  background: #000;
  border-radius: 18px;
  overflow: hidden;
}

.modal__panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--gold-grad);
}

.modal__panel--video::before {
  display: none;
}

.modal__close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 0;
  background: rgba(90, 15, 28, 0.08);
  color: var(--bordo-700);
  transition: background 0.2s, transform 0.2s;
}

.modal__close:hover {
  background: rgba(90, 15, 28, 0.16);
  transform: rotate(90deg);
}

.modal__panel--video .modal__close {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* Video modal mobil qurilmada ham markazda bo'lsin */
.modal:has(.modal__panel--video) {
  align-items: center;
  padding: 16px;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s var(--ease);
}
.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition: transform 0.4s var(--ease), opacity 0.3s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateY(40px);
  opacity: 0;
}

@media (min-width: 640px) {
  .modal {
    align-items: center;
    padding: 24px;
  }
  .modal__panel {
    border-radius: 26px;
    padding: 40px 36px 34px;
  }
  .modal-enter-from .modal__panel,
  .modal-leave-to .modal__panel {
    transform: translateY(20px) scale(0.97);
  }
}
</style>
