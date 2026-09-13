const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 区间选择 | 选择开始和结束日期
import type { CalendarGranularity } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
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
  XhDatePickerRangeSeparator,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { Fragment } from "react";

const kinds = [
  { key: "day", label: "旅行日期", granularity: "day" as CalendarGranularity },
];

const translations = { startDate: "开始", endDate: "结束" };

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {kinds.map(k => (
        <XhDatePickerRoot
          key={k.key}
          translations={translations}
          granularity={k.granularity}
          selectionMode="range"
          locale="zh-CN"
          style={{ "--xh-date-picker-control-min-w": "20rem" } as CSSProperties}
        >
          {({ panels, weekDays, segments, endSegments }) => (
            <>
              <XhDatePickerLabel>{k.label}</XhDatePickerLabel>
              <XhDatePickerControl>
                {/* 组号定这组段位认领哪一端：0 起点、1 终点 */}
                {[0, 1].map(group => (
                  <Fragment key={group}>
                    {group === 1 && <XhDatePickerRangeSeparator />}
                    <XhDatePickerSegmentGroup index={group}>
                      {/* 铺哪几块由 granularity 推；分隔符是普通节点，作者写在段位旁边 */}
                      {(group === 0 ? segments : endSegments).map((seg, i) => (
                        <Fragment key={seg.type}>
                          {i > 0 && <span>/</span>}
                          <XhDatePickerSegment index={i} />
                          {seg.type === "week" && <span>周</span>}
                        </Fragment>
                      ))}
                    </XhDatePickerSegmentGroup>
                  </Fragment>
                ))}
                <XhDatePickerClearTrigger />
                <XhDatePickerTrigger />
              </XhDatePickerControl>
              <XhDatePickerPositioner>
                <XhDatePickerContent>
                  {/* 面板号写在日历上，面板内的标题、网格与格子跟着它走 */}
                  {panels.map(panel => (
                    <XhDatePickerCalendar key={panel.index} index={panel.index}>
                      <XhDatePickerHeader>
                        {/* 往前只在最左那张、往后只在最右那张：整窗一起走 */}
                        {panel.index === 0 && <XhDatePickerPrevTrigger aria-label="上一页" />}
                        <XhDatePickerHeading />
                        {panel.index === panels.length - 1 && <XhDatePickerNextTrigger aria-label="下一页" />}
                      </XhDatePickerHeader>
                      <XhDatePickerGrid>
                        {panel.weeks.length > 0
                          ? (
                              <>
                                <XhDatePickerGridHead>
                                  <XhDatePickerWeekRow>
                                    {weekDays.map(d => (
                                      <XhDatePickerWeekDay key={d.value} value={d.value} />
                                    ))}
                                  </XhDatePickerWeekRow>
                                </XhDatePickerGridHead>
                                <XhDatePickerGridBody>
                                  {panel.weeks.map(week => (
                                    <XhDatePickerWeekRow key={week[0]!.start}>
                                      {/* 面板号跟着所在的日历走 */}
                                      {week.map(day => (
                                        <XhDatePickerCell key={day.start} value={day.start}>
                                          <XhDatePickerCellTrigger>{day.day}</XhDatePickerCellTrigger>
                                        </XhDatePickerCell>
                                      ))}
                                    </XhDatePickerWeekRow>
                                  ))}
                                </XhDatePickerGridBody>
                              </>
                            )
                          : panel.cells.map(cell => (
                              <XhDatePickerCell key={cell.start} value={cell.start}>
                                <XhDatePickerCellTrigger>{cell.label}</XhDatePickerCellTrigger>
                              </XhDatePickerCell>
                            ))}
                      </XhDatePickerGrid>
                    </XhDatePickerCalendar>
                  ))}
                </XhDatePickerContent>
              </XhDatePickerPositioner>

            </>
          )}
        </XhDatePickerRoot>
      ))}
    </div>
  );
}
`;export{e as default};
