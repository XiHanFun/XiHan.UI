<!-- 多选 | multiple 下点中即在集合里增删该项、浮层不收起，触发器上的文本把选中项连起来 -->
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
  XhSelectTrigger,
  XhSelectValueText,
} from "@xihan-ui/vue";

const picked = ref<string[]>(["apple"]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot v-model:value="picked" multiple placeholder="请选择">
    <XhSelectLabel>水果（多选）</XhSelectLabel>
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
  <p>已选：{{ picked.length ? picked.join("、") : "（无）" }}</p>
</template>
