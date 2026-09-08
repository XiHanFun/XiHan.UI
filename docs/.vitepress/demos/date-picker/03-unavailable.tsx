// 不可选的日子 | 周末由 isDateUnavailable 判不可用：方向键仍走得过去，只是落不了值
import type { ReactNode } from "react";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { useState } from "react";

function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y!, m! - 1, d).getDay();
  return weekday === 0 || weekday === 6;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <>
      <XhDatePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        isDateUnavailable={isWeekend}
        locale="zh-CN"
      >
        {({ weeks, weekDays }) => (
          <>
            <XhDatePickerLabel>工作日</XhDatePickerLabel>
            <XhDatePickerControl>
              <XhDatePickerSegmentGroup>
                <XhDatePickerSegment index={0} />
                <span>-</span>
                <XhDatePickerSegment index={1} />
                <span>-</span>
                <XhDatePickerSegment index={2} />
              </XhDatePickerSegmentGroup>
              <XhDatePickerClearTrigger />
            </XhDatePickerControl>
            <XhDatePickerPositioner>
              <XhDatePickerContent>
                <XhDatePickerCalendar>
                  <XhDatePickerHeader>
                    <XhDatePickerPrevTrigger aria-label="上个月" />
                    <XhDatePickerHeading />
                    <XhDatePickerNextTrigger aria-label="下个月" />
                  </XhDatePickerHeader>
                  <XhDatePickerGrid>
                    <XhDatePickerGridHead>
                      <XhDatePickerWeekRow>
                        {weekDays.map(d => (
                          <XhDatePickerWeekDay key={d.value} value={d.value} />
                        ))}
                      </XhDatePickerWeekRow>
                    </XhDatePickerGridHead>
                    <XhDatePickerGridBody>
                      {weeks.map(week => (
                        <XhDatePickerWeekRow key={week[0]!.value}>
                          {week.map(day => (
                            <XhDatePickerCell key={day.value} value={day.value}>
                              <XhDatePickerCellTrigger>{day.day}</XhDatePickerCellTrigger>
                            </XhDatePickerCell>
                          ))}
                        </XhDatePickerWeekRow>
                      ))}
                    </XhDatePickerGridBody>
                  </XhDatePickerGrid>
                </XhDatePickerCalendar>
              </XhDatePickerContent>
            </XhDatePickerPositioner>
          </>
        )}
      </XhDatePickerRoot>

      <span style={{ fontSize: "13px" }}>{`当前值：${value[0] ?? "（未选）"}`}</span>
    </>
  );
}
