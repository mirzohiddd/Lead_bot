<script setup>
import { ref, computed, reactive, onMounted, onBeforeUnmount } from 'vue'
import AppIcon from './components/AppIcon.vue'
import BrandLogo from './components/BrandLogo.vue'
import AccordionList from './components/AccordionList.vue'
import OrderForm from './components/OrderForm.vue'
import BaseModal from './components/BaseModal.vue'
import VideoCarousel from './components/VideoCarousel.vue'
import ConsentBar from './components/ConsentBar.vue'
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

/* ---------- Muvaffaqiyat ---------- */
const success = reactive({ open: false, name: '' })
const onSuccess = (name) => Object.assign(success, { open: true, name })

/* ---------- Pastki sticky CTA ----------
   Scroll listener o'rniga IntersectionObserver: hero ko'rinmay qolganda chiqadi,
   buyurtma formasi ekranda bo'lsa yashirinadi. Scroll paytida JS ishlamaydi. */
const showSticky = ref(false)
let heroVisible = true
let formVisible = false
let io
onMounted(() => {
  const hero = document.querySelector('.hero')
  const form = document.getElementById('forma')
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.target === hero) heroVisible = e.isIntersecting
        if (e.target === form) formVisible = e.isIntersecting
      }
      showSticky.value = !heroVisible && !formVisible
    },
    { threshold: 0 }
  )
  if (hero) io.observe(hero)
  if (form) io.observe(form)
})
onBeforeUnmount(() => io?.disconnect())

const hasPhone = !!C.contacts.phoneHref
const hasSocial = !!(C.contacts.telegram || C.contacts.instagram || C.contacts.youtube)
const year = new Date().getFullYear()
</script>

<template>
  <div class="page">
    <a href="#asosiy" class="skip">Асосий мазмунга ўтиш</a>

    <!-- ===== 0. Ustki panel ===== -->
    <div class="topbar">
      <span v-for="b in C.topBadges" :key="b"><AppIcon name="check" :size="14" :stroke="2.4" /> {{ b }}</span>
    </div>

    <header class="head">
      <BrandLogo />
      <a
        v-if="hasPhone"
        id="cta_header_call"
        data-cta="cta_header_call"
        :href="C.contacts.phoneHref"
        class="head__call"
        aria-label="Қўнғироқ қилиш"
      >
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
            :src="C.images.soapImg"
            alt="DERMOLIFE complex — табиий совун"
            width="560"
            height="700"
            fetchpriority="high"
            decoding="async"
          />
          <div class="hero__thumbs">
            <img :src="C.images.creamSm" alt="Dermo Complex крем" width="300" height="375" decoding="async" />
            <img :src="C.images.detoxSm" alt="Dermo Detox сироп" width="300" height="375" decoding="async" />
          </div>
          <span class="hero__chip hero__chip--1">{{ C.hero.chips[0] }}</span>
          <span class="hero__chip hero__chip--2">{{ C.hero.chips[1] }}</span>
        </div>

        <p class="hero__text2">{{ C.hero.text2 }}</p>

        <div class="hero__btns">
          <button
            id="cta_hero_consultation"
            data-cta="cta_hero_consultation"
            class="btn btn--primary btn--full pulse"
            type="button"
            @click="toForm"
          >
            {{ C.hero.ctaPrimary }} <AppIcon name="arrowRight" :size="18" :stroke="2.4" />
          </button>
          <button
            id="cta_hero_product"
            data-cta="cta_hero_product"
            class="btn btn--outline btn--full"
            type="button"
            @click="goTo('mahsulot')"
          >
            {{ C.hero.ctaSecondary }}
          </button>
        </div>
      </section>

      <!-- ===== 2. TERI MUAMMOLARI HAQIDA MA'LUMOT (tasdiqlangan statistika) ===== -->
      <section id="malumot" class="sec sec--dark">
        <h2 class="sec__title" v-reveal>{{ C.info.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.info.lead }}</p>
        <div class="stats">
          <div v-for="(s, i) in C.info.stats" :key="s.value" class="stat" v-reveal="i * 80">
            <strong>{{ s.value }}</strong>
            <p>{{ s.label }}</p>
            <small>Манба: {{ s.source }}</small>
          </div>
        </div>
        <p class="stats__note" v-reveal>{{ C.info.note }}</p>
      </section>

      <!-- ===== 3. MUAMMOLAR VA ALOMATLAR — accordion ===== -->
      <section id="muammolar" class="sec sec--white">
        <h2 class="sec__title" v-reveal>{{ C.conditions.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.conditions.lead }}</p>
        <AccordionList :items="C.conditions.items" id-prefix="cond" :initial="0" />
        <p class="sec__foot" v-reveal>{{ C.conditions.footer }}</p>
        <button
          id="cta_conditions_details"
          data-cta="cta_conditions_details"
          class="btn btn--outline btn--full mt"
          type="button"
          @click="goTo('parvarish')"
        >
          {{ C.conditions.cta }}
        </button>
      </section>

      <!-- ===== 4. MUTAXASSIS TAVSIYASI ===== -->
      <section id="mutaxassis" class="sec">
        <h2 class="sec__title" v-reveal>{{ C.expert.title }}</h2>
        <div class="expert expert--light" :class="{ ph: C.expert.placeholder }" v-reveal>
          <div class="expert__top">
            <div class="expert__photo">
              <img v-if="C.expert.photo" :src="C.expert.photo" :alt="C.expert.name" />
              <AppIcon v-else name="user" :size="34" />
            </div>
            <div>
              <span class="expert__label">Мутахассис фикри</span>
              <strong>{{ C.expert.name }}</strong>
              <small>{{ C.expert.role }}</small>
            </div>
          </div>
          <blockquote>
            <AppIcon name="quote" :size="22" />
            <p :class="{ 'ph-text': C.expert.placeholder }">{{ C.expert.quote }}</p>
          </blockquote>
        </div>
        <button
          id="cta_expert_contact"
          data-cta="cta_expert_contact"
          class="btn btn--primary btn--full mt"
          type="button"
          @click="toForm"
        >
          {{ C.expert.cta }}
        </button>
      </section>

      <!-- ===== 5. ALOMATLARNI BELGILASH — checkbox ===== -->
      <section id="alomatlar" class="sec sec--white">
        <h2 class="sec__title" v-reveal>{{ C.symptoms.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.symptoms.lead }}</p>

        <div class="checks" role="group" aria-label="Белгилар рўйхати">
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
          <button
            v-if="checkedCount"
            id="cta_symptoms_advice"
            data-cta="cta_symptoms_advice"
            class="btn btn--primary btn--full"
            type="button"
            @click="toForm"
          >
            {{ C.symptoms.cta }}
          </button>
        </div>

        <div class="emergency" v-reveal>
          <AppIcon name="alert" :size="22" />
          <p>{{ C.symptoms.emergency }}</p>
        </div>
      </section>

      <!-- ===== 6. TERI PARVARISHI HAQIDA ===== -->
      <section id="parvarish" class="sec">
        <h2 class="sec__title" v-reveal>{{ C.care.title }}</h2>
        <p class="sec__lead" v-reveal>{{ C.care.lead }}</p>
        <ol class="steps">
          <li v-for="(s, i) in C.care.items" :key="s.title" class="step" v-reveal="i * 60">
            <span class="step__n" :style="{ '--lvl': i }">{{ i + 1 }}</span>
            <div class="card step__card">
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </div>
          </li>
        </ol>
        <p class="sec__foot" v-reveal>{{ C.care.footer }}</p>
      </section>

      <!-- ===== 7. MAHSULOTLAR ===== -->
      <section id="mahsulot" class="sec sec--cream2">
        <h2 class="sec__title" v-reveal>{{ C.productIntro.title }}</h2>
        <div class="prod-strip" v-reveal>
          <figure v-for="(p, i) in C.products" :key="p.id">
            <img :src="p.image" :alt="p.name" loading="lazy" decoding="async" width="300" height="375" />
            <figcaption>{{ C.productIntro.badges[i] }}</figcaption>
          </figure>
        </div>
        <p class="sec__lead" v-reveal>{{ C.productIntro.text }}</p>

        <div class="products">
          <article v-for="p in C.products" :key="p.id" class="card prod" v-reveal>
            <div class="prod__img">
              <img :src="p.image" :alt="p.name" loading="lazy" decoding="async" width="300" height="375" />
            </div>
            <div class="prod__body">
              <h4>{{ p.name }}</h4>
              <p>{{ p.text }}</p>
              <div class="prod__tags"><span v-for="t in p.tags" :key="t">{{ t }}</span></div>
            </div>
          </article>
        </div>

        <!-- ===== 8. TARKIB VA XUSUSIYATLAR ===== -->
        <h3 class="sub">{{ C.ingredients.title }}</h3>
        <p class="sec__lead">{{ C.ingredients.lead }}</p>
        <div class="ingr">
          <div v-for="(g, i) in C.ingredients.items" :key="i" class="ingr__item ph">
            <span class="ingr__ico"><AppIcon name="leaf" :size="18" /></span>
            <strong class="ph-text">{{ g.name }}</strong>
            <small class="ph-text">{{ g.text }}</small>
          </div>
        </div>

        <h3 class="sub">{{ C.features.title }}</h3>
        <ul class="ticks">
          <li v-for="b in C.features.items" :key="b" v-reveal>
            <span><AppIcon name="check" :size="16" :stroke="2.6" /></span>{{ b }}
          </li>
        </ul>

        <button
          id="cta_products_price"
          data-cta="cta_products_price"
          class="btn btn--primary btn--full mt"
          type="button"
          @click="toForm"
        >
          {{ C.features.cta }}
        </button>
      </section>

      <!-- ===== 9. KIMLAR UCHUN + QO'LLASH ===== -->
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

      <!-- ===== 10. VIDEO SHARHLAR ===== -->
      <section id="videolar" class="sec sec--dark sec--videos">
        <h2 class="sec__title" v-reveal>Видео <em>шарҳлар</em></h2>
        <p class="sec__lead">Видеони кўриш учун устига босинг</p>
        <VideoCarousel :videos="C.videos" />
      </section>

      <!-- ===== 11. BUYURTMA FORMASI ===== -->
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
            <BrandLogo size="sm" />
            <h3>{{ C.order.formTitle }}</h3>
            <p>{{ C.order.formLead }}</p>
          </div>
          <OrderForm @success="onSuccess" />
          <ul class="trust">
            <li v-for="t in C.order.trust" :key="t"><AppIcon name="check" :size="15" :stroke="2.6" /> {{ t }}</li>
          </ul>
        </div>
      </section>

      <!-- ===== 12. MIJOZLAR FIKRI ===== -->
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
        <button
          id="cta_reviews"
          data-cta="cta_reviews"
          class="btn btn--outline btn--full"
          type="button"
          @click="goTo('videolar')"
        >
          {{ C.reviews.cta }}
        </button>
      </section>

      <!-- ===== 13. FAQ ===== -->
      <section id="faq" class="sec">
        <h2 class="sec__title" v-reveal>Кўп бериладиган саволлар</h2>
        <div class="mt-sm">
          <AccordionList :items="C.faq" id-prefix="faq" numbered />
        </div>
      </section>

      <!-- ===== 14. YAKUNIY CTA ===== -->
      <section class="sec final">
        <div class="final__card" v-reveal>
          <div class="final__img">
            <img :src="C.images.creamImg" alt="Dermo Complex крем" loading="lazy" decoding="async" width="560" height="700" />
          </div>
          <div class="final__body">
            <AppIcon name="heart" :size="28" class="final__heart" />
            <h2>{{ C.finalCta.title }}</h2>
            <p>{{ C.finalCta.text }}</p>
            <button
              id="cta_final_application"
              data-cta="cta_final_application"
              class="btn btn--accent btn--full"
              type="button"
              @click="toForm"
            >
              {{ C.finalCta.button }}
            </button>
          </div>
        </div>
        <p class="disclaimer"><AppIcon name="info" :size="16" /> {{ C.disclaimer }}</p>
      </section>
    </main>

    <!-- ===== FOOTER ===== -->
    <footer class="foot">
      <BrandLogo light />
      <nav class="foot__nav" aria-label="Пастки меню">
        <a href="#mahsulot" @click.prevent="goTo('mahsulot')">Маҳсулот</a>
        <a href="#forma" @click.prevent="goTo('forma')">Ариза</a>
        <a href="#alomatlar" @click.prevent="goTo('alomatlar')">Белгилар</a>
        <a href="#faq" @click.prevent="goTo('faq')">Саволлар</a>
      </nav>
      <div v-if="hasPhone || hasSocial" class="foot__soc">
        <a v-if="hasPhone" id="cta_footer_call" data-cta="cta_footer_call" :href="C.contacts.phoneHref">
          <AppIcon name="phone" :size="16" /> {{ C.contacts.phone }}
        </a>
        <div v-if="hasSocial">
          <a v-if="C.contacts.telegram" id="cta_footer_telegram" data-cta="cta_footer_telegram" :href="C.contacts.telegram" target="_blank" rel="noopener" aria-label="Telegram">
            <AppIcon name="telegram" :size="20" />
          </a>
          <a v-if="C.contacts.instagram" id="cta_footer_instagram" data-cta="cta_footer_instagram" :href="C.contacts.instagram" target="_blank" rel="noopener" aria-label="Instagram">
            <AppIcon name="instagram" :size="20" />
          </a>
          <a v-if="C.contacts.youtube" id="cta_footer_youtube" data-cta="cta_footer_youtube" :href="C.contacts.youtube" target="_blank" rel="noopener" aria-label="YouTube">
            <AppIcon name="youtube" :size="20" />
          </a>
        </div>
      </div>
      <p class="foot__company">{{ C.company.name }} · {{ C.company.address }}</p>
      <details class="foot__src">
        <summary>Статистика манбалари</summary>
        <ul><li v-for="s in C.sources" :key="s">{{ s }}</li></ul>
      </details>
      <a :href="C.privacyUrl" class="foot__privacy" target="_blank" rel="noopener">Махфийлик сиёсати</a>
      <small>© {{ year }} DERMOLIFE COMPLEX. Барча ҳуқуқлар ҳимояланган.</small>
    </footer>

    <!-- ===== Pastki sticky CTA ===== -->
    <Transition name="sticky">
      <div v-show="showSticky" class="sticky">
        <a
          v-if="hasPhone"
          id="cta_sticky_call"
          data-cta="cta_sticky_call"
          :href="C.contacts.phoneHref"
          class="sticky__call"
          aria-label="Қўнғироқ қилиш"
        >
          <AppIcon name="phone" :size="20" />
        </a>
        <button id="cta_sticky_more_info" data-cta="cta_sticky_more_info" class="btn btn--primary" type="button" @click="toForm">
          {{ C.sticky.button }}
        </button>
      </div>
    </Transition>

    <ConsentBar />

    <!-- ===== Muvaffaqiyat oynasi (faqat buyurtma qabul qilinganda) ===== -->
    <BaseModal :open="success.open" label="Ариза қабул қилинди" @close="success.open = false">
      <div class="ok">
        <div class="ok__icon"><AppIcon name="check" :size="44" :stroke="2.2" /></div>
        <h2>Раҳмат, {{ success.name }}!</h2>
        <p>Аризангиз қабул қилинди! Тез орада сиз билан боғланамиз.</p>
        <button id="success_close" class="btn btn--primary btn--full" type="button" @click="success.open = false">Яхши</button>
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
  background: var(--brand);
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
  background: var(--brand-deep);
  color: var(--accent-light);
  font-size: 13px;
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
  min-height: 60px;
  padding: 10px var(--pad);
  background: var(--white);
  border-bottom: 1px solid var(--line);
}
.head__call {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--brand);
  color: #fff;
}

/* ---- Hero ---- */
.hero {
  padding: 26px var(--pad) 36px;
  text-align: center;
  background: linear-gradient(180deg, var(--white) 0%, var(--bg) 100%);
}
.hero__kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 13.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.hero__title {
  margin-top: 14px;
  font-size: clamp(28px, 8.4vw, 35px);
  line-height: 1.22;
  font-weight: 900;
  color: var(--brand-dark);
  letter-spacing: -0.015em;
}
.hero__text {
  margin-top: 12px;
  font-size: 17px;
  color: var(--text-2);
  line-height: 1.6;
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
  object-position: 50% 55%;
  border-radius: 20px;
  box-shadow: 0 18px 40px -16px rgba(10, 53, 32, 0.5);
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
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 14px;
  border: 3px solid #fff;
  box-shadow: var(--shadow-pop);
  /* Cheksiz "float" animatsiyasi olib tashlandi — arzon telefonlarda doimiy qayta chizish */
}
.hero__chip {
  position: absolute;
  z-index: 4;
  padding: 6px 10px;
  border-radius: 999px;
  background: var(--brand);
  color: #fff;
  font-size: 13px;
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
  background: var(--grad-accent);
  color: var(--brand-deep);
}
.hero__text2 {
  font-size: 16.5px;
  font-weight: 600;
  color: var(--brand-dark);
  line-height: 1.55;
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
  border: 1px solid rgba(201, 237, 160, 0.25);
  text-align: center;
}
.stat strong {
  display: block;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.1;
  background: var(--grad-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stat p {
  margin-top: 6px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
}
.stat small {
  display: block;
  margin-top: 6px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.55);
}
.stats__note {
  margin-top: 14px;
  text-align: center;
  font-size: 15.5px;
  color: rgba(255, 255, 255, 0.8);
}
.expert--light {
  border: 1px solid var(--line);
  box-shadow: var(--shadow-card);
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
  background: var(--brand-soft);
  color: var(--brand);
  border: 2px solid var(--accent);
}
.expert__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.expert__label {
  display: block;
  font-size: 12.5px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--accent-dark);
}
.expert strong {
  display: block;
  color: var(--brand-dark);
}
.expert small {
  color: var(--text-2);
  font-size: 14.5px;
}
.expert blockquote {
  margin: 14px 0 0;
  padding: 12px 0 0;
  border-top: 1px solid var(--line);
  display: flex;
  gap: 10px;
  font-size: 16px;
  line-height: 1.55;
}
.expert blockquote svg {
  flex-shrink: 0;
  color: var(--accent);
}
.proverb {
  margin-top: 20px;
  text-align: center;
  font-style: italic;
  font-weight: 600;
  color: var(--accent-light);
  font-size: 17px;
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
  padding: 14px 14px;
  border-radius: 12px;
  background: var(--white);
  border: 1.5px solid var(--line);
  cursor: pointer;
  font-weight: 600;
  font-size: 16.5px;
  transition: border-color 0.2s, background 0.2s;
  -webkit-tap-highlight-color: transparent;
  line-height: 1.4;
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
  border: 2px solid #b9cfc0;
  display: grid;
  place-items: center;
  color: transparent;
  transition: all 0.2s;
}
.chk.on {
  border-color: var(--brand);
  background: var(--brand-soft);
}
.chk.on .chk__box {
  background: var(--brand);
  border-color: var(--brand);
  color: #fff;
}
.chk:has(input:focus-visible) {
  outline: 3px solid var(--accent);
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
  border-color: var(--accent);
  background: #f4fbf0;
}
.checks__count {
  font-size: 15px;
  color: var(--text-2);
}
.checks__count strong {
  font-size: 30px;
  font-weight: 900;
  color: var(--brand);
}
.checks__result p {
  font-size: 16px;
  font-weight: 600;
  color: var(--brand-dark);
  line-height: 1.5;
}
.emergency {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fdecec;
  color: #8a1f1f;
  font-size: 15.5px;
  font-weight: 600;
  line-height: 1.5;
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
  background: linear-gradient(var(--accent), var(--brand));
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
  background: color-mix(in srgb, var(--brand) calc(var(--lvl) * 33%), var(--accent));
  box-shadow: 0 0 0 4px var(--white);
}
.step__card {
  flex: 1;
}
.step__card h3 {
  font-size: 18.5px;
  font-weight: 800;
  color: var(--brand-dark);
}
.step__card p {
  margin-top: 4px;
  font-size: 16px;
  color: var(--text-2);
  line-height: 1.55;
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
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 14px;
  border: 2px solid #fff;
  box-shadow: var(--shadow-pop);
}
.prod-strip figcaption {
  margin-top: 6px;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--brand-dark);
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
  font-size: 16px;
  line-height: 1.4;
}
.ticks span {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--brand);
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
  background: var(--grad-accent);
  color: var(--brand-deep);
  font-size: 14px;
  font-weight: 800;
}
.sub {
  margin: 30px 0 14px;
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  color: var(--brand-dark);
  line-height: 1.25;
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
  background: var(--bg-2);
}
.prod__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.prod h4 {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: var(--brand-dark);
}
.prod p {
  margin-top: 4px;
  font-size: 15.5px;
  color: var(--text-2);
  line-height: 1.5;
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
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 12.5px;
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
  color: var(--accent-dark);
  margin-bottom: 4px;
}
.ingr__item strong {
  font-size: 15.5px;
}
.ingr__item small {
  font-size: 13.5px;
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
  font-size: 16px;
  line-height: 1.45;
}
.who li span {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--brand-soft);
  color: var(--brand);
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
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--accent-dark);
}
.usage__row strong {
  font-size: 16px;
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
  background: #eef7e6;
  color: var(--brand-dark);
  font-size: 15.5px;
  font-weight: 600;
  line-height: 1.5;
}
.warns svg {
  flex-shrink: 0;
  color: var(--accent-dark);
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
/* ---- Buyurtma ---- */
.order {
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
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
  background: var(--brand);
  color: #fff;
  font-weight: 900;
}
.osteps strong {
  display: block;
  color: var(--brand-dark);
  font-size: 17px;
}
.osteps p {
  font-size: 15px;
  color: var(--text-2);
  line-height: 1.5;
}
.form-card {
  padding: 20px 16px;
  border-radius: 20px;
  background: var(--white);
  border: 2px solid var(--accent);
  box-shadow: 0 18px 40px -18px rgba(10, 53, 32, 0.45);
}
.form-card__head {
  text-align: center;
  margin-bottom: 16px;
}
.form-card__head .logo {
  margin-bottom: 10px;
}
.form-card__head h3 {
  font-size: 26px;
  font-weight: 900;
  color: var(--brand-dark);
}
.form-card__head p {
  margin-top: 4px;
  font-size: 15.5px;
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
  font-size: 15px;
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
  background: var(--brand-soft);
  color: var(--brand);
}
.review strong {
  display: block;
  font-size: 16px;
}
.review small {
  font-size: 13.5px;
}
.review p {
  font-size: 15.5px;
  line-height: 1.55;
}
.reviews__note {
  text-align: center;
  font-size: 13.5px;
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
  background: var(--grad-brand);
  color: #fff;
  box-shadow: var(--shadow-pop);
}
.final__img {
  height: 220px;
  overflow: hidden;
}
.final__img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 40%;
}
.final__body {
  padding: 22px 18px;
  text-align: center;
}
.final__heart {
  margin: 0 auto 8px;
  color: var(--accent-light);
}
.final__body h2 {
  font-size: 26px;
  font-weight: 900;
  line-height: 1.25;
}
.final__body p {
  margin: 8px 0 18px;
  font-size: 16.5px;
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.55;
}
.disclaimer {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  font-size: 14px;
  color: var(--text-2);
}
.disclaimer svg {
  flex-shrink: 0;
  color: var(--accent-dark);
}

/* ---- Footer ---- */
.foot {
  display: grid;
  gap: 14px;
  justify-items: center;
  text-align: center;
  padding: 28px var(--pad) 100px;
  background: var(--brand-deep);
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
}
.foot__company {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}
.foot__nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px 16px;
  font-weight: 700;
  color: var(--accent-light);
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
  border: 1px solid rgba(201, 237, 160, 0.35);
  color: var(--accent-light);
}
.foot__src {
  font-size: 13px;
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
  /* backdrop-filter olib tashlandi: arzon Android telefonlarda scroll paytida qotishga sabab bo'ladi */
  background: #fff;
  border-top: 1px solid var(--line);
  box-shadow: 0 -8px 24px rgba(10, 53, 32, 0.12);
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
  background: var(--grad-accent);
  color: var(--brand-deep);
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
  background: var(--grad-accent);
  color: var(--brand-deep);
}
.ok h2 {
  font-size: 26px;
  font-weight: 900;
  color: var(--brand-dark);
}
.ok p {
  color: var(--text-2);
  font-size: 16.5px;
}
</style>