const e=`<!-- 多选 | multiple 下落值是切换、浮层不收起，可以接着挑；收起交给 Esc 或点浮层外 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPopselectContent,
  XhPopselectControl,
  XhPopselectPositioner,
  XhPopselectRoot,
  XhPopselectTrigger,
} from "@xihan-ui/vue";

const cities = [
  { value: "bj", label: "北京" },
  { value: "sh", label: "上海" },
  { value: "gz", label: "广州" },
  { value: "sz", label: "深圳" },
  { value: "cd", label: "成都" },
];

const picked = ref<string[]>(["bj"]);
// 多选把各项文本连起来显示
const label = computed(() => {
  const texts = picked.value.map((v) => cities.find((c) => c.value === v)?.label ?? v);
  return texts.length ? texts.join("、") : "请选择城市";
});
<\/script>

<template>
  <XhPopselectRoot v-model:value="picked" :collection="cities" multiple placement="bottom-start">
    <XhPopselectControl>
      <XhPopselectTrigger>{{ label }}</XhPopselectTrigger>
    </XhPopselectControl>
    <XhPopselectPositioner>
      <XhPopselectContent />
    </XhPopselectPositioner>
  </XhPopselectRoot>
  <p>已选 {{ picked.length }} 个</p>
</template>
`;export{e as default};
