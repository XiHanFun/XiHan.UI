const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 分隔符 | 在相邻内容之间添加分隔符
import type { ReactNode } from "react";
import { XhFlex } from "@xihan-ui/react";

const linkStyle = { color: "var(--xh-fg-brand)", cursor: "pointer" };
const ruleStyle = {
  display: "block",
  inlineSize: "1px",
  blockSize: "1em",
  background: "var(--xh-border-default)",
};

const actions = ["编辑", "复制", "归档", "删除"];

export default function Demo(): ReactNode {
  return (
    <XhFlex gap="sm" split={<span style={ruleStyle} />}>
      {actions.map(a => <span key={a} style={linkStyle}>{a}</span>)}
    </XhFlex>
  );
}
`;export{n as default};
