const n=`<!-- 对齐与分布 | 工具条只定主轴与条目间距，怎么分布交给 CSS：justify-content 一改，同一条就贴尾、居中或两端摊开 -->
<script setup lang="ts">
import {
  XhToolbarGroup,
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

// 分布方式写在 root 的内联样式上，条目的 DOM 顺序不动，方向键行程也就不受影响
const layouts = [
  { value: "flex-end", label: "贴尾" },
  { value: "center", label: "居中" },
  { value: "space-between", label: "两端摊开" },
];
<\/script>

<template>
  <div style="display: grid; gap: 12px; inline-size: 100%">
    <div v-for="l in layouts" :key="l.value" style="display: grid; gap: 6px">
      <span>{{ l.label }}</span>
      <XhToolbarRoot :style="{ justifyContent: l.value }">
        <XhToolbarGroup>
          <XhToolbarItem :value="\`\${l.value}-undo\`" :style="itemStyle">
            撤销
          </XhToolbarItem>
          <XhToolbarItem :value="\`\${l.value}-redo\`" :style="itemStyle">
            重做
          </XhToolbarItem>
        </XhToolbarGroup>
        <XhToolbarSeparator />
        <XhToolbarItem :value="\`\${l.value}-publish\`" :style="itemStyle">
          发布
        </XhToolbarItem>
      </XhToolbarRoot>
    </div>
  </div>
</template>
`;export{n as default};
