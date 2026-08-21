const n=`<!-- 判定线偏移 | offset 是判定线距容器视口顶边的距离，有吸顶栏就把栏高填进去，越过它的最后一节才算当前节 -->
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
  { value: "anchor-offset-a", label: "第一节" },
  { value: "anchor-offset-b", label: "第二节" },
  { value: "anchor-offset-c", label: "第三节" },
];

const scrollEl = ref<HTMLElement | null>(null);
<\/script>

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
    <XhAnchorRoot :scroll-element="scrollEl" :offset="44" smooth>
      <XhAnchorList>
        <XhAnchorItem v-for="s in sections" :key="s.value">
          <XhAnchorLink :value="s.value">{{ s.label }}</XhAnchorLink>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        position: relative;
        block-size: 240px;
        overflow: auto;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <!-- 44px 高的吸顶栏，判定线正好压在它下沿 -->
      <div
        style="
          position: sticky;
          inset-block-start: 0;
          z-index: 1;
          block-size: 44px;
          display: flex;
          align-items: center;
          padding-inline: 12px;
          background: var(--xh-bg-surface);
          border-block-end: 1px solid var(--xh-border-default);
        "
      >
        吸顶栏（44px）
      </div>

      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 180px; padding: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p>这一节被吸顶栏挡住时不算当前节。</p>
      </div>
    </div>
  </div>
</template>
`;export{n as default};
