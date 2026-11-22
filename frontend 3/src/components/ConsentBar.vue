<script setup>
// Faqat VITE_TRACKING_CONSENT=required bo'lganda va foydalanuvchi hali javob bermaganda ko'rinadi.
import { ref } from 'vue'
import { needsConsentPrompt, setTrackingConsent } from '../utils/metaPixel.js'

const visible = ref(needsConsentPrompt())

function answer(granted) {
  setTrackingConsent(granted)
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="consent" role="dialog" aria-live="polite" aria-label="Кузатув розилиги">
    <p>
      Сайт ишини яхшилаш ва реклама самарадорлигини ўлчаш учун cookie ва Meta Pixel'дан фойдаланамиз.
      Исм, телефон ва соғлиқ ҳақидаги маълумотлар Meta'га юборилмайди.
    </p>
    <div class="consent__btns">
      <button id="consent_accept" type="button" class="btn btn--accent" @click="answer(true)">Розиман</button>
      <button id="consent_decline" type="button" class="consent__no" @click="answer(false)">Рад этиш</button>
    </div>
  </div>
</template>

<style scoped>
.consent {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 60;
  width: 100%;
  max-width: var(--page-w);
  transform: translateX(-50%);
  padding: 14px 16px calc(14px + env(safe-area-inset-bottom));
  background: var(--brand-deep);
  color: #fff;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.25);
}

.consent p {
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.88);
}

.consent__btns {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.consent__btns .btn {
  flex: 1;
  min-height: 48px;
  font-size: 16px;
}

.consent__no {
  flex: 0 0 auto;
  padding: 0 16px;
  border: 1.5px solid rgba(201, 237, 160, 0.5);
  border-radius: var(--r-btn);
  background: transparent;
  color: var(--accent-light);
  font-weight: 700;
  font-size: 16px;
}
</style>