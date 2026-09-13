/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | primary 用于页面背景，secondary 用于卡片等已有表面
import type { ReactNode } from "react";
import { XhCheckboxGroupRoot } from "@xihan-ui/react";

const items = [
  { value: "email", label: "邮件" },
  { value: "sms", label: "短信" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-start" }}>
      <XhCheckboxGroupRoot
        collection={items}
        defaultValue={["email"]}
        label="主要"
        variant="primary"
      />
      <XhCheckboxGroupRoot
        collection={items}
        defaultValue={["email"]}
        label="次要"
        variant="secondary"
      />
    </div>
  );
}
