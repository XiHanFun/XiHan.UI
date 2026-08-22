const e=`<!-- 点行不展开与禁用节点 | expandOnClick 关掉后只有箭头与左右方向键能改展开态；禁用节点仍可聚焦，只是确认键不认它 -->
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

const collection = [
  {
    value: "build",
    label: "build",
    children: [
      { value: "vite", label: "vite.config.ts" },
      { value: "lock", label: "pnpm-lock.yaml", disabled: true },
    ],
  },
  // 空数组也算分支：展得开，只是里头没有行
  { value: "dist", label: "dist", children: [] },
  { value: "readme", label: "README.md" },
];
<\/script>

<template>
  <XhTreeRoot
    :collection="collection"
    :default-expanded-value="['build']"
    :expand-on-click="false"
    style="inline-size: 100%; max-inline-size: 320px"
  >
    <XhTreeLabel>构建产物</XhTreeLabel>
    <XhTreeTree>
      <XhTreeBranch value="build">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>build</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent>
          <XhTreeItem value="vite">
            <XhTreeItemIndicator />
            <XhTreeItemText>vite.config.ts</XhTreeItemText>
          </XhTreeItem>
          <XhTreeItem value="lock">
            <XhTreeItemIndicator />
            <XhTreeItemText>pnpm-lock.yaml（禁用）</XhTreeItemText>
          </XhTreeItem>
        </XhTreeBranchContent>
      </XhTreeBranch>

      <XhTreeBranch value="dist">
        <XhTreeBranchControl>
          <XhTreeBranchTrigger />
          <XhTreeBranchText>dist</XhTreeBranchText>
        </XhTreeBranchControl>
        <XhTreeBranchContent />
      </XhTreeBranch>

      <XhTreeItem value="readme">
        <XhTreeItemIndicator />
        <XhTreeItemText>README.md</XhTreeItemText>
      </XhTreeItem>
    </XhTreeTree>
  </XhTreeRoot>
</template>
`;export{e as default};
