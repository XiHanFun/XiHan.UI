const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 使用默认品牌渐变
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <p style={{ fontSize: "32px", fontWeight: 700 }}>
      <XhGradientText>曦寒前端组件库</XhGradientText>
    </p>
  );
}
`;export{n as default};
