<!-- 基础用法 | 触发器旁弹出一个列表，选完即收起；条目按 value 标识身份，禁用的条目方向键会跳过 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhPopselectContent,
  XhPopselectPositioner,
  XhPopselectRoot,
  XhPopselectTrigger,
} from "@xihan-ui/vue";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
  { value: "blueberry", label: "蓝莓" },
  { value: "cherry", label: "樱桃（缺货）", disabled: true },
  { value: "durian", label: "榴莲" },
];

const picked = ref<string[]>([]);
// 触发器上显示当前选中项的文本，没选中就显示提示语
const label = computed(
  () => fruits.find((f) => f.value === picked.value[0])?.label ?? "请选择水果",
);
</script>

<template>
  <XhPopselectRoot v-model:value="picked" :collection="fruits" placement="bottom-start">
    <XhPopselectTrigger>{{ label }}</XhPopselectTrigger>
    <XhPopselectPositioner>
      <XhPopselectContent />
    </XhPopselectPositioner>
  </XhPopselectRoot>
  <p>当前值：{{ picked.length ? picked.join("、") : "（未选）" }}</p>
</template>
