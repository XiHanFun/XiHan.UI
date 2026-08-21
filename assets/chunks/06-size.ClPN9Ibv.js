const n=`<!-- 尺寸 | size 换条目的字号与左右内边距，不传 size 即默认档 -->
<script setup lang="ts">
import {
  XhAnchorIndicator,
  XhAnchorItem,
  XhAnchorLink,
  XhAnchorList,
  XhAnchorRoot,
} from "@xihan-ui/vue";

// 中间一档不写 size，用 undefined 表达
const sizes = [
  { size: "sm", label: "小" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "大" },
] as const;

const sections = [
  { value: "anchor-size-install", label: "安装" },
  { value: "anchor-size-usage", label: "用法" },
  { value: "anchor-size-faq", label: "常见问题" },
];
<\/script>

<template>
  <div
    style="
      inline-size: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      align-items: start;
    "
  >
    <div v-for="s in sizes" :key="s.label">
      <div style="margin-block-end: 8px; font-size: 12px">{{ s.label }}</div>
      <XhAnchorRoot :size="s.size" default-value="anchor-size-usage">
        <XhAnchorList>
          <XhAnchorItem v-for="sec in sections" :key="sec.value">
            <XhAnchorLink :value="sec.value">{{ sec.label }}</XhAnchorLink>
          </XhAnchorItem>
          <XhAnchorIndicator />
        </XhAnchorList>
      </XhAnchorRoot>
    </div>
  </div>
</template>
`;export{n as default};
