<!-- 基础用法 | 集中常用编辑操作 -->
<script setup lang="ts">
import { BoldIcon, ClipboardIcon, CopyIcon, ItalicIcon, UnderlineIcon } from "@xihan-ui/icons";
import {
  XhIcon,
  XhToolbarGroup,
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
    <XhToolbarGroup>
      <template v-for="(format, index) in formats" :key="format.value">
        <XhToolbarSeparator v-if="index > 0" />
        <XhToolbarItem
          :value="format.value"
          type="button"
          :aria-label="format.label"
          :aria-pressed="selected.has(format.value)"
          @click="toggle(format.value)"
        >
          <XhIcon :icon="format.icon" />
        </XhToolbarItem>
      </template>
    </XhToolbarGroup>
    <XhToolbarSeparator />
    <XhToolbarGroup>
      <XhToolbarItem value="copy" type="button" aria-label="复制">
        <XhIcon :icon="CopyIcon" />
      </XhToolbarItem>
      <XhToolbarSeparator />
      <XhToolbarItem value="paste" type="button" aria-label="粘贴">
        <XhIcon :icon="ClipboardIcon" />
      </XhToolbarItem>
    </XhToolbarGroup>
  </XhToolbarRoot>
</template>
