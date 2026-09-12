const e=`// 快捷选项 | presets 在浮层里排出一列，点一条整份写进去并收起；日子在组件外算好再传
import type { ReactNode } from "react";
import { datePickerPresetDay } from "@xihan-ui/headless";
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
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPresetGroup,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);

  // 日子在 useMemo 里算一次。connect 每帧都会跑一遍，把 today() 放进渲染期会跨零点算出两个答案。
  // 区间用 datePickerPresetRange(-6, 0) 这类算出 '起/止' 一个串，两端一次落定
  const presets = useMemo(() => [
    { label: "今天", value: datePickerPresetDay(0) },
    { label: "明天", value: datePickerPresetDay(1) },
    { label: "一周后", value: datePickerPresetDay(7) },
  ], []);

  return (
    <>
      <XhDatePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        presets={presets}
        locale="zh-CN"
      >
        {({ weeks, weekDays }) => (
          <>
            <XhDatePickerLabel>提醒日期</XhDatePickerLabel>
            <XhDatePickerControl>
              <XhDatePickerSegmentGroup>
                <XhDatePickerSegment index={0} />
                <span>-</span>
                <XhDatePickerSegment index={1} />
                <span>-</span>
                <XhDatePickerSegment index={2} />
              </XhDatePickerSegmentGroup>
              <XhDatePickerClearTrigger />
            </XhDatePickerControl>
            <XhDatePickerPositioner>
              <XhDatePickerContent>
                {/* 不写 children 就按 presets 数据自动铺，产出的 DOM 与手写部件一致 */}
                <XhDatePickerPresetGroup />
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

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value[0] ?? "（未选）"}\`}</span>
    </>
  );
}
`;export{e as default};
