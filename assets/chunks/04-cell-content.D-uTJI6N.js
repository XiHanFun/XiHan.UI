const e=`// 格子内放置内容 | cell-trigger 的内容全部由作者编写，日号之外还可放置自己的标记
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
      <XhCalendarPickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        fixedWeeks
        style={{ maxInlineSize: "360px" }}
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
                        <XhCalendarPickerCellTrigger>
                          <span style={{ display: "grid", justifyItems: "center", gap: "2px" }}>
                            <span>{day.day}</span>
                            {/* 没安排的日子把这颗点隐掉，不是删掉 */}
                            <span
                              style={{
                                fontSize: "10px",
                                lineHeight: "1",
                                visibility: hasPlan(day.start) ? "visible" : "hidden",
                              }}
                            >
                              •
                            </span>
                          </span>
                        </XhCalendarPickerCellTrigger>
                      </XhCalendarPickerCell>
                    ))}
                  </XhCalendarPickerWeekRow>
                ))}
              </XhCalendarPickerGridBody>
            </XhCalendarPickerGrid>
          </>
        )}
      </XhCalendarPickerRoot>

      <span style={{ fontSize: "13px" }}>{\`选中：\${value[0] ?? "（未选）"}\`}</span>
    </>
  );
}
`;export{e as default};
