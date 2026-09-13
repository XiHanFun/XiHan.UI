/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 禁用 | 禁止展开和聚焦
import type { ReactNode } from "react";
import { XhSelectRoot } from "@xihan-ui/react";

const fruits = [
  { value: "apple", label: "苹果" },
  { value: "banana", label: "香蕉" },
];

export default function Demo(): ReactNode {
  return (
    <XhSelectRoot
      collection={fruits}
      defaultValue={["apple"]}
      disabled
      label="水果"
      placeholder="请选择"
    />
  );
}
