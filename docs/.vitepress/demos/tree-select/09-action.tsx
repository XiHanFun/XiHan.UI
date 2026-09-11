// 浮层里的操作区 | footer 写在 content 里、tree 的兄弟：它不进 role=tree 的拥有关系，方向键也走不到；在浮层内点按钮不算点在外面，浮层不会因此收起
import type { ReactNode } from "react";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectFooter,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/react";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md" },
    ],
  },
  {
    value: "assets",
    label: "assets",
    children: [{ value: "logo", label: "logo.svg" }],
  },
];

export default function Demo(): ReactNode {
  return (
    // 根部件的函数式 children 把操作入口交出来，浮层里的按钮直接调它们
    <XhTreeSelectRoot
      collection={files}
      defaultExpandedValue={["docs"]}
      placeholder="选一个文件"
      style={{ maxInlineSize: "320px" }}
    >
      {({ canClear, clear, setExpandedValue }) => (
        <>
          <XhTreeSelectLabel>文档</XhTreeSelectLabel>
          <XhTreeSelectControl>
            <XhTreeSelectTrigger>
              <XhTreeSelectValueText />
              <XhTreeSelectIndicator />
            </XhTreeSelectTrigger>
          </XhTreeSelectControl>
          <XhTreeSelectPositioner>
            <XhTreeSelectContent>
              <XhTreeSelectTree>
                {files.map(dir => (
                  <XhTreeSelectBranch key={dir.value} value={dir.value}>
                    <XhTreeSelectBranchControl>
                      <XhTreeSelectBranchTrigger />
                      <XhTreeSelectBranchText>{dir.label}</XhTreeSelectBranchText>
                      <XhTreeSelectItemIndicator />
                    </XhTreeSelectBranchControl>
                    <XhTreeSelectBranchContent>
                      {dir.children.map(file => (
                        <XhTreeSelectItem key={file.value} value={file.value}>
                          <XhTreeSelectItemIndicator />
                          <XhTreeSelectItemText>{file.label}</XhTreeSelectItemText>
                        </XhTreeSelectItem>
                      ))}
                    </XhTreeSelectBranchContent>
                  </XhTreeSelectBranch>
                ))}
              </XhTreeSelectTree>

              <XhTreeSelectFooter>
                <button type="button" onClick={() => setExpandedValue(["docs", "assets"])}>全部展开</button>
                <button type="button" onClick={() => setExpandedValue([])}>全部收起</button>
                <button type="button" disabled={!canClear} onClick={() => clear()}>清空</button>
              </XhTreeSelectFooter>
            </XhTreeSelectContent>
          </XhTreeSelectPositioner>
        </>
      )}
    </XhTreeSelectRoot>
  );
}
