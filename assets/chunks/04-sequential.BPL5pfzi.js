const n=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 顺序排列 | 按文档顺序逐列填充
import type { ReactNode } from "react";
import { XhMasonry } from "@xihan-ui/react";

const steps = ["创建项目", "配置主题", "添加组件", "连接数据", "运行测试", "发布应用"];

export default function Demo(): ReactNode {
  return (
    <XhMasonry columns={3} gap="sm" sequential style={{ inlineSize: "min(640px, 100%)" }}>
      {steps.map((step, index) => (
        <div key={step} style={{ padding: \`\${14 + (index % 3) * 8}px 14px\`, borderRadius: "var(--xh-shape-surface)", background: "var(--xh-bg-subtle)" }}>
          <strong>{index + 1}</strong>
          <div style={{ marginBlockStart: "6px" }}>{step}</div>
        </div>
      ))}
    </XhMasonry>
  );
}
`;export{n as default};
