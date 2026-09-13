const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 快捷选项 | 提供常用日期
import type { ReactNode } from "react";
import { datePickerPresetDay } from "@xihan-ui/headless";
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
  XhDatePickerPresetGroup,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { useMemo } from "react";

export default function Demo(): ReactNode {
  const presets = useMemo(() => [
    { label: "今天", value: datePickerPresetDay(0) },
    { label: "明天", value: datePickerPresetDay(1) },
    { label: "一周后", value: datePickerPresetDay(7) },
  ], []);

  return (
    <XhDatePickerRoot presets={presets} locale="zh-CN">
      {({ weeks, weekDays }) => (
        <>
          <XhDatePickerLabel>提醒日期</XhDatePickerLabel>
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
              {/* 不写 children 就按 presets 数据自动铺，产出的 DOM 与手写部件一致 */}
              <XhDatePickerPresetGroup />
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
