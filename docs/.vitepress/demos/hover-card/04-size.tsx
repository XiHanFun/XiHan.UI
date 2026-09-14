// 尺寸 | 三档换的是卡片的内边距与字号，不写 size 即缺省档；把指针停在触发器上看差别
import type { ReactNode } from "react";
import {
  XhHoverCardArrow,
  XhHoverCardContent,
  XhHoverCardPositioner,
  XhHoverCardRoot,
  XhHoverCardTrigger,
} from "@xihan-ui/react";

const sizes = [
  { value: "sm", label: "小" },
  { value: undefined, label: "缺省" },
  { value: "lg", label: "大" },
] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {sizes.map(s => (
        <XhHoverCardRoot
          key={s.label}
          size={s.value}
          placement="bottom-start"
          openDelay={0}
        >
          <XhHoverCardTrigger>{s.label}</XhHoverCardTrigger>
          <XhHoverCardPositioner>
            <XhHoverCardContent>
              <XhHoverCardArrow />
              <strong>{`${s.label}档`}</strong>
              <span>{`size = ${s.value ?? "未指定"}。`}</span>
            </XhHoverCardContent>
          </XhHoverCardPositioner>
        </XhHoverCardRoot>
      ))}
    </div>
  );
}
