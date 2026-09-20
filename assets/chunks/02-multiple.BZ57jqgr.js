const e=`// 多选 | selection-mode=multiple：点击一次加入，再点击一次移除，集合按日期升序
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

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["2026-09-08", "2026-09-15", "2026-09-22"]);

  return (
    <>
      <XhCalendarPickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        defaultFocusedValue="2026-09-13"
        locale="zh-CN"
        selectionMode="multiple"
        fixedWeeks
        style={{ maxInlineSize: "280px" }}
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

      <span style={{ fontSize: "13px" }}>
        已选
        {value.length}
        {" "}
        天：
        {value.join("、") || "（无）"}
      </span>
    </>
  );
}
`;export{e as default};
