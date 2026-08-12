<!-- 多选标签 | 内建标签形态：api 的 tags 受 maxTagCount 截断、余数在 overflowCount；触发器里 XhSelectTag 纯展示，触发器外配 XhSelectTagRemove 即可删 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSelectContent,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTag,
  XhSelectTagRemove,
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
</script>

<template>
  <XhSelectRoot
    v-slot="{ tags, overflowCount }"
    v-model:value="picked"
    :collection="options"
    :max-tag-count="2"
    multiple
    placeholder="请选择"
    style="inline-size: 280px"
  >
    <XhSelectLabel>技术栈</XhSelectLabel>
    <XhSelectTrigger>
      <XhSelectValueText v-if="tags.length === 0" />
      <span v-else style="display: inline-flex; align-items: center; gap: 4px">
        <XhSelectTag v-for="t in tags" :key="t.value" :value="t.value">{{ t.label }}</XhSelectTag>
        <span v-if="overflowCount > 0" style="color: var(--xh-fg-muted); font-size: 12px">
          +{{ overflowCount }}
        </span>
      </span>
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
    <!-- 触发器外的可删标签行：按钮不能套按钮，删除钮只能放在这里 -->
    <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-block-start: 6px">
      <XhSelectTag v-for="v in picked" :key="v" :value="v">
        {{ options.find((o) => o.value === v)?.label ?? v }}
        <XhSelectTagRemove>✕</XhSelectTagRemove>
      </XhSelectTag>
    </div>
  </XhSelectRoot>
</template>
