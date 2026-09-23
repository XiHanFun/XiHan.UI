// 前缀与行尾 | 行中放置什么由标记决定：文字前放图标、文字后放操作，展开箭头也可以移到行尾
import type { ReactNode } from "react";
import { FileIcon, FolderIcon } from "@xihan-ui/icons";
import {
  XhIcon,
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
    children: [{ value: "guide", label: "guide.md" }],
  },
];

export default function Demo(): ReactNode {
  const [log, setLog] = useState("（还没动过）");

  function rename(label: string): void {
    setLog(`重命名 ${label}`);
  }

  return (
    <div style={{ width: "100%", maxWidth: "320px", display: "grid", gap: "12px" }}>
      <XhTreeRoot collection={collection} defaultExpandedValue={["src"]}>
        <XhTreeLabel>工作区</XhTreeLabel>
        <XhTreeTree>
          {collection.map(dir => (
            <XhTreeBranch key={dir.value} value={dir.value}>
              <XhTreeBranchControl>
                <XhIcon icon={FolderIcon} />
                <XhTreeBranchText>{dir.label}</XhTreeBranchText>
                <XhTreeBranchTrigger />
                <XhTreeItemIndicator />
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                {dir.children.map(file => (
                  <XhTreeItem key={file.value} value={file.value}>
                    <XhIcon icon={FileIcon} />
                    <XhTreeItemText>{file.label}</XhTreeItemText>
                    {/* 掐断冒泡，否则点按钮连带把这一行也选上 */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        rename(file.label);
                      }}
                    >
                      重命名
                    </button>
                    <XhTreeItemIndicator />
                  </XhTreeItem>
                ))}
              </XhTreeBranchContent>
            </XhTreeBranch>
          ))}
        </XhTreeTree>
      </XhTreeRoot>
      <span>{log}</span>
    </div>
  );
}
