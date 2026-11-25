<!-- 放进页面骨架 | 页头、内容与页脚各放一个同档的版心，三段的内容对齐到同一条边线；通栏的底色与分隔线留在布局各段上 -->
<script setup lang="ts">
import { XhContainer, XhFlex, XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot } from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot split style="inline-size: 100%; border-radius: var(--xh-shape-surface); overflow: hidden">
    <XhLayoutHeader>
      <XhContainer max-width="sm">
        <XhFlex justify="between" align="center">
          <span data-demo-block="line" data-tone="brand" style="--xh-demo-block-inline-size: 24%" />
          <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 32%" />
        </XhFlex>
      </XhContainer>
    </XhLayoutHeader>
    <XhLayoutContent>
      <XhContainer max-width="sm">
        <XhFlex orientation="vertical" gap="sm">
          <span data-demo-block="line" data-tone="info" style="--xh-demo-block-inline-size: 48%" />
          <span data-demo-block="line" data-tone="neutral" />
          <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 80%" />
          <span data-demo-block data-tone="info" />
        </XhFlex>
      </XhContainer>
    </XhLayoutContent>
    <XhLayoutFooter>
      <XhContainer max-width="sm">
        <span data-demo-block="line" data-tone="neutral" style="--xh-demo-block-inline-size: 36%" />
      </XhContainer>
    </XhLayoutFooter>
  </XhLayoutRoot>
</template>
