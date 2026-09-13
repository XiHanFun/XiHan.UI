const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | 设置背景和边框样式
import type { ReactNode } from "react";
import { CheckIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

const variants = ["solid", "subtle", "outline", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {variants.map(variant => (
        <XhIconWrapper key={variant} variant={variant}>
          <XhIcon icon={CheckIcon} />
        </XhIconWrapper>
      ))}
    </div>
  );
}
`;export{n as default};
