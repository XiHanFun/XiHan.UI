const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分组标题 | 在分隔线中显示标题
import type { ReactNode } from "react";
import { XhSeparator } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "20px", inlineSize: "min(480px, 100%)" }}>
      <XhSeparator decorative>基本信息</XhSeparator>
      <XhSeparator decorative align="start">联系方式</XhSeparator>
      <XhSeparator decorative align="end">其他信息</XhSeparator>
    </div>
  );
}
`;export{e as default};
