const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 响应式列 | 在不同视口使用不同列数
import type { CSSProperties, ReactNode } from "react";
import { XhGridItem, XhGridRoot } from "@xihan-ui/react";

const sections = ["概览", "分析", "报告", "设置"];
const itemStyle: CSSProperties = {
  padding: "20px",
  borderRadius: "var(--xh-shape-surface)",
  background: "var(--xh-bg-subtle)",
  textAlign: "center",
};

export default function Demo(): ReactNode {
  return (
    <XhGridRoot cols={{ base: 1, sm: 2, lg: 4 }} gap="sm" style={{ inlineSize: "min(720px, 100%)" }}>
      {sections.map(section => <XhGridItem key={section} style={itemStyle}>{section}</XhGridItem>)}
    </XhGridRoot>
  );
}
`;export{e as default};
