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
  <label class="xh-framework">
    <span class="xh-framework__label">示例框架</span>
    <select
      class="xh-framework__select"
      :value="demoFramework"
      @change="setDemoFramework(($event.target as HTMLSelectElement).value)"
    >
      <option
        v-for="framework in demoFrameworks"
        :key="framework.id"
        :value="framework.id"
      >
        {{ framework.name }}
      </option>
    </select>
    <svg
      class="xh-framework__caret"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <path
        d="M2 4l3 3 3-3"
        fill="none"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </label>
</template>

<style scoped>
.xh-framework {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
/* 标签只给读屏，视觉上由选中项本身表意 */
.xh-framework__label {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.xh-framework__select {
  appearance: none;
  padding: 0 26px 0 12px;
  height: 32px;
  border-radius: 8px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
  font-size: 13px;
  font-weight: 500;
  line-height: 32px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}
.xh-framework__select:hover {
  background: var(--vp-c-gray-soft);
}
.xh-framework__select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}
/* 选项列表由系统绘制，深色下不跟主题走，这里把两色定死 */
.xh-framework__select option {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
}
.xh-framework__caret {
  position: absolute;
  right: 10px;
  color: var(--vp-c-text-3);
  pointer-events: none;
}
</style>
