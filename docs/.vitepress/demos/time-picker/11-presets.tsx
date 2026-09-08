// 快捷选项 | presets 在列旁边多排一列，点一条整份写进值并收起；时刻在组件外算好再传
import type { ReactNode } from "react";
import { timePickerPresetNow } from "@xihan-ui/headless";
import {
  XhTimePickerColumn,
  XhTimePickerContent,
  XhTimePickerControl,
  XhTimePickerItem,
  XhTimePickerLabel,
  XhTimePickerPositioner,
  XhTimePickerPresetGroup,
  XhTimePickerRoot,
  XhTimePickerSegment,
  XhTimePickerSegmentGroup,
} from "@xihan-ui/react";
import { useMemo, useState } from "react";

export default function Demo(): ReactNode {
  const [value, setValue] = useState("");

  // 时刻算一次就固定下来：connect 每帧都会跑一遍，把「此刻」放进渲染期会每帧算出新值
  const presets = useMemo(() => [
    { label: "此刻", value: timePickerPresetNow() },
    { label: "上午 9 点", value: "09:00" },
    { label: "午休", value: "12:00" },
    { label: "下班", value: "18:00" },
  ], []);

  return (
    <>
      <XhTimePickerRoot
        value={value}
        onValueChange={details => setValue(details.value)}
        presets={presets}
        step={15}
      >
        <XhTimePickerLabel>提交时刻</XhTimePickerLabel>
        <XhTimePickerControl>
          <XhTimePickerSegmentGroup>
            <XhTimePickerSegment segment="hour" />
            <span>:</span>
            <XhTimePickerSegment segment="minute" />
          </XhTimePickerSegmentGroup>
        </XhTimePickerControl>
        <XhTimePickerPositioner>
          <XhTimePickerContent>
            {/* 不写默认插槽就按 presets 数据自动铺；这一列自己吃方向键，不与时分那两列抢 */}
            <XhTimePickerPresetGroup />
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
