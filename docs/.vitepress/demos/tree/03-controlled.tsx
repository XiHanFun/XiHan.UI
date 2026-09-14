// 受控 | 传了 expandedValue / selection 就由宿主说了算，组件只发事件不落内部值，宿主写回它才动
import type { ReactNode } from "react";
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
} from "@xihan-ui/react";
import { useState } from "react";

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

export default function Demo(): ReactNode {
  const [expanded, setExpanded] = useState<string[]>(["api"]);
  const [selected, setSelected] = useState<string[]>([]);

  function onExpandedValueChange(details: { value: string[] }): void {
    setExpanded(details.value);
  }

  function onSelectionChange(details: { value: string[] }): void {
    setSelected(details.value);
  }

  return (
    <div style={{ width: "100%", maxWidth: "320px", display: "grid", gap: "12px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <XhButton size="sm" onClick={() => setExpanded(["api", "guide"])}>全部展开</XhButton>
        <XhButton size="sm" onClick={() => setExpanded([])}>全部收起</XhButton>
      </div>

      <XhTreeRoot
        collection={collection}
        expandedValue={expanded}
        selection={selected}
        onExpandedValueChange={onExpandedValueChange}
        onSelectionChange={onSelectionChange}
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
        {`展开：${expanded.length ? expanded.join("、") : "（无）"} · 选中：${
          selected.length ? selected.join("、") : "（无）"
        }`}
      </span>
    </div>
  );
}
