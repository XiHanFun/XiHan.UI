// 尺寸 | 不传 size 即默认档；行高、内边距与字号一起换档，标题也跟着变
import type { Size } from "@xihan-ui/core";
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";

const sizes: { size: Size | undefined; label: string }[] = [
  { size: "sm", label: "sm" },
  { size: undefined, label: "默认" },
  { size: "lg", label: "lg" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px" }}>
      {sizes.map(s => (
        <XhDateFieldRoot key={s.label} size={s.size} defaultValue="2026-07-28" locale="zh-CN">
          <XhDateFieldLabel>{s.label}</XhDateFieldLabel>
          <XhDateFieldControl>
            <XhDateFieldSegmentGroup>
              <XhDateFieldSegment index={0} />
              <span>年</span>
              <XhDateFieldSegment index={1} />
              <span>月</span>
              <XhDateFieldSegment index={2} />
              <span>日</span>
            </XhDateFieldSegmentGroup>
          </XhDateFieldControl>
        </XhDateFieldRoot>
      ))}
    </div>
  );
}
