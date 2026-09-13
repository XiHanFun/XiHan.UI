const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 校验状态 | 标记必须处理的选项
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhCheckbox invalid required>我同意服务条款</XhCheckbox>;
}
`;export{e as default};
