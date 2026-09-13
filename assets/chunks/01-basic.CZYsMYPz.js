const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | root 是 role=status 的活区，转圈图形由皮肤画在伪元素上；label 给出这一处在等什么
import type { ReactNode } from "react";
import { XhSpinner } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhSpinner label="加载中" />
  );
}
`;export{n as default};
