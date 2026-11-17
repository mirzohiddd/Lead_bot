<script setup>
// Haqiqiy mahsulot rasmi bo'lmaganda ko'rsatiladigan premium SVG-maket.
import { useId } from 'vue'

defineProps({
  variant: { type: String, default: 'paste' } // paste | syrup | complex
})

const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
const id = (n) => `${n}-${uid}`
</script>

<template>
  <svg class="product-art" viewBox="0 0 220 280" role="img" :aria-label="`GEPOMER ${variant}`">
    <defs>
      <linearGradient :id="id('gold')" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f8e3a6" />
        <stop offset=".45" stop-color="#d9ac58" />
        <stop offset=".7" stop-color="#a87a2c" />
        <stop offset="1" stop-color="#f1d38b" />
      </linearGradient>
      <linearGradient :id="id('glass')" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#2a060e" />
        <stop offset=".35" stop-color="#6b1324" />
        <stop offset=".6" stop-color="#8e1d31" />
        <stop offset="1" stop-color="#2a060e" />
      </linearGradient>
      <linearGradient :id="id('amber')" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3a1408" />
        <stop offset=".4" stop-color="#7a3512" />
        <stop offset=".62" stop-color="#9c4a1a" />
        <stop offset="1" stop-color="#3a1408" />
      </linearGradient>
      <linearGradient :id="id('cream')" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fffaf2" />
        <stop offset="1" stop-color="#efe1c9" />
      </linearGradient>
      <radialGradient :id="id('shadow')" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#000" stop-opacity=".45" />
        <stop offset="1" stop-color="#000" stop-opacity="0" />
      </radialGradient>
    </defs>

    <ellipse cx="110" cy="262" rx="82" ry="12" :fill="`url(#${id('shadow')})`" />

    <!-- ===== PASTA: shisha banka ===== -->
    <g v-if="variant === 'paste'">
      <rect x="40" y="84" width="140" height="170" rx="24" :fill="`url(#${id('glass')})`" />
      <rect x="50" y="56" width="120" height="40" rx="8" :fill="`url(#${id('gold')})`" />
      <g stroke="#8a6224" stroke-opacity=".35">
        <path v-for="i in 11" :key="i" :d="`M${50 + i * 10} 58v36`" />
      </g>
      <rect x="44" y="92" width="132" height="6" rx="3" fill="#1a0408" opacity=".5" />
      <rect x="52" y="128" width="116" height="92" rx="10" :fill="`url(#${id('cream')})`" />
      <rect x="57" y="133" width="106" height="82" rx="7" fill="none" :stroke="`url(#${id('gold')})`" stroke-width="1.5" />
      <path d="M110 142c-6 5-8 11-5 16 5-1 9-6 5-16Z" fill="#8e1d31" />
      <text x="110" y="180" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="700" font-size="19" fill="#5a0f1c" letter-spacing="1">GEPOMER</text>
      <text x="110" y="200" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="10" fill="#a87a2c" letter-spacing="4">PASTA</text>
      <rect x="58" y="100" width="10" height="140" rx="5" fill="#fff" opacity=".12" />
    </g>

    <!-- ===== SIROP: shisha flakon ===== -->
    <g v-else-if="variant === 'syrup'">
      <rect x="88" y="18" width="44" height="36" rx="6" :fill="`url(#${id('gold')})`" />
      <g stroke="#8a6224" stroke-opacity=".35">
        <path v-for="i in 7" :key="i" :d="`M${88 + i * 5.5} 20v32`" />
      </g>
      <path
        d="M94 54h32v22c0 8 34 18 34 46v112a20 20 0 0 1-20 20H80a20 20 0 0 1-20-20V122c0-28 34-38 34-46V54Z"
        :fill="`url(#${id('amber')})`"
      />
      <rect x="70" y="140" width="80" height="88" rx="10" :fill="`url(#${id('cream')})`" />
      <rect x="75" y="145" width="70" height="78" rx="7" fill="none" :stroke="`url(#${id('gold')})`" stroke-width="1.5" />
      <path d="M110 153c-5 4-7 9-4 13 4-1 7-5 4-13Z" fill="#8e1d31" />
      <text x="110" y="187" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="700" font-size="14" fill="#5a0f1c" letter-spacing=".5">GEPOMER</text>
      <text x="110" y="205" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="9" fill="#a87a2c" letter-spacing="3.5">SIROP</text>
      <rect x="70" y="112" width="8" height="120" rx="4" fill="#fff" opacity=".14" />
    </g>

    <!-- ===== COMPLEX: quti ===== -->
    <g v-else>
      <path d="M150 50 182 34v190l-32 30V50Z" fill="#3d0a15" />
      <path d="M38 50 70 34h112l-32 16H38Z" fill="#8e1d31" />
      <rect x="38" y="50" width="112" height="204" rx="4" :fill="`url(#${id('glass')})`" />
      <rect x="46" y="58" width="96" height="188" rx="3" fill="none" :stroke="`url(#${id('gold')})`" stroke-width="1.6" />
      <path d="M94 92c-8 7-11 15-7 22 7-1 12-8 7-22Z" :fill="`url(#${id('gold')})`" />
      <text x="94" y="146" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="700" font-size="17" :fill="`url(#${id('gold')})`" letter-spacing="1">GEPOMER</text>
      <rect x="64" y="156" width="60" height="1.4" :fill="`url(#${id('gold')})`" />
      <text x="94" y="176" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="700" font-size="10" fill="#f5dc9a" letter-spacing="4">COMPLEX</text>
      <text x="94" y="222" text-anchor="middle" font-family="Manrope, sans-serif" font-weight="600" font-size="7.5" fill="#f5dc9a" opacity=".7" letter-spacing="2">100% TABIIY</text>
      <path d="M150 50 182 34" stroke="#f1d38b" stroke-opacity=".5" />
    </g>
  </svg>
</template>

<style scoped>
.product-art {
  width: 100%;
  height: auto;
  overflow: visible;
}
</style>
