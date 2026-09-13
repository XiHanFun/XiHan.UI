const e=`// 不可用日期 | 禁止选择周末
import type { ReactNode } from "react";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerContent,
  XhDatePickerControl,
  XhDatePickerGrid,
  XhDatePickerGridBody,
  XhDatePickerGridHead,
  XhDatePickerHeader,
  XhDatePickerHeading,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";

function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y!, m! - 1, d).getDay();
  return weekday === 0 || weekday === 6;
}

export default function Demo(): ReactNode {
  return (
    <XhDatePickerRoot isDateUnavailable={isWeekend} locale="zh-CN">
      {({ weeks, weekDays }) => (
        <>
          <XhDatePickerLabel>工作日</XhDatePickerLabel>
          <XhDatePickerControl>
            <XhDatePickerSegmentGroup>
              <XhDatePickerSegment index={0} />
              <span>-</span>
              <XhDatePickerSegment index={1} />
              <span>-</span>
              <XhDatePickerSegment index={2} />
            </XhDatePickerSegmentGroup>
            <XhDatePickerClearTrigger />
          </XhDatePickerControl>
          <XhDatePickerPositioner>
            <XhDatePickerContent>
              <XhDatePickerCalendar>
                <XhDatePickerHeader>
                  <XhDatePickerPrevTrigger aria-label="上个月" />
                  <XhDatePickerHeading />
                  <XhDatePickerNextTrigger aria-label="下个月" />
                </XhDatePickerHeader>
                <XhDatePickerGrid>
                  <XhDatePickerGridHead>
                    <XhDatePickerWeekRow>
                      {weekDays.map(d => (
                        <XhDatePickerWeekDay key={d.value} value={d.value} />
                      ))}
                    </XhDatePickerWeekRow>
                  </XhDatePickerGridHead>
                  <XhDatePickerGridBody>
                    {weeks.map(week => (
                      <XhDatePickerWeekRow key={week[0]!.value}>
                        {week.map(day => (
                          <XhDatePickerCell key={day.value} value={day.value}>
                            <XhDatePickerCellTrigger>{day.day}</XhDatePickerCellTrigger>
                          </XhDatePickerCell>
                        ))}
                      </XhDatePickerWeekRow>
                    ))}
                  </XhDatePickerGridBody>
                </XhDatePickerGrid>
              </XhDatePickerCalendar>
            </XhDatePickerContent>
          </XhDatePickerPositioner>
        </>
      )}
    </XhDatePickerRoot>
  );
}
`;export{e as default};
