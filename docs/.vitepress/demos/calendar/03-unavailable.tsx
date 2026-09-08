// 不可选的日子 | isDateUnavailable 与 min / max 都只挡落值不挡聚焦：方向键照样走得过去
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

// 今天前后各七天是可选窗口
function shift(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const min = shift(-7);
const max = shift(7);

// 周末判为不可用
function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split("-");
  const weekday = new Date(Number(y), Number(m) - 1, Number(d)).getDay();
  return weekday === 0 || weekday === 6;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <>
      <XhCalendarRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        min={min}
        max={max}
        isDateUnavailable={isWeekend}
        locale="zh-CN"
        weekdayFormat="narrow"
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

      <span style={{ fontSize: "13px" }}>
        {`可选窗口 ${min} ~ ${max}，周末除外 · 选中：${value[0] ?? "（未选）"}`}
      </span>
    </>
  );
}
