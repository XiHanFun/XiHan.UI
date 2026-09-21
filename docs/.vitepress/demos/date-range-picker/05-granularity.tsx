// 周期区间 | granularity 决定两组输入行铺设哪几段、浮层铺设哪一档格子
import type { CalendarGranularity } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/react";
import { Fragment } from "react";

const kinds: { key: string; label: string; granularity: CalendarGranularity }[] = [
  { key: "week", label: "周报区间", granularity: "week" },
  { key: "month", label: "月报区间", granularity: "month" },
  { key: "quarter", label: "季报区间", granularity: "quarter" },
  { key: "year", label: "年报区间", granularity: "year" },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-5)" }}>
      {kinds.map(k => (
        <XhDateRangePickerRoot
          key={k.key}
          granularity={k.granularity}
          locale="zh-CN"
        >
          {({ panels, weekDays, segments, endSegments }) => (
            <>
              <XhDateRangePickerLabel>{k.label}</XhDateRangePickerLabel>
              <XhDateRangePickerControl>
                {/* 组号定这组段位认领哪一端：0 起点、1 终点 */}
                {([segments, endSegments] as const).map((group, end) => (
                  <Fragment key={end}>
                    {end === 1 && <XhDateRangePickerRangeSeparator />}
                    <XhDateRangePickerSegmentGroup index={end}>
                      {/* 铺哪几块由 granularity 推；分隔符是普通节点，作者写在段位旁边 */}
                      {group.map((seg, i) => (
                        <Fragment key={seg.type}>
                          {i > 0 && <span>/</span>}
                          <XhDateRangePickerSegment index={i} />
                          {seg.type === "week" && <span>周</span>}
                        </Fragment>
                      ))}
                    </XhDateRangePickerSegmentGroup>
                  </Fragment>
                ))}
                <XhDateRangePickerClearTrigger />
                <XhDateRangePickerTrigger />
              </XhDateRangePickerControl>
              <XhDateRangePickerPositioner>
                <XhDateRangePickerContent>
                  {/* 面板号写在日历上，面板内的标题、网格与格子跟着它走 */}
                  {panels.map(panel => (
                    <XhDateRangePickerCalendar key={panel.index} index={panel.index}>
                      <XhDateRangePickerHeader>
                        {/* 往前只在最左那张、往后只在最右那张：整窗一起走 */}
                        {panel.index === 0 && <XhDateRangePickerPrevTrigger aria-label="上一页" />}
                        <XhDateRangePickerHeading />
                        {panel.index === panels.length - 1 && <XhDateRangePickerNextTrigger aria-label="下一页" />}
                      </XhDateRangePickerHeader>
                      <XhDateRangePickerGrid>
                        {panel.weeks.length > 0
                          ? (
                              <>
                                <XhDateRangePickerGridHead>
                                  <XhDateRangePickerWeekRow>
                                    {weekDays.map(d => <XhDateRangePickerWeekDay key={d.value} value={d.value} />)}
                                  </XhDateRangePickerWeekRow>
                                </XhDateRangePickerGridHead>
                                <XhDateRangePickerGridBody>
                                  {panel.weeks.map(week => (
                                    <XhDateRangePickerWeekRow key={week[0]!.start}>
                                      {week.map(day => (
                                        <XhDateRangePickerCell key={day.start} value={day.start}>
                                          <XhDateRangePickerCellTrigger>{day.day}</XhDateRangePickerCellTrigger>
                                        </XhDateRangePickerCell>
                                      ))}
                                    </XhDateRangePickerWeekRow>
                                  ))}
                                </XhDateRangePickerGridBody>
                              </>
                            )
                          : panel.cells.map(cell => (
                              <XhDateRangePickerCell key={cell.start} value={cell.start}>
                                <XhDateRangePickerCellTrigger>{cell.label}</XhDateRangePickerCellTrigger>
                              </XhDateRangePickerCell>
                            ))}
                      </XhDateRangePickerGrid>
                    </XhDateRangePickerCalendar>
                  ))}
                </XhDateRangePickerContent>
              </XhDateRangePickerPositioner>
            </>
          )}
        </XhDateRangePickerRoot>
      ))}
    </div>
  );
}
