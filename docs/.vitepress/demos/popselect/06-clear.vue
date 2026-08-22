<!-- 清空按钮 | 清空钮与触发器一起收在盒里，是它的兄弟节点：有选中才显出，点按清空全部选中、焦点送回触发器；焦点在触发器上按 Delete 清空全部、Backspace 多选去掉最后一个；可及名走 translations.clearTrigger -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPopselectClearTrigger,
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
];

const picked = ref<string[]>(["bj", "sh"]);
// 多选把各项文本连起来显示
const label = computed(() => {
  const texts = picked.value.map((v) => cities.find((c) => c.value === v)?.label ?? v);
  return texts.length ? texts.join("、") : "请选择城市";
});
</script>

<template>
  <XhPopselectRoot
    v-model:value="picked"
    :collection="cities"
    multiple
    placement="bottom-start"
    :translations="{ clearTrigger: '清空所选' }"
  >
    <XhPopselectControl>
      <XhPopselectTrigger>{{ label }}</XhPopselectTrigger>
      <XhPopselectClearTrigger />
    </XhPopselectControl>
    <XhPopselectPositioner>
      <XhPopselectContent />
    </XhPopselectPositioner>
  </XhPopselectRoot>
  <p>已选 {{ picked.length }} 个</p>
</template>
