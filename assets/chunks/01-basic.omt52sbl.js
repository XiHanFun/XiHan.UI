const e=`// 基础用法 | 收起时整个控件只占触发器一个 Tab 位，展开那一刻焦点真的进树、落在已选中的那行上
import type { ReactNode } from "react";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
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
import { useState } from "react";

// 层级、显示文本与节点禁用都查这份树数据，标记只管长相
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
  { value: "readme", label: "README.md" },
];

export default function Demo(): ReactNode {
  const [doc, setDoc] = useState<string[]>([]);

  return (
    <>
      <XhTreeSelectRoot
        value={doc}
        onValueChange={details => setDoc(details.value)}
        collection={files}
        defaultExpandedValue={["docs"]}
        placeholder="选一个文件"
        style={{ maxInlineSize: "320px" }}
      >
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
              <XhTreeSelectBranch value="docs">
                <XhTreeSelectBranchControl>
                  <XhTreeSelectBranchTrigger />
                  <XhTreeSelectBranchText>docs</XhTreeSelectBranchText>
                  <XhTreeSelectItemIndicator />
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  <XhTreeSelectItem value="guide">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>guide.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                  <XhTreeSelectItem value="api">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>api.md</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>
              <XhTreeSelectBranch value="assets">
                <XhTreeSelectBranchControl>
                  <XhTreeSelectBranchTrigger />
                  <XhTreeSelectBranchText>assets</XhTreeSelectBranchText>
                  <XhTreeSelectItemIndicator />
                </XhTreeSelectBranchControl>
                <XhTreeSelectBranchContent>
                  <XhTreeSelectItem value="logo">
                    <XhTreeSelectItemIndicator />
                    <XhTreeSelectItemText>logo.svg</XhTreeSelectItemText>
                  </XhTreeSelectItem>
                </XhTreeSelectBranchContent>
              </XhTreeSelectBranch>
              <XhTreeSelectItem value="readme">
                <XhTreeSelectItemIndicator />
                <XhTreeSelectItemText>README.md</XhTreeSelectItemText>
              </XhTreeSelectItem>
            </XhTreeSelectTree>
          </XhTreeSelectContent>
        </XhTreeSelectPositioner>
      </XhTreeSelectRoot>
      <p>{\`已选：\${doc.length ? doc.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};
