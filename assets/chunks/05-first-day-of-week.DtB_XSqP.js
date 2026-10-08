var e=`// 周首日 | firstDayOfWeek 单独改周首日：locale 仍是 en-US，月份与星期名照旧是英文，表头与每一行改从星期一排起
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
      locale="en-US"
      firstDayOfWeek={1}
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
`;export{e as default};