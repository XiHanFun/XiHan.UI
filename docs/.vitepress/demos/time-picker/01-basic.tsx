// 基础用法 | 点输入行任意处即展开，不必再去点小箭头；段位与列写的是同一个值，段上敲、列里挑，另一边当场跟着改口
import type { ReactNode } from "react";
import {
  XhTimePickerClearTrigger,
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerHiddenInput,
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
        name="start"
      >
        <XhTimePickerLabel>会议开始</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            {/* 段不写内容：显示什么由组件按当前值填，空段是占位串 */}
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
          <XhTimePickerClearTrigger />
        </XhTimePickerControl>
        {/* 表单出口：随表单提交的是完整 ISO 串 */}
        <XhTimePickerHiddenInput />
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            {/* 可选值由 step 与小时制算出来，作者照它渲染 */}
            <XhTimePickerColumn unit="hour">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
            <XhTimePickerColumn unit="minute">
              {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
            </XhTimePickerColumn>
          </XhTimePickerContent>
        </XhTimePickerPositioner>
      </XhTimePickerRoot>

      <span style={{ fontSize: "13px" }}>{`当前值：${value || "（空）"}`}</span>
    </>
  );
}
