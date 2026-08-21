const n=`<!-- 基础用法 | 方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhListboxRoot } from "@xihan-ui/vue";

const city = ref<string[]>(["beijing"]);
const cities = [
  { value: "beijing", label: "Beijing 北京" },
  { value: "berlin", label: "Berlin 柏林" },
  { value: "busan", label: "Busan 釜山（禁用）", disabled: true },
  { value: "london", label: "London 伦敦" },
];
<\/script>

<template>
  <XhListboxRoot
    v-model:value="city"
    :collection="cities"
    label="城市"
    style="max-inline-size: 320px"
  />
  <p>已选：{{ city.length ? city.join("、") : "（无）" }}</p>
</template>
`;export{n as default};
