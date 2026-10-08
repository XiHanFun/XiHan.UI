var e=`// 只改终点 | 点终点那组段位展开时 activeIndex 为 1，日历以起点为锚、点在起点之后只改终点；从触发钮展开照旧重新挑一段
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
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["2026-10-05", "2026-10-09"]);
  const [activeIndex, setActiveIndex] = useState<0 | 1>(0);

  return (
    <>
      <XhDateRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        activeIndex={activeIndex}
        onActiveIndexChange={details => setActiveIndex(details.activeIndex)}
        locale="zh-CN"
      >
        {({ weeks, weekDays }) => (
          <>
            <XhDateRangePickerLabel>旅行日期</XhDateRangePickerLabel>
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

      <span aria-live="polite" style={{ fontSize: "13px" }}>{\`正在编辑：\${activeIndex === 1 ? "终点" : "起点"}；区间：\${value[0] ?? ""} → \${value[1] ?? ""}\`}</span>
    </>
  );
}
`;export{e as default};