var e=`// 可约时段 | timeStep 让分列每 15 分钟一格；min / max 带时间段时首尾两天界外的时刻不可选，isTimeUnavailable 再按已选的日子收掉周末的下午
import type { TimeColumnUnit, TimeUnavailableContext } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
  XhDatePickerClearTrigger,
  XhDatePickerConfirmTrigger,
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
  XhDatePickerTimePanel,
  XhDatePickerTrigger,
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";
import { Fragment, useState } from "react";

// 周末只接上午：判定收到这份时间所属的日期，时列的值恒按 24 小时制给
function isTimeUnavailable(option: string, unit: TimeColumnUnit, context: TimeUnavailableContext): boolean {
  if (unit !== "hour" || context.date == null)
    return false;
  const day = new Date(\`\${context.date}T00:00:00Z\`).getUTCDay();
  return (day === 0 || day === 6) && Number(option) >= 12;
}

function literalBefore(type: string, index: number): string {
  if (index === 0)
    return "";
  if (type === "hour")
    return " ";
  if (type === "minute")
    return ":";
  return "/";
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["2026-10-09T10:00"]);

  return (
    <>
      <XhDatePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        showTime
        locale="zh-CN"
        min="2026-10-09T09:00"
        max="2026-10-31T18:00"
        timeStep={{ minute: 15 }}
        isTimeUnavailable={isTimeUnavailable}
      >
        {({ weeks, weekDays, segments }) => (
          <>
            <XhDatePickerLabel>到店时间</XhDatePickerLabel>
            <XhDatePickerControl>
              <XhDatePickerSegmentGroup>
                {segments.map((segment, index) => (
                  <Fragment key={segment.type}>
                    {index > 0 && <span>{literalBefore(segment.type, index)}</span>}
                    <XhDatePickerSegment index={index} />
                  </Fragment>
                ))}
              </XhDatePickerSegmentGroup>
              <XhDatePickerClearTrigger />
              <XhDatePickerTrigger />
            </XhDatePickerControl>
            <XhDatePickerPositioner>
              <XhDatePickerContent>
                <div style={{ display: "flex", alignItems: "stretch" }}>
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
                          <XhDatePickerWeekRow key={week[0]!.start}>
                            {week.map(day => (
                              <XhDatePickerCell key={day.start} value={day.start}>
                                <XhDatePickerCellTrigger>{day.day}</XhDatePickerCellTrigger>
                              </XhDatePickerCell>
                            ))}
                          </XhDatePickerWeekRow>
                        ))}
                      </XhDatePickerGridBody>
                    </XhDatePickerGrid>
                  </XhDatePickerCalendar>
                  {/* 界外与判为不可用的格留在列里、按不下去，列长不随所选的日子变 */}
                  <XhDatePickerTimePanel />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBlockStart: "var(--xh-space-2)", marginInline: "calc(-1 * var(--xh-space-2))", marginBlockEnd: "calc(-1 * var(--xh-space-2))", paddingBlock: "var(--xh-space-1)", paddingInline: "var(--xh-space-2)", borderBlockStart: "var(--xh-stroke-thin) solid var(--xh-border-subtle)" }}>
                  <XhDatePickerConfirmTrigger>确定</XhDatePickerConfirmTrigger>
                </div>
              </XhDatePickerContent>
            </XhDatePickerPositioner>
          </>
        )}
      </XhDatePickerRoot>

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value[0] ?? "（空）"}\`}</span>
    </>
  );
}
`;export{e as default};