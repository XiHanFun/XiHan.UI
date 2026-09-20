const e=`<!-- 对齐与分布 | 对齐内容并分配剩余空间 -->
<script setup lang="ts">
import { XhFlex } from "@xihan-ui/vue";
<\/script>

<template>
  <XhFlex
    align="center"
    justify="between"
    aria-label="两端对齐占位区块"
    style="inline-size: min(360px, 100%); padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)"
  >
    <XhFlex align="center" gap="sm">
      <span data-demo-block="square" data-tone="brand" />
      <XhFlex orientation="vertical" gap="xs">
        <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 88px" />
        <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 48px" />
      </XhFlex>
    </XhFlex>
    <span data-demo-block="line" data-tone="success" style="--xh-demo-block-inline-size: 64px" />
  </XhFlex>
</template>
`;export{e as default};
