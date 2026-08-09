<!-- 受控 | 传了 value 就由宿主说了算：组件只发 value-change，宿主写回它才变，这里把樱桃挡在门外 -->
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

const value = ref<string[]>(["banana"]);
const rejected = ref(false);
const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "cherry", label: "樱桃（选不中）" },
];

// 只有通过校验的值才写回，未写回则界面停在原值
function onValueChange(details: { value: string[] }) {
  rejected.value = details.value.includes("cherry");
  if (!rejected.value) value.value = details.value;
}
</script>

<template>
  <XhSelectRoot :value="value" placeholder="请选择" @value-change="onValueChange">
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
  <p>宿主持有的值：{{ value.join("、") }}{{ rejected ? " · 上一次选择被拒绝" : "" }}</p>
</template>
