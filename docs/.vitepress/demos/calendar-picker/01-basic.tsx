/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 选择日期
import type { ReactNode } from "react";
import {
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerHeader,
  XhCalendarPickerHeading,
  XhCalendarPickerNextTrigger,
  XhCalendarPickerPrevTrigger,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhCalendarPickerRoot
      defaultValue={["2026-09-18"]}
      defaultFocusedValue="2026-09-13"
      locale="zh-CN"
      fixedWeeks
    >
      {({ weeks, weekDays }) => (
        <>
          <XhCalendarPickerHeader>
            <XhCalendarPickerPrevTrigger aria-label="上个月" />
            <XhCalendarPickerHeading />
            <XhCalendarPickerNextTrigger aria-label="下个月" />
          </XhCalendarPickerHeader>
          <XhCalendarPickerGrid>
            <XhCalendarPickerGridHead>
              <XhCalendarPickerWeekRow>
                {weekDays.map(d => (
                  <XhCalendarPickerWeekDay key={d.value} value={d.value} />
                ))}
              </XhCalendarPickerWeekRow>
            </XhCalendarPickerGridHead>
            <XhCalendarPickerGridBody>
              {weeks.map(week => (
                <XhCalendarPickerWeekRow key={week[0]?.start}>
                  {week.map(day => (
                    <XhCalendarPickerCell key={day.start} value={day.start}>
                      <XhCalendarPickerCellTrigger>{day.day}</XhCalendarPickerCellTrigger>
                    </XhCalendarPickerCell>
                  ))}
                </XhCalendarPickerWeekRow>
              ))}
            </XhCalendarPickerGridBody>
          </XhCalendarPickerGrid>
        </>
      )}
    </XhCalendarPickerRoot>
  );
}
