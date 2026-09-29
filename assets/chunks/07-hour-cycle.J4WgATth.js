const e=`// 12 小时制 | hourCycle=12 时时间列末位多出上下午列，输入行也多出上下午段；值仍是 24 小时制的 ISO 串
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

function literalBefore(type: string, index: number): string {
  if (index === 0)
    return "";
  if (type === "hour" || type === "dayPeriod")
    return " ";
  if (type === "minute")
    return ":";
  return "/";
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["2026-09-28T21:30"]);

  return (
    <>
      <XhDatePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        showTime
        hourCycle={12}
        locale="en-US"
      >
        {({ weeks, weekDays, segments }) => (
          <>
            <XhDatePickerLabel>Pickup</XhDatePickerLabel>
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
                      <XhDatePickerPrevTrigger aria-label="Previous month" />
                      <XhDatePickerHeading />
                      <XhDatePickerNextTrigger aria-label="Next month" />
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
                  {/* 时、分、上下午三列；上下午那一格的字按 locale 现译 */}
                  <XhDatePickerTimePanel />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBlockStart: "var(--xh-space-2)", marginInline: "calc(-1 * var(--xh-space-2))", marginBlockEnd: "calc(-1 * var(--xh-space-2))", paddingBlock: "var(--xh-space-1)", paddingInline: "var(--xh-space-2)", borderBlockStart: "var(--xh-stroke-thin) solid var(--xh-border-subtle)" }}>
                  <XhDatePickerConfirmTrigger>OK</XhDatePickerConfirmTrigger>
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
