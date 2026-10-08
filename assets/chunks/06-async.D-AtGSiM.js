var e=`<!-- 异步加载子节点 | 展开时才请求数据：请求在途的分支写进 loadingValue，展开箭头换成转圈并报告 aria-busy；取回后写回 collection 并移出，收起再展开不重复请求 -->
<script setup lang="ts">
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
import { ref } from "vue";

interface Node {
  value: string;
  label: string;
  children?: Node[];
}

// 空数组也是分支：还没取回子项的部门照样报告 aria-expanded；没有 children 的是叶子，不用取
const collection = ref<Node[]>([
  { value: "rd", label: "研发中心", children: [] },
  { value: "ops", label: "运维中心", children: [] },
  { value: "biz", label: "业务中心", children: [] },
  { value: "board", label: "董事办" },
]);

const staff: Record<string, string[]> = {
  rd: ["赵一", "钱二"],
  ops: ["孙三"],
  biz: ["李四", "周五", "吴六"],
};

const expanded = ref<string[]>([]);
const loading = ref<string[]>([]);
const loaded = new Set<string>();

// 这里用定时器代替一次请求
function fetchChildren(value: string): void {
  if (loaded.has(value))
    return;
  loaded.add(value);
  loading.value = [...loading.value, value];
  window.setTimeout(() => {
    const branch = collection.value.find(node => node.value === value);
    if (branch)
      branch.children = staff[value].map((name, index) => ({ value: \`\${value}-\${index}\`, label: name }));
    loading.value = loading.value.filter(item => item !== value);
  }, 800);
}

function onExpandedValueChange(details: { value: string[] }): void {
  expanded.value = details.value;
  for (const value of details.value) fetchChildren(value);
}
<\/script>

<template>
  <XhTreeRoot
    :collection="collection"
    :expanded-value="expanded"
    :loading-value="loading"
    style="inline-size: 100%; max-inline-size: 320px"
    @expanded-value-change="onExpandedValueChange"
  >
    <XhTreeLabel>组织架构</XhTreeLabel>
    <XhTreeTree>
      <template v-for="node in collection" :key="node.value">
        <XhTreeBranch v-if="node.children" :value="node.value">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>{{ node.label }}</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem v-for="child in node.children" :key="child.value" :value="child.value">
              <XhTreeItemText>{{ child.label }}</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
        <XhTreeItem v-else :value="node.value">
          <XhTreeItemText>{{ node.label }}</XhTreeItemText>
          <XhTreeItemIndicator />
        </XhTreeItem>
      </template>
    </XhTreeTree>
  </XhTreeRoot>
</template>
`;export{e as default};