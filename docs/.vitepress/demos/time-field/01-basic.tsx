// 基础用法 | 默认 24 小时制，上下键在段区间里回绕，缺一段整份值就退回空串
import type { ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldHiddenInput,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("");

  return (
    <>
      <XhTimeFieldRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        name="start"
      >
        <XhTimeFieldLabel>开始时间</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            {/* 段的身份由作者声明；中间的「:」是普通节点，换段时不会被当成一站 */}
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
        {/* 表单出口：缺段时它就是空的 */}
        <XhTimeFieldHiddenInput />
      </XhTimeFieldRoot>

      <span style={{ fontSize: "13px" }}>{`当前值：${value || "（未填齐）"}`}</span>
    </>
  );
}
