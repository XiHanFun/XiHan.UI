// 快捷选项 | 常用区间一键写入两端
import type { CSSProperties, ReactNode } from "react";
import { dateRangePickerPresetMonth, dateRangePickerPresetRange, dateRangePickerPresetYear } from "@xihan-ui/headless";
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPresetGroup,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/react";
import { useMemo } from "react";

export default function Demo(): ReactNode {
  // 日子在自己的 memo 里算好再传：库不在渲染期算「今天」
  const presets = useMemo(() => [
    { label: "近 7 天", value: dateRangePickerPresetRange(-6, 0) },
    { label: "近 30 天", value: dateRangePickerPresetRange(-29, 0) },
    { label: "本月", value: dateRangePickerPresetMonth(0) },
    { label: "上月", value: dateRangePickerPresetMonth(-1) },
    { label: "今年", value: dateRangePickerPresetYear(0) },
  ], []);

  return (
    <XhDateRangePickerRoot
      presets={presets}
      locale="zh-CN"
      style={{ "--xh-date-range-picker-control-min-w": "calc(var(--xh-control-min-w) * 2 + var(--xh-control-h-md) * 2 + var(--xh-space-6))" } as CSSProperties}
    >
      {({ weeks, weekDays }) => (
        <>
          <XhDateRangePickerLabel>统计区间</XhDateRangePickerLabel>
          <XhDateRangePickerControl>
            {/* 组号定这组段位认领哪一端：0 起点、1 终点 */}
            <XhDateRangePickerSegmentGroup index={0}>
              <XhDateRangePickerSegment index={0} />
              <span>/</span>
              <XhDateRangePickerSegment index={1} />
              <span>/</span>
              <XhDateRangePickerSegment index={2} />
            </XhDateRangePickerSegmentGroup>
            <XhDateRangePickerRangeSeparator />
            <XhDateRangePickerSegmentGroup index={1}>
              <XhDateRangePickerSegment index={0} />
              <span>/</span>
              <XhDateRangePickerSegment index={1} />
              <span>/</span>
              <XhDateRangePickerSegment index={2} />
            </XhDateRangePickerSegmentGroup>
            <XhDateRangePickerClearTrigger />
            <XhDateRangePickerTrigger />
          </XhDateRangePickerControl>
          <XhDateRangePickerPositioner>
            <XhDateRangePickerContent>
              {/* 不传 children 就按 presets 数据自动铺，产出的 DOM 与手写部件一致 */}
              <XhDateRangePickerPresetGroup />
              <XhDateRangePickerCalendar>
                <XhDateRangePickerHeader>
                  <XhDateRangePickerPrevTrigger aria-label="上个月" />
                  <XhDateRangePickerHeading />
                  <XhDateRangePickerNextTrigger aria-label="下个月" />
                </XhDateRangePickerHeader>
                <XhDateRangePickerGrid>
                  <XhDateRangePickerGridHead>
                    <XhDateRangePickerWeekRow>
                      {weekDays.map(d => (
                        <XhDateRangePickerWeekDay key={d.value} value={d.value} />
                      ))}
                    </XhDateRangePickerWeekRow>
                  </XhDateRangePickerGridHead>
                  <XhDateRangePickerGridBody>
                    {weeks.map(week => (
                      <XhDateRangePickerWeekRow key={week[0]!.start}>
                        {week.map(day => (
                          <XhDateRangePickerCell key={day.start} value={day.start}>
                            <XhDateRangePickerCellTrigger>{day.day}</XhDateRangePickerCellTrigger>
                          </XhDateRangePickerCell>
                        ))}
                      </XhDateRangePickerWeekRow>
                    ))}
                  </XhDateRangePickerGridBody>
                </XhDateRangePickerGrid>
              </XhDateRangePickerCalendar>
            </XhDateRangePickerContent>
          </XhDateRangePickerPositioner>
        </>
      )}
    </XhDateRangePickerRoot>
  );
}
