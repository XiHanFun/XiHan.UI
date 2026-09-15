<script setup lang="ts">
import type { StageAxis } from "./demo-stage";
import { onMounted } from "vue";
import {
  resetDemoStage,
  restoreDemoStage,
  setStageAxis,
  stageAxes,

  stageIsInitial,
} from "./demo-stage";

// 挂载后才读记住的选择，预渲染出来的那一帧只认初始档
onMounted(restoreDemoStage);

function onChange(axis: StageAxis, event: Event): void {
  setStageAxis(axis, (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="xh-axes" role="group" aria-label="舞台档位，对全站示例一起生效">
    <label v-for="axis in stageAxes" :key="axis.id" class="xh-axes__axis">
      <span class="xh-axes__label">{{ axis.label }}</span>
      <select
        class="xh-axes__select"
        :value="axis.value.value"
        @change="onChange(axis, $event)"
      >
        <option
          v-for="option in axis.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>
    <button
      class="xh-axes__reset"
      type="button"
      :disabled="stageIsInitial"
      @click="resetDemoStage"
    >
      重置
    </button>
  </div>
</template>

<style scoped>
.xh-axes {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--xh-space-1) var(--xh-space-2_5);
}
.xh-axes__axis {
  display: inline-flex;
  align-items: center;
  gap: var(--xh-space-1);
  color: var(--xh-fg-subtle);
  font-size: var(--xh-font-size-xs);
  line-height: 20px;
}
.xh-axes__label {
  user-select: none;
}
.xh-axes__select {
  min-block-size: var(--xh-control-action-size);
  padding-inline: var(--xh-space-1);
  border: var(--xh-stroke-thin) solid transparent;
  border-radius: var(--xh-shape-control);
  color: var(--xh-fg-muted);
  background: transparent;
  font-size: var(--xh-font-size-xs);
  line-height: 20px;
  cursor: pointer;
  transition:
    color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    background-color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    scale var(--xh-motion-duration-release) var(--xh-motion-ease-release);
}
.xh-axes__select:hover {
  color: var(--xh-fg-brand-strong);
  background: var(--xh-bg-subtle-hover);
}
.xh-axes__select:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-ring-focus);
  outline-offset: var(--xh-ring-offset);
}
.xh-axes__select:active {
  scale: var(--xh-motion-scale-press);
  transition-duration: var(--xh-motion-duration-press);
  transition-timing-function: var(--xh-motion-ease-press);
}
/* 选项列表由系统绘制，深色下不跟主题走，这里把两色定死 */
.xh-axes__select option {
  color: var(--xh-fg-default);
  background: var(--xh-bg-surface);
}
.xh-axes__reset {
  min-block-size: var(--xh-control-action-size);
  padding-inline: var(--xh-space-1_5);
  border: var(--xh-stroke-thin) solid transparent;
  border-radius: var(--xh-shape-control);
  background: transparent;
  color: var(--xh-fg-subtle);
  font-size: var(--xh-font-size-xs);
  line-height: 20px;
  transition:
    color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    background-color var(--xh-motion-duration-micro) var(--xh-motion-ease-enter),
    scale var(--xh-motion-duration-release) var(--xh-motion-ease-release);
}
.xh-axes__reset:hover:not(:disabled) {
  color: var(--xh-fg-brand-strong);
  background: var(--xh-bg-subtle-hover);
}
.xh-axes__reset:disabled {
  color: var(--xh-fg-disabled);
  background: transparent;
  cursor: default;
}
.xh-axes__reset:not(:disabled):active {
  scale: var(--xh-motion-scale-press);
  transition-duration: var(--xh-motion-duration-press);
  transition-timing-function: var(--xh-motion-ease-press);
}
.xh-axes__reset:focus-visible {
  outline: var(--xh-ring-width) solid var(--xh-ring-focus);
  outline-offset: var(--xh-ring-offset);
}
</style>
