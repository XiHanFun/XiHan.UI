const e=`// 日期加时间 | showTime 让起止都带上时刻，defaultTime 在只点日期时补 00:00:00 与 23:59:59；起止同一天时终点早于起点的时刻不可选，由确认钮收口
import type { ReactNode } from "react";
import {
  XhDateRangePickerCalendar,
  XhDateRangePickerCell,
  XhDateRangePickerCellTrigger,
  XhDateRangePickerClearTrigger,
  XhDateRangePickerConfirmTrigger,
  XhDateRangePickerContent,
  XhDateRangePickerControl,
  XhDateRangePickerGrid,
  XhDateRangePickerGridBody,
  XhDateRangePickerGridHead,
  XhDateRangePickerHeader,
  XhDateRangePickerHeading,
  XhDateRangePickerLabel,
  XhDateRangePickerNextTrigger,
  XhDateRangePickerPositioner,
  XhDateRangePickerPrevTrigger,
  XhDateRangePickerRangeSeparator,
  XhDateRangePickerRoot,
  XhDateRangePickerSegment,
  XhDateRangePickerSegmentGroup,
  XhDateRangePickerTimePanel,
  XhDateRangePickerTrigger,
  XhDateRangePickerWeekDay,
  XhDateRangePickerWeekRow,
} from "@xihan-ui/react";
import { Fragment, useState } from "react";

// 两组时间列的名字与小标题
const translations = { startTime: "开始时间", endTime: "结束时间", hour: "时", minute: "分", second: "秒" };

function literalBefore(type: string, index: number): string {
  if (index === 0)
    return "";
  if (type === "hour")
    return " ";
  if (type === "minute" || type === "second")
    return ":";
  return "/";
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>([]);
  const text = value[0] && value[1] ? \`\${value[0]} → \${value[1]}\` : "（未填齐）";

  return (
    <>
      <XhDateRangePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
        showTime
        timeGranularity="second"
        defaultTime={["00:00:00", "23:59:59"]}
        translations={translations}
      >
        {({ weeks, weekDays, segments, endSegments }) => (
          <>
            <XhDateRangePickerLabel>查询区间</XhDateRangePickerLabel>
            <XhDateRangePickerControl>
              <XhDateRangePickerSegmentGroup index={0}>
                {segments.map((segment, index) => (
                  <Fragment key={segment.type}>
                    {index > 0 && <span>{literalBefore(segment.type, index)}</span>}
                    <XhDateRangePickerSegment index={index} />
                  </Fragment>
                ))}
              </XhDateRangePickerSegmentGroup>
              <XhDateRangePickerRangeSeparator />
              <XhDateRangePickerSegmentGroup index={1}>
                {endSegments.map((segment, index) => (
                  <Fragment key={segment.type}>
                    {index > 0 && <span>{literalBefore(segment.type, index)}</span>}
                    <XhDateRangePickerSegment index={index} />
                  </Fragment>
                ))}
              </XhDateRangePickerSegmentGroup>
              <XhDateRangePickerClearTrigger />
              <XhDateRangePickerTrigger />
            </XhDateRangePickerControl>
            <XhDateRangePickerPositioner>
              <XhDateRangePickerContent>
                <XhDateRangePickerCalendar>
                  <XhDateRangePickerHeader>
                    <XhDateRangePickerPrevTrigger aria-label="上个月" />
                    <XhDateRangePickerHeading />
                    <XhDateRangePickerNextTrigger aria-label="下个月" />
                  </XhDateRangePickerHeader>
                  <XhDateRangePickerGrid>
                    <XhDateRangePickerGridHead>
                      <XhDateRangePickerWeekRow>
                        {weekDays.map(d => (
                          <XhDateRangePickerWeekDay key={d.value} value={d.value} />
                        ))}
                      </XhDateRangePickerWeekRow>
                    </XhDateRangePickerGridHead>
                    <XhDateRangePickerGridBody>
                      {weeks.map(week => (
                        <XhDateRangePickerWeekRow key={week[0]!.start}>
                          {week.map(day => (
                            <XhDateRangePickerCell key={day.start} value={day.start}>
                              <XhDateRangePickerCellTrigger>{day.day}</XhDateRangePickerCellTrigger>
                            </XhDateRangePickerCell>
                          ))}
                        </XhDateRangePickerWeekRow>
                      ))}
                    </XhDateRangePickerGridBody>
                  </XhDateRangePickerGrid>
                </XhDateRangePickerCalendar>
                {/* 起止各一组时间列，组顶的小标题取 translations.startTime / endTime；每组按不下去的格留在列里 */}
                <XhDateRangePickerTimePanel />
                <XhDateRangePickerConfirmTrigger>确定</XhDateRangePickerConfirmTrigger>
              </XhDateRangePickerContent>
            </XhDateRangePickerPositioner>
          </>
        )}
      </XhDateRangePickerRoot>

      <span aria-live="polite" style={{ fontSize: "13px" }}>{\`当前值：\${text}\`}</span>
    </>
  );
}
`;export{e as default};
