const e=`// 多选成标签 | selectionMode="multiple" 时选中的日期在输入行里排成标签，点标签上的叉或在日历钮上按退格摘掉，放不下的折进 +N；浮层选完不收起
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
  XhDatePickerHiddenInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerTagList,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDatePickerRoot
      locale="zh-CN"
      name="duty-days"
      selectionMode="multiple"
      placeholder="选择值班日期"
      defaultValue={["2026-10-08", "2026-10-15", "2026-10-22", "2026-10-29"]}
    >
      {({ weeks, weekDays }) => (
        <>
          <XhDatePickerLabel>值班日期</XhDatePickerLabel>
          <XhDatePickerControl>
            <XhDatePickerTagList />
            <XhDatePickerClearTrigger />
            <XhDatePickerTrigger />
          </XhDatePickerControl>
          <XhDatePickerHiddenInput />
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
                      <XhDatePickerWeekRow key={week[0]!.start}>
                        {week.map(day => (
                          <XhDatePickerCell key={day.start} value={day.start}>
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
