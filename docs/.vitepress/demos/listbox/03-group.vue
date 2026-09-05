<!-- 分组 | group 把条目分段，group-label 是这一段的可及名字，不参与选中也不接方向键 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhListboxContent,
  XhListboxItem,
  XhListboxGroup,
  XhListboxGroupLabel,
  XhListboxItemIndicator,
  XhListboxItemText,
  XhListboxLabel,
  XhListboxRoot,
} from "@xihan-ui/vue";

const city = ref<string[]>([]);
const groups = [
  {
    value: "asia",
    label: "亚洲",
    items: [
      { value: "bangkok", label: "Bangkok 曼谷" },
      { value: "beijing", label: "Beijing 北京" },
      { value: "chengdu", label: "Chengdu 成都" },
    ],
  },
  {
    value: "europe",
    label: "欧洲",
    items: [
      { value: "berlin", label: "Berlin 柏林" },
      { value: "london", label: "London 伦敦" },
    ],
  },
];
</script>

<template>
  <XhListboxRoot v-model:value="city" style="max-inline-size: 320px">
    <XhListboxLabel>城市</XhListboxLabel>
    <XhListboxContent>
      <XhListboxGroup v-for="g in groups" :key="g.value" :value="g.value">
        <XhListboxGroupLabel>{{ g.label }}</XhListboxGroupLabel>
        <XhListboxItem v-for="c in g.items" :key="c.value" :value="c.value">
          <XhListboxItemText>{{ c.label }}</XhListboxItemText>
          <XhListboxItemIndicator />
        </XhListboxItem>
      </XhListboxGroup>
    </XhListboxContent>
  </XhListboxRoot>
  <p>已选：{{ city.length ? city.join("、") : "（无）" }}</p>
</template>
