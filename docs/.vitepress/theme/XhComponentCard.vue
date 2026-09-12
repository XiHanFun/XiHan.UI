<script setup lang="ts">
import type { Component } from "vue";
import { withBase } from "vitepress";
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  href: string;
  label: string;
  name: string;
  renderless?: boolean;
  src: string;
}>();

const demos = import.meta.glob<{ default: Component }>("../demos/**/01-basic.vue");
const load = demos[`../demos/${props.src}/01-basic.vue`];
const demo = load ? defineAsyncComponent(load) : undefined;
const root = ref<HTMLElement | null>(null);
const visible = ref(false);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    visible.value = true;
    return;
  }

  observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting)
      return;
    visible.value = true;
    observer?.disconnect();
  }, { rootMargin: "160px" });

  if (root.value)
    observer.observe(root.value);
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <article ref="root" class="xh-component-card">
    <div class="xh-component-card__preview" inert aria-hidden="true">
      <div v-if="visible && demo && !renderless" class="xh-component-card__demo">
        <component :is="demo" />
      </div>
      <span v-else class="xh-component-card__placeholder">{{ name.slice(0, 1) }}</span>
    </div>
    <a class="xh-component-card__link" :href="withBase(href)">
      <strong>{{ name }}</strong>
      <span>{{ label }}</span>
    </a>
  </article>
</template>

<style>
.xh-component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 20px 16px;
  margin: 20px 0 44px;
}

.xh-component-card {
  min-width: 0;
}

.xh-component-card__preview {
  position: relative;
  display: grid;
  place-items: center;
  height: 156px;
  border: 1px solid color-mix(in oklab, var(--vp-c-divider) 78%, transparent);
  border-radius: 14px;
  overflow: hidden;
  background: var(--vp-c-bg-elv);
}

.xh-component-card__demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 125%;
  max-height: 180px;
  padding: 12px;
  overflow: hidden;
  transform: scale(0.72);
  transform-origin: center;
}

.xh-component-card__placeholder {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-weight: 600;
}

.xh-component-card__link {
  display: inline-flex;
  gap: 6px;
  align-items: baseline;
  padding-top: 10px;
  color: var(--vp-c-text-1);
  text-decoration: none;
}

.xh-component-card__link:hover strong {
  color: var(--vp-c-brand-1);
}

.xh-component-card__link strong {
  font-size: 14px;
  font-weight: 600;
  transition: color 120ms ease;
}

.xh-component-card__link span {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

@media (max-width: 640px) {
  .xh-component-grid {
    grid-template-columns: 1fr 1fr;
    gap: 16px 12px;
  }

  .xh-component-card__preview {
    height: 128px;
  }
}
</style>
