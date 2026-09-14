<script setup lang="ts">
import { BoldIcon, ItalicIcon, UnderlineIcon } from "@xihan-ui/icons";
import { XhIcon, XhToolbarGroup, XhToolbarItem, XhToolbarRoot } from "@xihan-ui/vue";

const actions = [
  { value: "bold", label: "加粗", icon: BoldIcon },
  { value: "italic", label: "斜体", icon: ItalicIcon },
  { value: "underline", label: "下划线", icon: UnderlineIcon },
];
</script>

<template>
  <XhToolbarRoot aria-label="文本格式">
    <XhToolbarGroup>
      <XhToolbarItem
        v-for="action in actions"
        :key="action.value"
        :value="action.value"
        type="button"
        :aria-label="action.label"
      >
        <XhIcon :icon="action.icon" />
      </XhToolbarItem>
    </XhToolbarGroup>
  </XhToolbarRoot>
</template>
