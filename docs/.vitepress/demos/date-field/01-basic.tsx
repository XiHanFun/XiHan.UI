// 基础用法 | 输入日期
import type { CSSProperties, ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldHiddenInput,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDateFieldRoot
      locale="zh-CN"
      name="deadline"
      style={{
        "--xh-date-field-control-min-w": "calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))",
      } as CSSProperties}
    >
      <XhDateFieldLabel>截止日期</XhDateFieldLabel>
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
      <XhDateFieldHiddenInput />
    </XhDateFieldRoot>
  );
}
