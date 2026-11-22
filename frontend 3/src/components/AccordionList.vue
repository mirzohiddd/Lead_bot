<script setup>
import { ref } from 'vue'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  items: { type: Array, required: true }, // { title|q, text|a, icon? }
  idPrefix: { type: String, required: true },
  initial: { type: Number, default: -1 },
  numbered: { type: Boolean, default: false }
})

const open = ref(props.initial)
const toggle = (i) => (open.value = open.value === i ? -1 : i)
</script>

<template>
  <div class="acc-list">
    <div v-for="(it, i) in items" :key="i" class="acc" :class="{ 'is-open': open === i }">
      <button
        :id="`${idPrefix}-h-${i}`"
        type="button"
        class="acc__head"
        :aria-expanded="open === i"
        :aria-controls="`${idPrefix}-p-${i}`"
        @click="toggle(i)"
      >
        <span v-if="it.icon" class="acc__ico"><AppIcon :name="it.icon" :size="20" /></span>
        <span v-else-if="numbered" class="acc__ico acc__ico--num">{{ i + 1 }}</span>
        <span class="acc__title">{{ it.title || it.q }}</span>
        <span class="acc__chev"><AppIcon name="chevronDown" :size="20" :stroke="2.2" /></span>
      </button>
      <div :id="`${idPrefix}-p-${i}`" class="acc__panel" role="region" :aria-labelledby="`${idPrefix}-h-${i}`">
        <div class="acc__clip">
          <p>{{ it.text || it.a }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.acc-list {
  display: grid;
  gap: 10px;
}

.acc {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: border-color 0.25s;
}

.acc.is-open {
  border-color: var(--accent);
}

.acc__head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 14px;
  min-height: 64px;
  background: none;
  border: 0;
  text-align: left;
  font-size: 17px;
  font-weight: 700;
  color: var(--brand-dark);
  -webkit-tap-highlight-color: transparent;
}

.acc__ico {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--brand-soft);
  color: var(--brand);
}

.acc__ico--num {
  font-weight: 800;
  font-size: 15px;
}

.acc__title {
  flex: 1;
  line-height: 1.35;
}

.acc__chev {
  color: var(--accent-dark);
  transition: transform 0.3s var(--ease);
}

.is-open .acc__chev {
  transform: rotate(180deg);
}

.acc__panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s var(--ease);
}

.is-open .acc__panel {
  grid-template-rows: 1fr;
}

.acc__clip {
  overflow: hidden;
}

.acc__clip p {
  margin: 0;
  padding: 0 16px 16px 64px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-2);
}
</style>