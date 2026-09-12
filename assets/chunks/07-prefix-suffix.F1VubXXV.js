const e=`// 前缀与行尾 | 行里放什么由标记说了算：文字前塞图标、文字后塞操作，方向指示也可以挪到行尾去
import type { ReactNode } from "react";
import {
  XhTreeBranch,
  XhTreeBranchContent,
  XhTreeBranchControl,
  XhTreeBranchIndicator,
  XhTreeBranchText,
  XhTreeItem,
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
    setLog(\`重命名 \${label}\`);
  }

  return (
    <div style={{ width: "100%", maxWidth: "320px", display: "grid", gap: "12px" }}>
      <XhTreeRoot collection={collection} defaultExpandedValue={["src"]}>
        <XhTreeLabel>工作区</XhTreeLabel>
        <XhTreeTree>
          {collection.map(dir => (
            <XhTreeBranch key={dir.value} value={dir.value}>
              <XhTreeBranchControl>
                <span aria-hidden="true">📁</span>
                <XhTreeBranchText>{dir.label}</XhTreeBranchText>
                {/* 指示器不带点击语义，展开态转 90° 全靠皮肤读 data-state */}
                <XhTreeBranchIndicator />
              </XhTreeBranchControl>
              <XhTreeBranchContent>
                {dir.children.map(file => (
                  <XhTreeItem key={file.value} value={file.value}>
                    <span aria-hidden="true">📄</span>
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
`;export{e as default};
