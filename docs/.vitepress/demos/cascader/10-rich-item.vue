<!-- 条目自定义内容 | 条目里放什么由作者定：文本两侧各加一段，是不是分支直接读 item 的 branch -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCascaderColumn,
  XhCascaderContent,
  XhCascaderIndicator,
  XhCascaderItem,
  XhCascaderItemIndicator,
  XhCascaderItemText,
  XhCascaderLabel,
  XhCascaderPositioner,
  XhCascaderRoot,
  XhCascaderTrigger,
  XhCascaderValueText,
} from "@xihan-ui/vue";

const org = [
  {
    value: "product",
    label: "产品线",
    children: [
      { value: "design", label: "设计组" },
      { value: "research", label: "用研组" },
    ],
  },
  {
    value: "tech",
    label: "技术线",
    children: [
      { value: "web", label: "前端组" },
      { value: "server", label: "服务端组" },
    ],
  },
];

// 条目上的附加信息由作者自己按值查，组件只管值与层级
const headcount: Record<string, number> = {
  product: 18,
  design: 11,
  research: 7,
  tech: 32,
  web: 14,
  server: 18,
};

const dept = ref<string[][]>([]);
</script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="dept"
    :collection="org"
    placeholder="请选择团队"
  >
    <XhCascaderLabel>团队</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText />
      <XhCascaderIndicator>▾</XhCascaderIndicator>
    </XhCascaderTrigger>
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <span aria-hidden="true" style="flex: none; color: var(--xh-fg-subtle)">
              {{ node.branch ? "▸" : "·" }}
            </span>
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <span style="flex: none; color: var(--xh-fg-subtle); font-size: 12px">
              {{ headcount[node.value] }} 人
            </span>
            <XhCascaderItemIndicator>✓</XhCascaderItemIndicator>
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>当前团队：{{ dept.length ? dept[0].join(" / ") : "（未选）" }}</p>
</template>
