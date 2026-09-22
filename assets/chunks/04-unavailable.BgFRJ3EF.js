const e=`// 不可用日期 | 周末不可选，区间允许跨过不可用的日期
import type { ReactNode } from "react";
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
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/react";

// 周六、周日不可选；起点参数用不上，区间能不能跨过不可用日由 allowsNonContiguousRanges 决定
function isWeekend(value: string): boolean {
  const day = new Date(\`\${value}T00:00:00Z\`).getUTCDay();
  return day === 0 || day === 6;
}

export default function Demo(): ReactNode {
  return (
    <XhDateRangePickerRoot
      isDateUnavailable={isWeekend}
      allowsNonContiguousRanges
      locale="zh-CN"
    >
      {({ weeks, weekDays }) => (
        <>
          <XhDateRangePickerLabel>工作日区间</XhDateRangePickerLabel>
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
`;export{e as default};
