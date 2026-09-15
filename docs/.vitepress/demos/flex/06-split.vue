<!-- 分隔符 | 在相邻内容之间添加分隔符 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";

const ruleStyle
  = "display: block; inline-size: 1px; block-size: 1em; background: var(--xh-border-default)";

const actions = ["编辑", "复制", "归档", "删除"];
const tones = ["brand", "info", "success", "danger"] as const;
</script>

<template>
  <XhFlex gap="sm">
    <template #split>
      <span :style="ruleStyle" />
    </template>
    <span
      v-for="(action, index) in actions"
      :key="action"
      data-demo-block="line"
      :data-tone="tones[index]"
      :aria-label="action"
      style="--xh-demo-block-inline-size: 48px"
    />
  </XhFlex>
</template>
