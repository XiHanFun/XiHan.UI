/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 组合式函数 | 不渲染组件实例
import type { ReactNode } from "react";
import { useHotkeys } from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [count, setCount] = useState(0);
  useHotkeys({
    keys: ["Mod", "K"],
    onHotKey: () => setCount(value => value + 1),
  });
  return <output>{`按下 Mod + K · ${count ? `已触发 ${count} 次` : "等待输入"}`}</output>;
}
