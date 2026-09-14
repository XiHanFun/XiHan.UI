// 并排两个月 | visible-count=2：起止常跨月，并排看两页才好挑；翻页时整窗一起走
import type { ReactNode } from "react";
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["2026-09-28", "2026-10-06"]);

  return (
    <>
      <XhCalendarRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        defaultFocusedValue="2026-09-28"
        locale="zh-CN"
        visibleCount={2}
        fixedWeeks
      >
        {({ panels, weekDays }) => (
          <>
            <XhCalendarRangePickerHeader>
              <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
              {/* 两张面板各有自己的标题，翻页按钮只有一对 */}
              {panels.map(panel => (
                <XhCalendarRangePickerHeading key={panel.index} index={panel.index} />
              ))}
              <XhCalendarRangePickerNextTrigger aria-label="下个月" />
            </XhCalendarRangePickerHeader>
            <div style={{ display: "flex", gap: "16px" }}>
              {panels.map(panel => (
                <XhCalendarRangePickerGrid key={panel.index} index={panel.index}>
                  <XhCalendarRangePickerGridHead>
                    <XhCalendarRangePickerWeekRow>
                      {weekDays.map(d => (
                        <XhCalendarRangePickerWeekDay key={d.value} value={d.value} />
                      ))}
                    </XhCalendarRangePickerWeekRow>
                  </XhCalendarRangePickerGridHead>
                  <XhCalendarRangePickerGridBody>
                    {panel.weeks.map(week => (
                      <XhCalendarRangePickerWeekRow key={week[0]?.start}>
                        {/* 同一天会同时出现在两张面板里，格子得自报属于哪一张 */}
                        {week.map(day => (
                          <XhCalendarRangePickerCell key={day.start} value={day.start} index={panel.index}>
                            <XhCalendarRangePickerCellTrigger>{day.day}</XhCalendarRangePickerCellTrigger>
                          </XhCalendarRangePickerCell>
                        ))}
                      </XhCalendarRangePickerWeekRow>
                    ))}
                  </XhCalendarRangePickerGridBody>
                </XhCalendarRangePickerGrid>
              ))}
            </div>
          </>
        )}
      </XhCalendarRangePickerRoot>

      <span style={{ fontSize: "13px" }}>
        区间：
        {value.length === 2 ? `${value[0]} → ${value[1]}` : "（未选）"}
      </span>
    </>
  );
}
