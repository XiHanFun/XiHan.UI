// 基础用法 | 点输入行任意处即展开，不必再去点小箭头；段位与日历写的是同一个值，改哪边另一边当场跟着改口
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
  XhDatePickerHiddenInput,
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <>
      <XhDatePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        name="due"
      >
        {({ weeks, weekDays }) => (
          <>
            <XhDatePickerLabel>交付日期</XhDatePickerLabel>
            <XhDatePickerControl>
              <XhDatePickerSegmentGroup>
                {/* 段位不写内容：显示什么由组件按当前值填 */}
                <XhDatePickerSegment index={0} />
                <span>-</span>
                <XhDatePickerSegment index={1} />
                <span>-</span>
                <XhDatePickerSegment index={2} />
              </XhDatePickerSegmentGroup>
              <XhDatePickerClearTrigger />
            </XhDatePickerControl>
            {/* 表单出口：随表单提交的是 ISO 串 */}
            <XhDatePickerHiddenInput />
            <XhDatePickerPositioner>
              <XhDatePickerContent>
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
                      {/* map 必带 key：就地复用会让承载焦点的那一格换了身份 */}
                      {weeks.map(week => (
                        <XhDatePickerWeekRow key={week[0]!.value}>
                          {week.map(day => (
                            <XhDatePickerCell key={day.value} value={day.value}>
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

      <span style={{ fontSize: "13px" }}>{`当前值：${value[0] ?? "（未选）"}`}</span>
    </>
  );
}
