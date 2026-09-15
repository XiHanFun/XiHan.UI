const e=`// 不可用的日子 | allows-non-contiguous-ranges 允许区间跨过周末，只是那些日子不铺轨道；isDateUnavailable 拿得到起点，据此限制区间长度
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

// 周末判为不可用；第二个参数是挑到一半的起点，落了起点之后只许挑 7 天内
function isUnavailable(iso: string, anchor: string | null): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const weekday = new Date(y!, m! - 1, d).getDay();
  if (weekday === 0 || weekday === 6)
    return true;
  if (!anchor)
    return false;
  const days = Math.abs((new Date(iso).getTime() - new Date(anchor).getTime()) / 86400000);
  return days > 7;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  // 值只在两端都落定时更新；挑到一半的起点记在组件里
  const text = value.length === 2 ? \`\${value[0]} → \${value[1]}\` : "（未选）";

  return (
    <>
      <XhCalendarRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        isDateUnavailable={isUnavailable}
        allowsNonContiguousRanges
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
