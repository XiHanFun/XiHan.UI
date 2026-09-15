const e=`// 十二小时制 | hourCycle 决定两组段位与时列的写法，上下午各成一段一列
import type { ReactNode } from "react";
import {
  XhTimeRangePickerClearTrigger,
  XhTimeRangePickerColumn,
  XhTimeRangePickerColumnGroup,
  XhTimeRangePickerColumnGroupLabel,
  XhTimeRangePickerContent,
  XhTimeRangePickerControl,
  XhTimeRangePickerItem,
  XhTimeRangePickerLabel,
  XhTimeRangePickerPositioner,
  XhTimeRangePickerRangeSeparator,
  XhTimeRangePickerRoot,
  XhTimeRangePickerSegment,
  XhTimeRangePickerSegmentGroup,
  XhTimeRangePickerTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["09:00", "17:30"]);
  const text = value[0] && value[1] ? \`\${value[0]} → \${value[1]}\` : "（未填齐）";

  return (
    <>
      <XhTimeRangePickerRoot value={value} onValueChange={details => setValue(details.value)} hourCycle={12} locale="zh-CN" step={30}>
        <XhTimeRangePickerLabel>值班时段</XhTimeRangePickerLabel>
        <XhTimeRangePickerControl>
          {([0, 1] as const).map(end => (
            <XhTimeRangePickerSegmentGroup key={end} index={end}>
              <XhTimeRangePickerSegment segment="hour" />
              <span>:</span>
              <XhTimeRangePickerSegment segment="minute" />
              <XhTimeRangePickerSegment segment="dayPeriod" />
              {end === 0 && <XhTimeRangePickerRangeSeparator />}
            </XhTimeRangePickerSegmentGroup>
          ))}
          <XhTimeRangePickerClearTrigger />
          <XhTimeRangePickerTrigger />
        </XhTimeRangePickerControl>
        <XhTimeRangePickerPositioner>
          <XhTimeRangePickerContent>
            {/* 起止各一组时列，端号写在外壳上，组内的列与格子跟着它走 */}
            {(["开始", "结束"] as const).map((label, end) => (
              <XhTimeRangePickerColumnGroup key={end} index={end}>
                <XhTimeRangePickerColumnGroupLabel>{label}</XhTimeRangePickerColumnGroupLabel>
                <XhTimeRangePickerColumn unit="hour">
                  {({ options }) => options.map(o => <XhTimeRangePickerItem key={o} value={o} />)}
                </XhTimeRangePickerColumn>
                <XhTimeRangePickerColumn unit="minute">
                  {({ options }) => options.map(o => <XhTimeRangePickerItem key={o} value={o} />)}
                </XhTimeRangePickerColumn>
                <XhTimeRangePickerColumn unit="dayPeriod">
                  {({ options }) => options.map(o => <XhTimeRangePickerItem key={o} value={o} />)}
                </XhTimeRangePickerColumn>
              </XhTimeRangePickerColumnGroup>
            ))}
          </XhTimeRangePickerContent>
        </XhTimeRangePickerPositioner>
      </XhTimeRangePickerRoot>

      <span aria-live="polite" style={{ fontSize: "13px" }}>
        {\`当前值：\${text}\`}
      </span>
    </>
  );
}
`;export{e as default};
