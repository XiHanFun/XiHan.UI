<!-- 弹出式选择 | 把列表装进浮层：触发器显示当前选中项，落值即收起，浮层底部还能放操作按钮 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhButton,
  XhListboxRoot,
  XhPopoverContent,
  XhPopoverPositioner,
  XhPopoverRoot,
  XhPopoverTrigger,
} from "@xihan-ui/vue";

const songs = [
  { value: "song1", label: "起风了" },
  { value: "song2", label: "夜空中最亮的星" },
  { value: "song3", label: "海阔天空（暂不可选）", disabled: true },
  { value: "song4", label: "晴天" },
];

const value = ref<string[]>(["song1"]);
const open = ref(false);
const label = computed(() => songs.find((s) => s.value === value.value[0])?.label ?? "弹出选择");

// 单选：落值即收起浮层
function onValueChange(details: { value: string[] }): void {
  if (details.value.length > 0) open.value = false;
}
</script>

<template>
  <XhPopoverRoot v-model:open="open" placement="bottom-start">
    <XhPopoverTrigger>{{ label }}</XhPopoverTrigger>
    <XhPopoverPositioner>
      <XhPopoverContent>
        <XhListboxRoot
          v-model:value="value"
          :collection="songs"
          style="min-inline-size: 200px"
          @value-change="onValueChange"
        />
        <XhButton variant="ghost" size="sm" @click="value = []">清空</XhButton>
      </XhPopoverContent>
    </XhPopoverPositioner>
  </XhPopoverRoot>
  <p>已选：{{ value.length ? value.join("、") : "（无）" }}</p>
</template>
