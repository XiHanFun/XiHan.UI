// 文件管理器式多选 | 选择模式写 extended：点击换成这一项，按住 Ctrl（macOS 为 ⌘）点击加选或取消，按住 Shift 点击从锚点选一段
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
import { useState } from "react";

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

export default function Demo(): ReactNode {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <div style={{ width: "100%", maxWidth: "320px", display: "grid", gap: "12px" }}>
      <p style={{ color: "var(--xh-fg-muted)" }}>
        点「上海」，再
        <strong>按住 Ctrl</strong>
        （macOS 为 ⌘）点「北京」把它加进来；
        <strong>按住 Shift</strong>
        {" 点「南京」，从「北京」到「南京」那一段换成新的选中；不按键直接点，只留这一项。"}
      </p>
      <XhTreeRoot
        selection={selected}
        onSelectionChange={details => setSelected(details.value)}
        collection={collection}
        defaultExpandedValue={["cn", "north"]}
        selectionMode="extended"
      >
        <XhTreeLabel>投放城市</XhTreeLabel>
        <XhTreeTree>
          <XhTreeBranch value="cn">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger />
              <XhTreeBranchText>华东</XhTreeBranchText>
              <XhTreeItemIndicator />
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem value="sh">
                <XhTreeItemText>上海</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
              <XhTreeItem value="hz">
                <XhTreeItemText>杭州</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
              <XhTreeItem value="nj">
                <XhTreeItemText>南京</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>

          <XhTreeBranch value="north">
            <XhTreeBranchControl>
              <XhTreeBranchTrigger />
              <XhTreeBranchText>华北</XhTreeBranchText>
              <XhTreeItemIndicator />
            </XhTreeBranchControl>
            <XhTreeBranchContent>
              <XhTreeItem value="bj">
                <XhTreeItemText>北京</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
              <XhTreeItem value="tj">
                <XhTreeItemText>天津</XhTreeItemText>
                <XhTreeItemIndicator />
              </XhTreeItem>
            </XhTreeBranchContent>
          </XhTreeBranch>
        </XhTreeTree>
      </XhTreeRoot>
      <span data-demo-output>{`选中：${selected.length ? selected.join("、") : "（无）"}`}</span>
    </div>
  );
}
