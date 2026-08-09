<!-- 尺寸 | size 只换整条的内边距与条目间的间距，条目自身的高度与字号归条目的皮肤管 -->
<script setup lang="ts">
import {
  XhToolbarItem,
  XhToolbarRoot,
  XhToolbarSeparator,
} from "@xihan-ui/vue";

const itemStyle = {
  padding: "4px 10px",
  borderRadius: "6px",
  border: "1px solid var(--xh-border-default)",
  background: "var(--xh-bg-surface)",
};
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>sm</span>
      <XhToolbarRoot size="sm">
        <XhToolbarItem value="sm-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="sm-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="sm-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>缺省</span>
      <XhToolbarRoot>
        <XhToolbarItem value="md-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="md-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="md-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>

    <div style="display: flex; flex-direction: column; gap: 6px">
      <span>lg</span>
      <XhToolbarRoot size="lg">
        <XhToolbarItem value="lg-bold" :style="itemStyle">粗体</XhToolbarItem>
        <XhToolbarItem value="lg-italic" :style="itemStyle">斜体</XhToolbarItem>
        <XhToolbarSeparator />
        <XhToolbarItem value="lg-link" :style="itemStyle">链接</XhToolbarItem>
      </XhToolbarRoot>
    </div>
  </div>
</template>
