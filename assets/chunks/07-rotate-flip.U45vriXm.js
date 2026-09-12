const n=`// 旋转与翻转 | rotate 只收 90 / 180 / 270 三档，flip 沿横轴或纵轴取反；两者是独立属性，同写即叠加
import type { CSSProperties, ReactNode } from "react";
import { XhIcon } from "@xihan-ui/react";

const ArrowIcon = {
  name: "arrow-right",
  viewBox: "0 0 24 24",
  attrs: {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  },
  nodes: [
    { tag: "path", attrs: { d: "M4 12h15" } },
    { tag: "path", attrs: { d: "M13 6l6 6-6 6" } },
  ],
} as const;

const row: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "10px",
};

export default function Demo(): ReactNode {
  return (
    <>
      <span style={row}>
        <XhIcon icon={ArrowIcon} size="lg" />
        <XhIcon icon={ArrowIcon} size="lg" rotate={90} />
        <XhIcon icon={ArrowIcon} size="lg" rotate={180} />
        <XhIcon icon={ArrowIcon} size="lg" rotate={270} />
        <span style={{ fontSize: "13px" }}>不转 / 90 / 180 / 270</span>
      </span>

      <span style={row}>
        <XhIcon icon={ArrowIcon} size="lg" flip="horizontal" />
        <XhIcon icon={ArrowIcon} size="lg" flip="vertical" />
        <XhIcon icon={ArrowIcon} size="lg" flip="both" />
        <XhIcon icon={ArrowIcon} size="lg" rotate={90} flip="horizontal" />
        <span style={{ fontSize: "13px" }}>横轴 / 纵轴 / 两轴 / 转 90 再翻横轴</span>
      </span>
    </>
  );
}
`;export{n as default};
