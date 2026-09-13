/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 区间选择 | selection-mode=range：先落起点再落终点，也可以按住拖过去；两端都落定才写值，Escape 撤掉起点
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
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  // 值只在两端都落定时更新；挑到一半的起点记在组件里
  const text = value.length === 2 ? `${value[0]} → ${value[1]}` : "（未选）";

  return (
    <>
      <XhCalendarRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        selectionMode="range"
        fixedWeeks
        style={{ maxInlineSize: "280px" }}
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

      <span style={{ fontSize: "13px" }}>{`区间：${text}`}</span>
    </>
  );
}
