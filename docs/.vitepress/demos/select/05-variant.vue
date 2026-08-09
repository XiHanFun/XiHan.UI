<!-- 形态 | variant 只改触发器的颜色槽位，浮层与键盘行为三档一致 -->
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

const variants = ["outline", "subtle", "ghost"] as const;
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃" },
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px">
    <XhSelectRoot
      v-for="v in variants"
      :key="v"
      :variant="v"
      :default-value="['apple']"
      placeholder="请选择"
    >
      <XhSelectLabel>{{ v }}</XhSelectLabel>
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
