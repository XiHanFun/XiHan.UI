const t=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 注册全局快捷键
import type { ReactNode } from "react";
import { XhHotkeys } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [count, setCount] = useState(0);
  return (
    <>
      <XhHotkeys keys={["Mod", "S"]} onHotKey={() => setCount(value => value + 1)} />
      <output>{\`按下 Mod + S · \${count ? \`已触发 \${count} 次\` : "等待输入"}\`}</output>
    </>
  );
}
`;export{t as default};
