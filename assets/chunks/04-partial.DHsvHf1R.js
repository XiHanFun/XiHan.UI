const t=`// 行内强调 | 只为关键词添加渐变
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <p style={{ fontSize: "28px", fontWeight: 700, lineHeight: 1.6 }}>
      快速、轻量、高效、用心的
      {" "}
      <XhGradientText direction="to-bottom-right" from="#8b5cf6" to="#06b6d4">
        框架无关 Headless UI 组件库
      </XhGradientText>
    </p>
  );
}
`;export{t as default};
