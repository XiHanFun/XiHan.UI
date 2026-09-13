/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 输入或选择时间
import type { CSSProperties, ReactNode } from "react";
import {
  XhTimePickerColumn,
  XhTimePickerClearTrigger,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhTimePickerRoot
      name="meeting-time"
      style={{
        "--xh-time-picker-control-min-w": "calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-space-6))",
      } as CSSProperties}
    >
      <XhTimePickerLabel>会议开始</XhTimePickerLabel>
      <XhTimePickerControl>
        <XhTimePickerSegmentGroup>
          <XhTimePickerSegment segment="hour" />
          <span>:</span>
          <XhTimePickerSegment segment="minute" />
        </XhTimePickerSegmentGroup>
        <XhTimePickerClearTrigger />
        <XhTimePickerTrigger />
      </XhTimePickerControl>
      <XhTimePickerHiddenInput />
      <XhTimePickerPositioner>
        <XhTimePickerContent>
          <XhTimePickerColumn unit="hour">
            {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
          </XhTimePickerColumn>
          <XhTimePickerColumn unit="minute">
            {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
          </XhTimePickerColumn>
        </XhTimePickerContent>
      </XhTimePickerPositioner>
    </XhTimePickerRoot>
  );
}
