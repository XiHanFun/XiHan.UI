const e=`<!-- 级联勾选与回显策略 | multiple 加 cascade 内建父子传导：点分支整枝勾上、子全勾父勾、部分勾中半选；对外值按 checked-strategy 收敛（默认只收叶），半选标记由条目自报的半选态出面 -->
<script setup lang="ts">
import { computed, ref } from "vue";
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

interface CatalogNode {
  value: string;
  label: string;
  children?: CatalogNode[];
}

const catalog: CatalogNode[] = [
  {
    value: "digital",
    label: "数码",
    children: [
      {
        value: "phone",
        label: "手机",
        children: [
          { value: "ios", label: "iOS" },
          { value: "android", label: "Android" },
        ],
      },
      {
        value: "laptop",
        label: "笔记本",
        children: [
          { value: "light", label: "轻薄本" },
          { value: "game", label: "游戏本" },
        ],
      },
    ],
  },
  {
    value: "home",
    label: "家居",
    children: [
      {
        value: "kitchen",
        label: "厨房",
        children: [
          { value: "pot", label: "锅具" },
          { value: "knife", label: "刀具" },
        ],
      },
    ],
  },
];

const value = ref<string[][]>([["digital", "phone", "ios"]]);

function labelOf(path: readonly string[]): string {
  let nodes: CatalogNode[] | undefined = catalog;
  let hit: CatalogNode | undefined;
  for (const segment of path) {
    hit = nodes?.find((node) => node.value === segment);
    nodes = hit?.children;
  }
  return hit?.label ?? path[path.length - 1]!;
}

const text = computed(() => value.value.map(labelOf).join("、"));
<\/script>

<template>
  <XhCascaderRoot
    v-slot="{ levels, isIndeterminate }"
    v-model:value="value"
    :collection="catalog"
    multiple
    cascade
  >
    <XhCascaderLabel>投放品类</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText>
        {{ text || "请选择品类" }}
      </XhCascaderValueText>
      <XhCascaderIndicator />
    </XhCascaderTrigger>
    <XhCascaderClearTrigger />
    <XhCascaderPositioner>
      <XhCascaderContent>
        <XhCascaderColumn v-for="lv in levels" :key="lv.level" :level="lv.level">
          <XhCascaderItem
            v-for="node in lv.items"
            :key="node.value"
            :value="node.value"
          >
            <XhCascaderItemText>{{ node.label }}</XhCascaderItemText>
            <span
              v-if="isIndeterminate(node.value)"
              aria-hidden="true"
              style="flex: none; color: var(--xh-fg-subtle)"
            >
              －
            </span>
            <XhCascaderItemIndicator />
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>选中值（默认只收叶）：{{ text || "（未选）" }}</p>
</template>
`;export{e as default};
