<script setup>
// DERMOLIFE complex logotipi (qadoqlardagi daraxt belgisi + yozuv).
// Haqiqiy logotip fayli bo'lsa: src/assets/ ga qo'yib, shu komponentda <img> bilan almashtiring.
defineProps({
  light: { type: Boolean, default: false }, // to'q fon ustida oq variant
  size: { type: String, default: 'md' } // sm | md | lg
})
</script>

<template>
  <span class="logo" :class="[`logo--${size}`, { 'logo--light': light }]" aria-label="DERMOLIFE complex" role="img">
    <svg class="logo__tree" viewBox="0 0 48 48" aria-hidden="true">
      <g class="logo__crown">
        <circle cx="24" cy="15" r="9" />
        <circle cx="14" cy="19" r="7" />
        <circle cx="34" cy="19" r="7" />
        <circle cx="18" cy="11" r="6" />
        <circle cx="30" cy="11" r="6" />
        <circle cx="24" cy="23" r="6" />
      </g>
      <path class="logo__trunk" d="M24 22v16m0-8-5-6m5 3 5-5M24 38c-3 2-7 3-10 3m10-3c3 2 7 3 10 3" />
    </svg>
    <span class="logo__text">
      <span class="logo__name">DERM<span class="logo__o">O</span>LIFE</span>
      <span class="logo__sub">complex</span>
    </span>
  </span>
</template>

<style scoped>
.logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
  color: var(--brand-dark);
}
.logo__tree {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}
.logo__crown circle {
  fill: var(--brand);
}
.logo__trunk {
  fill: none;
  stroke: var(--brand-dark);
  stroke-width: 2.6;
  stroke-linecap: round;
}
.logo__text {
  display: grid;
  gap: 2px;
}
.logo__name {
  font-weight: 900;
  font-size: 20px;
  letter-spacing: 0.04em;
  color: var(--brand-dark);
}
.logo__o {
  color: var(--accent-dark);
}
.logo__sub {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--brand);
}

.logo--light .logo__name {
  color: #fff;
}
.logo--light .logo__o,
.logo--light .logo__sub {
  color: var(--accent-light);
}
.logo--light .logo__crown circle {
  fill: var(--accent);
}
.logo--light .logo__trunk {
  stroke: #fff;
}

.logo--sm .logo__tree {
  width: 28px;
  height: 28px;
}
.logo--sm .logo__name {
  font-size: 16px;
}
.logo--sm .logo__sub {
  font-size: 11px;
}
.logo--lg .logo__tree {
  width: 44px;
  height: 44px;
}
.logo--lg .logo__name {
  font-size: 24px;
}
</style>
