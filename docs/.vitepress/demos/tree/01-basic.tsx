// 基础用法 | collection 是层级元信息的唯一事实源；不写结构时组件照它铺出标题与整棵树，缩进由子层容器自行撑开
import type { ReactNode } from "react";
import { XhTreeRoot } from "@xihan-ui/react";

const collection = [
  {
    value: "src",
    label: "src",
    children: [
      {
        value: "components",
        label: "components",
        children: [
          { value: "button", label: "Button.vue" },
          { value: "dialog", label: "Dialog.vue" },
        ],
      },
      { value: "main", label: "main.ts" },
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
  { value: "readme", label: "README.md" },
];

export default function Demo(): ReactNode {
  return (
    <XhTreeRoot
      collection={collection}
      defaultExpandedValue={["src"]}
      label="项目文件"
      style={{ inlineSize: "100%", maxInlineSize: 320 }}
    />
  );
}
