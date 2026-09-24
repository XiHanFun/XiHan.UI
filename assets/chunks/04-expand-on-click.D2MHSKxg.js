const e=`// 点击行展开与禁用节点 | 缺省点行只选中、展开归箭头与左右方向键，expandOnClick 打开后点行同时切换展开态；禁用节点仍可聚焦，只是确认键不响应它
import type { ReactNode } from "react";
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
} from "@xihan-ui/react";

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

export default function Demo(): ReactNode {
  return (
    <XhTreeRoot
      collection={collection}
      defaultExpandedValue={["build"]}
      expandOnClick
      style={{ inlineSize: "100%", maxInlineSize: "320px" }}
    >
      <XhTreeLabel>构建产物</XhTreeLabel>
      <XhTreeTree>
        <XhTreeBranch value="build">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>build</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent>
            <XhTreeItem value="vite">
              <XhTreeItemText>vite.config.ts</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
            <XhTreeItem value="lock">
              <XhTreeItemText>pnpm-lock.yaml（禁用）</XhTreeItemText>
              <XhTreeItemIndicator />
            </XhTreeItem>
          </XhTreeBranchContent>
        </XhTreeBranch>

        <XhTreeBranch value="dist">
          <XhTreeBranchControl>
            <XhTreeBranchTrigger />
            <XhTreeBranchText>dist</XhTreeBranchText>
            <XhTreeItemIndicator />
          </XhTreeBranchControl>
          <XhTreeBranchContent />
        </XhTreeBranch>

        <XhTreeItem value="readme">
          <XhTreeItemText>README.md</XhTreeItemText>
          <XhTreeItemIndicator />
        </XhTreeItem>
      </XhTreeTree>
    </XhTreeRoot>
  );
}
`;export{e as default};
