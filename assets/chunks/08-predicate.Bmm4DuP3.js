const e=`// 自定可选格 | 列里渲染哪几格由作者决定，午休两格整段拿掉；手打进段位的时被吸到下一个可约小时
import type { ReactNode } from "react";
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

// 午休不接待
const closed = [12, 13];

// 列里只留通过谓词的那几格
function bookable(options: readonly string[]): string[] {
  return options.filter(o => !closed.includes(Number(o)));
}

// 落进午休的小时往后挪到最近一个可约的小时
function snap(next: string): string {
  if (next === "")
    return next;
  let hour = Number(next.slice(0, 2));
  while (closed.includes(hour)) hour += 1;
  return \`\${\`\${hour}\`.padStart(2, "0")}\${next.slice(2)}\`;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState("09:00");

  return (
    <>
      <XhTimePickerRoot
        value={value}
        step={30}
        min="09:00"
        max="18:00"
        onValueChange={details => setValue(snap(details.value))}
      >
        <XhTimePickerLabel>面谈时刻</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            {/* min / max 先裁一遍，这里再按自己的谓词裁一遍；格里的文案也自己写 */}
            <XhTimePickerColumn unit="hour">
              {({ options }) => bookable(options).map(o => (
                <XhTimePickerItem key={o} value={o}>
                  {\`\${Number(o)} 点\`}
                </XhTimePickerItem>
              ))}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="minute">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value || "（空）"}\`}</span>
    </>
  );
}
`;export{e as default};
