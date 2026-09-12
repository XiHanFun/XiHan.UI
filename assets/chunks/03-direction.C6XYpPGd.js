const t=`// 走向 | direction 收的是档位，四条边加四个角共八档，逐档对应 CSS 渐变的 to 边或角写法；不收任意角度
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

const directions = [
  "to-right",
  "to-left",
  "to-bottom",
  "to-top",
  "to-bottom-right",
  "to-bottom-left",
  "to-top-right",
  "to-top-left",
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "24px", fontWeight: 700 }}>
      {directions.map(d => (
        <span key={d}>
          <XhGradientText direction={d} from="#ff5500" to="#0055ff">{d}</XhGradientText>
        </span>
      ))}
    </div>
  );
}
`;export{t as default};
