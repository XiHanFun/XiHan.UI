// 12 小时制 | 时列写的是显示值 01-12，落到哪个真实小时由上下午说了算：输入行里敲、浮层里挑都改它
import type { ReactNode } from "react";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("09:30");

  return (
    <>
      <XhTimePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        hourCycle={12}
        locale="zh-CN"
      >
        <XhTimePickerLabel>提醒时间</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
            <XhTimePickerSegment segment="dayPeriod" />
          </XhTimePickerSegmentGroup>
          <XhTimePickerClearTrigger />
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            <XhTimePickerColumn unit="hour">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="minute">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            {/* 上下午列只在 12 小时制下出现；格子上的文字由组件按 locale 填 */}
            <XhTimePickerColumn unit="dayPeriod">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>

      <span style={{ fontSize: "13px" }}>{`值仍是 24 小时的串：${value || "（空）"}`}</span>
    </>
  );
}
