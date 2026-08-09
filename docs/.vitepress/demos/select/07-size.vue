<!-- 尺寸 | 触发器与浮层条目一起换档，不传 size 即默认档 -->
<script setup lang="ts">
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

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px">
    <XhSelectRoot
      v-for="s in sizes"
      :key="s.label"
      :size="s.size"
      :default-value="['apple']"
      placeholder="请选择"
    >
      <XhSelectLabel>{{ s.label }}</XhSelectLabel>
      <XhSelectTrigger>
        <XhSelectValueText />
        <XhSelectIndicator>▾</XhSelectIndicator>
      </XhSelectTrigger>
      <XhSelectPositioner>
        <XhSelectContent>
          <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value">
            <XhSelectItemText>{{ f.label }}</XhSelectItemText>
            <XhSelectItemIndicator>✓</XhSelectItemIndicator>
          </XhSelectItem>
        </XhSelectContent>
      </XhSelectPositioner>
    </XhSelectRoot>
  </div>
</template>
