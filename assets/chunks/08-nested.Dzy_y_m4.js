const n=`<!-- 二级目录 | 子链接嵌在父项里的原生列表中，按文档序照常参与结算；父级要不要跟着亮由宿主自己算 -->
<script setup lang="ts">
import { computed, ref } from "vue";
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";

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

// 正文区块按文档序摊平，父节与子节共用一份清单
const sections = computed(() =>
  groups.flatMap((g) => [{ value: g.value, label: g.label }, ...g.children]),
);

const active = ref<string | null>(null);
const scrollEl = ref<HTMLElement | null>(null);

// 子节命中时父节一起点亮
function isGroupActive(group: {
  value: string;
  children: readonly { value: string }[];
}): boolean {
  return (
    active.value === group.value
    || group.children.some((c) => c.value === active.value)
  );
}
<\/script>

<template>
  <div
    style="
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 20px;
      inline-size: 100%;
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
          <!-- 子级用一层原生 ul 承载：再嵌一个 XhAnchorList 会把指示条的参照系抢走 -->
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
        padding: 12px;
        border: 1px solid var(--xh-border-default);
        border-radius: 8px;
      "
    >
      <div
        v-for="s in sections"
        :id="s.value"
        :key="s.value"
        style="block-size: 140px"
      >
        <strong>{{ s.label }}</strong>
        <p>这一节的正文。</p>
      </div>
    </div>
  </div>
</template>
`;export{n as default};
