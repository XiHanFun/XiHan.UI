<!-- 父子联动勾选 | 机器按点了哪条路径原样翻转，父子传导与回显折叠都在宿主这一侧算完再写回 value -->
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

const key = (path: readonly string[]) => JSON.stringify(path);

function nodeAt(path: readonly string[]): CatalogNode | undefined {
  let nodes: CatalogNode[] | undefined = catalog;
  let hit: CatalogNode | undefined;
  for (const segment of path) {
    hit = nodes?.find((node) => node.value === segment);
    nodes = hit?.children;
  }
  return hit;
}

// 一条路径底下的全部叶子路径；它自己就是叶子时返回它自己
function leavesUnder(path: string[]): string[][] {
  const node = nodeAt(path);
  if (!node?.children?.length) {
    return [path];
  }
  return node.children.flatMap((child) => leavesUnder([...path, child.value]));
}

// 勾中的叶子是唯一事实源，父节点的状态一律由它算
const leaves = ref<string[][]>([["digital", "phone", "ios"]]);
const checkedKeys = computed(() => new Set(leaves.value.map(key)));

function isFull(path: string[]): boolean {
  return leavesUnder(path).every((leaf) => checkedKeys.value.has(key(leaf)));
}

function isHalf(path: string[]): boolean {
  const under = leavesUnder(path);
  const hit = under.filter((leaf) => checkedKeys.value.has(key(leaf)));
  return hit.length > 0 && hit.length < under.length;
}

// 写回组件的那一份：叶子本身，加上底下已勾满的父节点——父条目上的 ✓ 由它画出来
const value = computed<string[][]>(() => {
  const out: string[][] = [...leaves.value];
  const walk = (nodes: CatalogNode[], parent: string[]) => {
    for (const node of nodes) {
      if (!node.children?.length) {
        continue;
      }
      const path = [...parent, node.value];
      if (isFull(path)) {
        out.push(path);
      }
      walk(node.children, path);
    }
  };
  walk(catalog, []);
  return out;
});

// 组件只报「这一条被翻转了」，与上一轮比出动的那一条，再把它底下的叶子整批加减
function onValueChange(details: { value: string[][] }) {
  const before = new Set(value.value.map(key));
  const after = new Set(details.value.map(key));
  const next = new Set(leaves.value.map(key));

  for (const path of details.value.filter((p) => !before.has(key(p)))) {
    for (const leaf of leavesUnder(path)) {
      next.add(key(leaf));
    }
  }
  for (const path of value.value.filter((p) => !after.has(key(p)))) {
    for (const leaf of leavesUnder(path)) {
      next.delete(key(leaf));
    }
  }
  leaves.value = [...next].map((k) => JSON.parse(k) as string[]);
}

const labelOf = (path: string[]) => nodeAt(path)?.label ?? path[path.length - 1];

// 同一份勾选，三种回显：全报、勾满就只报父、只报叶子
const textAll = computed(() => value.value.map(labelOf).join("、"));
const textParent = computed(() => {
  const kept = value.value.filter(
    (path) => path.length === 1 || !isFull(path.slice(0, -1)),
  );
  return kept.map(labelOf).join("、");
});
const textChild = computed(() => leaves.value.map(labelOf).join("、"));
</script>

<template>
  <XhCascaderRoot
    v-slot="{ levels }"
    :value="value"
    :collection="catalog"
    multiple
    change-on-select
    @value-change="onValueChange"
  >
    <XhCascaderLabel>投放品类</XhCascaderLabel>
    <XhCascaderTrigger>
      <XhCascaderValueText>
        {{ textParent || "请选择品类" }}
      </XhCascaderValueText>
      <XhCascaderIndicator>▾</XhCascaderIndicator>
    </XhCascaderTrigger>
    <XhCascaderClearTrigger>✕</XhCascaderClearTrigger>
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
              v-if="isHalf(node.path)"
              aria-hidden="true"
              style="flex: none; color: var(--xh-fg-subtle)"
            >
              －
            </span>
            <XhCascaderItemIndicator>✓</XhCascaderItemIndicator>
          </XhCascaderItem>
        </XhCascaderColumn>
      </XhCascaderContent>
    </XhCascaderPositioner>
  </XhCascaderRoot>
  <p>全报：{{ textAll || "（未选）" }}</p>
  <p>勾满只报父：{{ textParent || "（未选）" }}</p>
  <p>只报叶子：{{ textChild || "（未选）" }}</p>
</template>
