<!-- 全选与半选 | trigger 是第三态复选框，只有把全部条目的值交给 itemValues 才分得清 checked 与 indeterminate -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCheckboxGroupItem,
  XhCheckboxGroupIndicator,
  XhCheckboxGroupItemText,
  XhCheckboxGroupLabel,
  XhCheckboxGroupRoot,
  XhCheckboxGroupTrigger,
} from "@xihan-ui/vue";

const items = [
  { value: "cheese", label: "芝士" },
  { value: "bacon", label: "培根" },
  { value: "corn", label: "玉米" },
  { value: "truffle", label: "松露（禁用）", disabled: true },
];
const itemValues = items.map((t) => t.value);
const toppings = ref<string[]>(["cheese"]);
</script>

<template>
  <XhCheckboxGroupRoot
    v-slot="{ checkedState }"
    v-model:value="toppings"
    :item-values="itemValues"
  >
    <XhCheckboxGroupLabel>配料</XhCheckboxGroupLabel>
    <!-- 方框与勾号／横杠由皮肤画，这里只写文案 -->
    <XhCheckboxGroupTrigger>
      <span>全选（{{ checkedState }}）</span>
    </XhCheckboxGroupTrigger>
    <XhCheckboxGroupItem
      v-for="t in items"
      :key="t.value"
      :value="t.value"
      :disabled="t.disabled"
    >
      <XhCheckboxGroupIndicator />
      <XhCheckboxGroupItemText>{{ t.label }}</XhCheckboxGroupItemText>
    </XhCheckboxGroupItem>
  </XhCheckboxGroupRoot>
  <span>当前：{{ toppings.join("、") || "（无）" }}</span>
</template>
