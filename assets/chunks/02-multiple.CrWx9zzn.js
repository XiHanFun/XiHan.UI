const n=`<!-- 多选 | multiple 下空格改成切换该条，Shift + 方向键顺手扩选，Ctrl / Cmd + A 全选或全不选 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhListboxRoot } from "@xihan-ui/vue";

const cities = ref<string[]>(["beijing", "london"]);
const options = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "chengdu", label: "Chengdu 成都" },
  { value: "london", label: "London 伦敦" },
];
<\/script>

<template>
  <XhListboxRoot
    v-model:value="cities"
    :collection="options"
    label="常去城市"
    multiple
    style="max-inline-size: 320px"
  />
  <p>已选：{{ cities.length ? cities.join("、") : "（无）" }}</p>
</template>
`;export{n as default};
