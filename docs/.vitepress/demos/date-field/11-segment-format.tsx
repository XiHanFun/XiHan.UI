// 段位自定义文本 | 段位插槽给出这一段的类型、取值与焦点状态，离焦后年份只留两位、月份换成中文名
import type { DateFieldSegmentState } from "@xihan-ui/headless";
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

const MONTH_NAMES = [
  "一月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "十一月",
  "十二月",
];

// 空段与正在编辑的段照原样显示，其余按自己的写法渲染
function display(segment: DateFieldSegmentState | undefined): string {
  if (segment == null)
    return "";
  if (segment.empty || segment.focused)
    return segment.text;
  if (segment.type === "year")
    return segment.text.slice(-2);
  if (segment.type === "month")
    return MONTH_NAMES[(segment.value ?? 1) - 1] ?? segment.text;
  return segment.text;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState<string | null>("2026-07-28");

  return (
    <>
      <XhDateFieldRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        locale="zh-CN"
      >
        <XhDateFieldLabel>发布日期</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment index={0}>
              {({ segment }) => display(segment)}
            </XhDateFieldSegment>
            <span>年</span>
            <XhDateFieldSegment index={1}>
              {({ segment }) => display(segment)}
            </XhDateFieldSegment>
            <XhDateFieldSegment index={2}>
              {({ segment }) => display(segment)}
            </XhDateFieldSegment>
            <span>日</span>
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
      </XhDateFieldRoot>

      <span style={{ fontSize: "13px" }}>{`值仍是 ISO 串：${value ?? "（未填齐）"}`}</span>
    </>
  );
}
