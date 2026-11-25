// 形态与状态 | variant 设置输入框外观；禁用、只读与校验失败各是一种状态
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
    <div style={{ display: "grid", gap: "var(--xh-space-6)", justifyItems: "start" }}>
      <div style={{ display: "grid", gap: "var(--xh-space-4)", justifyItems: "start" }}>
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

      <div style={{ display: "grid", gap: "var(--xh-space-4)", justifyItems: "start" }}>
        <XhDateFieldRoot defaultValue="2026-07-28" locale="zh-CN" disabled>
          <XhDateFieldLabel>禁用</XhDateFieldLabel>
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

        <XhDateFieldRoot defaultValue="2026-07-28" locale="zh-CN" readOnly>
          <XhDateFieldLabel>只读</XhDateFieldLabel>
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

        <XhDateFieldRoot defaultValue="2026-07-28" locale="zh-CN" invalid>
          <XhDateFieldLabel>校验失败</XhDateFieldLabel>
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
      </div>
    </div>
  );
}
