<!-- 官方组合：浮层 + 列表框 | 值不进表单、只是就地切一个视图参数时用这一套：popover 管开合与定位，listbox 管条目与键盘，没有 hidden-select，也不占 name -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const orders = [
  { value: "latest", label: "最新发布" },
  { value: "hot", label: "最多讨论" },
  { value: "price", label: "价格从低到高" },
];

const order = ref<string[]>(["latest"]);
const open = ref(false);
const label = computed(() => orders.find((o) => o.value === order.value[0])?.label ?? "排序");

// 单选：落值即收起浮层
function onValueChange(details: { value: string[] }): void {
  if (details.value.length > 0) open.value = false;
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
