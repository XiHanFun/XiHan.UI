const n=`// 语气 | tone 决定两端取哪族颜色；写了 from / to 就由它们说了算，tone 让位
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <>
      {tones.map(tone => (
        <p key={tone} style={{ margin: "0 0 8px", fontSize: "28px", fontWeight: 700 }}>
          <XhGradientText tone={tone}>{\`曦寒前端组件库 · \${tone}\`}</XhGradientText>
        </p>
      ))}
    </>
  );
}
`;export{n as default};
