const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 在一条菜单栏中组织应用命令
import type { ReactNode } from "react";
import { XhMenubarRoot } from "@xihan-ui/react";

const menus = [
  {
    value: "file",
    label: "文件",
    items: [
      { value: "new", label: "新建" },
      { value: "open", label: "打开" },
      { value: "save", label: "保存" },
    ],
  },
  {
    value: "edit",
    label: "编辑",
    items: [
      { value: "undo", label: "撤销" },
      { value: "redo", label: "重做" },
    ],
  },
  {
    value: "view",
    label: "视图",
    items: [
      { value: "sidebar", label: "侧栏" },
      { value: "terminal", label: "终端" },
    ],
  },
];

export default function Demo(): ReactNode {
  return <XhMenubarRoot collection={menus} style={{ background: "var(--xh-bg-subtle)" }} />;
}
`;export{n as default};
