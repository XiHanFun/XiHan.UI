const e=`// 只提供数据自动渲染 | Vue 未写默认插槽时按 collection 铺开整套部件：带 children 的节点渲染为 branch、其余渲染为 item，文本与禁用都查询数据；label 提供标题，clearable 带上清空按钮（手写部件不使用它），产出的 DOM 与手写全套部件完全一致；Web Components 没有自动铺树，节点部件照常手写、只报告 value
import type { ReactNode } from "react";
import { XhTreeSelectRoot } from "@xihan-ui/react";
import { useState } from "react";

const files = [
  {
    value: "docs",
    label: "docs",
    children: [
      { value: "guide", label: "guide.md" },
      { value: "api", label: "api.md", disabled: true },
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
  const [doc, setDoc] = useState<string[]>(["guide"]);

  return (
    <>
      <XhTreeSelectRoot
        value={doc}
        onValueChange={details => setDoc(details.value)}
        collection={files}
        defaultExpandedValue={["docs"]}
        translations={{ clearTrigger: "清空所选" }}
        label="文档"
        placeholder="选一个文件"
        clearable
        style={{ maxInlineSize: "320px" }}
      />
      <p>{\`已选：\${doc.length ? doc.join("、") : "（无）"}\`}</p>
    </>
  );
}
`;export{e as default};
