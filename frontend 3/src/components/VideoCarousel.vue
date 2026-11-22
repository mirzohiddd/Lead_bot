<script setup>
// Video sharhlar — vertikal (9:16) kartalardan iborat gorizontal carousel.
// - Video aynan bosilgan kartaning ichida ijro etiladi: modal, popup, overlay yoki yangi oyna yo'q.
// - Sahifa ochilganda iframe yuklanmaydi — faqat thumbnail va Play tugmasi.
// - Bir vaqtda faqat bitta iframe bor: boshqa video bosilsa, oldingisi o'chiriladi (to'xtaydi).
// - Carousel ekrandan chiqib ketsa, ijro etilayotgan video ham to'xtatiladi (arzon telefonlarda resurs tejaladi).
// - playsinline=1: iPhone va Instagram ichki brauzerida fullscreen avtomatik ochilmaydi.
// - Video havolalari o'zgarmaydi; Shorts bo'lmagan video /shorts/ havolasiga aylantirilmaydi.
//   Haqiqiy Shorts uchun content.js da format: 'short' deb belgilash mumkin.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  videos: { type: Array, required: true } // [{ id, title, format? }]
})

const root = ref(null)
const track = ref(null)
const playing = ref(-1)
const activeDot = ref(0)

const thumbUrl = (v) => `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`
const embedUrl = (v) =>
  `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&playsinline=1&rel=0&modestbranding=1&controls=1`
const watchUrl = (v) =>
  v.format === 'short' ? `https://www.youtube.com/shorts/${v.id}` : `https://www.youtube.com/watch?v=${v.id}`

function play(i) {
  playing.value = i // oldingi iframe DOM'dan olib tashlanadi → oldingi video to'xtaydi
}

/* ---- Nuqtalar: scroll'ni requestAnimationFrame bilan cheklab hisoblaymiz ---- */
let raf = 0
function stepWidth() {
  const card = track.value?.children[0]
  return card ? card.offsetWidth + 12 : 1
}
function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const el = track.value
    if (!el) return
    activeDot.value = Math.min(props.videos.length - 1, Math.round(el.scrollLeft / stepWidth()))
  })
}
function goTo(i) {
  track.value?.scrollTo({ left: i * stepWidth(), behavior: 'smooth' })
}

/* ---- Ekrandan chiqqanda videoni to'xtatish ---- */
let io = null
onMounted(() => {
  track.value?.addEventListener('scroll', onScroll, { passive: true })
  if ('IntersectionObserver' in window && root.value) {
    io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting && playing.value !== -1) playing.value = -1
    })
    io.observe(root.value)
  }
})
onBeforeUnmount(() => {
  track.value?.removeEventListener('scroll', onScroll)
  if (raf) cancelAnimationFrame(raf)
  io?.disconnect()
})
</script>

<template>
  <div ref="root" class="vc">
    <div ref="track" class="vtrack">
      <article v-for="(v, i) in videos" :key="v.id" class="vid">
        <div class="vid__frame">
          <iframe
            v-if="playing === i"
            :src="embedUrl(v)"
            :title="v.title"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen
            referrerpolicy="strict-origin-when-cross-origin"
          ></iframe>
          <button
            v-else
            :id="`video_play_${i + 1}`"
            :data-cta="`video_play_${i + 1}`"
            type="button"
            class="vid__btn"
            :aria-label="`${v.title} — видеони ижро этиш`"
            @click="play(i)"
          >
            <img :src="thumbUrl(v)" :alt="v.title" loading="lazy" decoding="async" width="480" height="360" />
            <span class="vid__play"><AppIcon name="play" :size="28" /></span>
          </button>
        </div>
        <div class="vid__meta">
          <span class="vid__title">{{ v.title }}</span>
          <a
            :id="`video_youtube_${i + 1}`"
            :data-cta="`video_youtube_${i + 1}`"
            class="vid__yt"
            :href="watchUrl(v)"
            target="_blank"
            rel="noopener"
          >
            <AppIcon name="youtube" :size="16" /> YouTube'да кўриш
          </a>
        </div>
      </article>
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

/* Karta kengligi ~62%: keyingi video karta chetdan ko'rinib turadi */
.vid {
  flex: 0 0 62%;
  max-width: 260px;
  scroll-snap-align: start;
  color: #fff;
}

.vid__frame {
  position: relative;
  aspect-ratio: 9 / 16;
  border-radius: 16px;
  overflow: hidden;
  background: #0a2416;
  border: 2px solid rgba(201, 237, 160, 0.35);
  /* scroll paytida qayta chizishni kamaytiradi */
  contain: layout paint;
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
  width: 64px;
  height: 64px;
  margin: -32px 0 0 -32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--grad-accent);
  color: var(--brand-deep);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s var(--ease);
}
.vid__btn:active .vid__play {
  transform: scale(0.92);
}
.vid__play svg {
  margin-left: 4px;
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
  color: var(--accent-light);
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
  background: var(--accent-light);
}
</style>