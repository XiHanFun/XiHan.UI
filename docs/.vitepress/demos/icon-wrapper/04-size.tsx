/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 尺寸 | 设置图标块大小
import type { ReactNode } from "react";
import { FolderIcon } from "@xihan-ui/icons";
import { XhIcon, XhIconWrapper } from "@xihan-ui/react";

const sizes = ["sm", "md", "lg"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      {sizes.map(size => (
        <XhIconWrapper key={size} size={size} variant="subtle" tone="brand">
          <XhIcon icon={FolderIcon} />
        </XhIconWrapper>
      ))}
    </div>
  );
}
