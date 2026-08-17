<!-- 清空按钮 | XhSelectControl 收纳触发器与清空按钮：清空钮嵌在触发器右端、悬停时替换下拉箭头；有选中才显形，点按清空全部选中、不展开浮层；可及名走 translations.clear -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhSelectClearTrigger,
  XhSelectContent,
  XhSelectControl,
  XhSelectIndicator,
  XhSelectItem,
  XhSelectItemIndicator,
  XhSelectItemText,
  XhSelectLabel,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const teams = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

const picked = ref<string[]>(["design"]);
</script>

<template>
  <XhSelectRoot
    v-model:value="picked"
    :translations="{ clear: '清空所选' }"
    placeholder="选一个组"
    style="inline-size: 240px"
  >
    <XhSelectLabel>所属小组</XhSelectLabel>
    <XhSelectControl>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator>▾</XhSelectIndicator>
      </XhSelectTrigger>
      <XhSelectClearTrigger>✕</XhSelectClearTrigger>
    </XhSelectControl>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem v-for="t in teams" :key="t.value" :value="t.value">
            <XhSelectItemText>{{ t.label }}</XhSelectItemText>
            <XhSelectItemIndicator>✓</XhSelectItemIndicator>
          </XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p style="margin: 8px 0 0; font-size: 13px">选中：{{ picked.length ? picked.join(", ") : "（空）" }}</p>
</template>
