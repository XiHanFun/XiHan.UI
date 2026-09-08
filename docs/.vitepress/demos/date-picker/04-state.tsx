// 禁用 / 只读 / 校验失败 | 禁用整条退出 Tab 序，只读仍能展开翻月只是落不了值，invalid 只改标注
import type { ReactNode } from "react";
import {
  XhDatePickerCalendar,
  XhDatePickerCell,
  XhDatePickerCellTrigger,
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

const states = [
  { label: "禁用", disabled: true, readOnly: false, invalid: false },
  { label: "只读", disabled: false, readOnly: true, invalid: false },
  { label: "校验失败", disabled: false, readOnly: false, invalid: true },
];

export default function Demo(): ReactNode {
  return (
    <div style={{ display: "grid", gap: "16px", justifyItems: "start" }}>
      {states.map(s => (
        <XhDatePickerRoot
          key={s.label}
          disabled={s.disabled}
          readOnly={s.readOnly}
          invalid={s.invalid}
          defaultValue="2026-07-28"
          locale="zh-CN"
        >
          {({ weeks, weekDays }) => (
            <>
              <XhDatePickerLabel>{s.label}</XhDatePickerLabel>
              <XhDatePickerControl>
                <XhDatePickerSegmentGroup>
                  <XhDatePickerSegment index={0} />
                  <span>-</span>
                  <XhDatePickerSegment index={1} />
                  <span>-</span>
                  <XhDatePickerSegment index={2} />
                </XhDatePickerSegmentGroup>
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
      ))}
    </div>
  );
}
