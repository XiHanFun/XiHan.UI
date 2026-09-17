<script setup lang="ts">
import { XhLoadingBarRange, XhLoadingBarRoot, XhLoadingBarTrack } from "@xihan-ui/vue";
</script>

<template>
  <!-- 真用法是钉在视口上沿；预览里给它一块小页面，条子改成相对定位贴在这块的顶边 -->
  <div style="position: relative; inline-size: var(--xh-doc-catalog-w); block-size: var(--xh-doc-catalog-h); overflow: hidden; border: var(--xh-stroke-thin) solid var(--xh-border-default); border-radius: var(--xh-shape-surface); background: var(--xh-bg-surface)">
    <XhLoadingBarRoot loading :value="62" style="position: absolute; inset: 0 0 auto">
      <XhLoadingBarTrack>
        <XhLoadingBarRange />
      </XhLoadingBarTrack>
    </XhLoadingBarRoot>
    <div style="padding: var(--xh-space-5) var(--xh-space-4) 0; color: var(--xh-fg-muted)">页面正在切换…</div>
  </div>
</template>
