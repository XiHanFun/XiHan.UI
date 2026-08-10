<!-- 吸顶目录 | 目录用 sticky 钉在滚动容器顶边，滚动时留在原处；判定线仍由 offset 定 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";

const sections = [
  { value: "anchor-affix-intro", label: "简介" },
  { value: "anchor-affix-install", label: "安装" },
  { value: "anchor-affix-usage", label: "用法" },
  { value: "anchor-affix-faq", label: "常见问题" },
];

const scrollEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div
    ref="scrollEl"
    style="
      block-size: 260px;
      overflow: auto;
      inline-size: 100%;
      border: 1px solid var(--xh-border-default);
      border-radius: 8px;
    "
  >
    <div style="display: grid; grid-template-columns: 140px 1fr; gap: 20px; padding: 12px">
      <!-- 外层这格随内容拉满，目录在它内部 sticky，才有可移动的余量 -->
      <div>
        <XhAnchorRoot
          :scroll-element="scrollEl"
          :offset="12"
          smooth
          style="position: sticky; inset-block-start: 0; background: var(--xh-bg-surface)"
        >
          <XhAnchorList>
            <XhAnchorItem v-for="s in sections" :key="s.value">
              <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
            </XhAnchorItem>
            <XhAnchorIndicator />
          </XhAnchorList>
        </XhAnchorRoot>
      </div>

      <div>
        <div
          v-for="s in sections"
          :id="s.value"
          :key="s.value"
          style="block-size: 200px"
        >
          <strong>{{ s.label }}</strong>
          <p>滚动整块区域，左边的目录会一直贴在顶边。</p>
        </div>
      </div>
    </div>
  </div>
</template>
