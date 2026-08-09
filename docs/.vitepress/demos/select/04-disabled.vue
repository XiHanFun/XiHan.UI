<!-- 禁用 | 根部件的 disabled 把触发器转成原生 disabled，浮层展不开、也不占 Tab 位 -->
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

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];
</script>

<template>
  <XhSelectRoot :default-value="['apple']" disabled placeholder="请选择">
    <XhSelectLabel>水果</XhSelectLabel>
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
</template>
