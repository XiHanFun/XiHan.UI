// 日期与时间 | 同时选择日期和时间
import type { ReactNode } from "react";
import { Fragment } from "react";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
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
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";

function literalBefore(type: string, index: number): string {
  if (index === 0) return "";
  if (type === "hour") return " ";
  if (type === "minute" || type === "second") return ":";
  return "/";
}

export default function Demo(): ReactNode {
  return (
    <XhDatePickerRoot showTime locale="zh-CN">
      {({ weeks, weekDays, segments }) => (
        <>
          <XhDatePickerLabel>会议开始</XhDatePickerLabel>
          <XhDatePickerControl>
            <XhDatePickerSegmentGroup>
              {segments.map((segment, index) => (
                <Fragment key={segment.type}>
                  {index > 0 && <span>{literalBefore(segment.type, index)}</span>}
                  <XhDatePickerSegment index={index} />
                </Fragment>
              ))}
            </XhDatePickerSegmentGroup>
            <XhDatePickerClearTrigger />
            <XhDatePickerTrigger />
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
