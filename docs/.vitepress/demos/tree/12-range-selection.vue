<!-- 范围选 | 按住 Shift 点某一项，选中锚点到它那一段；按可见序取，折叠起来的子节点选不进去 -->
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

const collection = [
  {
    value: "cn",
    label: "华东",
    children: [
      { value: "sh", label: "上海" },
      { value: "hz", label: "杭州" },
      { value: "nj", label: "南京" },
    ],
  },
  {
    value: "north",
    label: "华北",
    children: [
      { value: "bj", label: "北京" },
      { value: "tj", label: "天津" },
    ],
  },
];

const selected = ref<string[]>([]);
</script>

<template>
  <div style="width: 100%; max-width: 320px; display: grid; gap: 12px">
    <p style="color: var(--xh-fg-muted)">
      点「上海」，再<strong>按住 Shift</strong> 点「北京」 —— 中间整段一起选上。
      再按住 Shift 点「南京」，选区往回收，起点不变。
    </p>
    <XhTreeRoot
      v-model:selection="selected"
      :collection="collection"
      :default-expanded-value="['cn', 'north']"
      selection-mode="multiple"
    >
      <XhTreeLabel>投放城市</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="cn">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华东</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="sh">
              <XhTreeItemIndicator />
              <XhTreeItemText>上海</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="hz">
              <XhTreeItemIndicator />
              <XhTreeItemText>杭州</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="nj">
              <XhTreeItemIndicator />
              <XhTreeItemText>南京</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="north">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>华北</XhTreeBranchText>
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="bj">
              <XhTreeItemIndicator />
              <XhTreeItemText>北京</XhTreeItemText>
            </XhTreeItem>
            <XhTreeItem value="tj">
              <XhTreeItemIndicator />
              <XhTreeItemText>天津</XhTreeItemText>
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>
      </XhTreeTree>
    </XhTreeRoot>
    <span>选中：{{ selected.length ? selected.join("、") : "（无）" }}</span>
  </div>
</template>
