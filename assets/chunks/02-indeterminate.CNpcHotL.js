const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 不确定状态 | 表示部分选中
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate");

  return (
    <XhCheckbox checked={checked} onCheckedChange={details => setChecked(details.checked)}>
      选择全部
    </XhCheckbox>
  );
}
`;export{e as default};
