/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日期与时间 | 输入精确到分钟的日期
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
    <XhDateFieldRoot defaultValue="2026-07-28T13:45" locale="zh-CN" granularity="minute">
      <XhDateFieldLabel>发布时间</XhDateFieldLabel>
      <XhDateFieldControl>
        <XhDateFieldSegmentGroup>
          <XhDateFieldSegment index={0} />
          <span>年</span>
          <XhDateFieldSegment index={1} />
          <span>月</span>
          <XhDateFieldSegment index={2} />
          <span>日</span>
          <span>&nbsp;</span>
          <XhDateFieldSegment index={3} />
          <span>:</span>
          <XhDateFieldSegment index={4} />
        </XhDateFieldSegmentGroup>
      </XhDateFieldControl>
    </XhDateFieldRoot>
  );
}
