// 基础用法 | 渐变裁进字形里；不给颜色就用品牌色族，走向缺省从左到右
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <p style={{ fontSize: "32px", fontWeight: 700 }}>
      <XhGradientText>曦寒前端组件库</XhGradientText>
    </p>
  );
}
