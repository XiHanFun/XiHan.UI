const e=`// 格子里放内容 | cell-trigger 的内容全由作者写，日号之外还能塞自己的标记
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

// 每月 1 号与 15 号当作有安排的日子
function hasPlan(iso: string): boolean {
  const day = Number(iso.slice(8, 10));
  return day === 1 || day === 15;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <>
      <XhCalendarRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        fixedWeeks
        style={{ maxInlineSize: "360px" }}
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
                        <XhCalendarCellTrigger>
                          <span style={{ display: "grid", justifyItems: "center", gap: "2px" }}>
                            <span>{day.day}</span>
                            {/* 没安排的日子把这颗点隐掉，不是删掉 */}
                            <span
                              style={{
                                fontSize: "10px",
                                lineHeight: "1",
                                visibility: hasPlan(day.value) ? "visible" : "hidden",
                              }}
                            >
                              •
                            </span>
                          </span>
                        </XhCalendarCellTrigger>
                      </XhCalendarCell>
                    ))}
                  </XhCalendarWeekRow>
                ))}
              </XhCalendarGridBody>
            </XhCalendarGrid>
          </>
        )}
      </XhCalendarRoot>

      <span style={{ fontSize: "13px" }}>{\`选中：\${value[0] ?? "（未选）"}\`}</span>
    </>
  );
}
`;export{e as default};
