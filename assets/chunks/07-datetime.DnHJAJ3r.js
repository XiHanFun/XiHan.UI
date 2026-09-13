const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 日期与时间 | 同时选择日期和时间
import type { ReactNode } from "react";
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
  XhDatePickerNextYearTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerPrevYearTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { Fragment } from "react";

function literalBefore(type: string, index: number): string {
  if (index === 0)
    return "";
  if (type === "hour")
    return " ";
  if (type === "minute" || type === "second")
    return ":";
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
                    <XhDatePickerPrevYearTrigger aria-label="上一年" />
                    <XhDatePickerPrevTrigger aria-label="上个月" />
                    <XhDatePickerHeading />
                    <XhDatePickerNextTrigger aria-label="下个月" />
                    <XhDatePickerNextYearTrigger aria-label="下一年" />
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
                <XhDatePickerTimePanel />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBlockStart: "var(--xh-space-2)", marginInline: "calc(-1 * var(--xh-space-2))", marginBlockEnd: "calc(-1 * var(--xh-space-2))", paddingBlock: "var(--xh-space-1)", paddingInline: "var(--xh-space-2)", borderBlockStart: "var(--xh-stroke-thin) solid var(--xh-border-subtle)" }}>
                <XhDatePickerConfirmTrigger>确定</XhDatePickerConfirmTrigger>
              </div>
            </XhDatePickerContent>
          </XhDatePickerPositioner>
        </>
      )}
    </XhDatePickerRoot>
  );
}
`;export{e as default};
