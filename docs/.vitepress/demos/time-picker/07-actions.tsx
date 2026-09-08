// 浮层里的操作按钮 | 列表下面这排按钮是作者自己的节点，键盘事件在它这一层收口，不再上交给列表
import type { ReactNode } from "react";
import {
  XhButton,
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

// 此刻的时分，两位补零
function now(): string {
  const d = new Date();
  const h = `${d.getHours()}`.padStart(2, "0");
  const m = `${d.getMinutes()}`.padStart(2, "0");
  return `${h}:${m}`;
}

export default function Demo(): ReactNode {
  const [value, setValue] = useState("");

  return (
    <>
      <XhTimePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        step={15}
      >
        {({ canClear, setValue: write, clear, setOpen }) => (
          <>
            <XhTimePickerLabel>提交时刻</XhTimePickerLabel>
            <XhTimePickerControl>
              <XhTimePickerSegmentGroup>
                <XhTimePickerSegment segment="hour" />
                <span>:</span>
                <XhTimePickerSegment segment="minute" />
              </XhTimePickerSegmentGroup>
            </XhTimePickerControl>
            <XhTimePickerPositioner>
              {/* 面板默认把列横排，改成竖排才放得下下面这一排按钮 */}
              <XhTimePickerContent style={{ flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex" }}>
                  <XhTimePickerColumn unit="hour">
                    {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                  </XhTimePickerColumn>
                  <XhTimePickerColumn unit="minute">
                    {({ options }) => options.map(o => <XhTimePickerItem key={o} value={o} />)}
                  </XhTimePickerColumn>
                </div>

                <div
                  style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}
                  onKeyDown={event => event.stopPropagation()}
                >
                  <XhButton size="sm" variant="ghost" onClick={() => write(now())}>此刻</XhButton>
                  <XhButton size="sm" variant="ghost" disabled={!canClear} onClick={() => clear()}>
                    清空
                  </XhButton>
                  <XhButton size="sm" onClick={() => setOpen(false)}>确定</XhButton>
                </div>
              </XhTimePickerContent>
            </XhTimePickerPositioner>
          </>
        )}
      </XhTimePickerRoot>

      <span style={{ fontSize: "13px" }}>{`当前值：${value || "（空）"}`}</span>
    </>
  );
}
