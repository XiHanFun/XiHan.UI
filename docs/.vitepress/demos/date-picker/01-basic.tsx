// 基础用法 | 输入或选择日期
import type { CSSProperties, ReactNode } from "react";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerHiddenInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDatePickerRoot
      locale="zh-CN"
      name="delivery-date"
      style={{
        "--xh-date-picker-control-min-w": "calc(var(--xh-control-min-w) + var(--xh-control-h-md) + var(--xh-control-h-md) + var(--xh-space-6))",
      } as CSSProperties}
    >
      {({ weeks, weekDays }) => (
        <>
          <XhDatePickerLabel>交付日期</XhDatePickerLabel>
          <XhDatePickerControl>
            <XhDatePickerSegmentGroup>
              <XhDatePickerSegment index={0} />
              <span>-</span>
              <XhDatePickerSegment index={1} />
              <span>-</span>
              <XhDatePickerSegment index={2} />
            </XhDatePickerSegmentGroup>
            <XhDatePickerTrigger />
          </XhDatePickerControl>
          <XhDatePickerHiddenInput />
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
  );
}
