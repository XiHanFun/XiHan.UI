const e=`/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 周期选择 | 粒度与单选/区间彼此独立
import type { CalendarGranularity, CalendarPeriod, CalendarSelectionMode } from "@xihan-ui/headless";
import type { CSSProperties, ReactNode } from "react";
import { calendarPeriodOf, calendarPeriodValue } from "@xihan-ui/headless";
import {
  XhButton,
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
  XhDatePickerRangeSeparator,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
  XhToggleGroupItem,
  XhToggleGroupRoot,
} from "@xihan-ui/react";
import { Fragment, useMemo, useState } from "react";

const granularities: { value: CalendarGranularity; label: string }[] = [
  { value: "day", label: "天" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
  { value: "quarter", label: "季" },
  { value: "year", label: "年" },
];

const modes: { value: Extract<CalendarSelectionMode, "single" | "range">; label: string }[] = [
  { value: "single", label: "单选" },
  { value: "range", label: "区间" },
];

const yearCells: CalendarPeriod[] = Array.from({ length: 200 }, (_, index) =>
  calendarPeriodOf(\`\${1900 + index}-01-01\`, "year", { locale: "zh-CN" })!);

export default function Demo(): ReactNode {
  const [granularity, setGranularity] = useState<CalendarGranularity>("day");
  const [selectionMode, setSelectionMode] = useState<"single" | "range">("single");
  const [value, setValue] = useState<string[]>([]);
  const summary = useMemo(() => {
    const period = calendarPeriodValue(granularity, selectionMode, value, { locale: "zh-CN" });
    return period ? \`\${period.start} – \${period.end}\` : "尚未选择";
  }, [granularity, selectionMode, value]);

  return (
    <XhDatePickerRoot
      value={value}
      granularity={granularity}
      selectionMode={selectionMode}
      closeOnSelect={false}
      locale="zh-CN"
      onValueChange={({ value: next }) => setValue(next)}
      style={{ "--xh-date-picker-control-min-w": "22rem" } as CSSProperties}
    >
      {({ panels, weekDays, segments, endSegments, clear, setOpen }) => (
        <>
          <XhDatePickerLabel>统计周期</XhDatePickerLabel>
          <XhDatePickerControl>
            {Array.from({ length: selectionMode === "range" ? 2 : 1 }, (_, group) => (
              <Fragment key={group}>
                {group === 1 && <XhDatePickerRangeSeparator />}
                <XhDatePickerSegmentGroup index={group as 0 | 1}>
                  {(group === 0 ? segments : endSegments).map((segment, index) => (
                    <Fragment key={segment.type}>
                      {index > 0 && <span>/</span>}
                      <XhDatePickerSegment index={index} />
                      {segment.type === "week" && <span>周</span>}
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
              <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--xh-space-3)", paddingBlockEnd: "var(--xh-space-2)" }}>
                <XhToggleGroupRoot
                  value={granularity}
                  disallowEmpty
                  size="sm"
                  onValueChange={({ value: next }) => typeof next === "string" && setGranularity(next as CalendarGranularity)}
                >
                  {granularities.map(item => <XhToggleGroupItem key={item.value} value={item.value}>{item.label}</XhToggleGroupItem>)}
                </XhToggleGroupRoot>
                <XhToggleGroupRoot
                  value={selectionMode}
                  disallowEmpty
                  size="sm"
                  onValueChange={({ value: next }) => (next === "single" || next === "range") && setSelectionMode(next)}
                >
                  {modes.map(item => <XhToggleGroupItem key={item.value} value={item.value}>{item.label}</XhToggleGroupItem>)}
                </XhToggleGroupRoot>
              </div>

              {panels.map(panel => (
                <XhDatePickerCalendar key={panel.index} index={panel.index}>
                  <XhDatePickerHeader>
                    {granularity === "year"
                      ? <XhDatePickerHeading>选择年份</XhDatePickerHeading>
                      : (
                          <>
                            <XhDatePickerPrevYearTrigger aria-label="快速向前" />
                            <XhDatePickerPrevTrigger aria-label="上一页" />
                            <XhDatePickerHeading>
                              <XhDatePickerHeadingYearTrigger />
                              <XhDatePickerHeadingMonthTrigger />
                            </XhDatePickerHeading>
                            <XhDatePickerNextTrigger aria-label="下一页" />
                            <XhDatePickerNextYearTrigger aria-label="快速向后" />
                          </>
                        )}
                  </XhDatePickerHeader>

                  <XhDatePickerGrid>
                    {panel.weeks.length > 0
                      ? (
                          <>
                            <XhDatePickerGridHead>
                              <XhDatePickerWeekRow>
                                {weekDays.map(day => <XhDatePickerWeekDay key={day.value} value={day.value} />)}
                              </XhDatePickerWeekRow>
                            </XhDatePickerGridHead>
                            <XhDatePickerGridBody>
                              {panel.weeks.map(week => (
                                <XhDatePickerWeekRow key={week[0]!.start}>
                                  {week.map(day => (
                                    <XhDatePickerCell key={day.key} value={day.start}>
                                      <XhDatePickerCellTrigger>{day.label}</XhDatePickerCellTrigger>
                                    </XhDatePickerCell>
                                  ))}
                                </XhDatePickerWeekRow>
                              ))}
                            </XhDatePickerGridBody>
                          </>
                        )
                      : (granularity === "year" ? yearCells : panel.cells).map(period => (
                          <XhDatePickerCell key={period.key} value={period.start}>
                            <XhDatePickerCellTrigger>{period.label}</XhDatePickerCellTrigger>
                          </XhDatePickerCell>
                        ))}
                  </XhDatePickerGrid>
                </XhDatePickerCalendar>
              ))}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--xh-space-3)", marginBlockStart: "var(--xh-space-2)", paddingBlockStart: "var(--xh-space-2)", borderBlockStart: "var(--xh-stroke-thin) solid var(--xh-border-subtle)" }}>
                <span>{summary}</span>
                <div style={{ display: "flex", gap: "var(--xh-space-2)" }}>
                  <XhButton variant="ghost" size="sm" disabled={value.length === 0} onClick={clear}>清空</XhButton>
                  <XhButton size="sm" disabled={value.length === 0} onClick={() => setOpen(false)}>确定</XhButton>
                </div>
              </div>
            </XhDatePickerContent>
          </XhDatePickerPositioner>
        </>
      )}
    </XhDatePickerRoot>
  );
}
`;export{e as default};
