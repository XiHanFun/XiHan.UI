<script setup lang="ts">
import { XhLoadingBarRange, XhLoadingBarRoot, XhLoadingBarTrack } from "@xihan-ui/vue";
</script>

<template>
  <!-- 真用法是钉在视口上沿；预览里给它一块小页面，条子改成相对定位贴在这块的顶边 -->
  <div style="position: relative; inline-size: 240px; block-size: 120px; overflow: hidden; border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); background: var(--xh-bg-surface)">
    <XhLoadingBarRoot loading :value="62" style="position: absolute; inset: 0 0 auto">
      <XhLoadingBarTrack>
        <XhLoadingBarRange />
      </XhLoadingBarTrack>
    </XhLoadingBarRoot>
    <div style="padding: 20px 14px 0; color: var(--xh-fg-muted); font-size: 12px">页面正在切换…</div>
  </div>
</template>
