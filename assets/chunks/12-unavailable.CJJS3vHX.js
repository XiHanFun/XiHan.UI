const e=`// 按已选的时判定 | isTimeUnavailable 的第三个参数带已选的时：9 点只能约 30 分以后，别的整点不受限
import type { TimeColumnUnit, TimeUnavailableContext } from "@xihan-ui/headless";
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

// 判真的格子仍在列里、仍可聚焦，只是选不中；时列的值恒按 24 小时制给
function isTimeUnavailable(option: string, unit: TimeColumnUnit, context: TimeUnavailableContext): boolean {
  return unit === "minute" && context.hour === 9 && Number(option) < 30;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string[]>(["09:30"]);

  return (
    <>
      <XhTimePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        min="09:00"
        max="18:00"
        timeStep={{ minute: 15 }}
        isTimeUnavailable={isTimeUnavailable}
      >
        <XhTimePickerLabel>到店时刻</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            <XhTimePickerColumn unit="hour">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="minute">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value[0] ?? "（空）"}\`}</span>
    </>
  );
}
`;export{e as default};
