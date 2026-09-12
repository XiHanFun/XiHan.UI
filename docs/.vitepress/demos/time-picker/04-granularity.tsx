// 精度到秒 | granularity 同时决定输入行显示几段、浮层里排几列
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
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("");

  return (
    <>
      <XhTimePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        granularity="second"
      >
        <XhTimePickerLabel>执行时刻</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
            <span>:</span>
            <XhTimePickerSegment segment="second" />
          </XhTimePickerSegmentGroup>
          <XhTimePickerClearTrigger />
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            <XhTimePickerColumn unit="hour">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="minute">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="second">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>

      <span style={{ fontSize: "13px" }}>{`当前值：${value || "（空）"}`}</span>
    </>
  );
}
