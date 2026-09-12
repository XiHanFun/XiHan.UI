// 方向 | 设置渐变方向
import type { GradientTextDirection } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import { XhGradientText } from "@xihan-ui/react";

const directions: { label: string; value: GradientTextDirection }[] = [
  { label: "向右", value: "to-right" },
  { label: "向下", value: "to-bottom" },
  { label: "右下", value: "to-bottom-right" },
  { label: "右上", value: "to-top-right" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "24px", fontWeight: 700 }}>
      {directions.map(direction => (
        <XhGradientText key={direction.value} direction={direction.value} from="#f97316" to="#2563eb">
          {direction.label}
        </XhGradientText>
      ))}
    </div>
  );
}
