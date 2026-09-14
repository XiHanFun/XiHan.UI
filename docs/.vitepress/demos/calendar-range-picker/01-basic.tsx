/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 基础用法 | 先落起点再落终点，也可以按住拖过去；两端都落定才写值，Escape 撤掉起点
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
  const [value, setValue] = useState<string[]>([]);

  // 值只在两端都落定时更新；挑到一半的起点记在组件里
  const text = value.length === 2 ? `${value[0]} → ${value[1]}` : "（未选）";

  return (
    <>
      <XhCalendarRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        fixedWeeks
        style={{ maxInlineSize: "280px" }}
      >
        {({ weeks, weekDays }) => (
          <>
            <XhCalendarRangePickerHeader>
              <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
              <XhCalendarRangePickerHeading />
              <XhCalendarRangePickerNextTrigger aria-label="下个月" />
            </XhCalendarRangePickerHeader>
            <XhCalendarRangePickerGrid>
              <XhCalendarRangePickerGridHead>
                <XhCalendarRangePickerWeekRow>
                  {weekDays.map(d => (
                    <XhCalendarRangePickerWeekDay key={d.value} value={d.value} />
                  ))}
                </XhCalendarRangePickerWeekRow>
              </XhCalendarRangePickerGridHead>
              <XhCalendarRangePickerGridBody>
                {weeks.map(week => (
                  <XhCalendarRangePickerWeekRow key={week[0]?.start}>
                    {week.map(day => (
                      <XhCalendarRangePickerCell key={day.start} value={day.start}>
                        <XhCalendarRangePickerCellTrigger>{day.day}</XhCalendarRangePickerCellTrigger>
                      </XhCalendarRangePickerCell>
                    ))}
                  </XhCalendarRangePickerWeekRow>
                ))}
              </XhCalendarRangePickerGridBody>
            </XhCalendarRangePickerGrid>
          </>
        )}
      </XhCalendarRangePickerRoot>

      <span style={{ fontSize: "13px" }}>{`区间：${text}`}</span>
    </>
  );
}
