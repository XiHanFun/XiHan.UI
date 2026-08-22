const e=`<!-- 中间层可选 | change-on-select 让分支自己也能落值；选中分支后浮层不收起，还能接着往下挑 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhCascaderClearTrigger,
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

const catalog = [
  {
    value: "docs",
    label: "文档",
    children: [
      { value: "guide", label: "指南" },
      { value: "api", label: "接口" },
    ],
  },
  {
    value: "design",
    label: "设计",
    children: [
      { value: "token", label: "设计令牌" },
      { value: "icon", label: "图标" },
    ],
  },
];

const path = ref<string[][]>([]);
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    v-model:value="path"
    :collection="catalog"
    change-on-select
    separator=" › "
    placeholder="选一个栏目"
  >
    <XhCascaderLabel>栏目</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText />
      <XhCascaderIndicator />
    </XhCascaderTrigger>
    <XhCascaderClearTrigger />
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem v-for="node in lv.items" :key="node.value" :value="node.value">
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>当前路径：{{ path.length ? path[0].join(" › ") : "（未选）" }}</p>
</template>
`;export{e as default};
