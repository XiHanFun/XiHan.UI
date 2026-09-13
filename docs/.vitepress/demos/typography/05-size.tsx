/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 尺寸 | 设置正文大小
import type { ReactNode } from "react";
import { XhTypographyParagraph, XhTypographyRoot } from "@xihan-ui/react";

const sizes = [
  { size: "sm", label: "小号正文" },
  { size: undefined, label: "默认正文" },
  { size: "lg", label: "大号正文" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {sizes.map(s => (
        <XhTypographyRoot key={s.label} size={s.size}>
          <XhTypographyParagraph>{s.label}</XhTypographyParagraph>
        </XhTypographyRoot>
      ))}
    </div>
  );
}
