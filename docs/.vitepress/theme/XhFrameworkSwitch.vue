<script setup lang="ts">
import { onMounted } from "vue";
import {
  demoFramework,
  demoFrameworks,
  restoreDemoFramework,
  setDemoFramework,
} from "./demo-framework";

// 挂载后才读记住的选择，预渲染出来的那一帧只认默认值
onMounted(restoreDemoFramework);
</script>

<template>
  <div class="xh-framework" role="group" aria-label="示例框架">
    <button
      v-for="framework in demoFrameworks"
      :key="framework.id"
      class="xh-framework__item"
      :class="{ 'xh-framework__item--active': demoFramework === framework.id }"
      type="button"
      :aria-pressed="demoFramework === framework.id"
      @click="setDemoFramework(framework.id)"
    >
      {{ framework.name === "Web Components" ? "Web" : framework.name }}
    </button>
  </div>
</template>

<style scoped>
.xh-framework {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: var(--xh-space-0_5);
  padding: var(--xh-space-0_5);
  border-radius: var(--xh-shape-pill);
  background: var(--xh-bg-subtle);
}
.xh-framework__item {
  min-width: 54px;
  height: var(--xh-control-h-sm);
  padding-inline: var(--xh-control-px-sm);
  border: 0;
  border-radius: var(--xh-shape-pill);
  color: var(--xh-fg-default);
  background: transparent;
  font-size: var(--xh-font-size-xs);
  font-weight: var(--xh-font-weight-medium);
  line-height: var(--xh-control-h-sm);
  cursor: pointer;
  transition:
    color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    background-color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    box-shadow var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    scale var(--xh-motion-duration-release) var(--xh-motion-ease-release);
}
.xh-framework__item:hover {
  color: var(--xh-fg-default);
  background: var(--xh-bg-subtle-hover);
}
.xh-framework__item:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-ring-focus);
  outline-offset: var(--xh-ring-offset);
}
.xh-framework__item:active {
  scale: var(--xh-motion-scale-press);
  transition-duration: var(--xh-motion-duration-press);
  transition-timing-function: var(--xh-motion-ease-press);
}
.xh-framework__item--active {
  color: var(--xh-fg-brand-strong);
  background: var(--xh-bg-surface-raised);
  box-shadow: var(--xh-elevation-raised);
}
</style>
