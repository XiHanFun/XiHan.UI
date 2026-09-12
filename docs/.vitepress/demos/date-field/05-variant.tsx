// 形态 | variant 只改分段框的底色与描边用法，分段结构与键盘行为都不变
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";

const variants = ["outline", "subtle", "ghost"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {variants.map(v => (
        <XhDateFieldRoot key={v} variant={v} defaultValue="2026-07-28" locale="zh-CN">
          <XhDateFieldLabel>{v}</XhDateFieldLabel>
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
