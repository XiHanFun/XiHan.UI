// 基础用法 | 使用默认品牌渐变
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <p style={{ fontSize: "32px", fontWeight: 700 }}>
      <XhGradientText>曦寒前端组件库</XhGradientText>
    </p>
  );
}
