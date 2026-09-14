// 快捷选项 | presets 在两组列旁边多排一列，点一条把两端整份写进值并收起
import type { ReactNode } from "react";
import { timeRangePickerPresetFromNow, timeRangePickerPresetValue } from "@xihan-ui/headless";
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
  XhTimeRangePickerPresetGroup,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const text = value[0] && value[1] ? `${value[0]} → ${value[1]}` : "（未填齐）";
  // 时刻在自己的 memo 里算好再传：库不在渲染期算「此刻」
  const presets = useMemo(() => [
    { label: "接下来一小时", value: timeRangePickerPresetFromNow(60) },
    { label: "上午", value: timeRangePickerPresetValue("09:00", "12:00") },
    { label: "下午", value: timeRangePickerPresetValue("13:30", "18:00") },
    { label: "全天", value: timeRangePickerPresetValue("09:00", "18:00") },
  ], []);

  return (
    <>
      <XhTimeRangePickerRoot value={value} onValueChange={details => setValue(details.value)} presets={presets} step={15}>
        <XhTimeRangePickerLabel>会议时段</XhTimeRangePickerLabel>
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
            {/* 不传 children 就按 presets 数据自动铺，产出的 DOM 与手写部件一致 */}
            <XhTimeRangePickerPresetGroup />
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
