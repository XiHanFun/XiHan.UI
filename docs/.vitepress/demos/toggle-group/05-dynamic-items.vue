<!-- 条目增删 | 条目集合在运行期可增可删，增删后照常接线；删掉的正好是选中项时由宿主把值收拾干净 -->
<script setup lang="ts">
import { ref } from "vue";
import { XhToggleGroupRoot } from "@xihan-ui/vue";

interface ViewOption {
  value: string;
  label: string;
  disabled?: boolean;
}

const options = ref<ViewOption[]>([
  { value: "list", label: "列表" },
  { value: "board", label: "看板" },
  { value: "chart", label: "图表", disabled: true },
]);
const view = ref<string | null>("list");
let seq = 0;

function addOption() {
  seq += 1;
  options.value.push({ value: `custom-${seq}`, label: `视图 ${seq}` });
}

function removeLast() {
  const removed = options.value.pop();
  // 删掉的正是当前值，选中态就没了落点，受控值得跟着清掉
  if (removed && removed.value === view.value)
    view.value = null;
}
</script>

<template>
  <span style="display: inline-flex; align-items: center; gap: 10px;">
    <XhToggleGroupRoot v-model:value="view" :collection="options" />
    <span style="font-size: 13px;">当前：{{ view ?? "（无选中）" }}</span>
  </span>

  <span style="display: inline-flex; gap: 8px;">
    <button type="button" @click="addOption">加一段</button>
    <button type="button" @click="removeLast">删末段</button>
  </span>
</template>
