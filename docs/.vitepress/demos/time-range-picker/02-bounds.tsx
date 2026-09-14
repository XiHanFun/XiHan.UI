// 可选时段 | min/max 把界外的格从两组列里裁掉，另一端一填全再各自收窄一次
import type { ReactNode } from "react";
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["10:00", ""]);
  const text = value[0] && value[1] ? `${value[0]} → ${value[1]}` : "（未填齐）";

  return (
    <>
      <XhTimeRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        min="08:00"
        max="20:00"
        step={30}
      >
        <XhTimeRangePickerLabel>预约时段</XhTimeRangePickerLabel>
        <XhTimeRangePickerControl>
          {/* 端号定这组段位认领哪一端：0 起点、1 终点 */}
          <XhTimeRangePickerSegmentGroup index={0}>
            <XhTimeRangePickerSegment segment="hour" />
            <span>:</span>
            <XhTimeRangePickerSegment segment="minute" />
          </XhTimeRangePickerSegmentGroup>
          <XhTimeRangePickerRangeSeparator />
          <XhTimeRangePickerSegmentGroup index={1}>
            <XhTimeRangePickerSegment segment="hour" />
            <span>:</span>
            <XhTimeRangePickerSegment segment="minute" />
          </XhTimeRangePickerSegmentGroup>
          <XhTimeRangePickerClearTrigger />
          <XhTimeRangePickerTrigger />
        </XhTimeRangePickerControl>
        <XhTimeRangePickerPositioner>
          <XhTimeRangePickerContent>
            {/* 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 */}
            {(["开始", "结束"] as const).map((label, end) => (
              <XhTimeRangePickerColumnGroup key={end} index={end}>
                <XhTimeRangePickerColumnGroupLabel>{label}</XhTimeRangePickerColumnGroupLabel>
                <XhTimeRangePickerColumn unit="hour">
                  {({ options }) => options.map(o => <XhTimeRangePickerItem key={o} value={o} />)}
                </XhTimeRangePickerColumn>
                <XhTimeRangePickerColumn unit="minute">
                  {({ options }) => options.map(o => <XhTimeRangePickerItem key={o} value={o} />)}
                </XhTimeRangePickerColumn>
              </XhTimeRangePickerColumnGroup>
            ))}
          </XhTimeRangePickerContent>
        </XhTimeRangePickerPositioner>
      </XhTimeRangePickerRoot>

      <span aria-live="polite" style={{ fontSize: "13px" }}>
        {`当前值：${text}`}
      </span>
    </>
  );
}
