/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 自定义颜色 | 设置渐变两端颜色
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

const gradients = [
  { label: "日落橙", from: "#f97316", to: "#ec4899" },
  { label: "极光紫", from: "#8b5cf6", to: "#06b6d4" },
  { label: "海洋蓝", from: "#0ea5e9", to: "#2563eb" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "28px", fontWeight: 700 }}>
      {gradients.map(gradient => (
        <XhGradientText key={gradient.label} from={gradient.from} to={gradient.to}>
          {gradient.label}
        </XhGradientText>
      ))}
    </div>
  );
}
