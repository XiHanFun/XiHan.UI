/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 变体 | 设置编辑框外观
import type { ReactNode } from "react";
import {
  XhEditableCancelTrigger,
  XhEditableControl,
  XhEditableEditTrigger,
  XhEditableInput,
  XhEditableLabel,
  XhEditablePreview,
  XhEditableRoot,
  XhEditableSubmitTrigger,
} from "@xihan-ui/react";

const rows = [
  { variant: "outline", label: "描边" },
  { variant: "subtle", label: "浅色" },
  { variant: "ghost", label: "幽灵" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {rows.map(row => (
        <XhEditableRoot
          key={row.label}
          variant={row.variant}
          defaultValue="曦寒"
          placeholder="未填写"
        >
          <XhEditableLabel>{row.label}</XhEditableLabel>
          <XhEditableControl>
            <XhEditablePreview />
            <XhEditableInput />
            <XhEditableEditTrigger>编辑</XhEditableEditTrigger>
            <XhEditableSubmitTrigger>保存</XhEditableSubmitTrigger>
            <XhEditableCancelTrigger>取消</XhEditableCancelTrigger>
          </XhEditableControl>
        </XhEditableRoot>
      ))}
    </div>
  );
}
