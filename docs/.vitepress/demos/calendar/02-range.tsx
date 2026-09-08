// 区间选择 | selection-mode=range：第一下落起点、第二下落终点，中间铺一条连续底色
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

  // 挑到一半时集合里只有起点一个值
  const text = value.length === 0
    ? "（未选）"
    : value.length === 1
      ? `${value[0]} → 待定`
      : `${value[0]} → ${value[1]}`;

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
                  <XhCalendarWeekRow key={week[0]?.value}>
                    {week.map(day => (
                      <XhCalendarCell key={day.value} value={day.value}>
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
