const e=`// 五种粒度 | 天 / 周 / 月 / 季度 / 年一套结构走完：输入行铺哪几段跟着 view 走，标题里的年与月可点，逐级钻上去
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
import { Fragment, useState } from "react";

// 段位不必再手数几段：铺哪几块由 view 推出来，作者照 segments 铺就是
const kinds = [
  { key: "day", label: "按天", view: "day" as CalendarView, week: false },
  { key: "week", label: "按周", view: "day" as CalendarView, week: true },
  { key: "month", label: "按月", view: "month" as CalendarView, week: false },
  { key: "quarter", label: "按季度", view: "quarter" as CalendarView, week: false },
  { key: "year", label: "按年", view: "year" as CalendarView, week: false },
];

export default function Demo(): ReactNode {
  const [values, setValues] = useState<Record<string, string[]>>({
    day: [],
    week: [],
    month: [],
    quarter: [],
    year: [],
  });

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
        {kinds.map(k => (
          <XhDatePickerRoot
            key={k.key}
            value={values[k.key] ?? []}
            onValueChange={details => setValues(prev => ({ ...prev, [k.key]: details.value }))}
            view={k.view}
            weekSelection={k.week}
            selectionMode={k.week ? "range" : "single"}
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
                          {/* 大步翻那对钮：日视图一年，粗粒度视图十页 */}
                          <XhDatePickerPrevYearTrigger aria-label="快退" />
                          <XhDatePickerPrevTrigger aria-label="上一页" />
                          <XhDatePickerHeading index={panel.index}>
                            {/* 年与月各是一个钮：点年进十年格、点月进月格；到顶那一截自动按不动，
                                没有的那一截自动收起 */}
                            <XhDatePickerHeadingYearTrigger index={panel.index} />
                            <XhDatePickerHeadingMonthTrigger index={panel.index} />
                          </XhDatePickerHeading>
                          <XhDatePickerNextTrigger aria-label="下一页" />
                          <XhDatePickerNextYearTrigger aria-label="快进" />
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
                            : panel.cells.map(cell => (
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

      <p style={{ fontSize: "13px" }}>
        {kinds.map(k => (
          <span key={k.key} style={{ marginInlineEnd: "12px" }}>
            {\`\${k.label}：\${(values[k.key] ?? []).join(" → ") || "—"}\`}
          </span>
        ))}
      </p>
    </>
  );
}
`;export{e as default};
