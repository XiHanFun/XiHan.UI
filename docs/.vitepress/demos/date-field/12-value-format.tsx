// 对外值换个写法 | 组件读写的恒是 ISO 串，宿主在读写两头各转一次换成自己的格式，表单也提交这一份
import type { ReactNode } from "react";
import {
  XhDateFieldControl,
  XhDateFieldLabel,
  XhDateFieldRoot,
  XhDateFieldSegment,
  XhDateFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

export default function Demo(): ReactNode {
  // 宿主与后端约定的写法
  const [stored, setStored] = useState("2026/07/28");

  // 读时换成 ISO 交给组件，写回时换回宿主的写法
  const iso = stored ? stored.split("/").join("-") : null;

  return (
    <>
      <XhDateFieldRoot
        value={iso}
        onValueChange={details => setStored(details.value ? details.value.split("-").join("/") : "")}
        locale="zh-CN"
      >
        <XhDateFieldLabel>结算日期</XhDateFieldLabel>
        <XhDateFieldControl>
          <XhDateFieldSegmentGroup>
            <XhDateFieldSegment index={0} />
            <span>年</span>
            <XhDateFieldSegment index={1} />
            <span>月</span>
            <XhDateFieldSegment index={2} />
            <span>日</span>
          </XhDateFieldSegmentGroup>
        </XhDateFieldControl>
        {/* 不用内建的隐藏输入，自己写一份提交宿主格式 */}
        <input type="hidden" name="settle" value={stored} />
      </XhDateFieldRoot>

      <span style={{ fontSize: "13px" }}>
        {`随表单提交的是：${stored || "（未填齐）"} · 组件里的值是：${iso ?? "null"}`}
      </span>
    </>
  );
}
