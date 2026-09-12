const e=`// 朝向与间距 | placement 是请求值，空间不够时定位引擎会自动翻面；offset 调的是卡片与触发器的距离
import type { ReactNode } from "react";
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/react";

const cases = [
  { placement: "top", offset: 8, label: "上方" },
  { placement: "right", offset: 8, label: "右侧" },
  { placement: "bottom-end", offset: 20, label: "下方靠尾（间距 20）" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {cases.map(c => (
        <XhHoverCardRoot
          key={c.placement}
          placement={c.placement}
          offset={c.offset}
          openDelay={0}
        >
          <XhHoverCardTrigger>{c.label}</XhHoverCardTrigger>
          <XhHoverCardPositioner>
            <XhHoverCardContent>
              <XhHoverCardArrow />
              <strong>{c.label}</strong>
              <span>{\`请求的朝向是 \${c.placement}，间距 \${c.offset}px。\`}</span>
            </XhHoverCardContent>
          </XhHoverCardPositioner>
        </XhHoverCardRoot>
      ))}
    </div>
  );
}
`;export{e as default};
