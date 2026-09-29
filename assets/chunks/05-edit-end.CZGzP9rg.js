const e=`// 只改终点 | activeIndex=1 时起点当锚：点在起点之后只改终点，点在起点之前从那一天重新开始挑
import type { ReactNode } from "react";
import {
  XhCalendarRangePickerCell,
  XhCalendarRangePickerCellTrigger,
  XhCalendarRangePickerGrid,
  XhCalendarRangePickerGridBody,
  XhCalendarRangePickerGridHead,
  XhCalendarRangePickerHeader,
  XhCalendarRangePickerHeading,
  XhCalendarRangePickerNextTrigger,
  XhCalendarRangePickerPrevTrigger,
  XhCalendarRangePickerRoot,
  XhCalendarRangePickerWeekDay,
  XhCalendarRangePickerWeekRow,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["2026-10-05", "2026-10-09"]);

  // 值只在两端都落定时更新；挑到一半的起点记在组件里
  const text = value.length === 2 ? \`\${value[0]} → \${value[1]}\` : "（未选）";

  return (
    <>
      <XhCalendarRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        activeIndex={1}
        locale="zh-CN"
        fixedWeeks
        style={{ maxInlineSize: "280px" }}
      >
        {({ weeks, weekDays }) => (
          <>
            <XhCalendarRangePickerHeader>
              <XhCalendarRangePickerPrevTrigger aria-label="上个月" />
              <XhCalendarRangePickerHeading />
              <XhCalendarRangePickerNextTrigger aria-label="下个月" />
            </XhCalendarRangePickerHeader>
            <XhCalendarRangePickerGrid>
              <XhCalendarRangePickerGridHead>
                <XhCalendarRangePickerWeekRow>
                  {weekDays.map(d => (
                    <XhCalendarRangePickerWeekDay key={d.value} value={d.value} />
                  ))}
                </XhCalendarRangePickerWeekRow>
              </XhCalendarRangePickerGridHead>
              <XhCalendarRangePickerGridBody>
                {weeks.map(week => (
                  <XhCalendarRangePickerWeekRow key={week[0]?.start}>
                    {week.map(day => (
                      <XhCalendarRangePickerCell key={day.start} value={day.start}>
                        <XhCalendarRangePickerCellTrigger>{day.day}</XhCalendarRangePickerCellTrigger>
                      </XhCalendarRangePickerCell>
                    ))}
                  </XhCalendarRangePickerWeekRow>
                ))}
              </XhCalendarRangePickerGridBody>
            </XhCalendarRangePickerGrid>
          </>
        )}
      </XhCalendarRangePickerRoot>

      <span style={{ fontSize: "13px" }}>{\`区间：\${text}\`}</span>
    </>
  );
}
`;export{e as default};
