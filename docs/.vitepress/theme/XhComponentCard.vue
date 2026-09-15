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
  status?: "alpha" | "new" | "updated";
}>();

const previews = import.meta.glob<{ default: Component }>("../catalog/*.vue");
const load = previews[`../catalog/${props.src}.vue`];
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
      <span
        v-if="status"
        class="xh-component-card__status"
        :class="`xh-component-card__status--${status}`"
      >{{ status === "updated" ? "更新" : status }}</span>
    </a>
  </article>
</template>

<style>
.xh-component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--xh-space-6) var(--xh-space-4);
  margin: var(--xh-space-5) 0 var(--xh-space-8);
}

.xh-component-card {
  min-width: 0;
}

.xh-component-card__preview {
  position: relative;
  display: grid;
  place-items: center;
  height: 190px;
  border: var(--xh-stroke-thin) solid var(--xh-border-default);
  border-radius: var(--xh-shape-surface);
  overflow: hidden;
  background: var(--xh-bg-surface-raised);
  box-shadow: var(--xh-elevation-raised);
}

.xh-component-card__demo {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--xh-space-2);
  width: 116%;
  max-height: 210px;
  padding: var(--xh-space-3);
  overflow: hidden;
  transform: scale(0.86);
  transform-origin: center;
}

.xh-component-card__placeholder {
  display: grid;
  place-items: center;
  width: var(--xh-control-h-lg);
  height: var(--xh-control-h-lg);
  border-radius: var(--xh-shape-control);
  background: var(--xh-bg-subtle);
  color: var(--xh-fg-muted);
  font-weight: var(--xh-font-weight-semibold);
}

.xh-component-card__link {
  display: inline-flex;
  gap: var(--xh-space-1_5);
  align-items: baseline;
  padding-top: var(--xh-space-2_5);
  color: var(--xh-fg-default);
  text-decoration: none;
}

.xh-component-card__link:hover strong {
  color: var(--xh-fg-brand-strong);
}

.xh-component-card__link strong {
  font-size: var(--xh-text-label-size);
  font-weight: var(--xh-font-weight-semibold);
  transition: color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter);
}

.xh-component-card__link span {
  color: var(--xh-fg-muted);
  font-size: var(--xh-control-font-sm);
}

.xh-component-card__link .xh-component-card__status {
  display: inline-flex;
  align-items: center;
  padding-inline: 0.5em;
  border-radius: var(--xh-shape-pill);
  background: var(--xh-bg-brand-subtle);
  color: var(--xh-fg-brand-strong);
  font-size: var(--xh-font-size-xs);
  font-weight: var(--xh-font-weight-semibold);
  line-height: 1.6;
}

.xh-component-card__link .xh-component-card__status--alpha {
  color: var(--xh-fg-subtle);
  background: var(--xh-bg-subtle);
  font-weight: var(--xh-font-weight-medium);
}

@media (max-width: 640px) {
  .xh-component-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--xh-space-4) var(--xh-space-3);
  }

  .xh-component-card__preview {
    height: 148px;
  }
}
</style>
