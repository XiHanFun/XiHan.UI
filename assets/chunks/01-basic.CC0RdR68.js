const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 标记一个独立选项
import type { ReactNode } from "react";
import { XhCheckbox } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return <XhCheckbox name="updates" defaultChecked>接收产品更新</XhCheckbox>;
}
`;export{e as default};
