<!-- 基础用法 | 构建应用页面骨架 -->
<script setup lang="ts">
import { XhLayoutContent, XhLayoutFooter, XhLayoutHeader, XhLayoutRoot, XhLayoutSider } from "@xihan-ui/vue";
</script>

<template>
  <XhLayoutRoot bordered sider-breakpoint="sm" style="inline-size: min(720px, 100%); block-size: 280px; border-radius: var(--xh-shape-surface); overflow: hidden">
    <XhLayoutHeader><strong>XiHan Admin</strong></XhLayoutHeader>
    <XhLayoutSider>
      <div style="display: grid; gap: 12px"><span>概览</span><span>用户</span><span>设置</span></div>
    </XhLayoutSider>
    <XhLayoutContent>
      <strong>欢迎回来</strong>
      <p style="color: var(--xh-fg-muted)">这里是今日的项目概览。</p>
    </XhLayoutContent>
    <XhLayoutFooter>© 2026 XiHan.UI</XhLayoutFooter>
  </XhLayoutRoot>
</template>
