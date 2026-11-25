<!-- 受控 | 传入 expandedValue / selection 后由宿主决定，组件只发事件不落内部值，宿主写回后才变化；这里分支的选中意图不写回，选中集合里只有叶子 -->
<script setup lang="ts">
import {
  XhButton,
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

const collection = [
  {
    value: "api",
    label: "接口",
    children: [
      { value: "auth", label: "鉴权" },
      { value: "user", label: "用户" },
    ],
  },
  {
    value: "guide",
    label: "指南",
    children: [{ value: "start", label: "快速开始" }],
  },
];

const expanded = ref<string[]>(["api"]);
const selected = ref<string[]>([]);

function onExpandedValueChange(details: { value: string[] }) {
  expanded.value = details.value;
}

// 只有叶子进选中集合：带上分支的那次意图整个不写回，选中照旧
const leaves = new Set(collection.flatMap(group => group.children.map(item => item.value)));

function onSelectionChange(details: { value: string[] }) {
  if (details.value.some(value => !leaves.has(value)))
    return;
  selected.value = details.value;
}
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <XhButton variant="outline" size="sm" @click="expanded = ['api', 'guide']">全部展开</XhButton>
      <XhButton variant="outline" size="sm" @click="expanded = []">全部收起</XhButton>
    </div>

    <XhTreeRoot
      :collection="collection"
      :expanded-value="expanded"
      :selection="selected"
      @expanded-value-change="onExpandedValueChange"
      @selection-change="onSelectionChange"
    >
      <XhTreeLabel>文档目录</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="api">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>接口</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="auth">
              <XhTreeItemText>鉴权</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
            <XhTreeItem value="user">
              <XhTreeItemText>用户</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="guide">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>指南</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="start">
              <XhTreeItemText>快速开始</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>

    <span data-demo-output>
      展开：{{ expanded.length ? expanded.join("、") : "（无）" }} · 选中：{{
        selected.length ? selected.join("、") : "（无）"
      }}
    </span>
  </div>
</template>
