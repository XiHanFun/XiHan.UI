// 只交数据自动渲染 | Vue 不写默认插槽时按 collection 铺开整套部件：带 children 的节点落成 branch、其余落成 item，文本与禁用都查数据；label 给标题，clearable 带上清空钮（手写部件不看它），产出的 DOM 与手写全套部件完全一致；Web Components 没有自动铺树，节点部件照常手写、只报 value
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
      <p>{`已选：${doc.length ? doc.join("、") : "（无）"}`}</p>
    </>
  );
}
