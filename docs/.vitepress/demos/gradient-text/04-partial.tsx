// 只渐变一段 | 组件是行内的，可以只包住整句话里的几个字，字号字重由外面的文字决定
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <p style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.6 }}>
      快速、轻量、高效、用心的
      <XhGradientText direction="to-bottom-right" from="#7c3aed" to="#06b6d4">
        设计系统运行时
      </XhGradientText>
    </p>
  );
}
