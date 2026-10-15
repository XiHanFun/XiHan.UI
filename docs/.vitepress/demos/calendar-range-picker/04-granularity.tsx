// 按周选择 | granularity=week：rows 已按行切好，周视图一行一个整周，每行写一个 week-row；值是两端两周的周首日；月、季度与年同理
import type { ReactNode } from "react";
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  // 值只在两端都落定时更新；挑到一半的起点记在组件里
  const text = value.length === 2 ? `${value[0]} → ${value[1]}` : "（未选）";

  return (
    <>
      <XhCalendarRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        granularity="week"
        style={{ maxInlineSize: "280px" }}
      >
        {({ rows }) => (
          <>
            <XhCalendarRangePickerHeader>
              <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
              <XhCalendarRangePickerHeading />
              <XhCalendarRangePickerNextTrigger aria-label="下个月" />
            </XhCalendarRangePickerHeader>
            {/* 周期格按行收进 week-row：grid 底下得是行，格子落在行里 */}
            <XhCalendarRangePickerGrid>
              {rows.map(row => (
                <XhCalendarRangePickerWeekRow key={row[0]!.key}>
                  {row.map(period => (
                    <XhCalendarRangePickerCell key={period.key} value={period.start}>
                      <XhCalendarRangePickerCellTrigger>{period.label}</XhCalendarRangePickerCellTrigger>
                    </XhCalendarRangePickerCell>
                  ))}
                </XhCalendarRangePickerWeekRow>
              ))}
            </XhCalendarRangePickerGrid>
          </>
        )}
      </XhCalendarRangePickerRoot>

      <span style={{ fontSize: "13px" }}>{`周区间：${text}`}</span>
    </>
  );
}
