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
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
}
.xh-framework__item {
  min-width: 54px;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  color: var(--vp-c-text-1);
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  line-height: 28px;
  cursor: pointer;
  transition:
    color 150ms ease,
    background-color 150ms ease,
    box-shadow 150ms ease;
}
.xh-framework__item:hover {
  color: var(--vp-c-text-1);
}
.xh-framework__item:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
.xh-framework__item--active {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
  box-shadow: var(--xh-doc-shadow-control);
}
</style>
