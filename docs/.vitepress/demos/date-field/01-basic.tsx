// 基础用法 | 输入日期
import type { ReactNode } from "react";
import {
  XhDateFieldClearTrigger,
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
    >
      <XhDateFieldLabel>截止日期</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment index={0} />
          <span>/</span>
          <XhDateFieldSegment index={1} />
          <span>/</span>
          <XhDateFieldSegment index={2} />
        </XhDateFieldSegmentGroup>
        <XhDateFieldClearTrigger />
      </XhDateFieldControl>
      <XhDateFieldHiddenInput />
    </XhDateFieldRoot>
  );
}
