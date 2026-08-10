<!-- 图标 | icon 部件排在标题前面，颜色取当前语气的强调色；内容由作者塞，字形与内联 svg 都行 -->
<script setup lang="ts">
import {
  XhAlertDescription,
  XhAlertIcon,
  XhAlertRoot,
  XhAlertTitle,
} from "@xihan-ui/vue";
</script>

<template>
  <div style="width: 100%; display: grid; gap: 12px">
    <!-- 一个字形就够：图标是纯装饰，读屏不会念它 -->
    <XhAlertRoot tone="success">
      <XhAlertIcon>✓</XhAlertIcon>
      <XhAlertTitle>发布完成</XhAlertTitle>
      <XhAlertDescription>三个节点都已切到新版本。</XhAlertDescription>
    </XhAlertRoot>

    <!-- 内联 svg 同样能塞进来，描边取 currentColor 就跟着语气走 -->
    <XhAlertRoot tone="danger">
      <XhAlertIcon>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3.5L21.5 20H2.5Z" />
          <path d="M12 9.5v4" />
          <path d="M12 16.5v.5" />
        </svg>
      </XhAlertIcon>
      <XhAlertTitle>发布失败</XhAlertTitle>
      <XhAlertDescription>第 2 个节点健康检查未通过。</XhAlertDescription>
    </XhAlertRoot>
  </div>
</template>
