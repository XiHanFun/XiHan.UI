// 只让叶子进选中集合 | 选中受控就由宿主定夺：分支的值直接不写回，点目录只剩展开收起这一个效果
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
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
];

const leaves = new Set(collection.flatMap(dir => dir.children.map(file => file.value)));

export default function Demo(): ReactNode {
  const [selected, setSelected] = useState<string[]>([]);

  function onSelectionChange(details: { value: string[] }): void {
    setSelected(details.value.filter(value => leaves.has(value)));
  }

  return (
    <div style={{ width: "100%", maxWidth: "320px", display: "grid", gap: "12px" }}>
      <XhTreeRoot
        collection={collection}
        selection={selected}
        defaultExpandedValue={["src"]}
        multiple
        onSelectionChange={onSelectionChange}
      >
        <XhTreeLabel>要提交的文件</XhTreeLabel>
        <XhTreeTree>
          {collection.map(dir => (
            <XhTreeBranch key={dir.value} value={dir.value}>
              <XhTreeBranchControl>
                <XhTreeBranchTrigger />
                <XhTreeBranchText>{dir.label}</XhTreeBranchText>
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                {dir.children.map(file => (
                  <XhTreeItem key={file.value} value={file.value}>
                    <XhTreeItemIndicator />
                    <XhTreeItemText>{file.label}</XhTreeItemText>
                  </XhTreeItem>
                ))}
              </XhTreeBranchContent>
            </XhTreeBranch>
          ))}
        </XhTreeTree>
      </XhTreeRoot>
      <span>{`已选：${selected.length ? selected.join("、") : "（无）"}`}</span>
    </div>
  );
}
