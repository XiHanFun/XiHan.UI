// 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";

const tones = ["brand", "neutral", "success", "warning", "danger", "info"] as const;

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
      {tones.map(t => (
        <XhDateFieldRoot
          key={t}
          variant="subtle"
          tone={t}
          defaultValue="2026-07-28"
          locale="zh-CN"
        >
          <XhDateFieldLabel>{t}</XhDateFieldLabel>
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
