<!-- 基础用法 | trigger 展开浮层，item 落值；条目自己声明 disabled，方向键与连打检索会跳过它 -->
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

const fruit = ref<string[]>([]);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];
</script>

<template>
  <XhSelectRoot v-model:value="fruit" placeholder="请选择">
    <XhSelectLabel>水果</XhSelectLabel>
    <XhSelectTrigger>
      <XhSelectValueText />
      <XhSelectIndicator>▾</XhSelectIndicator>
    </XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectItem v-for="f in fruits" :key="f.value" :value="f.value" :disabled="f.disabled">
          <XhSelectItemText>{{ f.label }}</XhSelectItemText>
          <XhSelectItemIndicator>✓</XhSelectItemIndicator>
        </XhSelectItem>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
  <p>当前值：{{ fruit.length ? fruit.join("、") : "（未选）" }}</p>
</template>
