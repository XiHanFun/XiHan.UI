// 两页并排 | 起止常跨月时设置 visibleCount=2，两页一起翻
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
  const [value, setValue] = useState<string[]>([]);
  const text = value.length === 2 ? `${value[0]} → ${value[1]}` : "（未选）";

  return (
    <>
      <XhDateRangePickerRoot
        value={value}
        visibleCount={2}
        locale="zh-CN"
        onValueChange={({ value: next }) => setValue(next)}
      >
        {({ panels, weekDays }) => (
          <>
            <XhDateRangePickerLabel>入住与退房</XhDateRangePickerLabel>
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
                {/* 面板号写在日历上，面板内的标题、网格与格子跟着它走 */}
                {panels.map(panel => (
                  <XhDateRangePickerCalendar key={panel.index} index={panel.index}>
                    <XhDateRangePickerHeader>
                      {/* 往前只在最左那张、往后只在最右那张：整窗一起走 */}
                      {panel.index === 0 && <XhDateRangePickerPrevTrigger aria-label="上一页" />}
                      <XhDateRangePickerHeading />
                      {panel.index === panels.length - 1 && <XhDateRangePickerNextTrigger aria-label="下一页" />}
                    </XhDateRangePickerHeader>
                    <XhDateRangePickerGrid>
                      {panel.weeks.length > 0
                        ? (
                            <>
                              <XhDateRangePickerGridHead>
                                <XhDateRangePickerWeekRow>
                                  {weekDays.map(d => <XhDateRangePickerWeekDay key={d.value} value={d.value} />)}
                                </XhDateRangePickerWeekRow>
                              </XhDateRangePickerGridHead>
                              <XhDateRangePickerGridBody>
                                {panel.weeks.map(week => (
                                  <XhDateRangePickerWeekRow key={week[0]!.start}>
                                    {week.map(day => (
                                      <XhDateRangePickerCell key={day.start} value={day.start}>
                                        <XhDateRangePickerCellTrigger>{day.day}</XhDateRangePickerCellTrigger>
                                      </XhDateRangePickerCell>
                                    ))}
                                  </XhDateRangePickerWeekRow>
                                ))}
                              </XhDateRangePickerGridBody>
                            </>
                          )
                        : panel.cells.map(cell => (
                            <XhDateRangePickerCell key={cell.start} value={cell.start}>
                              <XhDateRangePickerCellTrigger>{cell.label}</XhDateRangePickerCellTrigger>
                            </XhDateRangePickerCell>
                          ))}
                    </XhDateRangePickerGrid>
                  </XhDateRangePickerCalendar>
                ))}
              </XhDateRangePickerContent>
            </XhDateRangePickerPositioner>
          </>
        )}
      </XhDateRangePickerRoot>
      <p style={{ marginBlock: "var(--xh-space-2) 0", fontSize: "var(--xh-text-secondary-size)" }}>
        区间：
        {text}
      </p>
    </>
  );
}
