<!-- 基础用法 | 目录跟着滚动位置自己换高亮；scroll-element 把判定线挂到指定滚动容器上，不给就挂在窗口上 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";

// 链接的 value 就是目标区块的 id：href 由组件按它派生
const sections = [
  { value: "anchor-basic-intro", label: "这是什么" },
  { value: "anchor-basic-keyboard", label: "键盘怎么走" },
  { value: "anchor-basic-edge", label: "边界在哪" },
  { value: "anchor-basic-token", label: "主题与令牌" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 20px;
      inline-size: 100%;
      align-items: start;
    "
  >
    <XhAnchorRoot :scroll-element="scrollEl" smooth>
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <!-- 指示条必须住在 list 里：它以 list 为定位参照系，而 ul 里只放得下 li -->
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        block-size: 240px;
        overflow: auto;
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 目标区块是页面内容、不是组件的部件：组件按链接的 value 现查 id -->
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 180px"
      >
        <strong>{{ s.label }}</strong>
        <p>滚动这一栏，看左边哪一条亮起来。</p>
      </div>
    </div>
  </div>
</template>
