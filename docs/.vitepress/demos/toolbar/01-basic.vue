<!-- 基础用法 | 集中常用编辑操作 -->
<script setup lang="ts">
import { BoldIcon, ItalicIcon, RotateLeftIcon, RotateRightIcon, UnderlineIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";
import { ref } from "vue";

const formats = [
  { value: "bold", label: "加粗", icon: BoldIcon },
  { value: "italic", label: "斜体", icon: ItalicIcon },
  { value: "underline", label: "下划线", icon: UnderlineIcon },
];
const selected = ref(new Set(["bold"]));

function toggle(value: string) {
  const next = new Set(selected.value);
  next.has(value) ? next.delete(value) : next.add(value);
  selected.value = next;
}
</script>

<template>
  <XhToolbarRoot aria-label="文本编辑">
    <XhToolbarItem value="undo" type="button" aria-label="撤销">
      <XhIcon :icon="RotateLeftIcon" />
    </XhToolbarItem>
    <XhToolbarItem value="redo" type="button" aria-label="重做">
      <XhIcon :icon="RotateRightIcon" />
    </XhToolbarItem>
    <XhToolbarSeparator />
    <XhToolbarItem
      v-for="format in formats"
      :key="format.value"
      :value="format.value"
      type="button"
      :aria-label="format.label"
      :aria-pressed="selected.has(format.value)"
      @click="toggle(format.value)"
    >
      <XhIcon :icon="format.icon" />
    </XhToolbarItem>
  </XhToolbarRoot>
</template>
