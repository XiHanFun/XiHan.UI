// 日期与时间 | 同时选择日期和时间
import type { ReactNode } from "react";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerConfirmTrigger,
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
  XhDatePickerTimePanel,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhDatePickerRoot showTime locale="zh-CN">
      {({ weeks, weekDays }) => (
        <>
          <XhDatePickerLabel>会议开始</XhDatePickerLabel>
          <XhDatePickerControl>
            <XhDatePickerSegmentGroup>
              <XhDatePickerSegment index={0} />
              <span>-</span>
              <XhDatePickerSegment index={1} />
              <span>-</span>
              <XhDatePickerSegment index={2} />
            </XhDatePickerSegmentGroup>
          </XhDatePickerControl>
          <XhDatePickerPositioner>
            <XhDatePickerContent>
              <div style={{ display: "flex", alignItems: "stretch" }}>
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
                <XhDatePickerTimePanel />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBlockStart: "8px" }}>
                <XhDatePickerConfirmTrigger>确定</XhDatePickerConfirmTrigger>
              </div>
            </XhDatePickerContent>
          </XhDatePickerPositioner>
        </>
      )}
    </XhDatePickerRoot>
  );
}
