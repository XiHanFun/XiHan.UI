/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 颜色 | 使用预设语义颜色
import type { Tone } from "@xihan-ui/core";
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

const tones: { label: string; value: Tone }[] = [
  { label: "品牌", value: "brand" },
  { label: "成功", value: "success" },
  { label: "警告", value: "warning" },
  { label: "危险", value: "danger" },
  { label: "信息", value: "info" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "24px", fontWeight: 700 }}>
      {tones.map(tone => <XhGradientText key={tone.value} tone={tone.value}>{tone.label}</XhGradientText>)}
    </div>
  );
}
