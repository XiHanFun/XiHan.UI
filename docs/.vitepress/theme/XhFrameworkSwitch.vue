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
      class="xh-framework__btn"
      type="button"
      :aria-pressed="framework.id === demoFramework"
      @click="setDemoFramework(framework.id)"
    >
      {{ framework.name }}
    </button>
  </div>
</template>

<style scoped>
.xh-framework {
  display: flex;
  gap: 2px;
  margin-right: 16px;
  padding: 2px;
  border-radius: 8px;
  background: var(--vp-c-default-soft);
}
.xh-framework__btn {
  padding: 2px 10px;
  border-radius: 6px;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  transition: color 0.2s, background-color 0.2s;
}
.xh-framework__btn:hover {
  color: var(--vp-c-text-1);
}
.xh-framework__btn[aria-pressed="true"] {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}
</style>
