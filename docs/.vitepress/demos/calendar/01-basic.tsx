// 基础用法 | 网格由作者照 weeks / weekDays 自己渲染，组件一个节点都不替你生成
import type { ReactNode } from "react";
import {
  XhCalendarCell,
  XhCalendarCellTrigger,
  XhCalendarGrid,
  XhCalendarGridBody,
  XhCalendarGridHead,
  XhCalendarHeader,
  XhCalendarHeading,
  XhCalendarNextTrigger,
  XhCalendarPrevTrigger,
  XhCalendarRoot,
  XhCalendarWeekDay,
  XhCalendarWeekRow,
} from "@xihan-ui/react";

export default function Demo(): ReactNode {
  return (
    <XhCalendarRoot
      defaultValue={["2026-09-13"]}
      defaultFocusedValue="2026-09-13"
      locale="zh-CN"
      fixedWeeks
      style={{ maxInlineSize: "280px" }}
    >
      {({ weeks, weekDays }) => (
        <>
          <XhCalendarHeader>
            {/* 翻月按钮需要明确可及名称 */}
            <XhCalendarPrevTrigger aria-label="上个月" />
            <XhCalendarHeading />
            <XhCalendarNextTrigger aria-label="下个月" />
          </XhCalendarHeader>
          <XhCalendarGrid>
            <XhCalendarGridHead>
              <XhCalendarWeekRow>
                {weekDays.map(d => (
                  <XhCalendarWeekDay key={d.value} value={d.value} />
                ))}
              </XhCalendarWeekRow>
            </XhCalendarGridHead>
            <XhCalendarGridBody>
              {/* 格子按日期做 key：翻月时前后两月共有的那几天原地复用，指针底下那一格不被抽走 */}
              {weeks.map(week => (
                <XhCalendarWeekRow key={week[0]?.value}>
                  {week.map(day => (
                    <XhCalendarCell key={day.value} value={day.value}>
                      <XhCalendarCellTrigger>{day.day}</XhCalendarCellTrigger>
                    </XhCalendarCell>
                  ))}
                </XhCalendarWeekRow>
              ))}
            </XhCalendarGridBody>
          </XhCalendarGrid>
        </>
      )}
    </XhCalendarRoot>
  );
}
