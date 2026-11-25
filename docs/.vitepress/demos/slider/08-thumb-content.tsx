// 滑块中的内容 | thumb 是一个普通容器，放置什么由作者决定，容纳空间依靠 --xh-slider-thumb-size 撑开直径；value-text 挂在 thumb 中即随之移动，推动时由皮肤显示成值气泡，文字取自作者的格式化函数
import type { CSSProperties, ReactNode } from "react";
import {
  XhSliderControl,
  XhSliderHiddenInput,
  XhSliderLabel,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
  XhSliderValueText,
} from "@xihan-ui/react";
import { useState } from "react";

const badge: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  blockSize: "100%",
  fontSize: "11px",
  color: "var(--xh-fg-on-brand)",
};

function money(value: number): string {
  return `¥${value.toLocaleString("zh-CN")}`;
}

// 读屏走 aria-valuetext，与可见气泡各念各的同一个值
function valueText({ value }: { value: number }): string {
  return money(value);
}

export default function Demo(): ReactNode {
  const [budget, setBudget] = useState([1800]);

  const amount = budget[0] ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--xh-space-8)" }}>
      <XhSliderRoot
        defaultValue={[45]}
        step={5}
        style={{ "inlineSize": "320px", "--xh-slider-thumb-size": "34px" } as CSSProperties}
      >
        {({ value }) => (
          <>
            <XhSliderLabel>完成度</XhSliderLabel>
            <XhSliderControl>
              <XhSliderTrack>
                <XhSliderRange />
              </XhSliderTrack>
              <XhSliderThumb>
                <span style={badge}>{`${value[0]}%`}</span>
                <XhSliderHiddenInput />
              </XhSliderThumb>
            </XhSliderControl>
          </>
        )}
      </XhSliderRoot>

      <XhSliderRoot
        value={budget}
        onValueChange={details => setBudget(details.value)}
        min={0}
        max={5000}
        step={50}
        getValueText={valueText}
        name="budget"
        style={{ "inlineSize": "320px", "--xh-slider-gap": "var(--xh-space-8)" } as CSSProperties}
      >
        <XhSliderLabel>{`预算上限：${money(amount)}`}</XhSliderLabel>
        <XhSliderControl>
          <XhSliderTrack>
            <XhSliderRange />
          </XhSliderTrack>
          <XhSliderThumb>
            <XhSliderValueText />
            <XhSliderHiddenInput />
          </XhSliderThumb>
        </XhSliderControl>
      </XhSliderRoot>
      <p data-demo-output>{`已选：${money(amount)}`}</p>
    </div>
  );
}
