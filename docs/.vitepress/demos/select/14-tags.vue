<!-- 多选标签 | 触发器的显示是插槽：只摆前两个标签、其余折成 +N；可删除的标签行放在触发器之外，删除按钮调根插槽的 setValue -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhBadge,
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const options = [
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "lit", label: "Lit" },
  { value: "preact", label: "Preact" },
];

const picked = ref<string[]>(["vue", "svelte", "solid"]);

function labelOf(value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}
</script>

<template>
  <XhSelectRoot
    v-slot="{ value, setValue }"
    v-model:value="picked"
    multiple
    placeholder="请选择"
  >
    <XhSelectLabel>技术栈</XhSelectLabel>
    <XhSelectTrigger>
      <XhSelectValueText>
        <span v-if="value.length === 0" style="color: var(--xh-fg-subtle)">请选择</span>
        <span v-else style="display: inline-flex; align-items: center; gap: 4px">
          <XhBadge v-for="v in value.slice(0, 2)" :key="v" variant="subtle" size="sm">
            {{ labelOf(v) }}
          </XhBadge>
          <span v-if="value.length > 2" style="color: var(--xh-fg-muted); font-size: 12px">
            +{{ value.length - 2 }}
          </span>
        </span>
      </XhSelectValueText>
      <XhSelectIndicator>▾</XhSelectIndicator>
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectItem v-for="o in options" :key="o.value" :value="o.value">
          <XhSelectItemText>{{ o.label }}</XhSelectItemText>
          <XhSelectItemIndicator>✓</XhSelectItemIndicator>
        </XhSelectItem>
      </XhSelectContent>
    </XhSelectPositioner>
    <!-- 可删除的标签行放在触发器之外，删掉一项即把它从集合里摘掉 -->
    <div
      v-if="value.length > 0"
      style="display: flex; flex-wrap: wrap; gap: 6px; margin-block-start: 8px"
    >
      <span
        v-for="v in value"
        :key="v"
        style="
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: var(--xh-shape-control);
          background: var(--xh-bg-subtle);
          font-size: 12px;
        "
      >
        {{ labelOf(v) }}
        <button
          type="button"
          :aria-label="`移除 ${labelOf(v)}`"
          style="border: 0; background: none; color: var(--xh-fg-muted); cursor: pointer"
          @click="setValue(value.filter((x: string) => x !== v))"
        >
          ✕
        </button>
      </span>
    </div>
  </XhSelectRoot>
</template>
