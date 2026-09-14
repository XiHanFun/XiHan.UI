<script setup lang="ts">
import { XhLayoutContent, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot bordered sider-width="72px" style="inline-size: 240px; block-size: 150px; border-radius: var(--xh-shape-surface); overflow: hidden; font-size: 12px">
    <XhLayoutHeader><strong>XiHan Admin</strong></XhLayoutHeader>
    <XhLayoutSider>
      <div style="display: grid; gap: 8px"><span>概览</span><span>用户</span><span>设置</span></div>
    </XhLayoutSider>
    <XhLayoutContent>
      <strong>欢迎回来</strong>
      <p style="margin: 4px 0 0; color: var(--xh-fg-muted)">今日概览</p>
    </XhLayoutContent>
  </XhLayoutRoot>
</template>
