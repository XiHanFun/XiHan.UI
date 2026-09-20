const e=`// 不可选的日期 | isDateUnavailable 与 min / max 都只阻止落值不阻止聚焦：方向键照常可以经过
import type { ReactNode } from "react";
import {
  XhCalendarPickerCell,
  XhCalendarPickerCellTrigger,
  XhCalendarPickerGrid,
  XhCalendarPickerGridBody,
  XhCalendarPickerGridHead,
  XhCalendarPickerHeader,
  XhCalendarPickerHeading,
  XhCalendarPickerNextTrigger,
  XhCalendarPickerPrevTrigger,
  XhCalendarPickerRoot,
  XhCalendarPickerWeekDay,
  XhCalendarPickerWeekRow,
} from "@xihan-ui/react";
import { useState } from "react";

// 今天前后各七天是可选窗口
function shift(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const month = \`\${d.getMonth() + 1}\`.padStart(2, "0");
  const day = \`\${d.getDate()}\`.padStart(2, "0");
  return \`\${d.getFullYear()}-\${month}-\${day}\`;
}

const min = shift(-7);
const max = shift(7);

// 周末判为不可用
function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split("-");
  const weekday = new Date(Number(y), Number(m) - 1, Number(d)).getDay();
  return weekday === 0 || weekday === 6;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  return (
    <>
      <XhCalendarPickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        min={min}
        max={max}
        isDateUnavailable={isWeekend}
        locale="zh-CN"
        weekdayFormat="narrow"
        fixedWeeks
        style={{ maxInlineSize: "280px" }}
      >
        {({ weeks, weekDays }) => (
          <>
            <XhCalendarPickerHeader>
              <XhCalendarPickerPrevTrigger aria-label="上个月" />
              <XhCalendarPickerHeading />
              <XhCalendarPickerNextTrigger aria-label="下个月" />
            </XhCalendarPickerHeader>
            <XhCalendarPickerGrid>
              <XhCalendarPickerGridHead>
                <XhCalendarPickerWeekRow>
                  {weekDays.map(d => (
                    <XhCalendarPickerWeekDay key={d.value} value={d.value} />
                  ))}
                </XhCalendarPickerWeekRow>
              </XhCalendarPickerGridHead>
              <XhCalendarPickerGridBody>
                {weeks.map(week => (
                  <XhCalendarPickerWeekRow key={week[0]?.start}>
                    {week.map(day => (
                      <XhCalendarPickerCell key={day.start} value={day.start}>
                        <XhCalendarPickerCellTrigger>{day.day}</XhCalendarPickerCellTrigger>
                      </XhCalendarPickerCell>
                    ))}
                  </XhCalendarPickerWeekRow>
                ))}
              </XhCalendarPickerGridBody>
            </XhCalendarPickerGrid>
          </>
        )}
      </XhCalendarPickerRoot>

      <span style={{ fontSize: "13px" }}>
        {\`可选窗口 \${min} ~ \${max}，周末除外 · 选中：\${value[0] ?? "（未选）"}\`}
      </span>
    </>
  );
}
`;export{e as default};
