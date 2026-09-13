/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多选 | 允许选择多个选项
import type { ReactNode } from "react";
import { XhListboxRoot } from "@xihan-ui/react";

const options = [
  { value: "design", label: "产品设计" },
  { value: "engineering", label: "工程研发" },
  { value: "marketing", label: "市场运营" },
  { value: "support", label: "客户支持" },
];

export default function Demo(): ReactNode {
  return (
    <XhListboxRoot
      collection={options}
      defaultValue={["design"]}
      label="参与团队"
      selectionMode="multiple"
      style={{ inlineSize: "min(100%, 300px)" }}
    />
  );
}
