<script setup>
import { reactive, ref, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import { validateName, validatePhone } from '../utils/form.js'
import { createOrder, newIdempotencyKey, ApiError } from '../api/orders.js'
import { getUtm } from '../utils/utm.js'
import { trackLead } from '../utils/tracking.js'

const props = defineProps({
  // Agar sahifada mahsulot tanlash bo'lsa: 'complex' | 'paste' | 'syrup'
  product: { type: String, default: '' }
})
const emit = defineEmits(['success'])

const form = reactive({ name: "", phone: "", consent: false, marketing: false, website: '' })
const errors = reactive({ name: '', phone: '', consent: '' })
const touched = reactive({ name: false, phone: false })
const loading = ref(false)
const slow = ref(false) // server uyg'onayotgan bo'lsa (Render cold start) — mijozga tushuntiramiz
let slowTimer = null
const serverError = ref('')

// Bitta ariza uchun bitta kalit: tugma qayta bosilsa yoki tarmoq xatosidan keyin qayta yuborilsa,
// backend bir xil kalitni ko'rib dublikat yaratmaydi. Ma'lumot o'zgarsa — yangi kalit.
let idemKey = newIdempotencyKey()
watch(
  () => [form.name, form.phone],
  () => {
    idemKey = newIdempotencyKey()
    serverError.value = ''
  }
)

// "+998" prefiksi alohida turadi, foydalanuvchi faqat 9 ta raqam kiritadi: 90 123 45 67
function fmt(d) {
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean)
  return p.join(' ')
}
const digits = () => form.phone.replace(/\D/g, '')

function onPhone(e) {
  let d = e.target.value.replace(/\D/g, '')
  if (d.length > 9 && d.startsWith('998')) d = d.slice(3)
  form.phone = fmt(d.slice(0, 9))
  e.target.value = form.phone
  if (touched.phone) errors.phone = validatePhone(digits())
}

function check(f) {
  touched[f] = true
  if (f === 'name') errors.name = validateName(form.name)
  else errors.phone = validatePhone(digits())
}

async function submit() {
  if (loading.value) return // takroriy bosishdan himoya
  serverError.value = ''
  check('name')
  check('phone')
  errors.consent = form.consent ? '' : 'Давом этиш учун розилик белгисини қўйинг'
  if (errors.name || errors.phone || errors.consent) {
    document.getElementById(errors.name ? 'f-name' : errors.phone ? 'f-phone' : 'f-consent')?.focus()
    return
  }

  loading.value = true
  slow.value = false
  slowTimer = setTimeout(() => (slow.value = true), 7000)
  const name = form.name.trim()
  try {
    const response = await createOrder(
      {
        name,
        phone: '+998' + digits(),
        product: props.product || undefined,
        consent: form.consent,
        marketingConsent: form.marketing,
        utm: getUtm(),
        page: window.location.pathname,
        website: form.website // honeypot
      },
      idemKey
    )
    // Lead — faqat backend yangi buyurtmani qabul qilganda va har bir buyurtma uchun bir marta
    trackLead(response)
    emit('success', name)
    form.name = ''
    form.phone = ''
    form.marketing = false
    touched.name = touched.phone = false
    errors.name = errors.phone = ''
    idemKey = newIdempotencyKey()
  } catch (err) {
    if (err instanceof ApiError && err.fields) {
      // Server xato matnlari lotinchada — kirillcha matnlarni frontendda ko'rsatamiz
      errors.name = err.fields.name ? validateName(form.name) || 'Исмни текширинг' : ''
      errors.phone = err.fields.phone ? 'Телефон рақами нотўғри. Формат: +998XXXXXXXXX' : ''
      errors.consent = err.fields.consent ? 'Маълумотларни қайта ишлашга розилик беринг' : ''
      serverError.value = err.fields.product || err.fields._ ? 'Маълумотларни текширинг ва қайта уриниб кўринг.' : ''
    } else {
      serverError.value = err.message || 'Хатолик юз берди. Қайта уриниб кўринг.'
    }
  } finally {
    clearTimeout(slowTimer)
    loading.value = false
    slow.value = false
  }
}
</script>

<template>
  <form class="oform" novalidate :aria-busy="loading" @submit.prevent="submit">
    <!-- Honeypot: odamlarga ko'rinmaydi, botlar to'ldiradi -->
    <div class="oform__hp" aria-hidden="true">
      <label for="f-website">Веб-сайт</label>
      <input id="f-website" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
    </div>

    <label class="oform__label" for="f-name">Исмингиз</label>
    <div class="oform__field" :class="{ err: errors.name }">
      <AppIcon name="user" :size="20" />
      <input
        id="f-name"
        v-model="form.name"
        type="text"
        name="name"
        autocomplete="given-name"
        placeholder="Исмингизни киритинг"
        maxlength="40"
        :disabled="loading"
        :aria-invalid="!!errors.name"
        aria-describedby="f-name-e"
        @blur="check('name')"
        @input="touched.name && check('name')"
      />
    </div>
    <p id="f-name-e" class="oform__err" role="alert">{{ errors.name }}</p>

    <label class="oform__label" for="f-phone">Телефон рақамингиз</label>
    <div class="oform__field oform__field--phone" :class="{ err: errors.phone }">
      <span class="oform__prefix">+998</span>
      <input
        id="f-phone"
        :value="form.phone"
        type="tel"
        name="phone"
        inputmode="numeric"
        autocomplete="tel-national"
        placeholder="90 123 45 67"
        maxlength="16"
        :disabled="loading"
        :aria-invalid="!!errors.phone"
        aria-describedby="f-phone-e"
        @input="onPhone"
        @blur="check('phone')"
      />
    </div>
    <p id="f-phone-e" class="oform__err" role="alert">{{ errors.phone }}</p>

    <label class="oform__check" :class="{ err: errors.consent }">
      <input id="f-consent" v-model="form.consent" type="checkbox" :disabled="loading" @change="errors.consent = ''" />
      <span>Маълумотларим буюртма бўйича мен билан боғланиш учун қайта ишланишига розиман</span>
    </label>
    <p class="oform__err" role="alert">{{ errors.consent }}</p>
    <label class="oform__check">
      <input v-model="form.marketing" type="checkbox" :disabled="loading" />
      <span>Акция ва янгиликлар ҳақида хабар олишга розиман (ихтиёрий)</span>
    </label>

    <p v-if="serverError" class="oform__server" role="alert">
      <AppIcon name="alert" :size="18" />
      <span>{{ serverError }}</span>
    </p>

    <button
      id="submit_order"
      data-cta="submit_order"
      type="submit"
      class="btn btn--primary btn--full oform__btn"
      :disabled="loading"
    >
      <span v-if="loading" class="spin" aria-hidden="true"></span>
      {{ loading ? 'Юборилмоқда...' : 'Буюртма бериш' }}
    </button>
    <p v-if="loading && slow" class="oform__slow" role="status">Сервер уланмоқда, илтимос, саҳифани ёпманг...</p>
  </form>
</template>

<style scoped>
.oform {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  text-align: left;
}

.oform__label {
  font-size: 16px;
  font-weight: 700;
  color: var(--bordo-dark);
  margin: 0 0 6px 2px;
}

.oform__field {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  padding: 0 14px;
  border-radius: var(--r-input);
  background: var(--white);
  border: 1.5px solid var(--line);
  color: var(--gold-dark);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.oform__field:focus-within {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 154, 69, 0.2);
}

.oform__field.err {
  border-color: #c0392b;
}

.oform__field input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
}

.oform__field input::placeholder {
  color: #aa9a9c;
  font-weight: 500;
}

.oform__prefix {
  font-weight: 800;
  font-size: 17px;
  color: var(--bordo-dark);
  padding-right: 10px;
  border-right: 1.5px solid var(--line);
}

.oform__err {
  margin: 5px 2px 0;
  font-size: 14px;
  font-weight: 600;
  color: #c0392b;
}

.oform__err:empty {
  display: none;
}

.oform__label:not(:first-of-type) {
  margin-top: 14px;
}

.oform__hp {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.oform__check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  font-size: 15px;
  line-height: 1.45;
  color: var(--text-2);
  cursor: pointer;
}

.oform__check input {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin: 1px 0 0;
  accent-color: var(--bordo);
}

.oform__check.err span {
  color: #c0392b;
}

.oform__server {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fdecec;
  color: #8a1f1f;
  font-size: 15px;
  font-weight: 600;
}

.oform__server svg {
  flex-shrink: 0;
}

.oform__field input:disabled {
  opacity: 0.7;
}

.oform__slow {
  margin: 10px 0 0;
  text-align: center;
  font-size: 15px;
  color: var(--text-2);
}

.oform__btn {
  margin-top: 18px;
}

.spin {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2.5px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  animation: sp 0.8s linear infinite;
}

@keyframes sp {
  to {
    transform: rotate(360deg);
  }
}
</style>