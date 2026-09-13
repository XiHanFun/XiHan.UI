// 区间选择 | 选择开始和结束日期
import type { CalendarView } from "@xihan-ui/headless";
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
  XhDatePickerNextYearTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerPrevYearTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekNumber,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { Fragment } from "react";

const kinds = [
  { key: "day", label: "旅行日期", view: "day" as CalendarView, week: false },
];

const translations = { startDate: "开始", endDate: "结束" };

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {kinds.map(k => (
        <XhDatePickerRoot
          key={k.key}
          translations={translations}
          view={k.view}
          weekSelection={k.week}
          selectionMode="range"
          locale="zh-CN"
        >
          {({ panels, weekDays, segments, endSegments }) => (
            <>
              <XhDatePickerLabel>{k.label}</XhDatePickerLabel>
              <XhDatePickerControl>
                {/* 组号定这组段位认领哪一端：0 起点、1 终点 */}
                {[0, 1].map(group => (
                  <XhDatePickerSegmentGroup key={group} index={group}>
                    {/* 铺哪几块由 view 推；「-」与「周」是普通节点，作者写在段位旁边 */}
                    {(group === 0 ? segments : endSegments).map((seg, i) => (
                      <Fragment key={seg.type}>
                        {i > 0 && <span>-</span>}
                        <XhDatePickerSegment index={i} />
                        {seg.type === "week" && <span>周</span>}
                      </Fragment>
                    ))}
                  </XhDatePickerSegmentGroup>
                ))}
                <XhDatePickerClearTrigger />
              </XhDatePickerControl>
              <XhDatePickerPositioner>
                <XhDatePickerContent>
                  {/* 面板号写在日历上，面板内的标题、网格与格子跟着它走 */}
                  {panels.map(panel => (
                    <XhDatePickerCalendar key={panel.index} index={panel.index}>
                      <XhDatePickerHeader>
                        {/* 往前只在最左那张、往后只在最右那张：整窗一起走 */}
                        {panel.index === 0 && <XhDatePickerPrevYearTrigger aria-label="快退" />}
                        {panel.index === 0 && <XhDatePickerPrevTrigger aria-label="上一页" />}
                        <XhDatePickerHeading />
                        {panel.index === panels.length - 1 && <XhDatePickerNextTrigger aria-label="下一页" />}
                        {panel.index === panels.length - 1 && <XhDatePickerNextYearTrigger aria-label="快进" />}
                      </XhDatePickerHeader>
                      <XhDatePickerGrid>
                        {panel.weeks.length > 0
                          ? (
                              <>
                                <XhDatePickerGridHead>
                                  <XhDatePickerWeekRow>
                                    {/* 周选时行首多一列周序号，表头也得空出这一格 */}
                                    {k.week && <XhDatePickerWeekNumber value="" />}
                                    {weekDays.map(d => (
                                      <XhDatePickerWeekDay key={d.value} value={d.value} />
                                    ))}
                                  </XhDatePickerWeekRow>
                                </XhDatePickerGridHead>
                                <XhDatePickerGridBody>
                                  {panel.weeks.map(week => (
                                    <XhDatePickerWeekRow key={week[0]!.value}>
                                      {/* 周序号：挑的是第几周，光看日期看不出来。列宽与文字归皮肤管 */}
                                      {k.week && <XhDatePickerWeekNumber value={week[0]!.value} />}
                                      {/* 面板号跟着所在的日历走 */}
                                      {week.map(day => (
                                        <XhDatePickerCell key={day.value} value={day.value}>
                                          <XhDatePickerCellTrigger>{day.day}</XhDatePickerCellTrigger>
                                        </XhDatePickerCell>
                                      ))}
                                    </XhDatePickerWeekRow>
                                  ))}
                                </XhDatePickerGridBody>
                              </>
                            )
                          : panel.cells.map(cell => (
                              <XhDatePickerCell key={cell.value} value={cell.value}>
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
