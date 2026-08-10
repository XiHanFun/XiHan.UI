<!-- 校验状态 | 校验结论由宿主给出：告警描边写进触发器的使用者令牌，错误文案用 aria-describedby 挂到触发器上 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
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

const departments = [
  { value: "design", label: "设计组" },
  { value: "frontend", label: "前端组" },
  { value: "server", label: "服务端组" },
];

const picked = ref<string[]>([]);
const invalid = computed(() => picked.value.length === 0);

// 描边与它的悬停档一起换成告警色，其余槽位不动
const invalidStyle = computed(() =>
  invalid.value
    ? {
        "--xh-select-trigger-border": "var(--xh-color-danger-500)",
        "--xh-select-trigger-border-hover": "var(--xh-color-danger-500)",
      }
    : undefined,
);
</script>

<template>
  <XhSelectRoot v-model:value="picked" placeholder="必须选一个">
    <XhSelectLabel>所属部门</XhSelectLabel>
    <XhSelectTrigger
      :style="invalidStyle"
      :aria-describedby="invalid ? 'select-invalid-tip' : undefined"
    >
      <XhSelectValueText />
      <XhSelectIndicator>▾</XhSelectIndicator>
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectItem v-for="d in departments" :key="d.value" :value="d.value">
          <XhSelectItemText>{{ d.label }}</XhSelectItemText>
          <XhSelectItemIndicator>✓</XhSelectItemIndicator>
        </XhSelectItem>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p v-if="invalid" id="select-invalid-tip" style="color: var(--xh-fg-danger)">这一项必填</p>
</template>
