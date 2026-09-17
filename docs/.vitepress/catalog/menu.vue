<script setup lang="ts">
import { ChevronDownIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuRoot } from "@xihan-ui/vue";

const actions = [
  { value: "new", label: "新建文件" },
  { value: "open", label: "打开文件" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];
</script>

<template>
  <XhMenuRoot :collection="actions" trigger-as-child>
    <template #trigger>
      <XhButton>
        操作
        <XhIcon :icon="ChevronDownIcon" />
      </XhButton>
    </template>
  </XhMenuRoot>
</template>
