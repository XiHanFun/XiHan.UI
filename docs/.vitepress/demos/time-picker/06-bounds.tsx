// 可选时段 | min / max 直接把界外的格从列里裁掉；分列还会随已选的时再裁一遍
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

export default function Demo(): ReactNode {
  const [value, setValue] = useState("");

  return (
    <>
      <XhTimePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        min="09:00"
        max="18:00"
        step={30}
      >
        <XhTimePickerLabel>面谈时段</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            {/* 时列只剩 09 到 18；选到 18 时分列就只剩 00 */}
            <XhTimePickerColumn unit="hour">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="minute">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>

      <span style={{ fontSize: "13px" }}>
        {`手打进段位的时间不受裁剪限制，越界只被标注：${value || "（空）"}`}
      </span>
    </>
  );
}
