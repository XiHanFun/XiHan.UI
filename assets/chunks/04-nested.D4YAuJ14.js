const n=`<!-- 嵌套目录 | 展示父级与子级章节 -->
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";
import { computed, ref } from "vue";

const groups = [
  {
    value: "anchor-nested-guide",
    label: "指南",
    children: [
      { value: "anchor-nested-install", label: "安装" },
      { value: "anchor-nested-start", label: "快速开始" },
    ],
  },
  {
    value: "anchor-nested-api",
    label: "接口",
    children: [
      { value: "anchor-nested-props", label: "属性" },
      { value: "anchor-nested-events", label: "事件" },
    ],
  },
];

const sections = computed(() =>
  groups.flatMap(g => [{ value: g.value, label: g.label }, ...g.children]),
);

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);

function isGroupActive(group: {
  value: string;
  children: readonly { value: string }[];
}): boolean {
  return (
    active.value === group.value
    || group.children.some(c => c.value === active.value)
  );
}
<\/script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: minmax(128px, 160px) minmax(0, 1fr);
      gap: 20px;
      inline-size: min(640px, 100%);
      align-items: start;
    "
  >
    <XhAnchorRoot v-model:value="active" :scroll-element="scrollEl" smooth>
      <XhAnchorList>
        <XhAnchorItem
          v-for="g in groups"
          :key="g.value"
          style="flex-direction: column; align-items: stretch"
        >
          <XhAnchorLink
            :value="g.value"
            :style="isGroupActive(g) ? { color: 'var(--xh-fg-brand)' } : undefined"
          >
            {{ g.label }}
          </XhAnchorLink>
          <ul
            style="margin: 0; padding: 0; padding-inline-start: 12px; list-style: none"
          >
            <XhAnchorItem v-for="c in g.children" :key="c.value">
              <XhAnchorLink :value="c.value">{{ c.label }}</XhAnchorLink>
            </XhAnchorItem>
          </ul>
        </XhAnchorItem>
        <XhAnchorIndicator />
      </XhAnchorList>
    </XhAnchorRoot>

    <div
      ref="scrollEl"
      style="
        block-size: 240px;
        overflow: auto;
        padding-inline: 12px;
        border-radius: var(--xh-shape-surface);
        background: var(--xh-bg-subtle);
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 140px; padding-block: 12px"
      >
        <strong>{{ s.label }}</strong>
        <p style="color: var(--xh-fg-muted)">{{ s.label }}相关内容</p>
      </div>
    </div>
  </div>
</template>
`;export{n as default};
