<!-- 自定义条目 | 条目里想放什么都行：连打检索只认 item-text，多出来的文字不参与，选中与导航照旧 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPopselectContent,
  XhPopselectControl,
  XhPopselectItem,
  XhPopselectItemIndicator,
  XhPopselectItemText,
  XhPopselectPositioner,
  XhPopselectRoot,
  XhPopselectTrigger,
} from "@xihan-ui/vue";

const members = [
  { value: "u1", label: "赵晓", role: "负责人" },
  { value: "u2", label: "钱多", role: "开发" },
  { value: "u3", label: "孙离", role: "设计" },
];

const picked = ref<string[]>(["u1"]);
const label = computed(() => members.find((m) => m.value === picked.value[0])?.label ?? "指派给");
</script>

<template>
  <XhPopselectRoot v-model:value="picked" :collection="members" placement="bottom-start">
    <XhPopselectControl>
      <XhPopselectTrigger>指派给：{{ label }}</XhPopselectTrigger>
    </XhPopselectControl>
    <XhPopselectPositioner>
      <XhPopselectContent>
        <XhPopselectItem v-for="m in members" :key="m.value" :value="m.value">
          <XhPopselectItemText>{{ m.label }}</XhPopselectItemText>
          <span style="color: var(--xh-fg-muted); font-size: var(--xh-font-size-sm)">
            {{ m.role }}
          </span>
          <XhPopselectItemIndicator />
        </XhPopselectItem>
      </XhPopselectContent>
    </XhPopselectPositioner>
  </XhPopselectRoot>
  <p>当前指派：{{ picked.join("、") || "（未指派）" }}</p>
</template>
