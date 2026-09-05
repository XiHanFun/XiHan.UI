<script setup lang="ts">
import { onMounted } from "vue";
import {
  resetDemoStage,
  restoreDemoStage,
  setStageAxis,
  stageAxes,
  stageIsInitial,
  type StageAxis,
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
  gap: 4px 10px;
}
.xh-axes__axis {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 20px;
}
.xh-axes__label {
  user-select: none;
}
.xh-axes__select {
  padding: 0 4px;
  border-radius: 4px;
  color: var(--vp-c-text-2);
  background: transparent;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}
.xh-axes__select:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
}
.xh-axes__select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}
/* 选项列表由系统绘制，深色下不跟主题走，这里把两色定死 */
.xh-axes__select option {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-elv);
}
.xh-axes__reset {
  padding: 0 6px;
  border-radius: 4px;
  color: var(--vp-c-text-3);
  font-size: 12px;
  line-height: 20px;
  transition: color 0.2s, background-color 0.2s;
}
.xh-axes__reset:hover:not(:disabled) {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-default-soft);
}
.xh-axes__reset:disabled {
  opacity: 0.45;
  cursor: default;
}
</style>
