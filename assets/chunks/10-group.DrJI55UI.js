const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分组 | 使用标题与分隔线组织命令
import type { ReactNode } from "react";
import { XhButton, XhMenuRoot } from "@xihan-ui/react";

const actions = [
  { value: "compact", label: "紧凑", group: "density", groupLabel: "行高" },
  { value: "comfortable", label: "宽松", group: "density" },
  { value: "sidebar", label: "侧栏", group: "panels", groupLabel: "面板", separatorBefore: true },
  { value: "inspector", label: "属性面板", group: "panels" },
];

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot
      collection={actions}
      triggerAsChild
      trigger={<XhButton variant="subtle">视图</XhButton>}
    />
  );
}
`;export{n as default};
