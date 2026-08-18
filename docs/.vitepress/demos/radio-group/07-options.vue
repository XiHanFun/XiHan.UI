<!-- 数据驱动 | 自家字段叫什么由数据定，映射成条目的值、文本与禁用即可 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import { XhRadioGroupRoot } from "@xihan-ui/vue";

const level = ref<string | null>("p1");
const levels = [
  { code: "p0", text: "紧急", locked: false },
  { code: "p1", text: "高", locked: false },
  { code: "p2", text: "普通", locked: false },
  { code: "p3", text: "低", locked: true },
];
const collection = computed(() =>
  levels.map((lv) => ({ value: lv.code, label: lv.text, disabled: lv.locked }))
);
</script>

<template>
  <XhRadioGroupRoot
    v-model:value="level"
    :collection="collection"
    label="优先级"
    name="level"
    orientation="horizontal"
  />
  <span>当前：{{ level ?? "（未选）" }}</span>
</template>
