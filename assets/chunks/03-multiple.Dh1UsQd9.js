const e=`// 多选与表单 | multiple 下已选项在触发器里排成标签，确认键是切换、浮层不收起；写了 hidden-input 才随表单提交，每个值一个同名字段
import type { ReactNode } from "react";
import {
  XhTreeSelectBranch,
  XhTreeSelectBranchContent,
  XhTreeSelectBranchControl,
  XhTreeSelectBranchText,
  XhTreeSelectBranchTrigger,
  XhTreeSelectContent,
  XhTreeSelectControl,
  XhTreeSelectHiddenInput,
  XhTreeSelectIndicator,
  XhTreeSelectItem,
  XhTreeSelectItemIndicator,
  XhTreeSelectItemText,
  XhTreeSelectLabel,
  XhTreeSelectOverflowTag,
  XhTreeSelectPositioner,
  XhTreeSelectRoot,
  XhTreeSelectTag,
  XhTreeSelectTagList,
  XhTreeSelectTree,
  XhTreeSelectTrigger,
  XhTreeSelectValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const files = [
  {
    value: "src",
    label: "src",
    children: [
      { value: "index", label: "index.ts" },
      { value: "app", label: "app.vue" },
    ],
  },
  { value: "readme", label: "README.md" },
];

export default function Demo(): ReactNode {
  const [picked, setPicked] = useState<string[]>(["index"]);

  return (
    <>
      <XhTreeSelectRoot
        value={picked}
        onValueChange={details => setPicked(details.value)}
        collection={files}
        defaultExpandedValue={["src"]}
        multiple
        name="docs"
        placeholder="可以多选"
      >
        {({ tags }) => (
          <>
            <XhTreeSelectLabel>提交范围</XhTreeSelectLabel>
            <XhTreeSelectControl>
              <XhTreeSelectTrigger>
                {/* 占位文字与标签行同时写着：有选中时标签行露面、占位让位；触发器里的标签只作展示 */}
                <XhTreeSelectValueText />
                <XhTreeSelectTagList>
                  {tags.map(t => (
                    <XhTreeSelectTag key={t.value} value={t.value}>{t.label}</XhTreeSelectTag>
                  ))}
                  <XhTreeSelectOverflowTag />
                </XhTreeSelectTagList>
                <XhTreeSelectIndicator />
              </XhTreeSelectTrigger>
            </XhTreeSelectControl>
            <XhTreeSelectPositioner>
              <XhTreeSelectContent>
                <XhTreeSelectTree>
                  <XhTreeSelectBranch value="src">
                    <XhTreeSelectBranchControl>
                      <XhTreeSelectBranchTrigger />
                      <XhTreeSelectBranchText>src</XhTreeSelectBranchText>
                      <XhTreeSelectItemIndicator />
                    </XhTreeSelectBranchControl>
                    <XhTreeSelectBranchContent>
                      <XhTreeSelectItem value="index">
                        <XhTreeSelectItemIndicator />
                        <XhTreeSelectItemText>index.ts</XhTreeSelectItemText>
                      </XhTreeSelectItem>
                      <XhTreeSelectItem value="app">
                        <XhTreeSelectItemIndicator />
                        <XhTreeSelectItemText>app.vue</XhTreeSelectItemText>
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
            <XhTreeSelectHiddenInput />
          </>
        )}
      </XhTreeSelectRoot>
      <p>{\`已选：\${picked.length ? picked.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};
