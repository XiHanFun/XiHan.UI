// 禁用与非法 | 禁用整组退出 Tab 序、隐藏输入不再提交；invalid 只改观感与 aria，不动值
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
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
        <XhDateFieldLabel>invalid</XhDateFieldLabel>
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
  );
}
