const e=`// 三轴 | variant 决定描边与底怎么画、tone 决定用哪族颜色、size 换几何档；三者只落在 root，浮层里的日历一并跟着换
import type { ControlVariant, Size, Tone } from "@xihan-ui/core";
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
  XhDatePickerWeekDay,
  XhDatePickerWeekRow,
} from "@xihan-ui/react";

const variants: ControlVariant[] = ["outline", "subtle", "ghost"];
const tones: Tone[] = ["brand", "success", "danger"];
const sizes: Size[] = ["sm", "md", "lg"];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {[variants, tones, sizes].map((row, i) => (
        <div key={row.join("-")} style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {row.map(v => (
            <XhDatePickerRoot
              key={v}
              variant={i === 0 ? (v as ControlVariant) : undefined}
              tone={i === 1 ? (v as Tone) : undefined}
              size={i === 2 ? (v as Size) : undefined}
              locale="zh-CN"
            >
              {({ weeks, weekDays }) => (
                <>
                  <XhDatePickerLabel>{v}</XhDatePickerLabel>
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
                                    <XhDatePickerCellTrigger>
                                      {day.day}
                                    </XhDatePickerCellTrigger>
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
          ))}
        </div>
      ))}
    </div>
  );
}
`;export{e as default};
