const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 从按钮打开一组操作
import type { ReactNode } from "react";
import { ChevronDownIcon } from "@xihan-ui/icons";
import { XhButton, XhIcon, XhMenuRoot } from "@xihan-ui/react";

const actions = [
  { value: "new", label: "新建文件" },
  { value: "open", label: "打开文件" },
  { value: "save", label: "保存" },
  { value: "delete", label: "移到回收站", separatorBefore: true },
];

export default function Demo(): ReactNode {
  return (
    <XhMenuRoot
      collection={actions}
      triggerAsChild
      trigger={(
        <XhButton variant="subtle">
          操作
          <XhIcon icon={ChevronDownIcon} />
        </XhButton>
      )}
    />
  );
}
`;export{n as default};
