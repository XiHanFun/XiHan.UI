<!-- Popover + Listbox | 不参与表单的选择 -->
<script setup lang="ts">
import {
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const orders = [
  { value: "latest", label: "最新发布" },
  { value: "hot", label: "最多讨论" },
  { value: "price", label: "价格从低到高" },
];

const order = ref<string[]>(["latest"]);
const open = ref(false);
const label = computed(() => orders.find(o => o.value === order.value[0])?.label ?? "排序");

// 单选：落值即收起浮层
function onValueChange(details: { value: string[] }): void {
  if (details.value.length > 0)
    open.value = false;
}
</script>

<template>
  <XhPopoverRoot v-model:open="open" placement="bottom-start">
    <XhPopoverTrigger>排序：{{ label }}</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhListboxRoot
          v-model:value="order"
          :collection="orders"
          style="min-inline-size: 180px"
          @value-change="onValueChange"
        />
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
</template>
