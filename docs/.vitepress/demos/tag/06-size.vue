<!-- 尺寸 | size 改变内边距、间距、字号与行框，不写即默认档；同一档有无关闭按钮高度相同，关闭按钮三档同一个尺寸 -->
<script setup lang="ts">
import { XhTagCloseTrigger, XhTagLabel, XhTagRoot } from "@xihan-ui/vue";

const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "缺省" },
  { size: "lg", label: "大" },
] as const;
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px">
    <template v-for="item in sizes" :key="item.label">
      <XhTagRoot variant="subtle" :size="item.size">
        <XhTagLabel>{{ item.label }}</XhTagLabel>
      </XhTagRoot>
      <XhTagRoot variant="subtle" :size="item.size" closable>
        <XhTagLabel>{{ item.label }}</XhTagLabel>
        <XhTagCloseTrigger />
      </XhTagRoot>
    </template>
  </div>
</template>
