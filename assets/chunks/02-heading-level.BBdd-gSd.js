const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 标题层级 | 设置标题的视觉层级
import type { ReactNode } from "react";
import { XhTypographyHeading, XhTypographyRoot } from "@xihan-ui/react";

const headings = [
  { level: 1, label: "一级标题" },
  { level: 2, label: "二级标题" },
  { level: 3, label: "三级标题" },
  { level: 4, label: "四级标题" },
  { level: 5, label: "五级标题" },
  { level: 6, label: "六级标题" },
] as const;

export default function Demo(): ReactNode {
  return (
    <XhTypographyRoot>
      {headings.map(heading => (
        <XhTypographyHeading key={heading.level} level={heading.level}>
          {heading.label}
        </XhTypographyHeading>
      ))}
    </XhTypographyRoot>
  );
}
`;export{e as default};
