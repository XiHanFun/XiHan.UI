<!-- 分别固定 | 两个开关各自独立：只写 header-fixed 时侧栏照常随内容滚走，只写 sider-fixed 时侧栏钉在滚动容器上沿、头照常滚走 -->
<script setup lang="ts">
import {
  XhLayoutContent,
  XhLayoutHeader,
  XhLayoutRoot,
  XhLayoutSider,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="display: grid; gap: 16px">
    <div
      style="
        block-size: 200px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <XhLayoutRoot header-fixed bordered>
        <XhLayoutHeader>只固定头</XhLayoutHeader>
        <XhLayoutSider>导航会滚走</XhLayoutSider>
        <XhLayoutContent>
          <p v-for="i in 10" :key="i" style="margin-block-end: 12px">
            第 {{ i }} 段正文。
          </p>
        </XhLayoutContent>
      </XhLayoutRoot>
    </div>

    <div
      style="
        block-size: 200px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 头没固定，侧栏就贴滚动容器的上沿，不必让开谁 -->
      <XhLayoutRoot
        sider-fixed
        bordered
        style="--xh-layout-scrollport-h: 200px"
      >
        <XhLayoutHeader>头会滚走</XhLayoutHeader>
        <XhLayoutSider>只固定侧栏</XhLayoutSider>
        <XhLayoutContent>
          <p v-for="i in 10" :key="i" style="margin-block-end: 12px">
            第 {{ i }} 段正文。
          </p>
        </XhLayoutContent>
      </XhLayoutRoot>
    </div>
  </div>
</template>
