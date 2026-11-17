<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from './components/AppIcon.vue'
import ProductArt from './components/ProductArt.vue'
import AccordionList from './components/AccordionList.vue'
import OrderForm from './components/OrderForm.vue'
import BaseModal from './components/BaseModal.vue'
import logo from './assets/gepomer-logo.webp'
import * as C from './data/content.js'

/* ---------- Smooth scroll ---------- */
function goTo(id) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: reduce ? 'auto' : 'smooth' })
}
const toForm = () => goTo('forma')

/* ---------- Alomatlar (checkbox) ---------- */
const checked = ref([])
const checkedCount = computed(() => checked.value.length)

/* ---------- Video ---------- */
const video = reactive({ open: false, id: '', title: '' })
const openVideo = (v) => Object.assign(video, { open: true, id: v.id, title: v.title })
const videoSrc = computed(
  () => `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0&playsinline=1&modestbranding=1`
)
const track = ref(null)
const activeVideo = ref(0)
function onTrackScroll() {
  const el = track.value
  if (!el) return
  const card = el.querySelector('.vid')
  const step = card ? card.offsetWidth + 12 : 260
  activeVideo.value = Math.min(C.videos.length - 1, Math.round(el.scrollLeft / step))
}
function scrollVideos(i) {
  const el = track.value
  const card = el?.querySelector('.vid')
  if (card) el.scrollTo({ left: i * (card.offsetWidth + 12), behavior: 'smooth' })
}

/* ---------- Muvaffaqiyat ---------- */
const success = reactive({ open: false, name: '' })
const onSuccess = (name) => Object.assign(success, { open: true, name })

/* ---------- Pastki sticky CTA ---------- */
const showSticky = ref(false)
let formVisible = false
let io
function updateSticky() {
  showSticky.value = window.scrollY > 600 && !formVisible
}
onMounted(() => {
  window.addEventListener('scroll', updateSticky, { passive: true })
  io = new IntersectionObserver(
    ([e]) => {
      formVisible = e.isIntersecting
      updateSticky()
    },
    { threshold: 0.1 }
  )
  io.observe(document.getElementById('forma'))
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateSticky)
  io?.disconnect()
})

const year = new Date().getFullYear()
</script>

<template>
  <div class="page">
    <a href="#asosiy" class="skip">Asosiy mazmunga o'tish</a>

    <!-- ===== 0. Ustki panel ===== -->
    <div class="topbar">
      <span v-for="b in C.topBadges" :key="b"><AppIcon name="check" :size="14" :stroke="2.4" /> {{ b }}</span>
    </div>

    <header class="head">
      <img :src="logo" alt="GEPOMER" width="140" height="34" />
      <a :href="C.contacts.phoneHref" class="head__call" aria-label="Qo'ng'iroq qilish">
        <AppIcon name="phone" :size="18" />
      </a>
    </header>

    <main id="asosiy">
      <!-- ===== 1. HERO ===== -->
      <section class="hero">
        <span class="hero__kicker"><AppIcon name="leaf" :size="15" /> {{ C.hero.kicker }}</span>
        <h1 class="hero__title">{{ C.hero.title }}</h1>
        <p class="hero__text">{{ C.hero.text }}</p>

        <div class="hero__visual">
          <img
            class="hero__photo"
            :src="C.images.complexImg"
            alt="GEPOMER Complex — quti va paketchalar"
            width="720"
            height="960"
            fetchpriority="high"
          />
          <div class="hero__thumbs">
            <img :src="C.images.pasteSm" alt="GEPOMER Pasta" width="300" height="450" />
            <img :src="C.images.syrupSm" alt="GEPOMER Sirop" width="300" height="450" />
          </div>
          <span class="hero__chip hero__chip--1">40+ giyoh</span>
          <span class="hero__chip hero__chip--2">100% tabiiy</span>
        </div>

        <p class="hero__text2">{{ C.hero.text2 }}</p>

        <div class="hero__btns">
          <button class="btn btn--primary btn--full pulse" type="button" @click="toForm">
            {{ C.hero.ctaPrimary }} <AppIcon name="arrowRight" :size="18" :stroke="2.4" />
          </button>
          <button class="btn btn--outline btn--full" type="button" @click="goTo('xavf')">
            {{ C.hero.ctaSecondary }}
          </button>
        </div>
      </section>

      <!-- ===== 2. XAVFLAR — accordion ===== -->
      <section id="xavf" class="sec sec--white">
        <h2 class="sec__title" v-reveal>{{ C.risks.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.risks.lead }}</p>
        <AccordionList :items="C.risks.items" id-prefix="risk" :initial="0" />
        <p class="sec__foot" v-reveal>{{ C.risks.footer }}</p>
      </section>

      <!-- ===== 3. STATISTIKA + MUTAXASSIS ===== -->
      <section class="sec sec--dark">
        <h2 class="sec__title" v-reveal>{{ C.stats.title }}</h2>
        <div class="stats">
          <div v-for="(s, i) in C.stats.items" :key="s.value" class="stat" v-reveal="i * 80">
            <strong>{{ s.value }}</strong>
            <p>{{ s.label }}</p>
            <small>Manba: {{ s.source }}</small>
          </div>
        </div>
        <p class="stats__note" v-reveal>{{ C.stats.note }}</p>

        <div class="expert" :class="{ ph: C.expert.placeholder }" v-reveal>
          <div class="expert__top">
            <div class="expert__photo">
              <img v-if="C.expert.photo" :src="C.expert.photo" :alt="C.expert.name" />
              <AppIcon v-else name="user" :size="34" />
            </div>
            <div>
              <span class="expert__label">Mutaxassis fikri</span>
              <strong>{{ C.expert.name }}</strong>
              <small>{{ C.expert.role }}</small>
            </div>
          </div>
          <blockquote>
            <AppIcon name="quote" :size="22" />
            <p :class="{ 'ph-text': C.expert.placeholder }">{{ C.expert.quote }}</p>
          </blockquote>
        </div>

        <p class="proverb" v-reveal>«{{ C.proverb }}»</p>
      </section>

      <!-- ===== 4. ALOMATLAR — checkbox ===== -->
      <section id="alomatlar" class="sec">
        <h2 class="sec__title" v-reveal>{{ C.symptoms.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.symptoms.lead }}</p>

        <div class="checks" role="group" aria-label="Belgilar ro'yxati">
          <label v-for="s in C.symptoms.items" :key="s" class="chk" :class="{ on: checked.includes(s) }">
            <input v-model="checked" type="checkbox" :value="s" />
            <span class="chk__box"><AppIcon name="check" :size="16" :stroke="3" /></span>
            <span class="chk__text">{{ s }}</span>
          </label>
        </div>

        <div class="checks__result" :class="{ active: checkedCount > 0 }" aria-live="polite">
          <div class="checks__count">
            <strong>{{ checkedCount }}</strong> / {{ C.symptoms.items.length }}
          </div>
          <p>{{ checkedCount ? C.symptoms.resultSome : C.symptoms.resultNone }}</p>
          <button v-if="checkedCount" class="btn btn--primary btn--full" type="button" @click="toForm">
            Bepul maslahat olish
          </button>
        </div>

        <div class="emergency" v-reveal>
          <AppIcon name="alert" :size="22" />
          <p>{{ C.symptoms.emergency }}</p>
        </div>
      </section>

      <!-- ===== 5. RIVOJLANISH BOSQICHLARI ===== -->
      <section class="sec sec--white">
        <h2 class="sec__title" v-reveal>{{ C.stages.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.stages.lead }}</p>
        <ol class="steps">
          <li v-for="(s, i) in C.stages.items" :key="s.title" class="step" v-reveal="i * 60">
            <span class="step__n" :style="{ '--lvl': i }">{{ i + 1 }}</span>
            <div class="card step__card">
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </div>
          </li>
        </ol>
        <p class="sec__foot" v-reveal>{{ C.stages.footer }}</p>
      </section>

      <!-- ===== 6. MAHSULOT ===== -->
      <section id="mahsulot" class="sec sec--cream2">
        <h2 class="sec__title" v-reveal>{{ C.productIntro.title }}</h2>
        <div class="prod-strip" v-reveal>
          <figure v-for="p in C.products" :key="p.id">
            <img :src="p.image" :alt="p.name" loading="lazy" width="300" height="450" />
            <figcaption>{{ p.name.replace('Gepomer ', '') }}</figcaption>
          </figure>
        </div>
        <p class="sec__lead" v-reveal>{{ C.productIntro.text }}</p>
        <ul class="ticks">
          <li v-for="b in C.productIntro.bullets" :key="b" v-reveal>
            <span><AppIcon name="check" :size="16" :stroke="2.6" /></span>{{ b }}
          </li>
        </ul>
        <div class="badges">
          <span v-for="b in C.productIntro.badges" :key="b">{{ b }}</span>
        </div>

        <h3 class="sub">Mahsulotlar liniyasi</h3>
        <div class="products">
          <article v-for="p in C.products" :key="p.id" class="card prod" v-reveal>
            <div class="prod__img">
              <img v-if="p.image" :src="p.image" :alt="p.name" loading="lazy" />
              <ProductArt v-else :variant="p.art" />
            </div>
            <div class="prod__body">
              <h4>{{ p.name }}</h4>
              <p>{{ p.text }}</p>
              <div class="prod__tags"><span v-for="t in p.tags" :key="t">{{ t }}</span></div>
            </div>
          </article>
        </div>

        <h3 class="sub">{{ C.ingredients.title }}</h3>
        <p class="sec__lead">{{ C.ingredients.lead }}</p>
        <div class="ingr">
          <div v-for="(g, i) in C.ingredients.items" :key="i" class="ingr__item ph">
            <span class="ingr__ico"><AppIcon name="leaf" :size="18" /></span>
            <strong class="ph-text">{{ g.name }}</strong>
            <small class="ph-text">{{ g.text }}</small>
          </div>
        </div>

        <button class="btn btn--primary btn--full mt" type="button" @click="toForm">Buyurtma berish</button>
      </section>

      <!-- ===== 7. KIMLAR UCHUN + QO'LLASH ===== -->
      <section class="sec sec--white">
        <h2 class="sec__title" v-reveal>{{ C.audience.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.audience.lead }}</p>
        <ul class="who">
          <li v-for="a in C.audience.items" :key="a" class="card" v-reveal>
            <span><AppIcon name="users" :size="18" /></span>{{ a }}
          </li>
        </ul>

        <h3 class="sub">{{ C.usage.title }}</h3>
        <div class="card usage" v-reveal>
          <div v-for="r in C.usage.rows" :key="r.label" class="usage__row">
            <span>{{ r.label }}</span>
            <strong class="ph-text">{{ r.value }}</strong>
          </div>
        </div>
        <ul class="warns">
          <li v-for="w in C.usage.warnings" :key="w"><AppIcon name="info" :size="18" />{{ w }}</li>
        </ul>
      </section>

      <!-- ===== 8. VIDEO SHARHLAR ===== -->
      <section id="videolar" class="sec sec--dark sec--videos">
        <h2 class="sec__title" v-reveal>Video <em>sharhlar</em></h2>
        <p class="sec__lead">Videoni ko'rish uchun ustiga bosing</p>
        <div ref="track" class="vtrack" @scroll.passive="onTrackScroll">
          <button
            v-for="v in C.videos"
            :key="v.id"
            type="button"
            class="vid"
            :aria-label="`${v.title} — ko'rish`"
            @click="openVideo(v)"
          >
            <span class="vid__thumb">
              <img :src="`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`" :alt="v.title" loading="lazy" width="480" height="360" />
              <span class="vid__play"><AppIcon name="play" :size="26" /></span>
            </span>
            <span class="vid__title">{{ v.title }}</span>
          </button>
        </div>
        <div class="vdots">
          <button
            v-for="(v, i) in C.videos"
            :key="v.id"
            type="button"
            :class="{ on: activeVideo === i }"
            :aria-label="`${i + 1}-video`"
            @click="scrollVideos(i)"
          ></button>
        </div>
      </section>

      <!-- ===== 9. BUYURTMA FORMASI ===== -->
      <section id="forma" class="sec order">
        <h2 class="sec__title" v-reveal>{{ C.order.title }}</h2>
        <ol class="osteps">
          <li v-for="(s, i) in C.order.steps" :key="s.title" v-reveal="i * 70">
            <span class="osteps__n">{{ i + 1 }}</span>
            <div>
              <strong>{{ s.title }}</strong>
              <p :class="{ 'ph-text': s.text.startsWith('[') }">{{ s.text }}</p>
            </div>
          </li>
        </ol>

        <div class="form-card">
          <div class="form-card__head">
            <img :src="logo" alt="" width="120" height="29" />
            <h3>{{ C.order.formTitle }}</h3>
            <p>{{ C.order.formLead }}</p>
          </div>
          <OrderForm @success="onSuccess" />
          <ul class="trust">
            <li v-for="t in C.order.trust" :key="t"><AppIcon name="check" :size="15" :stroke="2.6" /> {{ t }}</li>
          </ul>
        </div>
      </section>

      <!-- ===== 10a. MIJOZLAR FIKRI ===== -->
      <section class="sec sec--white">
        <h2 class="sec__title" v-reveal>{{ C.reviews.title }}</h2>
        <div class="reviews">
          <article v-for="(r, i) in C.reviews.items" :key="i" class="review" :class="{ ph: r.placeholder }" v-reveal>
            <div class="review__head">
              <span class="review__ava"><AppIcon name="user" :size="20" /></span>
              <div>
                <strong class="ph-text">{{ r.name }}</strong>
                <small class="ph-text">{{ r.city }}</small>
              </div>
            </div>
            <p class="ph-text">{{ r.text }}</p>
          </article>
        </div>
        <p class="reviews__note">{{ C.reviews.note }}</p>
        <button class="btn btn--outline btn--full" type="button" @click="goTo('videolar')">Video sharhlarni ko'rish</button>
      </section>

      <!-- ===== 10b. FAQ ===== -->
      <section id="faq" class="sec">
        <h2 class="sec__title" v-reveal>Ko'p beriladigan savollar</h2>
        <div class="mt-sm">
          <AccordionList :items="C.faq" id-prefix="faq" numbered />
        </div>
      </section>

      <!-- ===== 10c. YAKUNIY CTA ===== -->
      <section class="sec final">
        <div class="final__card" v-reveal>
          <div class="final__img ph">
            <AppIcon name="image" :size="34" />
            <span>[Oila fotosurati — litsenziyali rasm qo'ying]</span>
          </div>
          <div class="final__body">
            <AppIcon name="heart" :size="28" class="final__heart" />
            <h2>{{ C.finalCta.title }}</h2>
            <p>{{ C.finalCta.text }}</p>
            <button class="btn btn--gold btn--full pulse" type="button" @click="toForm">{{ C.finalCta.button }}</button>
          </div>
        </div>
        <p class="disclaimer"><AppIcon name="info" :size="16" /> {{ C.disclaimer }}</p>
      </section>
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="foot">
      <img :src="logo" alt="GEPOMER" width="130" height="31" loading="lazy" />
      <nav class="foot__nav" aria-label="Pastki menyu">
        <a href="#mahsulot" @click.prevent="goTo('mahsulot')">Mahsulot</a>
        <a href="#forma" @click.prevent="goTo('forma')">Buyurtma</a>
        <a href="#alomatlar" @click.prevent="goTo('alomatlar')">Belgilar</a>
        <a href="#faq" @click.prevent="goTo('faq')">Savollar</a>
      </nav>
      <div class="foot__soc">
        <a :href="C.contacts.phoneHref"><AppIcon name="phone" :size="16" /> {{ C.contacts.phone }}</a>
        <a :href="C.contacts.telegram" target="_blank" rel="noopener"><AppIcon name="telegram" :size="16" /> t.me/jigar_kasalligi</a>
        <a :href="C.contacts.instagram" target="_blank" rel="noopener"><AppIcon name="instagram" :size="16" /> {{ C.contacts.instagramHandle }}</a>
        <div>
          <a :href="C.contacts.telegram" target="_blank" rel="noopener" aria-label="Telegram"><AppIcon name="telegram" :size="20" /></a>
          <a :href="C.contacts.instagram" target="_blank" rel="noopener" aria-label="Instagram"><AppIcon name="instagram" :size="20" /></a>
          <a :href="C.contacts.youtube" target="_blank" rel="noopener" aria-label="YouTube"><AppIcon name="youtube" :size="20" /></a>
        </div>
      </div>
      <details class="foot__src">
        <summary>Statistika manbalari</summary>
        <ul><li v-for="s in C.sources" :key="s">{{ s }}</li></ul>
      </details>
      <a href="#" class="foot__privacy" @click.prevent>Maxfiylik siyosati [PLACEHOLDER]</a>
      <small>© {{ year }} GEPOMER. Barcha huquqlar himoyalangan.</small>
    </footer>

    <!-- ===== Pastki sticky CTA ===== -->
    <Transition name="sticky">
      <div v-show="showSticky" class="sticky">
        <a :href="C.contacts.phoneHref" class="sticky__call" aria-label="Qo'ng'iroq qilish"><AppIcon name="phone" :size="20" /></a>
        <button class="btn btn--primary" type="button" @click="toForm">Buyurtma berish</button>
      </div>
    </Transition>

    <!-- ===== Modallar ===== -->
    <BaseModal :open="video.open" :label="video.title" size="video" @close="video.open = false">
      <div class="vframe">
        <iframe
          v-if="video.open"
          :src="videoSrc"
          :title="video.title"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </BaseModal>

    <BaseModal :open="success.open" label="Ariza qabul qilindi" @close="success.open = false">
      <div class="ok">
        <div class="ok__icon"><AppIcon name="check" :size="44" :stroke="2.2" /></div>
        <h2>Rahmat, {{ success.name }}!</h2>
        <p>Arizangiz qabul qilindi! Tez orada siz bilan bog'lanamiz.</p>
        <button class="btn btn--primary btn--full" type="button" @click="success.open = false">Yaxshi</button>
      </div>
    </BaseModal>
  </div>
</template>

<style scoped>
.skip {
  position: absolute;
  left: -999px;
  top: 0;
  z-index: 99;
  padding: 10px 14px;
  background: var(--bordo);
  color: #fff;
}
.skip:focus {
  left: 8px;
}

/* ---- Topbar / header ---- */
.topbar {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  padding: 8px 10px;
  background: var(--bordo-deep);
  color: var(--gold-light);
  font-size: 11.5px;
  font-weight: 700;
}
.topbar span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px var(--pad);
  background: var(--bordo-dark);
}
.head img {
  height: 30px;
  width: auto;
  border-radius: 5px;
}
.head__call {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--grad-gold);
  color: var(--bordo-deep);
}

/* ---- Hero ---- */
.hero {
  padding: 26px var(--pad) 36px;
  text-align: center;
  background: linear-gradient(180deg, var(--white) 0%, var(--cream) 100%);
}
.hero__kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--bordo-soft);
  color: var(--bordo);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.hero__title {
  margin-top: 14px;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 900;
  color: var(--bordo-dark);
  letter-spacing: -0.015em;
}
.hero__text {
  margin-top: 12px;
  font-size: 15px;
  color: var(--text-2);
}
.hero__visual {
  position: relative;
  margin: 18px 0 64px;
}
.hero__photo {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 50% 45%;
  border-radius: 20px;
  box-shadow: 0 18px 40px -16px rgba(44, 6, 16, 0.5);
  border: 3px solid #fff;
}
.hero__thumbs {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -50px;
  display: flex;
  justify-content: space-between;
  padding: 0 12px;
  pointer-events: none;
}
.hero__thumbs img {
  width: 92px;
  height: auto;
  object-position: 50% 65%;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 14px;
  border: 3px solid #fff;
  box-shadow: var(--shadow-pop);
  animation: float 5s ease-in-out infinite;
}
.hero__thumbs img:last-child {
  animation-delay: -2.5s;
}
.hero__chip {
  position: absolute;
  z-index: 4;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--bordo);
  color: #fff;
  font-size: 11.5px;
  font-weight: 800;
  box-shadow: var(--shadow-pop);
}
.hero__chip--1 {
  top: 12px;
  left: 12px;
}
.hero__chip--2 {
  top: 12px;
  right: 12px;
  background: var(--grad-gold);
  color: var(--bordo-deep);
}
.hero__text2 {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--bordo-dark);
}
.hero__btns {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

/* ---- Statistika ---- */
.stats {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}
.stat {
  padding: 16px;
  border-radius: var(--r-card);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(245, 220, 154, 0.25);
  text-align: center;
}
.stat strong {
  display: block;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  background: var(--grad-gold);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat p {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}
.stat small {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
}
.stats__note {
  margin-top: 14px;
  text-align: center;
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.8);
}
.expert {
  margin-top: 22px;
  padding: 16px;
  border-radius: var(--r-card);
  background: #fff;
  color: var(--text);
}
.expert__top {
  display: flex;
  gap: 12px;
  align-items: center;
}
.expert__photo {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: var(--bordo-soft);
  color: var(--bordo);
  border: 2px solid var(--gold);
}
.expert__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.expert__label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--gold-dark);
}
.expert strong {
  display: block;
  color: var(--bordo-dark);
}
.expert small {
  color: var(--text-2);
}
.expert blockquote {
  margin: 14px 0 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--line);
  display: flex;
  gap: 10px;
  font-size: 14px;
}
.expert blockquote svg {
  flex-shrink: 0;
  color: var(--gold);
}
.proverb {
  margin-top: 20px;
  text-align: center;
  font-style: italic;
  font-weight: 600;
  color: var(--gold-light);
}

/* ---- Checkbox ---- */
.checks {
  display: grid;
  gap: 8px;
}
.chk {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 14px;
  border-radius: 12px;
  background: var(--white);
  border: 1.5px solid var(--line);
  cursor: pointer;
  font-weight: 600;
  font-size: 14.5px;
  transition: border-color 0.2s, background 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.chk input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.chk__box {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 7px;
  border: 2px solid #cdbca3;
  display: grid;
  place-items: center;
  color: transparent;
  transition: all 0.2s;
}
.chk.on {
  border-color: var(--bordo);
  background: var(--bordo-soft);
}
.chk.on .chk__box {
  background: var(--bordo);
  border-color: var(--bordo);
  color: #fff;
}
.chk:has(input:focus-visible) {
  outline: 3px solid var(--gold);
}
.checks__result {
  margin-top: 14px;
  padding: 16px;
  border-radius: var(--r-card);
  background: var(--white);
  border: 1.5px dashed var(--line);
  text-align: center;
  display: grid;
  gap: 10px;
  transition: border-color 0.3s, background 0.3s;
}
.checks__result.active {
  border-style: solid;
  border-color: var(--gold);
  background: #fffaf0;
}
.checks__count {
  font-size: 14px;
  color: var(--text-2);
}
.checks__count strong {
  font-size: 30px;
  font-weight: 900;
  color: var(--bordo);
}
.checks__result p {
  font-size: 14px;
  font-weight: 600;
  color: var(--bordo-dark);
}
.emergency {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fdecec;
  color: #8a1f1f;
  font-size: 13.5px;
  font-weight: 600;
}
.emergency svg {
  flex-shrink: 0;
}

/* ---- Bosqichlar ---- */
.steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
  position: relative;
}
.steps::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: linear-gradient(var(--gold), var(--bordo));
}
.step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  position: relative;
}
.step__n {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 900;
  color: #fff;
  background: color-mix(in srgb, var(--bordo) calc(var(--lvl) * 33%), var(--gold));
  box-shadow: 0 0 0 4px var(--white);
}
.step__card {
  flex: 1;
}
.step__card h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--bordo-dark);
}
.step__card p {
  margin-top: 4px;
  font-size: 14px;
  color: var(--text-2);
}

/* ---- Mahsulot ---- */
.prod-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 18px 0 4px;
}
.prod-strip figure {
  margin: 0;
  text-align: center;
}
.prod-strip img {
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  border-radius: 14px;
  border: 2px solid #fff;
  box-shadow: var(--shadow-pop);
}
.prod-strip figcaption {
  margin-top: 6px;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--bordo-dark);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ticks {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.ticks li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 12px;
  background: var(--white);
  font-weight: 600;
  font-size: 14px;
}
.ticks span {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bordo);
  color: #fff;
}
.badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}
.badges span {
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--grad-gold);
  color: var(--bordo-deep);
  font-size: 12.5px;
  font-weight: 800;
}
.sub {
  margin: 30px 0 14px;
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: var(--bordo-dark);
}
.sub + .sec__lead {
  margin-top: -6px;
}
.products {
  display: grid;
  gap: 12px;
}
.prod {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
}
.prod__img {
  width: 100px;
  height: 140px;
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  background: var(--cream-2);
}
.prod__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.prod h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: var(--bordo-dark);
}
.prod p {
  margin-top: 4px;
  font-size: 13px;
  color: var(--text-2);
}
.prod__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}
.prod__tags span {
  padding: 3px 8px;
  border-radius: 999px;
  background: var(--bordo-soft);
  color: var(--bordo);
  font-size: 11px;
  font-weight: 700;
}
.ingr {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.ingr__item {
  display: grid;
  gap: 2px;
  padding: 12px;
  border-radius: 12px;
}
.ingr__ico {
  color: var(--gold-dark);
  margin-bottom: 4px;
}
.ingr__item strong {
  font-size: 13.5px;
}
.ingr__item small {
  font-size: 11.5px;
}
.mt {
  margin-top: 22px;
}
.mt-sm {
  margin-top: 18px;
}

/* ---- Kimlar uchun ---- */
.who {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 8px;
}
.who li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  font-weight: 600;
  font-size: 14px;
}
.who li span {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--bordo-soft);
  color: var(--bordo);
}
.usage {
  padding: 4px 16px;
}
.usage__row {
  display: grid;
  gap: 2px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.usage__row:last-child {
  border-bottom: 0;
}
.usage__row span {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--gold-dark);
}
.usage__row strong {
  font-size: 14px;
}
.warns {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  display: grid;
  gap: 8px;
}
.warns li {
  display: flex;
  gap: 10px;
  padding: 11px 12px;
  border-radius: 12px;
  background: #fff6e4;
  color: var(--bordo-dark);
  font-size: 13.5px;
  font-weight: 600;
}
.warns svg {
  flex-shrink: 0;
  color: var(--gold-dark);
}

/* ---- Videolar ---- */
.sec--videos {
  padding-left: 0;
  padding-right: 0;
}
.sec--videos .sec__title,
.sec--videos .sec__lead {
  padding: 0 var(--pad);
}
.vtrack {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  padding: 4px var(--pad) 10px;
  scroll-padding: 0 var(--pad);
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.vtrack::-webkit-scrollbar {
  display: none;
}
.vtrack::after {
  content: '';
  flex: 0 0 4px;
}
.vid {
  flex: 0 0 72%;
  scroll-snap-align: start;
  padding: 0;
  border: 0;
  background: none;
  color: #fff;
  text-align: left;
}
.vid__thumb {
  position: relative;
  display: block;
  aspect-ratio: 16 / 10;
  border-radius: 14px;
  overflow: hidden;
  background: #1c0409;
  border: 2px solid rgba(245, 220, 154, 0.35);
}
.vid__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.vid__play {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 56px;
  height: 56px;
  margin: -28px 0 0 -28px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--grad-gold);
  color: var(--bordo-deep);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
}
.vid__play svg {
  margin-left: 3px;
}
.vid__title {
  display: block;
  margin-top: 8px;
  font-weight: 700;
  font-size: 14px;
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
.vframe {
  position: relative;
  aspect-ratio: 16 / 9;
}
.vframe iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

/* ---- Buyurtma ---- */
.order {
  background: linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%);
}
.osteps {
  list-style: none;
  padding: 0;
  margin: 20px 0;
  display: grid;
  gap: 10px;
}
.osteps li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--white);
  border: 1px solid var(--line);
}
.osteps__n {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bordo);
  color: #fff;
  font-weight: 900;
}
.osteps strong {
  display: block;
  color: var(--bordo-dark);
  font-size: 14.5px;
}
.osteps p {
  font-size: 13px;
  color: var(--text-2);
}
.form-card {
  padding: 20px 16px;
  border-radius: 20px;
  background: var(--white);
  border: 2px solid var(--gold);
  box-shadow: 0 18px 40px -18px rgba(74, 11, 24, 0.45);
}
.form-card__head {
  text-align: center;
  margin-bottom: 16px;
}
.form-card__head img {
  height: 26px;
  width: auto;
  margin: 0 auto 10px;
  border-radius: 4px;
}
.form-card__head h3 {
  font-size: 22px;
  font-weight: 900;
  color: var(--bordo-dark);
}
.form-card__head p {
  margin-top: 4px;
  font-size: 13.5px;
  color: var(--text-2);
}
.trust {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: grid;
  gap: 6px;
}
.trust li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}
.trust svg {
  color: #2f8f4e;
}

/* ---- Sharhlar ---- */
.reviews {
  display: grid;
  gap: 10px;
  margin: 18px 0 10px;
}
.review {
  padding: 14px;
  border-radius: var(--r-card);
}
.review__head {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}
.review__ava {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--bordo-soft);
  color: var(--bordo);
}
.review strong {
  display: block;
  font-size: 14px;
}
.review small {
  font-size: 12px;
}
.review p {
  font-size: 13.5px;
}
.reviews__note {
  text-align: center;
  font-size: 12px;
  color: var(--text-2);
  margin-bottom: 14px;
}

/* ---- Yakuniy CTA ---- */
.final {
  padding-top: 8px;
}
.final__card {
  border-radius: 20px;
  overflow: hidden;
  background: var(--grad-bordo);
  color: #fff;
  box-shadow: var(--shadow-pop);
}
.final__img {
  height: 190px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 8px;
  text-align: center;
  color: var(--gold-dark);
  font-size: 12.5px;
  font-style: italic;
  border-width: 0 0 1.5px;
  padding: 0 20px;
}
.final__body {
  padding: 22px 18px;
  text-align: center;
}
.final__heart {
  margin: 0 auto 8px;
  color: var(--gold-light);
}
.final__body h2 {
  font-size: 22px;
  font-weight: 900;
}
.final__body p {
  margin: 8px 0 18px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
}
.disclaimer {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-2);
}
.disclaimer svg {
  flex-shrink: 0;
  color: var(--gold-dark);
}

/* ---- Footer ---- */
.foot {
  display: grid;
  gap: 14px;
  justify-items: center;
  text-align: center;
  padding: 28px var(--pad) 100px;
  background: var(--bordo-deep);
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}
.foot img {
  height: 28px;
  width: auto;
  border-radius: 4px;
}
.foot__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
  font-weight: 700;
  color: var(--gold-light);
}
.foot__soc {
  display: grid;
  gap: 10px;
  justify-items: center;
}
.foot__soc > a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #fff;
}
.foot__soc div {
  display: flex;
  gap: 10px;
}
.foot__soc div a {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  border: 1px solid rgba(245, 220, 154, 0.35);
  color: var(--gold-light);
}
.foot__src {
  font-size: 11.5px;
  text-align: left;
  max-width: 100%;
}
.foot__src summary {
  cursor: pointer;
  text-align: center;
}
.foot__src ul {
  padding-left: 18px;
}
.foot__privacy {
  text-decoration: underline;
}

/* ---- Sticky CTA ---- */
.sticky {
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 40;
  width: 100%;
  max-width: var(--page-w);
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid var(--line);
  box-shadow: 0 -8px 24px rgba(44, 6, 16, 0.12);
}
.sticky .btn {
  flex: 1;
}
.sticky__call {
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  border-radius: var(--r-btn);
  display: grid;
  place-items: center;
  background: var(--grad-gold);
  color: var(--bordo-deep);
}
.sticky-enter-active,
.sticky-leave-active {
  transition: transform 0.35s var(--ease), opacity 0.3s;
}
.sticky-enter-from,
.sticky-leave-to {
  transform: translate(-50%, 100%);
  opacity: 0;
}

/* ---- Success ---- */
.ok {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
}
.ok__icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--grad-gold);
  color: var(--bordo-deep);
}
.ok h2 {
  font-size: 24px;
  font-weight: 900;
  color: var(--bordo-dark);
}
.ok p {
  color: var(--text-2);
}
</style>
