const e=`// 可选的触发钮 | 点输入行本来就展开，这个按钮不是必需的；要它是因为它才带 aria-haspopup / aria-expanded
import type { ReactNode } from "react";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
  XhTimePickerTrigger,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("09:30");

  return (
    <>
      <XhTimePickerRoot value={value} onValueChange={details => setValue(details.value)}>
        <XhTimePickerLabel>会议开始</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
          <XhTimePickerClearTrigger />
          {/* 写上它多一个明写的入口；不写也照样能展开——点输入行即可，
              键盘则在段上按 Alt+ArrowDown */}
          <XhTimePickerTrigger aria-label="展开时间列" />
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

      <span style={{ fontSize: "13px" }}>{\`当前值：\${value || "（空）"}\`}</span>
    </>
  );
}
`;export{e as default};
