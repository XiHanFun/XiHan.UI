// 选择粒度 | 按周、月、季度或年选择
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
  XhDatePickerHeadingMonthTrigger,
  XhDatePickerHeadingYearTrigger,
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
  { key: "day", label: "按天", view: "day" as CalendarView, week: false },
  { key: "week", label: "按周", view: "day" as CalendarView, week: true },
  { key: "month", label: "按月", view: "month" as CalendarView, week: false },
  { key: "quarter", label: "按季度", view: "quarter" as CalendarView, week: false },
  { key: "year", label: "按年", view: "year" as CalendarView, week: false },
];

const yearCells = Array.from({ length: 200 }, (_, index) => {
  const year = 1900 + index;
  return { value: `${year}-01-01`, label: `${year}年` };
});

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
      {kinds.map(k => (
        <XhDatePickerRoot
          key={k.key}
          view={k.view}
          weekSelection={k.week}
          selectionMode={k.week ? "range" : "single"}
          defaultFocusedValue={k.key === "year" ? "2026-01-01" : undefined}
          locale="zh-CN"
        >
          {({ panels, weekDays, segments }) => (
            <>
              <XhDatePickerLabel>{k.label}</XhDatePickerLabel>
              <XhDatePickerControl>
                <XhDatePickerSegmentGroup>
                  {/* 「-」与「周」是普通节点，与「年 / 月 / 日」一样由作者写在段位旁边 */}
                  {segments.map((seg, i) => (
                    <Fragment key={seg.type}>
                      {i > 0 && <span>-</span>}
                      <XhDatePickerSegment index={i} />
                      {seg.type === "week" && <span>周</span>}
                    </Fragment>
                  ))}
                </XhDatePickerSegmentGroup>
                <XhDatePickerClearTrigger />
              </XhDatePickerControl>
              <XhDatePickerPositioner>
                <XhDatePickerContent>
                  {panels.map(panel => (
                    <XhDatePickerCalendar key={panel.index}>
                      <XhDatePickerHeader>
                        {k.key === "year"
                          ? <XhDatePickerHeading>选择年份</XhDatePickerHeading>
                          : (
                              <>
                                {/* 大步翻那对钮：日视图一年，粗粒度视图十页 */}
                                <XhDatePickerPrevYearTrigger aria-label="快退" />
                                <XhDatePickerPrevTrigger aria-label="上一页" />
                                <XhDatePickerHeading index={panel.index}>
                                  <XhDatePickerHeadingYearTrigger index={panel.index} />
                                  <XhDatePickerHeadingMonthTrigger index={panel.index} />
                                </XhDatePickerHeading>
                                <XhDatePickerNextTrigger aria-label="下一页" />
                                <XhDatePickerNextYearTrigger aria-label="快进" />
                              </>
                            )}
                      </XhDatePickerHeader>
                      <XhDatePickerGrid index={panel.index}>
                        {/* 日视图铺周行，粗粒度视图把格子直接铺进网格。钻上去之后铺的也是格子，
                              所以这里看 panel.weeks 有没有东西，不看 view */}
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
                                      {week.map(day => (
                                        <XhDatePickerCell
                                          key={day.value}
                                          value={day.value}
                                          index={panel.index}
                                        >
                                          <XhDatePickerCellTrigger>{day.day}</XhDatePickerCellTrigger>
                                        </XhDatePickerCell>
                                      ))}
                                    </XhDatePickerWeekRow>
                                  ))}
                                </XhDatePickerGridBody>
                              </>
                            )
                          : (k.key === "year" ? yearCells : panel.cells).map(cell => (
                              <XhDatePickerCell
                                key={cell.value}
                                value={cell.value}
                                index={panel.index}
                              >
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
