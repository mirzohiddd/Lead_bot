<script setup>
// Inline YouTube player: video aynan bosilgan kartaning o'zida ochiladi (yangi tab yoki modal yo'q).
// - Sahifa ochilganda hech qanday iframe yuklanmaydi — faqat thumbnail.
// - Bir vaqtda faqat bitta iframe bor: yangi video ochilsa, oldingisi o'chiriladi (to'xtaydi).
// - Shorts (vertikal) — 9:16, oddiy video — 16:9. Format haqiqiy thumbnail bo'yicha aniqlanadi:
//   Shorts bo'lmagan video hech qachon /shorts/ havolasiga aylantirilmaydi.
//   content.js da video uchun format: 'short' | 'video' qilib qo'lda ham berish mumkin.
// - Har bir video ostida «Тўлиқ видеони YouTube'да кўриш» havolasi doim ko'rinadi.
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  videos: { type: Array, required: true } // [{ id, title, format? }]
})

const track = ref(null)
const playing = ref(-1)
const activeDot = ref(0)

// Har bir video formati: 'short' | 'video' | 'auto' (aniqlanmoqda)
const formats = reactive(props.videos.map((v) => v.format || 'auto'))
const thumbs = reactive(
  props.videos.map((v) =>
    v.format === 'video'
      ? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`
      : // Vertikal thumbnail faqat Shorts uchun mavjud — shu orqali formatni aniqlaymiz
        `https://i.ytimg.com/vi/${v.id}/oardefault.jpg`
  )
)

function asRegular(i) {
  formats[i] = 'video'
  const url = `https://i.ytimg.com/vi/${props.videos[i].id}/hqdefault.jpg`
  if (thumbs[i] !== url) thumbs[i] = url
}

function onThumbLoad(e, i) {
  if (formats[i] !== 'auto') return
  const { naturalWidth: w, naturalHeight: h } = e.target
  // YouTube mavjud bo'lmagan rasm o'rniga 120x90 "bo'sh" rasm qaytaradi
  if (h > w && w > 120) formats[i] = 'short'
  else asRegular(i)
}

function onThumbError(i) {
  if (formats[i] === 'auto' || formats[i] === 'short') asRegular(i)
}

const embedUrl = (id) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1`
const watchUrl = (v, i) =>
  formats[i] === 'short' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`

function play(i) {
  playing.value = i // oldingi iframe avtomatik o'chiriladi → video to'xtaydi
}

/* ---- Nuqtalar (scroll bo'yicha), requestAnimationFrame bilan cheklangan ---- */
let raf = 0
function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const el = track.value
    if (!el) return
    const cards = el.children
    const x = el.scrollLeft + 1
    let idx = 0
    for (let i = 0; i < props.videos.length; i++) {
      if (cards[i] && cards[i].offsetLeft - el.offsetLeft - 16 <= x) idx = i
    }
    activeDot.value = idx
  })
}

function goTo(i) {
  const el = track.value
  const card = el?.children[i]
  if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: 'smooth' })
}

onMounted(() => track.value?.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="vc">
    <div ref="track" class="vtrack">
      <div
        v-for="(v, i) in videos"
        :key="v.id"
        class="vid"
        :class="formats[i] === 'short' ? 'vid--short' : 'vid--wide'"
      >
        <div class="vid__frame">
          <iframe
            v-if="playing === i"
            :src="embedUrl(v.id)"
            :title="v.title"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
          <button
            v-else
            :id="`video_play_${i + 1}`"
            :data-cta="`video_play_${i + 1}`"
            type="button"
            class="vid__btn"
            :aria-label="`${v.title} — кўриш`"
            @click="play(i)"
          >
            <img
              :src="thumbs[i]"
              :alt="v.title"
              loading="lazy"
              decoding="async"
              width="480"
              height="360"
              @load="onThumbLoad($event, i)"
              @error="onThumbError(i)"
            />
            <span class="vid__play"><AppIcon name="play" :size="26" /></span>
          </button>
        </div>
        <div class="vid__meta">
          <span class="vid__title">{{ v.title }}</span>
          <a
            :id="`video_youtube_${i + 1}`"
            :data-cta="`video_youtube_${i + 1}`"
            class="vid__yt"
            :href="watchUrl(v, i)"
            target="_blank"
            rel="noopener"
          >
            <AppIcon name="youtube" :size="16" /> Тўлиқ видеони YouTube'да кўриш
          </a>
        </div>
      </div>
    </div>

    <div class="vdots">
      <button
        v-for="(v, i) in videos"
        :key="v.id"
        type="button"
        :class="{ on: activeDot === i }"
        :aria-label="`${i + 1}-видео`"
        @click="goTo(i)"
      ></button>
    </div>
  </div>
</template>

<style scoped>
.vtrack {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  padding: 4px var(--pad) 10px;
  scroll-padding: 0 var(--pad);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-x pan-y;
}
.vtrack::-webkit-scrollbar {
  display: none;
}
.vtrack::after {
  content: '';
  flex: 0 0 4px;
}

.vid {
  flex: 0 0 78%;
  scroll-snap-align: start;
  color: #fff;
}
.vid--short {
  flex-basis: 60%;
}

.vid__frame {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 14px;
  overflow: hidden;
  background: #1c0409;
  border: 2px solid rgba(245, 220, 154, 0.35);
}
.vid--short .vid__frame {
  aspect-ratio: 9 / 16;
}

.vid__frame iframe,
.vid__btn {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.vid__btn {
  display: block;
  padding: 0;
  background: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.vid__btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vid__play {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--grad-gold);
  color: var(--bordo-deep);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s var(--ease);
}
.vid__btn:active .vid__play {
  transform: scale(0.92);
}
.vid__play svg {
  margin-left: 3px;
}

.vid__meta {
  display: grid;
  gap: 4px;
  margin-top: 8px;
}
.vid__title {
  font-weight: 700;
  font-size: 16px;
}
.vid__yt {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  font-size: 15px;
  font-weight: 600;
  color: var(--gold-light);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.vdots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
}
.vdots button {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.3);
  transition: width 0.3s, background 0.3s;
}
.vdots button.on {
  width: 24px;
  background: var(--gold-light);
}
</style>