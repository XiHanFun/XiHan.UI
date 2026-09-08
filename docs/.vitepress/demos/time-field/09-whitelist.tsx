// 可选值白名单 | 值交给宿主持有，写回来的时间被吸附到清单里的一格，上下键与数字键因此都落在清单上
import type { ReactNode } from "react";
import {
  XhTimeFieldControl,
  XhTimeFieldLabel,
  XhTimeFieldRoot,
  XhTimeFieldSegment,
  XhTimeFieldSegmentGroup,
} from "@xihan-ui/react";
import { useState } from "react";

const allowed = ["08:00", "12:00", "18:00"];

export default function Demo(): ReactNode {
  const [value, setValue] = useState(allowed[0]!);

  // 比原值大就取清单里的下一格，比原值小就取上一格，走到头回绕
  function snap(next: string): string {
    if (next === "" || allowed.includes(next)) {
      return next;
    }
    const forward = next > value;
    const hit = forward
      ? allowed.find(t => t > next)
      : [...allowed].reverse().find(t => t < next);
    return hit ?? (forward ? allowed[0]! : allowed[allowed.length - 1]!);
  }

  return (
    <>
      {/* 受控写法：值不交给组件自己存，写入意图先过一遍 snap */}
      <XhTimeFieldRoot value={value} onValueChange={details => setValue(snap(details.value))}>
        <XhTimeFieldLabel>发车时刻</XhTimeFieldLabel>
        <XhTimeFieldControl>
          <XhTimeFieldSegmentGroup>
            <XhTimeFieldSegment segment="hour" />
            <span>:</span>
            <XhTimeFieldSegment segment="minute" />
          </XhTimeFieldSegmentGroup>
        </XhTimeFieldControl>
      </XhTimeFieldRoot>

      <span style={{ fontSize: "13px" }}>
        {`只收 ${allowed.join(" / ")}，当前值：${value || "（空）"}`}
      </span>
    </>
  );
}
