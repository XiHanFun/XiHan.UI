/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 选择日期
import type { ReactNode } from "react";
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhCalendarRoot
      defaultValue={["2026-09-18"]}
      defaultFocusedValue="2026-09-13"
      locale="zh-CN"
      fixedWeeks
    >
      {({ weeks, weekDays }) => (
        <>
          <XhCalendarHeader>
            <XhCalendarPrevTrigger aria-label="上个月" />
            <XhCalendarHeading />
            <XhCalendarNextTrigger aria-label="下个月" />
          </XhCalendarHeader>
          <XhCalendarGrid>
            <XhCalendarGridHead>
              <XhCalendarWeekRow>
                {weekDays.map(d => (
                  <XhCalendarWeekDay key={d.value} value={d.value} />
                ))}
              </XhCalendarWeekRow>
            </XhCalendarGridHead>
            <XhCalendarGridBody>
              {weeks.map(week => (
                <XhCalendarWeekRow key={week[0]?.start}>
                  {week.map(day => (
                    <XhCalendarCell key={day.start} value={day.start}>
                      <XhCalendarCellTrigger>{day.day}</XhCalendarCellTrigger>
                    </XhCalendarCell>
                  ))}
                </XhCalendarWeekRow>
              ))}
            </XhCalendarGridBody>
          </XhCalendarGrid>
        </>
      )}
    </XhCalendarRoot>
  );
}
