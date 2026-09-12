const o=`// 朝向 | placement 是请求值，空间不够时由定位引擎避让；箭头跟着最终落定的那一面走
import type { ReactNode } from "react";
import {
  XhTooltipArrow,
  XhTooltipContent,
  XhTooltipPositioner,
  XhTooltipRoot,
  XhTooltipTrigger,
} from "@xihan-ui/react";

const placements = [
  { value: "top", label: "上方" },
  { value: "right", label: "右侧" },
  { value: "bottom", label: "下方" },
  { value: "left", label: "左侧" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {placements.map(p => (
        <XhTooltipRoot key={p.value} placement={p.value} openDelay={0}>
          <XhTooltipTrigger>{p.label}</XhTooltipTrigger>
          <XhTooltipPositioner>
            <XhTooltipContent>
              {\`请求朝向 \${p.value}\`}
              <XhTooltipArrow />
            </XhTooltipContent>
          </XhTooltipPositioner>
        </XhTooltipRoot>
      ))}
    </div>
  );
}
`;export{o as default};
