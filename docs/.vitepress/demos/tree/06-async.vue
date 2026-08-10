<!-- 异步加载子节点 | 展开那一刻才去要数据：先摆一行禁用的占位，取回来就地换掉，收起再展开不重复请求 -->
<script setup lang="ts">
import { ref } from "vue";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchText,
  XhTreeBranchTrigger,
  XhTreeItem,
  XhTreeItemIndicator,
  XhTreeItemText,
  XhTreeLabel,
  XhTreeRoot,
  XhTreeTree,
} from "@xihan-ui/vue";

interface Node {
  value: string;
  label: string;
  disabled?: boolean;
  children?: Node[];
}

// 占位行也是一个真节点：它得在 collection 里，方向键才走得到它
function pending(owner: string): Node[] {
  return [{ value: `${owner}-pending`, label: "加载中…", disabled: true }];
}

const collection = ref<Node[]>([
  { value: "rd", label: "研发中心", children: pending("rd") },
  { value: "ops", label: "运维中心", children: pending("ops") },
  { value: "biz", label: "业务中心", children: pending("biz") },
]);

const staff: Record<string, string[]> = {
  rd: ["赵一", "钱二"],
  ops: ["孙三"],
  biz: ["李四", "周五", "吴六"],
};

const expanded = ref<string[]>([]);
const loaded = new Set<string>();

function fetchChildren(value: string): void {
  if (loaded.has(value)) return;
  loaded.add(value);
  window.setTimeout(() => {
    const branch = collection.value.find((node) => node.value === value);
    if (!branch) return;
    branch.children = staff[value].map((name, index) => ({
      value: `${value}-${index}`,
      label: name,
    }));
  }, 800);
}

function onExpandedChange(details: { value: string[] }): void {
  expanded.value = details.value;
  for (const value of details.value) fetchChildren(value);
}
</script>

<template>
  <XhTreeRoot
    :collection="collection"
    :expanded-value="expanded"
    style="inline-size: 100%; max-inline-size: 320px"
    @expanded-change="onExpandedChange"
  >
    <XhTreeLabel>组织架构</XhTreeLabel>
    <XhTreeTree>
      <XhTreeBranch v-for="node in collection" :key="node.value" :value="node.value">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger>▸</XhTreeBranchTrigger>
          <XhTreeBranchText>{{ node.label }}</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem v-for="child in node.children" :key="child.value" :value="child.value">
            <XhTreeItemIndicator>✓</XhTreeItemIndicator>
            <XhTreeItemText>{{ child.label }}</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>
    </XhTreeTree>
  </XhTreeRoot>
</template>
