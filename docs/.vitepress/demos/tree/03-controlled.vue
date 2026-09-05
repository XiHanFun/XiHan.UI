<!-- 受控 | 传了 expandedValue / selection 就由宿主说了算，组件只发事件不落内部值，宿主写回它才动 -->
<script setup lang="ts">
import { ref } from "vue";
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

function onSelectionChange(details: { value: string[] }) {
  selected.value = details.value;
}
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <div style="display: flex; gap: 8px">
      <XhButton size="sm" @click="expanded = ['api', 'guide']">全部展开</XhButton>
      <XhButton size="sm" @click="expanded = []">全部收起</XhButton>
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
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="auth">
              <XhTreeItemIndicator />
              <XhTreeItemText>鉴权</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="user">
              <XhTreeItemIndicator />
              <XhTreeItemText>用户</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="guide">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>指南</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="start">
              <XhTreeItemIndicator />
              <XhTreeItemText>快速开始</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>

    <span>
      展开：{{ expanded.length ? expanded.join("、") : "（无）" }} · 选中：{{
        selected.length ? selected.join("、") : "（无）"
      }}
    </span>
  </div>
</template>
