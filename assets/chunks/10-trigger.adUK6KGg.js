const e=`// 可选的触发钮 | 点输入行本来就展开，这个按钮不是必需的；要它是因为它才带 aria-haspopup / aria-expanded
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
  XhDatePickerLabel,
  XhDatePickerNextTrigger,
  XhDatePickerPositioner,
  XhDatePickerPrevTrigger,
  XhDatePickerRoot,
  XhDatePickerSegment,
  XhDatePickerSegmentGroup,
  XhDatePickerTrigger,
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
      >
        {({ weeks, weekDays }) => (
          <>
            <XhDatePickerLabel>交付日期</XhDatePickerLabel>
            <XhDatePickerControl>
              <XhDatePickerSegmentGroup>
                <XhDatePickerSegment index={0} />
                <span>-</span>
                <XhDatePickerSegment index={1} />
                <span>-</span>
                <XhDatePickerSegment index={2} />
              </XhDatePickerSegmentGroup>
              <XhDatePickerClearTrigger />
              {/* 写上它多一个明写的入口；不写也照样能展开——点输入行即可，
                  键盘则在段上按 Alt+ArrowDown */}
              <XhDatePickerTrigger aria-label="展开日历" />
            </XhDatePickerControl>
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
